import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { Task, TaskComment, TaskAttachment } from '@prisma/client';

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  assignedTo?: string;
  dueDate?: Date;
  estimatedHours?: number;
  parentTaskId?: string;
  dependencies?: string[];
  tags?: string[];
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  progressPercentage?: number;
  actualHours?: number;
}

export interface TaskWithDetails extends Task {
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
  };
  parentTask?: {
    id: string;
    title: string;
  };
  subtasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
  taskComments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  taskAttachments: Array<{
    id: string;
    description?: string;
    file: {
      id: string;
      name: string;
      originalName: string;
      fileSize: bigint;
      mimeType?: string;
    };
  }>;
  _count: {
    subtasks: number;
    taskComments: number;
    taskAttachments: number;
  };
}

export class TaskService {
  /**
   * Create a new task
   */
  static async createTask(
    projectId: string, 
    createdBy: string, 
    data: CreateTaskData
  ): Promise<TaskWithDetails> {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, createdBy);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const task = await prisma.task.create({
        data: {
          ...data,
          projectId,
          createdBy,
          estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
          dependencies: data.dependencies || [],
          tags: data.tags || [],
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
          taskComments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          taskAttachments: {
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              subtasks: true,
              taskComments: true,
              taskAttachments: true,
            },
          },
        },
      });

      logger.info('Task created successfully', { 
        taskId: task.id, 
        projectId, 
        createdBy 
      });

      return task as TaskWithDetails;
    } catch (error) {
      logger.error('Failed to create task', { error, projectId, createdBy, data });
      throw error;
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(id: string, userId: string): Promise<TaskWithDetails | null> {
    try {
      const task = await prisma.task.findUnique({
        where: { id },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
          taskComments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          taskAttachments: {
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              subtasks: true,
              taskComments: true,
              taskAttachments: true,
            },
          },
        },
      });

      if (!task) {
        return null;
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(task.projectId, userId);
      if (!hasAccess) {
        return null;
      }

      return task as TaskWithDetails;
    } catch (error) {
      logger.error('Failed to get task by ID', { error, id, userId });
      throw error;
    }
  }

  /**
   * Get tasks with pagination and filters
   */
  static async getTasks(
    projectId: string,
    userId: string,
    pagination: PaginationParams,
    filters?: {
      status?: string;
      priority?: string;
      assignedTo?: string;
      type?: string;
      search?: string;
      parentTaskId?: string;
      tags?: string[];
    }
  ): Promise<PaginatedResponse<TaskWithDetails>> {
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
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.priority) {
          where.priority = filters.priority;
        }
        if (filters.assignedTo) {
          where.assignedTo = filters.assignedTo;
        }
        if (filters.type) {
          where.type = filters.type;
        }
        if (filters.parentTaskId) {
          where.parentTaskId = filters.parentTaskId;
        }
        if (filters.tags && filters.tags.length > 0) {
          where.tags = {
            hasSome: filters.tags,
          };
        }
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma.task.count({ where });

      // Get tasks
      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
          taskComments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          taskAttachments: {
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              subtasks: true,
              taskComments: true,
              taskAttachments: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: tasks as TaskWithDetails[],
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
      logger.error('Failed to get tasks', { error, projectId, userId, pagination, filters });
      throw error;
    }
  }

  /**
   * Update task
   */
  static async updateTask(id: string, userId: string, data: UpdateTaskData): Promise<TaskWithDetails> {
    try {
      // Get task to check permissions
      const existingTask = await prisma.task.findUnique({
        where: { id },
        select: { projectId: true, assignedTo: true, createdBy: true },
      });

      if (!existingTask) {
        throw new Error('Task not found');
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(existingTask.projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      // Check if user can update this task
      const canUpdate = existingTask.assignedTo === userId || 
                       existingTask.createdBy === userId ||
                       await this.checkProjectPermission(existingTask.projectId, userId, 'manage_tasks');

      if (!canUpdate) {
        throw new Error('Insufficient permissions to update task');
      }

      const task = await prisma.task.update({
        where: { id },
        data: {
          ...data,
          estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
          actualHours: data.actualHours ? Number(data.actualHours) : undefined,
          progressPercentage: data.progressPercentage ? Math.min(Math.max(data.progressPercentage, 0), 100) : undefined,
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
          taskComments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          taskAttachments: {
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              subtasks: true,
              taskComments: true,
              taskAttachments: true,
            },
          },
        },
      });

      logger.info('Task updated successfully', { taskId: id, userId });

      return task as TaskWithDetails;
    } catch (error) {
      logger.error('Failed to update task', { error, id, userId, data });
      throw error;
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(id: string, userId: string): Promise<void> {
    try {
      // Get task to check permissions
      const task = await prisma.task.findUnique({
        where: { id },
        select: { projectId: true, createdBy: true },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(task.projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      // Check if user can delete this task
      const canDelete = task.createdBy === userId ||
                       await this.checkProjectPermission(task.projectId, userId, 'manage_tasks');

      if (!canDelete) {
        throw new Error('Insufficient permissions to delete task');
      }

      await prisma.task.delete({
        where: { id },
      });

      logger.info('Task deleted successfully', { taskId: id, userId });
    } catch (error) {
      logger.error('Failed to delete task', { error, id, userId });
      throw error;
    }
  }

  /**
   * Add comment to task
   */
  static async addTaskComment(
    taskId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<TaskComment> {
    try {
      // Get task to check permissions
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { projectId: true },
      });

      if (!task) {
        throw new Error('Task not found');
      }

      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(task.projectId, userId);
      if (!hasAccess) {
        throw new Error('No access to project');
      }

      const comment = await prisma.taskComment.create({
        data: {
          taskId,
          userId,
          content,
          parentCommentId,
        },
      });

      logger.info('Task comment added successfully', { taskId, userId, commentId: comment.id });

      return comment;
    } catch (error) {
      logger.error('Failed to add task comment', { error, taskId, userId });
      throw error;
    }
  }

  /**
   * Get user's assigned tasks
   */
  static async getUserTasks(
    userId: string,
    pagination: PaginationParams,
    filters?: {
      status?: string;
      priority?: string;
      projectId?: string;
      overdue?: boolean;
    }
  ): Promise<PaginatedResponse<TaskWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = { assignedTo: userId };

      if (filters) {
        if (filters.status) {
          where.status = filters.status;
        }
        if (filters.priority) {
          where.priority = filters.priority;
        }
        if (filters.projectId) {
          where.projectId = filters.projectId;
        }
        if (filters.overdue) {
          where.dueDate = { lt: new Date() };
          where.status = { not: 'COMPLETED' };
        }
      }

      // Get total count
      const total = await prisma.task.count({ where });

      // Get tasks
      const tasks = await prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          parentTask: {
            select: {
              id: true,
              title: true,
            },
          },
          subtasks: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
          taskComments: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          taskAttachments: {
            include: {
              file: {
                select: {
                  id: true,
                  name: true,
                  originalName: true,
                  fileSize: true,
                  mimeType: true,
                },
              },
            },
          },
          _count: {
            select: {
              subtasks: true,
              taskComments: true,
              taskAttachments: true,
            },
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: tasks as TaskWithDetails[],
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
      logger.error('Failed to get user tasks', { error, userId, pagination, filters });
      throw error;
    }
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

  /**
   * Check if user has specific permission on project
   */
  private static async checkProjectPermission(
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