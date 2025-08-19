import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { BOMItem } from '@prisma/client';

export interface CreateBOMItemData {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  supplierId?: string;
  status?: string;
  priority?: string;
  deliveryDate?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  parentId?: string;
}

export interface UpdateBOMItemData extends Partial<CreateBOMItemData> {
  totalPrice?: number;
}

export interface BOMItemWithDetails extends BOMItem {
  supplier?: {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    rating?: number;
  };
  parent?: {
    id: string;
    name: string;
    category?: string;
  };
  children: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    totalPrice?: number;
    status: string;
  }>;
  project: {
    id: string;
    name: string;
  };
}

export interface BOMHierarchy {
  id: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  status: string;
  priority: string;
  children: BOMHierarchy[];
}

export class BOMService {
  /**
   * Create a new BOM item
   */
  static async createBOMItem(
    projectId: string,
    userId: string,
    data: CreateBOMItemData
  ): Promise<BOMItemWithDetails> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      // Calculate total price
      const totalPrice = data.unitPrice && data.quantity 
        ? Number(data.unitPrice) * Number(data.quantity)
        : undefined;

      const bomItem = await prisma.bOMItem.create({
        data: {
          ...data,
          projectId,
          quantity: Number(data.quantity),
          unitPrice: data.unitPrice ? Number(data.unitPrice) : undefined,
          totalPrice,
          metadata: data.metadata || {},
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              rating: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true,
              totalPrice: true,
              status: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      logger.info('BOM item created successfully', { 
        bomItemId: bomItem.id, 
        projectId, 
        userId 
      });

      return bomItem as BOMItemWithDetails;
    } catch (error) {
      logger.error('Failed to create BOM item', { error, projectId, userId, data });
      throw error;
    }
  }

  /**
   * Get BOM item by ID
   */
  static async getBOMItemById(id: string, userId: string): Promise<BOMItemWithDetails | null> {
    try {
      const bomItem = await prisma.bOMItem.findUnique({
        where: { id },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              rating: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true,
              totalPrice: true,
              status: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!bomItem) {
        return null;
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(bomItem.projectId, userId);
      if (!hasAccess) {
        return null;
      }

      return bomItem as BOMItemWithDetails;
    } catch (error) {
      logger.error('Failed to get BOM item by ID', { error, id, userId });
      throw error;
    }
  }

  /**
   * Get BOM items for a project
   */
  static async getBOMItems(
    projectId: string,
    userId: string,
    pagination: PaginationParams,
    filters?: {
      category?: string;
      status?: string;
      priority?: string;
      supplierId?: string;
      parentId?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<BOMItemWithDetails>> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = { projectId };

      if (filters) {
        if (filters.category) {
          where.category = filters.category;
        }
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.priority) {
          where.priority = filters.priority;
        }
        if (filters.supplierId) {
          where.supplierId = filters.supplierId;
        }
        if (filters.parentId !== undefined) {
          where.parentId = filters.parentId || null;
        }
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { sku: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma.bOMItem.count({ where });

      // Get BOM items
      const bomItems = await prisma.bOMItem.findMany({
        where,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              rating: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true,
              totalPrice: true,
              status: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { deliveryDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: bomItems as BOMItemWithDetails[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to get BOM items', { error, projectId, userId, pagination, filters });
      throw error;
    }
  }

  /**
   * Get BOM hierarchy for a project
   */
  static async getBOMHierarchy(projectId: string, userId: string): Promise<BOMHierarchy[]> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      // Get all BOM items for the project
      const bomItems = await prisma.bOMItem.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
      });

      // Build hierarchy
      const hierarchy = this.buildBOMHierarchy(bomItems);

      return hierarchy;
    } catch (error) {
      logger.error('Failed to get BOM hierarchy', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Update BOM item
   */
  static async updateBOMItem(id: string, userId: string, data: UpdateBOMItemData): Promise<BOMItemWithDetails> {
    try {
      // Get BOM item to check permissions
      const existingItem = await prisma.bOMItem.findUnique({
        where: { id },
        select: { projectId: true },
      });

      if (!existingItem) {
        throw new Error('BOM item not found');
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(existingItem.projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      // Calculate total price if unit price or quantity changed
      let totalPrice = data.totalPrice;
      if ((data.unitPrice !== undefined || data.quantity !== undefined) && !totalPrice) {
        const currentItem = await prisma.bOMItem.findUnique({
          where: { id },
          select: { unitPrice: true, quantity: true },
        });

        if (currentItem) {
          const newUnitPrice = data.unitPrice !== undefined ? Number(data.unitPrice) : Number(currentItem.unitPrice || 0);
          const newQuantity = data.quantity !== undefined ? Number(data.quantity) : Number(currentItem.quantity);
          totalPrice = newUnitPrice * newQuantity;
        }
      }

      const bomItem = await prisma.bOMItem.update({
        where: { id },
        data: {
          ...data,
          quantity: data.quantity ? Number(data.quantity) : undefined,
          unitPrice: data.unitPrice ? Number(data.unitPrice) : undefined,
          totalPrice: totalPrice ? Number(totalPrice) : undefined,
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
              email: true,
              rating: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              quantity: true,
              unit: true,
              totalPrice: true,
              status: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      logger.info('BOM item updated successfully', { bomItemId: id, userId });

      return bomItem as BOMItemWithDetails;
    } catch (error) {
      logger.error('Failed to update BOM item', { error, id, userId, data });
      throw error;
    }
  }

  /**
   * Delete BOM item
   */
  static async deleteBOMItem(id: string, userId: string): Promise<void> {
    try {
      // Get BOM item to check permissions
      const bomItem = await prisma.bOMItem.findUnique({
        where: { id },
        select: { projectId: true },
      });

      if (!bomItem) {
        throw new Error('BOM item not found');
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(bomItem.projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      await prisma.bOMItem.delete({
        where: { id },
      });

      logger.info('BOM item deleted successfully', { bomItemId: id, userId });
    } catch (error) {
      logger.error('Failed to delete BOM item', { error, id, userId });
      throw error;
    }
  }

  /**
   * Get BOM statistics for a project
   */
  static async getBOMStatistics(projectId: string, userId: string): Promise<any> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const [
        totalStats,
        categoryStats,
        statusStats,
        supplierStats,
      ] = await Promise.all([
        // Total statistics
        prisma.bOMItem.aggregate({
          where: { projectId },
          _count: true,
          _sum: { 
            quantity: true,
            totalPrice: true,
          },
          _avg: {
            unitPrice: true,
          },
        }),
        // Category statistics
        prisma.bOMItem.groupBy({
          by: ['category'],
          where: { projectId },
          _count: true,
          _sum: { totalPrice: true },
        }),
        // Status statistics
        prisma.bOMItem.groupBy({
          by: ['status'],
          where: { projectId },
          _count: true,
          _sum: { totalPrice: true },
        }),
        // Supplier statistics
        prisma.bOMItem.groupBy({
          by: ['supplierId'],
          where: { 
            projectId,
            supplierId: { not: null },
          },
          _count: true,
          _sum: { totalPrice: true },
        }),
      ]);

      return {
        total: {
          items: totalStats._count,
          totalValue: totalStats._sum.totalPrice || 0,
          averageUnitPrice: totalStats._avg.unitPrice || 0,
        },
        byCategory: categoryStats.reduce((acc, stat) => {
          acc[stat.category || 'Uncategorized'] = {
            count: stat._count,
            totalValue: stat._sum.totalPrice || 0,
          };
          return acc;
        }, {} as Record<string, any>),
        byStatus: statusStats.reduce((acc, stat) => {
          acc[stat.status] = {
            count: stat._count,
            totalValue: stat._sum.totalPrice || 0,
          };
          return acc;
        }, {} as Record<string, any>),
        bySupplier: supplierStats.length,
      };
    } catch (error) {
      logger.error('Failed to get BOM statistics', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Import BOM items from CSV/Excel data
   */
  static async importBOMItems(
    projectId: string,
    userId: string,
    items: CreateBOMItemData[]
  ): Promise<BOMItemWithDetails[]> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const createdItems: BOMItemWithDetails[] = [];

      // Use transaction for batch import
      await prisma.$transaction(async (tx) => {
        for (const itemData of items) {
          // Calculate total price
          const totalPrice = itemData.unitPrice && itemData.quantity 
            ? Number(itemData.unitPrice) * Number(itemData.quantity)
            : undefined;

          const bomItem = await tx.bOMItem.create({
            data: {
              ...itemData,
              projectId,
              quantity: Number(itemData.quantity),
              unitPrice: itemData.unitPrice ? Number(itemData.unitPrice) : undefined,
              totalPrice,
              metadata: itemData.metadata || {},
            },
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true,
                  contactPerson: true,
                  email: true,
                  rating: true,
                },
              },
              parent: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
              children: {
                select: {
                  id: true,
                  name: true,
                  quantity: true,
                  unit: true,
                  totalPrice: true,
                  status: true,
                },
              },
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          });

          createdItems.push(bomItem as BOMItemWithDetails);
        }
      });

      logger.info('BOM items imported successfully', { 
        projectId, 
        userId, 
        count: items.length 
      });

      return createdItems;
    } catch (error) {
      logger.error('Failed to import BOM items', { error, projectId, userId, count: items.length });
      throw error;
    }
  }

  /**
   * Build BOM hierarchy from flat list
   */
  private static buildBOMHierarchy(items: BOMItem[]): BOMHierarchy[] {
    const itemMap = new Map<string, BOMHierarchy>();
    const rootItems: BOMHierarchy[] = [];

    // First pass: create all items
    items.forEach(item => {
      const hierarchyItem: BOMHierarchy = {
        id: item.id,
        name: item.name,
        description: item.description || undefined,
        category: item.category || undefined,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : undefined,
        totalPrice: item.totalPrice ? Number(item.totalPrice) : undefined,
        status: item.status,
        priority: item.priority,
        children: [],
      };

      itemMap.set(item.id, hierarchyItem);
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const hierarchyItem = itemMap.get(item.id)!;

      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(hierarchyItem);
        } else {
          // Parent not found, treat as root
          rootItems.push(hierarchyItem);
        }
      } else {
        rootItems.push(hierarchyItem);
      }
    });

    return rootItems;
  }

  /**
   * Check if user has access to project
   */
  private static async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          projectMembers: {
            where: {
              userId,
              isActive: true,
            },
          },
        },
      });

      if (!project) {
        return false;
      }

      return project.managerId === userId || project.projectMembers.length > 0;
    } catch (error) {
      logger.error('Failed to check project access', { error, projectId, userId });
      return false;
    }
  }
}