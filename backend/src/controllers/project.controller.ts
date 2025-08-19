import { Request, Response } from 'express';
import { ProjectService } from '@/services/project.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { validateAndTransform } from '@/utils/validation';
import { z } from 'zod';

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  clientId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
  actualCost: z.number().nonnegative().optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.string().min(1, 'Role is required'),
  permissions: z.record(z.any()).optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

const projectFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  managerId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export class ProjectController {
  /**
   * Create a new project
   */
  static async createProject(req: Request, res: Response) {
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

      const data = validateAndTransform(createProjectSchema, req.body);

      // Convert date strings to Date objects
      if (data.startDate) {
        data.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        data.endDate = new Date(data.endDate);
      }

      const project = await ProjectService.createProject(req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { project },
        message: 'Project created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Project created successfully', {
        projectId: project.id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create project', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create project',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get projects with pagination and filters
   */
  static async getProjects(req: Request, res: Response) {
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
      const filters = validateAndTransform(projectFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100), // Max 100 items per page
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await ProjectService.getProjects(req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Projects retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get projects', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve projects',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get project by ID
   */
  static async getProjectById(req: Request, res: Response) {
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

      if (!id) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'Project ID is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const project = await ProjectService.getProjectById(id, req.user.id);

      if (!project) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Project not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const response: ApiResponse = {
        success: true,
        data: { project },
        message: 'Project retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get project by ID', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve project',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Update project
   */
  static async updateProject(req: Request, res: Response) {
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
      const data = validateAndTransform(updateProjectSchema, req.body);

      // Convert date strings to Date objects
      if (data.startDate) {
        data.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        data.endDate = new Date(data.endDate);
      }

      const project = await ProjectService.updateProject(id, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { project },
        message: 'Project updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Project updated successfully', {
        projectId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to update project', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to update project';

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
   * Delete project
   */
  static async deleteProject(req: Request, res: Response) {
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

      await ProjectService.deleteProject(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Project deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Project deleted successfully', {
        projectId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to delete project', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to delete project';

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
   * Add project member
   */
  static async addProjectMember(req: Request, res: Response) {
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
      const memberData = validateAndTransform(addMemberSchema, req.body);

      const projectMember = await ProjectService.addProjectMember(id, req.user.id, memberData);

      const response: ApiResponse = {
        success: true,
        data: { projectMember },
        message: 'Project member added successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Project member added successfully', {
        projectId: id,
        memberId: memberData.userId,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to add project member', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to add project member';

      if (error instanceof Error) {
        if (error.message.includes('Insufficient permissions')) {
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
   * Remove project member
   */
  static async removeProjectMember(req: Request, res: Response) {
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

      const { id, memberId } = req.params;

      await ProjectService.removeProjectMember(id, req.user.id, memberId);

      const response: ApiResponse = {
        success: true,
        message: 'Project member removed successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Project member removed successfully', {
        projectId: id,
        memberId,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to remove project member', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        memberId: req.params.memberId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to remove project member';

      if (error instanceof Error) {
        if (error.message.includes('Insufficient permissions')) {
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
   * Get project statistics
   */
  static async getProjectStatistics(req: Request, res: Response) {
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

      const statistics = await ProjectService.getProjectStatistics(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        data: { statistics },
        message: 'Project statistics retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get project statistics', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to retrieve project statistics';

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
}