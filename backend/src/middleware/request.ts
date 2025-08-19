import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/config/logger';

/**
 * Request ID middleware
 * Adds a unique request ID to each request
 */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

/**
 * Request logging middleware
 * Logs incoming requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string;

  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId,
    userId: req.user?.id,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length'),
      requestId,
      userId: req.user?.id,
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Request timeout middleware
 */
export function requestTimeout(timeout: number = 30000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] as string;
    
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn('Request timeout', {
          method: req.method,
          url: req.url,
          timeout: `${timeout}ms`,
          requestId,
          userId: req.user?.id,
        });

        res.status(408).json({
          success: false,
          error: 'REQUEST_TIMEOUT',
          message: 'Request timeout',
          timestamp: new Date().toISOString(),
          requestId,
        });
      }
    }, timeout);

    // Clear timeout when response is sent
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      clearTimeout(timer);
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Request size limit middleware
 */
export function requestSizeLimit(limit: number = 10 * 1024 * 1024) { // 10MB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const requestId = req.headers['x-request-id'] as string;

    if (contentLength > limit) {
      logger.warn('Request size limit exceeded', {
        contentLength,
        limit,
        method: req.method,
        url: req.url,
        requestId,
        userId: req.user?.id,
      });

      return res.status(413).json({
        success: false,
        error: 'REQUEST_TOO_LARGE',
        message: `Request size exceeds limit of ${limit} bytes`,
        timestamp: new Date().toISOString(),
        requestId,
      });
    }

    next();
  };
}

/**
 * User context middleware
 * Adds user context to request for logging
 */
export function userContext(req: Request, res: Response, next: NextFunction) {
  // This middleware runs after authentication
  // It's mainly for adding user context to subsequent logs
  if (req.user) {
    logger.debug('User context set', {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role?.name,
      requestId: req.headers['x-request-id'],
    });
  }

  next();
}

/**
 * IP whitelist middleware
 */
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const requestId = req.headers['x-request-id'] as string;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logger.warn('IP not whitelisted', {
        clientIP,
        allowedIPs,
        method: req.method,
        url: req.url,
        requestId,
      });

      return res.status(403).json({
        success: false,
        error: 'IP_NOT_ALLOWED',
        message: 'IP address not allowed',
        timestamp: new Date().toISOString(),
        requestId,
      });
    }

    next();
  };
}

/**
 * Maintenance mode middleware
 */
export function maintenanceMode(isMaintenanceMode: boolean = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isMaintenanceMode) {
      const requestId = req.headers['x-request-id'] as string;

      logger.info('Request blocked - maintenance mode', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        requestId,
      });

      return res.status(503).json({
        success: false,
        error: 'MAINTENANCE_MODE',
        message: 'Service temporarily unavailable due to maintenance',
        timestamp: new Date().toISOString(),
        requestId,
      });
    }

    next();
  };
}

/**
 * Request method override middleware
 * Allows using _method query parameter to override HTTP method
 */
export function methodOverride(req: Request, res: Response, next: NextFunction) {
  if (req.query._method && typeof req.query._method === 'string') {
    const method = req.query._method.toUpperCase();
    if (['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      req.method = method;
      delete req.query._method;
    }
  }
  next();
}

/**
 * Request validation middleware
 * Basic request validation
 */
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string;

  // Check for required headers
  if (!req.get('user-agent')) {
    logger.warn('Missing User-Agent header', {
      method: req.method,
      url: req.url,
      requestId,
    });
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempt
    /union.*select/i,  // SQL injection
  ];

  const url = req.url;
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));

  if (isSuspicious) {
    logger.warn('Suspicious request detected', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId,
    });

    return res.status(400).json({
      success: false,
      error: 'INVALID_REQUEST',
      message: 'Invalid request format',
      timestamp: new Date().toISOString(),
      requestId,
    });
  }

  next();
}