import { Request, Response } from 'express';
import { SupplierService } from '@/services/supplier.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { validateAndTransform } from '@/utils/validation';
import { z } from 'zod';

// Validation schemas
const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(255),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  address: z.record(z.any()).optional(),
  taxId: z.string().optional(),
  paymentTerms: z.string().optional(),
  category: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  performanceMetrics: z.record(z.any()).optional(),
});

const updateSupplierSchema = createSupplierSchema.partial().extend({
  rating: z.number().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
});

const supplierFiltersSchema = z.object({
  category: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  rating: z.string().transform(Number).optional(),
  search: z.string().optional(),
  specialties: z.string().optional().transform(val => val ? val.split(',') : undefined),
});

const supplierSearchSchema = z.object({
  category: z.string().optional(),
  specialties: z.string().optional().transform(val => val ? val.split(',') : undefined),
  minRating: z.string().transform(Number).optional(),
  location: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
});

const createContractSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  contractType: z.string().min(1, 'Contract type is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  totalValue: z.number().nonnegative().optional(),
  paymentTerms: z.string().optional(),
  termsConditions: z.string().optional(),
  projectId: z.string().uuid().optional(),
  documents: z.array(z.record(z.any())).optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export class SupplierController {
  /**
   * Create a new supplier
   */
  static async createSupplier(req: Request, res: Response) {
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

      const data = validateAndTransform(createSupplierSchema, req.body);

      const supplier = await SupplierService.createSupplier(data);

      const response: ApiResponse = {
        success: true,
        data: { supplier },
        message: 'Supplier created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Supplier created successfully', {
        supplierId: supplier.id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create supplier', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to create supplier',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get suppliers with pagination and filters
   */
  static async getSuppliers(req: Request, res: Response) {
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
      const filters = validateAndTransform(supplierFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await SupplierService.getSuppliers(pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Suppliers retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get suppliers', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve suppliers',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(req: Request, res: Response) {
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

      const supplier = await SupplierService.getSupplierById(id);

      if (!supplier) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'Supplier not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const response: ApiResponse = {
        success: true,
        data: { supplier },
        message: 'Supplier retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get supplier by ID', {
        error: error instanceof Error ? error.message : error,
        supplierId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve supplier',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(req: Request, res: Response) {
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
      const data = validateAndTransform(updateSupplierSchema, req.body);

      const supplier = await SupplierService.updateSupplier(id, data);

      const response: ApiResponse = {
        success: true,
        data: { supplier },
        message: 'Supplier updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Supplier updated successfully', {
        supplierId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to update supplier', {
        error: error instanceof Error ? error.message : error,
        supplierId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to update supplier';

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
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
   * Delete supplier
   */
  static async deleteSupplier(req: Request, res: Response) {
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

      await SupplierService.deleteSupplier(id);

      const response: ApiResponse = {
        success: true,
        message: 'Supplier deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Supplier deleted successfully', {
        supplierId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to delete supplier', {
        error: error instanceof Error ? error.message : error,
        supplierId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to delete supplier';

      if (error instanceof Error) {
        if (error.message.includes('active items or contracts')) {
          statusCode = HttpStatus.CONFLICT;
          errorCode = ErrorCode.RESOURCE_CONFLICT;
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
   * Search suppliers
   */
  static async searchSuppliers(req: Request, res: Response) {
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
      const criteria = validateAndTransform(supplierSearchSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      // Build price range if provided
      const searchCriteria = {
        ...criteria,
        priceRange: (criteria.minPrice || criteria.maxPrice) ? {
          min: criteria.minPrice,
          max: criteria.maxPrice,
        } : undefined,
      };

      const result = await SupplierService.searchSuppliers(searchCriteria, pagination);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Supplier search completed successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to search suppliers', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to search suppliers',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get supplier recommendations
   */
  static async getSupplierRecommendations(req: Request, res: Response) {
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

      const { category, quantity, location } = req.query;

      if (!category || !quantity) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'Category and quantity are required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const recommendations = await SupplierService.getSupplierRecommendations(
        category as string,
        Number(quantity),
        location as string
      );

      const response: ApiResponse = {
        success: true,
        data: { recommendations },
        message: 'Supplier recommendations retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get supplier recommendations', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get supplier recommendations',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get top suppliers
   */
  static async getTopSuppliers(req: Request, res: Response) {
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

      const { category, limit } = req.query;

      const suppliers = await SupplierService.getTopSuppliers(
        category as string,
        limit ? Number(limit) : 10
      );

      const response: ApiResponse = {
        success: true,
        data: { suppliers },
        message: 'Top suppliers retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get top suppliers', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get top suppliers',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get supplier categories
   */
  static async getSupplierCategories(req: Request, res: Response) {
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

      const categories = await SupplierService.getSupplierCategories();

      const response: ApiResponse = {
        success: true,
        data: { categories },
        message: 'Supplier categories retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get supplier categories', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get supplier categories',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get supplier statistics
   */
  static async getSupplierStatistics(req: Request, res: Response) {
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

      const statistics = await SupplierService.getSupplierStatistics(id);

      const response: ApiResponse = {
        success: true,
        data: { statistics },
        message: 'Supplier statistics retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get supplier statistics', {
        error: error instanceof Error ? error.message : error,
        supplierId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to get supplier statistics',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }
}