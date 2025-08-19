import { Request, Response } from 'express';
import { TaskService } from '@/services/task.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { validateAndTransform } from '@/utils/validation';
import { z } from 'zod';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  type: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  parentTaskId: z.string().uuid().optional(),
  dependencies: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  progressPercentage: z.number().min(0).max(100).optional(),
  actualHours: z.number().nonnegative().optional(),
});

const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  parentCommentId: z.string().uuid().optional(),
});

const taskFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  parentTaskId: z.string().uuid().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  overdue: z.string().transform(val => val === 'true').optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export class TaskController {
  /**
   * Create a new task
   */
  static async createTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { projectId } = req.params;
      const data = validateAndTransform(createTaskSchema, req.body);

      // Convert date strings to Date objects
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      const task = await TaskService.createTask(projectId, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { task },
        message: 'Task created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Task created successfully', {
        taskId: task.id,
        projectId,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create task', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to create task';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get tasks for a project
   */
  static async getProjectTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { projectId } = req.params;
      const paginationData = validateAndTransform(paginationSchema, req.query);
      const filters = validateAndTransform(taskFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await TaskService.getTasks(projectId, req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Tasks retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get project tasks', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to retrieve tasks';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get task by ID
   */
  static async getTaskById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { id } = req.params;

      const task = await TaskService.getTaskById(id, req.user.id);

      if (!task) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Task not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const response: ApiResponse = {
        success: true,
        data: { task },
        message: 'Task retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get task by ID', {
        error: error instanceof Error ? error.message : error,
        taskId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve task',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Update task
   */
  static async updateTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { id } = req.params;
      const data = validateAndTransform(updateTaskSchema, req.body);

      // Convert date strings to Date objects
      if (data.dueDate) {
        data.dueDate = new Date(data.dueDate);
      }

      const task = await TaskService.updateTask(id, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { task },
        message: 'Task updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Task updated successfully', {
        taskId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to update task', {
        error: error instanceof Error ? error.message : error,
        taskId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to update task';

      if (error instanceof Error) {
        if (error.message.includes('Insufficient permissions')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.RESOURCE_NOT_FOUND;
          message = error.message;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { id } = req.params;

      await TaskService.deleteTask(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Task deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Task deleted successfully', {
        taskId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to delete task', {
        error: error instanceof Error ? error.message : error,
        taskId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to delete task';

      if (error instanceof Error) {
        if (error.message.includes('Insufficient permissions')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.RESOURCE_NOT_FOUND;
          message = error.message;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Add comment to task
   */
  static async addTaskComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { id } = req.params;
      const { content, parentCommentId } = validateAndTransform(addCommentSchema, req.body);

      const comment = await TaskService.addTaskComment(id, req.user.id, content, parentCommentId);

      const response: ApiResponse = {
        success: true,
        data: { comment },
        message: 'Comment added successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Task comment added successfully', {
        taskId: id,
        commentId: comment.id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to add task comment', {
        error: error instanceof Error ? error.message : error,
        taskId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to add comment';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.RESOURCE_NOT_FOUND;
          message = error.message;
        }
      }

      const response: ApiResponse = {
        success: false,
        error: errorCode,
        message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(statusCode).json(response);
    }
  }

  /**
   * Get user's assigned tasks
   */
  static async getUserTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const paginationData = validateAndTransform(paginationSchema, req.query);
      const filters = validateAndTransform(taskFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await TaskService.getUserTasks(req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User tasks retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get user tasks', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve user tasks',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }
}