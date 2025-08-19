import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger';
import { ApiResponse, ErrorCode, HttpStatus } from '@/types/api';
import { isDevelopment } from '@/config/env';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error('Unhandled error', {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
      details: error.details,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    requestId: req.headers['x-request-id'],
  });

  // Default error values
  let statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = error.code || ErrorCode.INTERNAL_ERROR;
  let message = error.message || 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.VALIDATION_ERROR;
    message = 'Validation failed';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
    message = 'Unauthorized access';
  } else if (error.name === 'ForbiddenError') {
    statusCode = HttpStatus.FORBIDDEN;
    errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
    message = 'Forbidden access';
  } else if (error.name === 'NotFoundError') {
    statusCode = HttpStatus.NOT_FOUND;
    errorCode = ErrorCode.RESOURCE_NOT_FOUND;
    message = 'Resource not found';
  } else if (error.name === 'ConflictError') {
    statusCode = HttpStatus.CONFLICT;
    errorCode = ErrorCode.RESOURCE_CONFLICT;
    message = 'Resource conflict';
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCode.DATABASE_ERROR;
    message = 'Database operation failed';

    // Handle specific Prisma error codes
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        statusCode = HttpStatus.CONFLICT;
        errorCode = ErrorCode.RESOURCE_ALREADY_EXISTS;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        errorCode = ErrorCode.RESOURCE_NOT_FOUND;
        message = 'Resource not found';
        break;
      case 'P2003':
        statusCode = HttpStatus.BAD_REQUEST;
        errorCode = ErrorCode.RESOURCE_CONFLICT;
        message = 'Foreign key constraint failed';
        break;
    }
  }

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    error: errorCode,
    message,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string,
  };

  // Add error details in development mode
  if (isDevelopment()) {
    errorResponse.data = {
      details: error.details,
      stack: error.stack,
    };
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    error: ErrorCode.RESOURCE_NOT_FOUND,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string,
  };

  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.headers['x-request-id'],
  });

  res.status(HttpStatus.NOT_FOUND).json(response);
}

/**
 * Async error wrapper
 * Catches async errors and passes them to error handler
 */
export function asyncHandler<T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) {
  return (req: T, res: U, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create custom error
 */
export function createError(
  message: string,
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  code: string = ErrorCode.INTERNAL_ERROR,
  details?: any
): CustomError {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Validation error creator
 */
export function createValidationError(
  message: string,
  details?: any
): CustomError {
  return createError(
    message,
    HttpStatus.BAD_REQUEST,
    ErrorCode.VALIDATION_ERROR,
    details
  );
}

/**
 * Not found error creator
 */
export function createNotFoundError(
  resource: string = 'Resource'
): CustomError {
  return createError(
    `${resource} not found`,
    HttpStatus.NOT_FOUND,
    ErrorCode.RESOURCE_NOT_FOUND
  );
}

/**
 * Unauthorized error creator
 */
export function createUnauthorizedError(
  message: string = 'Unauthorized access'
): CustomError {
  return createError(
    message,
    HttpStatus.UNAUTHORIZED,
    ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

/**
 * Forbidden error creator
 */
export function createForbiddenError(
  message: string = 'Forbidden access'
): CustomError {
  return createError(
    message,
    HttpStatus.FORBIDDEN,
    ErrorCode.INSUFFICIENT_PERMISSIONS
  );
}

/**
 * Conflict error creator
 */
export function createConflictError(
  message: string,
  details?: any
): CustomError {
  return createError(
    message,
    HttpStatus.CONFLICT,
    ErrorCode.RESOURCE_CONFLICT,
    details
  );
}