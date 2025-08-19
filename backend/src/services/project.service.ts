import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { Project, ProjectMember, ProjectPhase } from '@prisma/client';

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  clientId?: string;
  organizationId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  actualCost?: number;
}

export interface ProjectWithDetails extends Project {
  manager: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  client?: {
    id: string;
    name: string;
    contactPerson?: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  projectMembers: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  _count: {
    tasks: number;
    bomItems: number;
    permits: number;
    logistics: number;
    files: number;
  };
}

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(managerId: string, data: CreateProjectData): Promise<ProjectWithDetails> {
    try {
      const project = await prisma.project.create({
        data: {
          ...data,
          managerId,
          budget: data.budget ? Number(data.budget) : undefined,
          metadata: data.metadata || {},
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          projectMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              bomItems: true,
              permits: true,
              logistics: true,
              files: true,
            },
          },
        },
      });

      // Add manager as project member with admin role
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId: managerId,
          role: 'admin',
          permissions: { '*': '*' },
        },
      });

      logger.info('Project created successfully', { 
        projectId: project.id, 
        managerId, 
        name: data.name 
      });

      return project as ProjectWithDetails;
    } catch (error) {
      logger.error('Failed to create project', { error, managerId, data });
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  static async getProjectById(id: string, userId?: string): Promise<ProjectWithDetails | null> {
    try {
      const project = await prisma.project.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          projectMembers: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              bomItems: true,
              permits: true,
              logistics: true,
              files: true,
            },
          },
        },
      });

      if (project && userId) {
        // Check if user has access to this project
        const hasAccess = await this.checkProjectAccess(id, userId);
        if (!hasAccess) {
          return null;
        }
      }

      return project as ProjectWithDetails | null;
    } catch (error) {
      logger.error('Failed to get project by ID', { error, id, userId });
      throw error;
    }
  }

  /**
   * Get projects with pagination and filters
   */
  static async getProjects(
    userId: string,
    pagination: PaginationParams,
    filters?: {
      status?: string;
      priority?: string;
      managerId?: string;
      clientId?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<ProjectWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = {
        OR: [
          { managerId: userId },
          {
            projectMembers: {
              some: {
                userId,
                isActive: true,
              },
            },
          },
        ],
      };

      if (filters) {
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.priority) {
          where.priority = filters.priority;
        }
        if (filters.managerId) {
          where.managerId = filters.managerId;
        }
        if (filters.clientId) {
          where.clientId = filters.clientId;
        }
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma.project.count({ where });

      // Get projects
      const projects = await prisma.project.findMany({
        where,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          projectMembers: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              bomItems: true,
              permits: true,
              logistics: true,
              files: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: projects as ProjectWithDetails[],
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
      logger.error('Failed to get projects', { error, userId, pagination, filters });
      throw error;
    }
  }

  /**
   * Update project
   */
  static async updateProject(id: string, userId: string, data: UpdateProjectData): Promise<ProjectWithDetails> {
    try {
      // Check if user has permission to update
      const hasPermission = await this.checkProjectPermission(id, userId, 'update');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update project');
      }

      const project = await prisma.project.update({
        where: { id },
        data: {
          ...data,
          budget: data.budget ? Number(data.budget) : undefined,
          actualCost: data.actualCost ? Number(data.actualCost) : undefined,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              contactPerson: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          projectMembers: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              tasks: true,
              bomItems: true,
              permits: true,
              logistics: true,
              files: true,
            },
          },
        },
      });

      logger.info('Project updated successfully', { projectId: id, userId });

      return project as ProjectWithDetails;
    } catch (error) {
      logger.error('Failed to update project', { error, id, userId, data });
      throw error;
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(id: string, userId: string): Promise<void> {
    try {
      // Check if user is project manager or has admin role
      const project = await prisma.project.findUnique({
        where: { id },
        select: { managerId: true },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      if (project.managerId !== userId) {
        // Check if user has admin permissions
        const hasPermission = await this.checkProjectPermission(id, userId, 'delete');
        if (!hasPermission) {
          throw new Error('Insufficient permissions to delete project');
        }
      }

      await prisma.project.delete({
        where: { id },
      });

      logger.info('Project deleted successfully', { projectId: id, userId });
    } catch (error) {
      logger.error('Failed to delete project', { error, id, userId });
      throw error;
    }
  }

  /**
   * Add project member
   */
  static async addProjectMember(
    projectId: string,
    userId: string,
    memberData: {
      userId: string;
      role: string;
      permissions?: Record<string, any>;
    }
  ): Promise<ProjectMember> {
    try {
      // Check if user has permission to add members
      const hasPermission = await this.checkProjectPermission(projectId, userId, 'manage_members');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to add project members');
      }

      const projectMember = await prisma.projectMember.create({
        data: {
          projectId,
          userId: memberData.userId,
          role: memberData.role,
          permissions: memberData.permissions || {},
        },
      });

      logger.info('Project member added successfully', { 
        projectId, 
        memberId: memberData.userId, 
        addedBy: userId 
      });

      return projectMember;
    } catch (error) {
      logger.error('Failed to add project member', { error, projectId, userId, memberData });
      throw error;
    }
  }

  /**
   * Remove project member
   */
  static async removeProjectMember(
    projectId: string,
    userId: string,
    memberId: string
  ): Promise<void> {
    try {
      // Check if user has permission to remove members
      const hasPermission = await this.checkProjectPermission(projectId, userId, 'manage_members');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to remove project members');
      }

      await prisma.projectMember.update({
        where: {
          projectId_userId: {
            projectId,
            userId: memberId,
          },
        },
        data: {
          isActive: false,
          leftAt: new Date(),
        },
      });

      logger.info('Project member removed successfully', { 
        projectId, 
        memberId, 
        removedBy: userId 
      });
    } catch (error) {
      logger.error('Failed to remove project member', { error, projectId, userId, memberId });
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStatistics(projectId: string, userId: string): Promise<any> {
    try {
      const hasAccess = await this.checkProjectAccess(projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const [
        taskStats,
        bomStats,
        permitStats,
        logisticsStats,
        fileStats,
        projectPhases,
      ] = await Promise.all([
        // Task statistics
        prisma.task.groupBy({
          by: ['status'],
          where: { projectId },
          _count: true,
        }),
        // BOM statistics
        prisma.bOMItem.aggregate({
          where: { projectId },
          _count: true,
          _sum: { totalPrice: true },
        }),
        // Permit statistics
        prisma.permit.groupBy({
          by: ['status'],
          where: { projectId },
          _count: true,
        }),
        // Logistics statistics
        prisma.logistic.groupBy({
          by: ['status'],
          where: { projectId },
          _count: true,
        }),
        // File statistics
        prisma.file.aggregate({
          where: { projectId },
          _count: true,
          _sum: { fileSize: true },
        }),
        // Project phases
        prisma.projectPhase.findMany({
          where: { projectId },
          orderBy: { orderIndex: 'asc' },
        }),
      ]);

      return {
        tasks: taskStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        bom: {
          totalItems: bomStats._count,
          totalValue: bomStats._sum.totalPrice || 0,
        },
        permits: permitStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        logistics: logisticsStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        files: {
          totalFiles: fileStats._count,
          totalSize: fileStats._sum.fileSize || 0,
        },
        phases: projectPhases,
      };
    } catch (error) {
      logger.error('Failed to get project statistics', { error, projectId, userId });
      throw error;
    }
  }

  /**
   * Check if user has access to project
   */
  static async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
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

      // Check if user is manager or member
      return project.managerId === userId || project.projectMembers.length > 0;
    } catch (error) {
      logger.error('Failed to check project access', { error, projectId, userId });
      return false;
    }
  }

  /**
   * Check if user has specific permission on project
   */
  static async checkProjectPermission(
    projectId: string, 
    userId: string, 
    permission: string
  ): Promise<boolean> {
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

      // Project manager has all permissions
      if (project.managerId === userId) {
        return true;
      }

      // Check member permissions
      const member = project.projectMembers[0];
      if (!member) {
        return false;
      }

      const permissions = member.permissions as Record<string, any>;
      return permissions['*'] === '*' || permissions[permission] === true;
    } catch (error) {
      logger.error('Failed to check project permission', { error, projectId, userId, permission });
      return false;
    }
  }
}