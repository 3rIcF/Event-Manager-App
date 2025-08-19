import { Request, Response } from 'express';
import { BOMService } from '@/services/bom.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { validateAndTransform } from '@/utils/validation';
import { z } from 'zod';

// Validation schemas
const createBOMItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(255),
  description: z.string().optional(),
  sku: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().nonnegative().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.enum(['PLANNED', 'ORDERED', 'DELIVERED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  deliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  parentId: z.string().uuid().optional(),
});

const updateBOMItemSchema = createBOMItemSchema.partial().extend({
  totalPrice: z.number().nonnegative().optional(),
});

const bomFiltersSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  supplierId: z.string().uuid().optional(),
  parentId: z.string().optional(),
  search: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

const importBOMSchema = z.object({
  items: z.array(createBOMItemSchema),
});

export class BOMController {
  /**
   * Create a new BOM item
   */
  static async createBOMItem(req: Request, res: Response) {
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
      const data = validateAndTransform(createBOMItemSchema, req.body);

      // Convert date strings to Date objects
      if (data.deliveryDate) {
        data.deliveryDate = new Date(data.deliveryDate);
      }

      const bomItem = await BOMService.createBOMItem(projectId, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { bomItem },
        message: 'BOM item created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('BOM item created successfully', {
        bomItemId: bomItem.id,
        projectId,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create BOM item', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to create BOM item';

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
   * Get BOM items for a project
   */
  static async getBOMItems(req: Request, res: Response) {
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
      const filters = validateAndTransform(bomFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await BOMService.getBOMItems(projectId, req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'BOM items retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get BOM items', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to retrieve BOM items';

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
   * Get BOM hierarchy for a project
   */
  static async getBOMHierarchy(req: Request, res: Response) {
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

      const hierarchy = await BOMService.getBOMHierarchy(projectId, req.user.id);

      const response: ApiResponse = {
        success: true,
        data: { hierarchy },
        message: 'BOM hierarchy retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get BOM hierarchy', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to retrieve BOM hierarchy';

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
   * Get BOM item by ID
   */
  static async getBOMItemById(req: Request, res: Response) {
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

      const bomItem = await BOMService.getBOMItemById(id, req.user.id);

      if (!bomItem) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'BOM item not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const response: ApiResponse = {
        success: true,
        data: { bomItem },
        message: 'BOM item retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get BOM item by ID', {
        error: error instanceof Error ? error.message : error,
        bomItemId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve BOM item',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Update BOM item
   */
  static async updateBOMItem(req: Request, res: Response) {
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
      const data = validateAndTransform(updateBOMItemSchema, req.body);

      // Convert date strings to Date objects
      if (data.deliveryDate) {
        data.deliveryDate = new Date(data.deliveryDate);
      }

      const bomItem = await BOMService.updateBOMItem(id, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { bomItem },
        message: 'BOM item updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('BOM item updated successfully', {
        bomItemId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to update BOM item', {
        error: error instanceof Error ? error.message : error,
        bomItemId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to update BOM item';

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
   * Delete BOM item
   */
  static async deleteBOMItem(req: Request, res: Response) {
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

      await BOMService.deleteBOMItem(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'BOM item deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('BOM item deleted successfully', {
        bomItemId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to delete BOM item', {
        error: error instanceof Error ? error.message : error,
        bomItemId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to delete BOM item';

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
   * Get BOM statistics for a project
   */
  static async getBOMStatistics(req: Request, res: Response) {
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

      const statistics = await BOMService.getBOMStatistics(projectId, req.user.id);

      const response: ApiResponse = {
        success: true,
        data: { statistics },
        message: 'BOM statistics retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get BOM statistics', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to retrieve BOM statistics';

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
   * Import BOM items from CSV/Excel
   */
  static async importBOMItems(req: Request, res: Response) {
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
      const { items } = validateAndTransform(importBOMSchema, req.body);

      // Convert date strings to Date objects for each item
      const processedItems = items.map(item => ({
        ...item,
        deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : undefined,
      }));

      const bomItems = await BOMService.importBOMItems(projectId, req.user.id, processedItems);

      const response: ApiResponse = {
        success: true,
        data: { 
          bomItems,
          imported: bomItems.length,
        },
        message: `${bomItems.length} BOM items imported successfully`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('BOM items imported successfully', {
        projectId,
        count: bomItems.length,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to import BOM items', {
        error: error instanceof Error ? error.message : error,
        projectId: req.params.projectId,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to import BOM items';

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