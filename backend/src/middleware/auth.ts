import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/utils/jwt';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { ApiResponse, ErrorCode, HttpStatus } from '@/types/api';
import { AuthUser } from '@/types/auth';

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.TOKEN_INVALID,
        message: 'Authorization header is required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const token = JWTService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.TOKEN_INVALID,
        message: 'Invalid authorization header format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    // Verify token
    let payload;
    try {
      payload = JWTService.verifyAccessToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.TOKEN_INVALID,
        message,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
      },
    });

    if (!user) {
      logger.warn('Token valid but user not found', { userId: payload.userId });
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    if (!user.isActive) {
      logger.warn('Inactive user attempted access', { userId: user.id });
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.USER_INACTIVE,
        message: 'User account is inactive',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    // Add user to request (excluding password hash)
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword as AuthUser;
    req.sessionId = payload.sessionId;

    logger.debug('User authenticated successfully', { 
      userId: user.id, 
      email: user.email,
      sessionId: payload.sessionId,
    });

    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ErrorCode.INTERNAL_ERROR,
      message: 'Authentication failed',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
}

/**
 * Optional authentication middleware
 * Adds user to request if token is provided and valid, but doesn't require it
 */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = JWTService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }

    // Verify token
    let payload;
    try {
      payload = JWTService.verifyAccessToken(token);
    } catch (error) {
      // Invalid token, but it's optional so continue without user
      return next();
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
      },
    });

    if (user && user.isActive) {
      const { passwordHash, ...userWithoutPassword } = user;
      req.user = userWithoutPassword as AuthUser;
      req.sessionId = payload.sessionId;
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error', { error });
    // Continue without authentication for optional middleware
    next();
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    const userRole = req.user.role?.name;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      logger.warn('Insufficient permissions', { 
        userId: req.user.id, 
        userRole, 
        requiredRoles: allowedRoles 
      });
      
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    next();
  };
}

/**
 * Permission-based authorization middleware
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    try {
      // Check role permissions
      if (req.user.role?.permissions) {
        const permissions = req.user.role.permissions as Record<string, any>;
        
        // Check for wildcard permission
        if (permissions['*'] === '*') {
          return next();
        }
        
        // Check specific resource permission
        const resourcePermissions = permissions[resource];
        if (resourcePermissions === '*' || 
            (Array.isArray(resourcePermissions) && resourcePermissions.includes(action)) ||
            (typeof resourcePermissions === 'string' && resourcePermissions.includes(action))) {
          return next();
        }
      }

      // Check user-specific permissions
      const userPermissions = await prisma.userPermission.findMany({
        where: {
          userId: req.user.id,
          resourceType: resource,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
      });

      const hasPermission = userPermissions.some(perm => {
        const permissions = perm.permissions as Record<string, any>;
        return permissions[action] === true || permissions['*'] === true;
      });

      if (!hasPermission) {
        logger.warn('Permission denied', { 
          userId: req.user.id, 
          resource, 
          action 
        });
        
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: `Permission denied for ${action} on ${resource}`,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
      }

      next();
    } catch (error) {
      logger.error('Permission check error', { error, userId: req.user.id, resource, action });
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Permission check failed',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };
}

/**
 * Resource ownership middleware
 * Checks if the authenticated user owns the resource
 */
export function requireOwnership(resourceIdParam: string = 'id', resourceType: 'project' | 'task' | 'file' = 'project') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: ErrorCode.INSUFFICIENT_PERMISSIONS,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    try {
      const resourceId = req.params[resourceIdParam];
      
      if (!resourceId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.INVALID_INPUT,
          message: `Resource ID parameter '${resourceIdParam}' is required`,
          timestamp: new Date().toISOString(),
        } as ApiResponse);
      }

      let isOwner = false;

      switch (resourceType) {
        case 'project':
          const project = await prisma.project.findUnique({
            where: { id: resourceId },
          });
          isOwner = project?.managerId === req.user.id;
          break;
          
        case 'task':
          const task = await prisma.task.findUnique({
            where: { id: resourceId },
          });
          isOwner = task?.assignedTo === req.user.id || task?.createdBy === req.user.id;
          break;
          
        case 'file':
          const file = await prisma.file.findUnique({
            where: { id: resourceId },
          });
          isOwner = file?.uploadedBy === req.user.id;
          break;
      }

      if (!isOwner) {
        logger.warn('Resource ownership denied', { 
          userId: req.user.id, 
          resourceId, 
          resourceType 
        });
        
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: 'You do not own this resource',
          timestamp: new Date().toISOString(),
        } as ApiResponse);
      }

      next();
    } catch (error) {
      logger.error('Ownership check error', { error, userId: req.user.id, resourceType });
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Ownership check failed',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  };
}