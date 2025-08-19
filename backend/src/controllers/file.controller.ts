import { Request, Response } from 'express';
import { FileService } from '@/services/file.service';
import { logger } from '@/config/logger';
import { ApiResponse, HttpStatus, ErrorCode } from '@/types/api';
import { validateAndTransform } from '@/utils/validation';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/*,application/pdf').split(',');
    
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2);
        return file.mimetype.startsWith(baseType);
      }
      return file.mimetype === type;
    });

    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Validation schemas
const uploadOptionsSchema = z.object({
  projectId: z.string().uuid().optional(),
  category: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  isPublic: z.string().transform(val => val === 'true').optional(),
  displayName: z.string().optional(),
});

const updateFileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

const fileFiltersSchema = z.object({
  projectId: z.string().uuid().optional(),
  category: z.string().optional(),
  mimeType: z.string().optional(),
  uploadedBy: z.string().uuid().optional(),
  isPublic: z.string().transform(val => val === 'true').optional(),
  search: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
});

export class FileController {
  /**
   * Upload file
   */
  static uploadMiddleware = upload.single('file');

  static async uploadFile(req: Request, res: Response) {
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

      if (!req.file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'No file provided',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const options = validateAndTransform(uploadOptionsSchema, req.body);

      const result = await FileService.uploadFile(req.user.id, req.file, {
        projectId: options.projectId,
        category: options.category,
        tags: options.tags,
        metadata: options.displayName ? { displayName: options.displayName } : {},
        isPublic: options.isPublic,
      });

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'File uploaded successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('File uploaded successfully', {
        fileId: result.file.id,
        originalName: req.file.originalname,
        size: req.file.size,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to upload file', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        fileName: req.file?.originalname,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to upload file';

      if (error instanceof Error) {
        if (error.message.includes('File size exceeds')) {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = ErrorCode.FILE_TOO_LARGE;
          message = error.message;
        } else if (error.message.includes('not allowed')) {
          statusCode = HttpStatus.BAD_REQUEST;
          errorCode = ErrorCode.INVALID_FILE_TYPE;
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
   * Get files with pagination and filters
   */
  static async getFiles(req: Request, res: Response) {
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
      const filters = validateAndTransform(fileFiltersSchema, req.query);

      const pagination = {
        page: paginationData.page,
        limit: Math.min(paginationData.limit, 100),
        offset: (paginationData.page - 1) * paginationData.limit,
      };

      const result = await FileService.getFiles(req.user.id, pagination, filters);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Files retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get files', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve files',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Get file by ID
   */
  static async getFileById(req: Request, res: Response) {
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

      const file = await FileService.getFileById(id, req.user.id);

      if (!file) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: ErrorCode.RESOURCE_NOT_FOUND,
          message: 'File not found',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const response: ApiResponse = {
        success: true,
        data: { file },
        message: 'File retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get file by ID', {
        error: error instanceof Error ? error.message : error,
        fileId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      const response: ApiResponse = {
        success: false,
        error: ErrorCode.INTERNAL_ERROR,
        message: 'Failed to retrieve file',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  /**
   * Download file
   */
  static async downloadFile(req: Request, res: Response) {
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

      const fileInfo = await FileService.downloadFile(id, req.user.id);

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
      if (fileInfo.mimeType) {
        res.setHeader('Content-Type', fileInfo.mimeType);
      }

      // Send file
      res.sendFile(path.resolve(fileInfo.filePath));

      logger.info('File download completed', {
        fileId: id,
        userId: req.user.id,
        filename: fileInfo.filename,
        requestId: req.headers['x-request-id'],
      });
    } catch (error) {
      logger.error('Failed to download file', {
        error: error instanceof Error ? error.message : error,
        fileId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to download file';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.FILE_NOT_FOUND;
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
   * Update file metadata
   */
  static async updateFile(req: Request, res: Response) {
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
      const data = validateAndTransform(updateFileSchema, req.body);

      const file = await FileService.updateFile(id, req.user.id, data);

      const response: ApiResponse = {
        success: true,
        data: { file },
        message: 'File updated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('File updated successfully', {
        fileId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to update file', {
        error: error instanceof Error ? error.message : error,
        fileId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to update file';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.FILE_NOT_FOUND;
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
   * Delete file
   */
  static async deleteFile(req: Request, res: Response) {
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

      await FileService.deleteFile(id, req.user.id);

      const response: ApiResponse = {
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('File deleted successfully', {
        fileId: id,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to delete file', {
        error: error instanceof Error ? error.message : error,
        fileId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to delete file';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.FILE_NOT_FOUND;
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
   * Get file statistics
   */
  static async getFileStatistics(req: Request, res: Response) {
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

      const { projectId } = req.query;

      const statistics = await FileService.getFileStatistics(
        req.user.id,
        projectId as string
      );

      const response: ApiResponse = {
        success: true,
        data: { statistics },
        message: 'File statistics retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      logger.error('Failed to get file statistics', {
        error: error instanceof Error ? error.message : error,
        userId: req.user?.id,
        projectId: req.query.projectId,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to get file statistics';

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
   * Create new file version
   */
  static async createFileVersion(req: Request, res: Response) {
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

      if (!req.file) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: ErrorCode.MISSING_REQUIRED_FIELD,
          message: 'No file provided',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] as string,
        } as ApiResponse);
      }

      const { id } = req.params;
      const { changeDescription } = req.body;

      const fileVersion = await FileService.createFileVersion(
        id,
        req.user.id,
        req.file,
        changeDescription
      );

      const response: ApiResponse = {
        success: true,
        data: { fileVersion },
        message: 'File version created successfully',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] as string,
      };

      logger.info('File version created successfully', {
        fileId: id,
        versionNumber: fileVersion.versionNumber,
        userId: req.user.id,
        requestId: req.headers['x-request-id'],
      });

      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      logger.error('Failed to create file version', {
        error: error instanceof Error ? error.message : error,
        fileId: req.params.id,
        userId: req.user?.id,
        requestId: req.headers['x-request-id'],
      });

      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let errorCode = ErrorCode.INTERNAL_ERROR;
      let message = 'Failed to create file version';

      if (error instanceof Error) {
        if (error.message.includes('No access')) {
          statusCode = HttpStatus.FORBIDDEN;
          errorCode = ErrorCode.INSUFFICIENT_PERMISSIONS;
          message = error.message;
        } else if (error.message.includes('not found')) {
          statusCode = HttpStatus.NOT_FOUND;
          errorCode = ErrorCode.FILE_NOT_FOUND;
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