import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { 
  LoginInput, 
  RegisterInput, 
  ChangePasswordInput,
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from '@/types/auth';
import { validateAndTransform } from '@/utils/validation';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response) {
    try {
      const data = validateAndTransform(registerSchema, req.body);

      const result = await AuthService.register(data);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        message: 'User registered successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('User registration successful', { 
        userId: result.user.id,
        email: result.user.email,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('User registration failed', { 
        error: error instanceof Error ? error.message : error,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.BAD_REQUEST;
      let errorCode = ErrorCode.VALIDATION_ERROR;
      let message = 'Registration failed';

      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          statusCode = HttpStatus.CONFLICT;
          errorCode = ErrorCode.USER_ALREADY_EXISTS;
          message = error.message;
        } else if (error.message.includes('Validation failed')) {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = ErrorCode.VALIDATION_ERROR;
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
   * Login user
   */
  static async login(req: Request, res: Response) {
    try {
      const credentials = validateAndTransform(loginSchema, req.body);

      const result = await AuthService.login(credentials);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
        },
        message: 'Login successful',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('User login successful', { 
        userId: result.user.id,
        email: result.user.email,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('User login failed', { 
        error: error instanceof Error ? error.message : error,
        email: req.body?.email,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.UNAUTHORIZED;
      let errorCode = ErrorCode.INVALID_CREDENTIALS;
      let message = 'Login failed';

      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials')) {
          statusCode = HttpStatus.UNAUTHORIZED;
          errorCode = ErrorCode.INVALID_CREDENTIALS;
          message = 'Invalid email or password';
        } else if (error.message.includes('inactive')) {
          statusCode = HttpStatus.UNAUTHORIZED;
          errorCode = ErrorCode.USER_INACTIVE;
          message = 'User account is inactive';
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
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'Refresh token is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: { tokens },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Token refresh failed', { 
        error: error instanceof Error ? error.message : error,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.TOKEN_INVALID,
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.UNAUTHORIZED).json(response);
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response) {
    try {
      await AuthService.logout(req.sessionId);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('User logout successful', { 
        userId: req.user?.id,
        sessionId: req.sessionId,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Logout failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Logout failed',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: Request, res: Response) {
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

      await AuthService.logoutAll(req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Logged out from all devices successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('User logout all successful', { 
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Logout all failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Logout all failed',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response) {
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

      const data = validateAndTransform(changePasswordSchema, req.body);

      await AuthService.changePassword(
        req.user.id,
        data.currentPassword,
        data.newPassword
      );

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Password change successful', { 
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Password change failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.BAD_REQUEST;
      let errorCode = ErrorCode.VALIDATION_ERROR;
      let message = 'Password change failed';

      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = ErrorCode.INVALID_CREDENTIALS;
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
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response) {
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

      const response: ApiResponse = {
        success: true,
        data: { user: req.user },
        message: 'Profile retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Get profile failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve profile',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get user sessions
   */
  static async getSessions(req: Request, res: Response) {
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

      const sessions = await AuthService.getUserSessions(req.user.id);

      const response: ApiResponse = {
        success: true,
        data: { sessions },
        message: 'Sessions retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Get sessions failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve sessions',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Revoke a session
   */
  static async revokeSession(req: Request, res: Response) {
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

      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'Session ID is required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      await AuthService.revokeSession(req.user.id, sessionId);

      const response: ApiResponse = {
        success: true,
        message: 'Session revoked successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('Session revoked successfully', { 
        userId: req.user.id,
        revokedSessionId: sessionId,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Session revocation failed', { 
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to revoke session',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }
}