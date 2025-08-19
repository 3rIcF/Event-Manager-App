import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { Supplier, SupplierContract } from '@prisma/client';

export interface CreateSupplierData {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: Record<string, any>;
  taxId?: string;
  paymentTerms?: string;
  category?: string;
  specialties?: string[];
  certifications?: string[];
  performanceMetrics?: Record<string, any>;
}

export interface UpdateSupplierData extends Partial<CreateSupplierData> {
  rating?: number;
  isActive?: boolean;
}

export interface SupplierWithDetails extends Supplier {
  bomItems: Array<{
    id: string;
    name: string;
    projectId: string;
    totalPrice?: number;
    status: string;
    project: {
      name: string;
    };
  }>;
  supplierContracts: Array<{
    id: string;
    contractNumber: string;
    contractType: string;
    totalValue?: number;
    status: string;
    project?: {
      name: string;
    };
  }>;
  _count: {
    bomItems: number;
    supplierContracts: number;
  };
}

export interface CreateContractData {
  contractNumber: string;
  contractType: string;
  startDate: Date;
  endDate?: Date;
  totalValue?: number;
  paymentTerms?: string;
  termsConditions?: string;
  projectId?: string;
  documents?: Record<string, any>[];
}

export class SupplierService {
  /**
   * Create a new supplier
   */
  static async createSupplier(data: CreateSupplierData): Promise<SupplierWithDetails> {
    try {
      const supplier = await prisma.supplier.create({
        data: {
          ...data,
          address: data.address || {},
          specialties: data.specialties || [],
          certifications: data.certifications || [],
          performanceMetrics: data.performanceMetrics || {},
        },
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 5,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 5,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
      });

      logger.info('Supplier created successfully', { 
        supplierId: supplier.id, 
        name: data.name 
      });

      return supplier as SupplierWithDetails;
    } catch (error) {
      logger.error('Failed to create supplier', { error, data });
      throw error;
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(id: string): Promise<SupplierWithDetails | null> {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id },
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
      });

      return supplier as SupplierWithDetails | null;
    } catch (error) {
      logger.error('Failed to get supplier by ID', { error, id });
      throw error;
    }
  }

  /**
   * Get suppliers with pagination and filters
   */
  static async getSuppliers(
    pagination: PaginationParams,
    filters?: {
      category?: string;
      isActive?: boolean;
      rating?: number;
      search?: string;
      specialties?: string[];
    }
  ): Promise<PaginatedResponse<SupplierWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = {};

      if (filters) {
        if (filters.category) {
          where.category = filters.category;
        }
        if (filters.isActive !== undefined) {
          where.isActive = filters.isActive;
        }
        if (filters.rating) {
          where.rating = { gte: filters.rating };
        }
        if (filters.specialties && filters.specialties.length > 0) {
          where.specialties = {
            hasSome: filters.specialties,
          };
        }
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { contactPerson: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma.supplier.count({ where });

      // Get suppliers
      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' },
        ],
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: suppliers as SupplierWithDetails[],
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
      logger.error('Failed to get suppliers', { error, pagination, filters });
      throw error;
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: UpdateSupplierData): Promise<SupplierWithDetails> {
    try {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: {
          ...data,
          rating: data.rating ? Number(data.rating) : undefined,
        },
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 5,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 5,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
      });

      logger.info('Supplier updated successfully', { supplierId: id });

      return supplier as SupplierWithDetails;
    } catch (error) {
      logger.error('Failed to update supplier', { error, id, data });
      throw error;
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string): Promise<void> {
    try {
      // Check if supplier has active BOM items or contracts
      const activeItems = await prisma.bOMItem.count({
        where: {
          supplierId: id,
          status: { in: ['PLANNED', 'ORDERED'] },
        },
      });

      const activeContracts = await prisma.supplierContract.count({
        where: {
          supplierId: id,
          status: 'ACTIVE',
        },
      });

      if (activeItems > 0 || activeContracts > 0) {
        throw new Error('Cannot delete supplier with active items or contracts');
      }

      await prisma.supplier.delete({
        where: { id },
      });

      logger.info('Supplier deleted successfully', { supplierId: id });
    } catch (error) {
      logger.error('Failed to delete supplier', { error, id });
      throw error;
    }
  }

  /**
   * Create supplier contract
   */
  static async createContract(
    supplierId: string,
    data: CreateContractData
  ): Promise<SupplierContract> {
    try {
      const contract = await prisma.supplierContract.create({
        data: {
          ...data,
          supplierId,
          totalValue: data.totalValue ? Number(data.totalValue) : undefined,
          documents: data.documents || [],
        },
      });

      logger.info('Supplier contract created successfully', { 
        contractId: contract.id, 
        supplierId 
      });

      return contract;
    } catch (error) {
      logger.error('Failed to create supplier contract', { error, supplierId, data });
      throw error;
    }
  }

  /**
   * Get supplier contracts
   */
  static async getSupplierContracts(
    supplierId: string,
    pagination: PaginationParams,
    filters?: {
      status?: string;
      contractType?: string;
      projectId?: string;
    }
  ): Promise<PaginatedResponse<SupplierContract>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = { supplierId };

      if (filters) {
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.contractType) {
          where.contractType = filters.contractType;
        }
        if (filters.projectId) {
          where.projectId = filters.projectId;
        }
      }

      // Get total count
      const total = await prisma.supplierContract.count({ where });

      // Get contracts
      const contracts = await prisma.supplierContract.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          supplier: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: contracts,
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
      logger.error('Failed to get supplier contracts', { error, supplierId, pagination, filters });
      throw error;
    }
  }

  /**
   * Update supplier rating based on performance
   */
  static async updateSupplierRating(supplierId: string): Promise<void> {
    try {
      // Get all BOM items for this supplier
      const bomItems = await prisma.bOMItem.findMany({
        where: { supplierId },
        select: {
          status: true,
          deliveryDate: true,
          createdAt: true,
        },
      });

      if (bomItems.length === 0) {
        return;
      }

      // Calculate performance metrics
      const completedItems = bomItems.filter(item => item.status === 'DELIVERED').length;
      const onTimeDeliveries = bomItems.filter(item => 
        item.status === 'DELIVERED' && 
        item.deliveryDate && 
        new Date(item.deliveryDate) >= new Date()
      ).length;

      const completionRate = completedItems / bomItems.length;
      const onTimeRate = onTimeDeliveries / bomItems.length;

      // Calculate rating (1-5 scale)
      const rating = Math.min(5, Math.max(1, (completionRate * 2.5) + (onTimeRate * 2.5)));

      // Update supplier rating and performance metrics
      await prisma.supplier.update({
        where: { id: supplierId },
        data: {
          rating: Number(rating.toFixed(2)),
          performanceMetrics: {
            completionRate: Number((completionRate * 100).toFixed(2)),
            onTimeRate: Number((onTimeRate * 100).toFixed(2)),
            totalOrders: bomItems.length,
            lastUpdated: new Date().toISOString(),
          },
        },
      });

      logger.info('Supplier rating updated', { 
        supplierId, 
        rating: rating.toFixed(2),
        completionRate: (completionRate * 100).toFixed(2) + '%',
        onTimeRate: (onTimeRate * 100).toFixed(2) + '%',
      });
    } catch (error) {
      logger.error('Failed to update supplier rating', { error, supplierId });
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStatistics(supplierId: string): Promise<any> {
    try {
      const [
        bomStats,
        contractStats,
        recentActivity,
      ] = await Promise.all([
        // BOM item statistics
        prisma.bOMItem.aggregate({
          where: { supplierId },
          _count: true,
          _sum: { totalPrice: true },
        }),
        // Contract statistics
        prisma.supplierContract.aggregate({
          where: { supplierId },
          _count: true,
          _sum: { totalValue: true },
        }),
        // Recent activity (last 30 days)
        prisma.bOMItem.count({
          where: {
            supplierId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

      return {
        bomItems: {
          total: bomStats._count,
          totalValue: bomStats._sum.totalPrice || 0,
        },
        contracts: {
          total: contractStats._count,
          totalValue: contractStats._sum.totalValue || 0,
        },
        recentActivity: {
          newItemsLast30Days: recentActivity,
        },
      };
    } catch (error) {
      logger.error('Failed to get supplier statistics', { error, supplierId });
      throw error;
    }
  }

  /**
   * Search suppliers by criteria
   */
  static async searchSuppliers(
    criteria: {
      category?: string;
      specialties?: string[];
      minRating?: number;
      location?: string;
      priceRange?: { min?: number; max?: number };
    },
    pagination: PaginationParams
  ): Promise<PaginatedResponse<SupplierWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = { isActive: true };

      if (criteria.category) {
        where.category = criteria.category;
      }

      if (criteria.specialties && criteria.specialties.length > 0) {
        where.specialties = {
          hasSome: criteria.specialties,
        };
      }

      if (criteria.minRating) {
        where.rating = { gte: criteria.minRating };
      }

      if (criteria.location) {
        where.address = {
          path: ['city'],
          string_contains: criteria.location,
        };
      }

      // Get total count
      const total = await prisma.supplier.count({ where });

      // Get suppliers
      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { name: 'asc' },
        ],
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: suppliers as SupplierWithDetails[],
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
      logger.error('Failed to search suppliers', { error, criteria, pagination });
      throw error;
    }
  }

  /**
   * Get supplier recommendations for a BOM item
   */
  static async getSupplierRecommendations(
    category: string,
    quantity: number,
    location?: string
  ): Promise<SupplierWithDetails[]> {
    try {
      const where: any = {
        isActive: true,
        category,
        rating: { gte: 3.0 }, // Minimum rating
      };

      if (location) {
        where.address = {
          path: ['city'],
          string_contains: location,
        };
      }

      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { _count: { bomItems: 'desc' } }, // Experience
        ],
        take: 10,
      });

      logger.info('Supplier recommendations retrieved', { 
        category, 
        quantity, 
        location, 
        count: suppliers.length 
      });

      return suppliers as SupplierWithDetails[];
    } catch (error) {
      logger.error('Failed to get supplier recommendations', { error, category, quantity, location });
      throw error;
    }
  }

  /**
   * Get top suppliers by category
   */
  static async getTopSuppliers(category?: string, limit: number = 10): Promise<SupplierWithDetails[]> {
    try {
      const where: any = { isActive: true };

      if (category) {
        where.category = category;
      }

      const suppliers = await prisma.supplier.findMany({
        where,
        include: {
          bomItems: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          supplierContracts: {
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
            take: 3,
          },
          _count: {
            select: {
              bomItems: true,
              supplierContracts: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { _count: { bomItems: 'desc' } },
        ],
        take: limit,
      });

      return suppliers as SupplierWithDetails[];
    } catch (error) {
      logger.error('Failed to get top suppliers', { error, category, limit });
      throw error;
    }
  }

  /**
   * Get supplier categories
   */
  static async getSupplierCategories(): Promise<string[]> {
    try {
      const categories = await prisma.supplier.findMany({
        where: { 
          isActive: true,
          category: { not: null },
        },
        select: { category: true },
        distinct: ['category'],
      });

      return categories
        .map(c => c.category)
        .filter(Boolean) as string[];
    } catch (error) {
      logger.error('Failed to get supplier categories', { error });
      throw error;
    }
  }
}