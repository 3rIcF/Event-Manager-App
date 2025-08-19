import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode, HttpStatus } from '@/types/api';
import { logger } from '@/config/logger';

/**
 * Validation middleware factory
 */
export function validateRequest<T extends z.ZodSchema>(
  schema: T,
  property: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[property];
      const validatedData = schema.parse(data);
      
      // Replace the original data with validated data
      (req as any)[property] = validatedData;
      
      logger.debug('Request validation successful', {
        property,
        data: validatedData,
        path: req.path,
      });
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Request validation failed', {
          property,
          errors: validationErrors,
          path: req.path,
          data,
        });

        const response: ApiResponse = {
          success: false,
          error: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          data: { errors: validationErrors },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        };

        return res.status(HttpStatus.BAD_REQUEST).json(response);
      }

      logger.error('Unexpected validation error', { error, path: req.path });
      next(error);
    }
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate phone number format (international)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate date string format (ISO 8601)
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\0/g, ''); // Remove null bytes
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const baseType = type.slice(0, -2);
      return mimeType.startsWith(baseType);
    }
    return mimeType === type;
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: z.string().uuid('Invalid ID format'),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  url: z.string().url('Invalid URL format').optional(),
  date: z.string().datetime('Invalid date format').optional(),
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().nonnegative('Must be a non-negative number'),
  
  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  
  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  
  // Search
  search: z.string().optional(),
  
  // Status enums
  projectStatus: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']),
  taskStatus: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  
  // Text fields
  shortText: z.string().min(1).max(255),
  mediumText: z.string().max(1000),
  longText: z.string().max(10000),
  
  // Arrays
  stringArray: z.array(z.string()),
  idArray: z.array(z.string().uuid()),
};

/**
 * Create a schema for partial updates
 */
export function createPartialSchema<T extends z.ZodSchema>(schema: T): z.ZodOptional<z.ZodPartial<T>> {
  return schema.partial().optional();
}

/**
 * Merge multiple validation errors
 */
export function mergeValidationErrors(...errors: z.ZodError[]): z.ZodError {
  const allIssues = errors.flatMap(error => error.issues);
  return new z.ZodError(allIssues);
}

/**
 * Transform validation error to user-friendly format
 */
export function formatValidationError(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  });
  
  return formatted;
}

/**
 * Validate request body against schema and return typed data
 */
export function validateAndTransform<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${JSON.stringify(formatValidationError(error))}`);
    }
    throw error;
  }
}