import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { File, FileVersion } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface CreateFileData {
  name: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType?: string;
  extension?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  projectId?: string;
  isPublic?: boolean;
}

export interface UpdateFileData {
  name?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic?: boolean;
}

export interface FileWithDetails extends File {
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
  fileVersions: Array<{
    id: string;
    versionNumber: number;
    fileSize: bigint;
    changeDescription?: string;
    createdAt: Date;
  }>;
  _count: {
    fileVersions: number;
  };
}

export interface FileUploadResult {
  file: FileWithDetails;
  uploadPath: string;
  url: string;
}

export class FileService {
  private static readonly UPLOAD_DIR = process.env.UPLOAD_PATH || './uploads';
  private static readonly MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/*,application/pdf').split(',');

  /**
   * Initialize upload directory
   */
  static initializeUploadDir(): void {
    try {
      if (!fs.existsSync(this.UPLOAD_DIR)) {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        logger.info('Upload directory created', { path: this.UPLOAD_DIR });
      }

      // Create subdirectories
      const subdirs = ['images', 'documents', 'archives', 'temp'];
      subdirs.forEach(subdir => {
        const subdirPath = path.join(this.UPLOAD_DIR, subdir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath, { recursive: true });
        }
      });
    } catch (error) {
      logger.error('Failed to initialize upload directory', { error });
      throw error;
    }
  }

  /**
   * Upload and create file record
   */
  static async uploadFile(
    uploadedBy: string,
    fileData: Express.Multer.File,
    options: {
      projectId?: string;
      category?: string;
      tags?: string[];
      metadata?: Record<string, any>;
      isPublic?: boolean;
    } = {}
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      this.validateFile(fileData);

      // Generate unique filename
      const fileId = uuidv4();
      const extension = path.extname(fileData.originalname);
      const filename = `${fileId}${extension}`;
      
      // Determine subdirectory based on file type
      let subdir = 'documents';
      if (fileData.mimetype?.startsWith('image/')) {
        subdir = 'images';
      } else if (fileData.mimetype?.includes('zip') || fileData.mimetype?.includes('tar')) {
        subdir = 'archives';
      }

      const uploadPath = path.join(this.UPLOAD_DIR, subdir, filename);
      const relativePath = path.join(subdir, filename);

      // Ensure directory exists
      const dirPath = path.dirname(uploadPath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Move file to upload directory
      fs.writeFileSync(uploadPath, fileData.buffer);

      // Create file record in database
      const file = await prisma.file.create({
        data: {
          name: options.metadata?.displayName || fileData.originalname,
          originalName: fileData.originalname,
          filePath: relativePath,
          fileSize: BigInt(fileData.size),
          mimeType: fileData.mimetype,
          extension: extension.substring(1), // Remove the dot
          category: options.category,
          tags: options.tags || [],
          metadata: options.metadata || {},
          uploadedBy,
          projectId: options.projectId,
          isPublic: options.isPublic || false,
        },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          fileVersions: {
            select: {
              id: true,
              versionNumber: true,
              fileSize: true,
              changeDescription: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              fileVersions: true,
            },
          },
        },
      });

      // Create initial file version
      await prisma.fileVersion.create({
        data: {
          fileId: file.id,
          versionNumber: 1,
          filePath: relativePath,
          fileSize: BigInt(fileData.size),
          changeDescription: 'Initial upload',
          uploadedBy,
        },
      });

      logger.info('File uploaded successfully', { 
        fileId: file.id,
        originalName: fileData.originalname,
        size: fileData.size,
        uploadedBy,
      });

      return {
        file: file as FileWithDetails,
        uploadPath,
        url: `/api/v1/files/${file.id}/download`,
      };
    } catch (error) {
      logger.error('Failed to upload file', { error, uploadedBy, originalName: fileData?.originalname });
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  static async getFileById(id: string, userId: string): Promise<FileWithDetails | null> {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          fileVersions: {
            select: {
              id: true,
              versionNumber: true,
              fileSize: true,
              changeDescription: true,
              createdAt: true,
            },
            orderBy: { versionNumber: 'desc' },
          },
          _count: {
            select: {
              fileVersions: true,
            },
          },
        },
      });

      if (!file) {
        return null;
      }

      // Check if user has access to the file
      const hasAccess = await this.checkFileAccess(file, userId);
      if (!hasAccess) {
        return null;
      }

      return file as FileWithDetails;
    } catch (error) {
      logger.error('Failed to get file by ID', { error, id, userId });
      throw error;
    }
  }

  /**
   * Get files with pagination and filters
   */
  static async getFiles(
    userId: string,
    pagination: PaginationParams,
    filters?: {
      projectId?: string;
      category?: string;
      mimeType?: string;
      uploadedBy?: string;
      isPublic?: boolean;
      search?: string;
      tags?: string[];
    }
  ): Promise<PaginatedResponse<FileWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = {};

      // Access control: user can see files they uploaded or files in projects they have access to
      where.OR = [
        { uploadedBy: userId },
        { isPublic: true },
        {
          project: {
            OR: [
              { managerId: userId },
              {
                projectMembers: {
                  some: {
                    userId,
                    isActive: true,
                  },
                },
              },
            ],
          },
        },
      ];

      if (filters) {
        if (filters.projectId) {
          where.projectId = filters.projectId;
        }
        if (filters.category) {
          where.category = filters.category;
        }
        if (filters.mimeType) {
          where.mimeType = { contains: filters.mimeType };
        }
        if (filters.uploadedBy) {
          where.uploadedBy = filters.uploadedBy;
        }
        if (filters.isPublic !== undefined) {
          where.isPublic = filters.isPublic;
        }
        if (filters.tags && filters.tags.length > 0) {
          where.tags = {
            hasSome: filters.tags,
          };
        }
        if (filters.search) {
          where.AND = [
            ...(where.AND || []),
            {
              OR: [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { originalName: { contains: filters.search, mode: 'insensitive' } },
              ],
            },
          ];
        }
      }

      // Get total count
      const total = await prisma.file.count({ where });

      // Get files
      const files = await prisma.file.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          fileVersions: {
            select: {
              id: true,
              versionNumber: true,
              fileSize: true,
              changeDescription: true,
              createdAt: true,
            },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              fileVersions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: files as FileWithDetails[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to get files', { error, userId, pagination, filters });
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  static async updateFile(id: string, userId: string, data: UpdateFileData): Promise<FileWithDetails> {
    try {
      // Check if user has access to the file
      const existingFile = await prisma.file.findUnique({
        where: { id },
      });

      if (!existingFile) {
        throw new Error('File not found');
      }

      const hasAccess = await this.checkFileAccess(existingFile, userId);
      if (!hasAccess) {
        throw new Error('No access to file');
      }

      const file = await prisma.file.update({
        where: { id },
        data,
        include: {
          uploader: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          fileVersions: {
            select: {
              id: true,
              versionNumber: true,
              fileSize: true,
              changeDescription: true,
              createdAt: true,
            },
            orderBy: { versionNumber: 'desc' },
          },
          _count: {
            select: {
              fileVersions: true,
            },
          },
        },
      });

      logger.info('File updated successfully', { fileId: id, userId });

      return file as FileWithDetails;
    } catch (error) {
      logger.error('Failed to update file', { error, id, userId, data });
      throw error;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(id: string, userId: string): Promise<void> {
    try {
      // Check if user has access to the file
      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error('File not found');
      }

      const hasAccess = await this.checkFileAccess(file, userId);
      if (!hasAccess) {
        throw new Error('No access to file');
      }

      // Delete physical file
      const fullPath = path.join(this.UPLOAD_DIR, file.filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      // Delete file versions
      const versions = await prisma.fileVersion.findMany({
        where: { fileId: id },
      });

      for (const version of versions) {
        const versionPath = path.join(this.UPLOAD_DIR, version.filePath);
        if (fs.existsSync(versionPath)) {
          fs.unlinkSync(versionPath);
        }
      }

      // Delete database record
      await prisma.file.delete({
        where: { id },
      });

      logger.info('File deleted successfully', { fileId: id, userId });
    } catch (error) {
      logger.error('Failed to delete file', { error, id, userId });
      throw error;
    }
  }

  /**
   * Download file
   */
  static async downloadFile(id: string, userId: string): Promise<{
    filePath: string;
    filename: string;
    mimeType?: string;
  }> {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error('File not found');
      }

      const hasAccess = await this.checkFileAccess(file, userId);
      if (!hasAccess) {
        throw new Error('No access to file');
      }

      const fullPath = path.join(this.UPLOAD_DIR, file.filePath);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error('Physical file not found');
      }

      // Update download count
      await prisma.file.update({
        where: { id },
        data: {
          downloadCount: { increment: 1 },
        },
      });

      logger.info('File download initiated', { fileId: id, userId });

      return {
        filePath: fullPath,
        filename: file.originalName,
        mimeType: file.mimeType || undefined,
      };
    } catch (error) {
      logger.error('Failed to download file', { error, id, userId });
      throw error;
    }
  }

  /**
   * Create new file version
   */
  static async createFileVersion(
    fileId: string,
    userId: string,
    fileData: Express.Multer.File,
    changeDescription?: string
  ): Promise<FileVersion> {
    try {
      // Check if user has access to the file
      const existingFile = await prisma.file.findUnique({
        where: { id: fileId },
        include: {
          fileVersions: {
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!existingFile) {
        throw new Error('File not found');
      }

      const hasAccess = await this.checkFileAccess(existingFile, userId);
      if (!hasAccess) {
        throw new Error('No access to file');
      }

      // Validate new file
      this.validateFile(fileData);

      // Generate new version filename
      const extension = path.extname(fileData.originalname);
      const nextVersion = (existingFile.fileVersions[0]?.versionNumber || 0) + 1;
      const filename = `${fileId}_v${nextVersion}${extension}`;
      
      // Determine subdirectory
      let subdir = 'documents';
      if (fileData.mimetype?.startsWith('image/')) {
        subdir = 'images';
      } else if (fileData.mimetype?.includes('zip') || fileData.mimetype?.includes('tar')) {
        subdir = 'archives';
      }

      const uploadPath = path.join(this.UPLOAD_DIR, subdir, filename);
      const relativePath = path.join(subdir, filename);

      // Save physical file
      fs.writeFileSync(uploadPath, fileData.buffer);

      // Create file version record
      const fileVersion = await prisma.fileVersion.create({
        data: {
          fileId,
          versionNumber: nextVersion,
          filePath: relativePath,
          fileSize: BigInt(fileData.size),
          changeDescription,
          uploadedBy: userId,
        },
      });

      // Update main file record
      await prisma.file.update({
        where: { id: fileId },
        data: {
          filePath: relativePath,
          fileSize: BigInt(fileData.size),
          mimeType: fileData.mimetype,
          updatedAt: new Date(),
        },
      });

      logger.info('File version created successfully', { 
        fileId, 
        versionNumber: nextVersion, 
        userId 
      });

      return fileVersion;
    } catch (error) {
      logger.error('Failed to create file version', { error, fileId, userId });
      throw error;
    }
  }

  /**
   * Get file statistics
   */
  static async getFileStatistics(
    userId: string,
    projectId?: string
  ): Promise<any> {
    try {
      const where: any = {};

      if (projectId) {
        // Check if user has access to the project
        const hasAccess = await this.checkProjectAccess(projectId, userId);
        if (!hasAccess) {
          throw new Error('No access to project');
        }
        where.projectId = projectId;
      } else {
        // User's files or files in accessible projects
        where.OR = [
          { uploadedBy: userId },
          { isPublic: true },
          {
            project: {
              OR: [
                { managerId: userId },
                {
                  projectMembers: {
                    some: {
                      userId,
                      isActive: true,
                    },
                  },
                },
              ],
            },
          },
        ];
      }

      const [
        totalStats,
        categoryStats,
        mimeTypeStats,
      ] = await Promise.all([
        // Total statistics
        prisma.file.aggregate({
          where,
          _count: true,
          _sum: { 
            fileSize: true,
            downloadCount: true,
          },
        }),
        // Category statistics
        prisma.file.groupBy({
          by: ['category'],
          where,
          _count: true,
          _sum: { fileSize: true },
        }),
        // MIME type statistics
        prisma.file.groupBy({
          by: ['mimeType'],
          where,
          _count: true,
          _sum: { fileSize: true },
        }),
      ]);

      return {
        total: {
          files: totalStats._count,
          totalSize: totalStats._sum.fileSize || BigInt(0),
          totalDownloads: totalStats._sum.downloadCount || 0,
        },
        byCategory: categoryStats.reduce((acc, stat) => {
          acc[stat.category || 'Uncategorized'] = {
            count: stat._count,
            totalSize: stat._sum.fileSize || BigInt(0),
          };
          return acc;
        }, {} as Record<string, any>),
        byMimeType: mimeTypeStats.reduce((acc, stat) => {
          acc[stat.mimeType || 'Unknown'] = {
            count: stat._count,
            totalSize: stat._sum.fileSize || BigInt(0),
          };
          return acc;
        }, {} as Record<string, any>),
      };
    } catch (error) {
      logger.error('Failed to get file statistics', { error, userId, projectId });
      throw error;
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(fileData: Express.Multer.File): void {
    // Check file size
    if (fileData.size > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE} bytes`);
    }

    // Check file type
    const isAllowed = this.ALLOWED_TYPES.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.slice(0, -2);
        return fileData.mimetype?.startsWith(baseType);
      }
      return fileData.mimetype === type;
    });

    if (!isAllowed) {
      throw new Error(`File type ${fileData.mimetype} is not allowed`);
    }

    // Check for malicious file names
    if (fileData.originalname.includes('..') || fileData.originalname.includes('/')) {
      throw new Error('Invalid file name');
    }
  }

  /**
   * Check if user has access to file
   */
  private static async checkFileAccess(file: File, userId: string): Promise<boolean> {
    try {
      // File is public
      if (file.isPublic) {
        return true;
      }

      // User uploaded the file
      if (file.uploadedBy === userId) {
        return true;
      }

      // File belongs to a project the user has access to
      if (file.projectId) {
        return await this.checkProjectAccess(file.projectId, userId);
      }

      return false;
    } catch (error) {
      logger.error('Failed to check file access', { error, fileId: file.id, userId });
      return false;
    }
  }

  /**
   * Check if user has access to project
   */
  private static async checkProjectAccess(projectId: string, userId: string): Promise<boolean> {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          projectMembers: {
            where: {
              userId,
              isActive: true,
            },
          },
        },
      });

      if (!project) {
        return false;
      }

      return project.managerId === userId || project.projectMembers.length > 0;
    } catch (error) {
      logger.error('Failed to check project access', { error, projectId, userId });
      return false;
    }
  }

  /**
   * Clean up temporary files
   */
  static async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = path.join(this.UPLOAD_DIR, 'temp');
      
      if (!fs.existsSync(tempDir)) {
        return;
      }

      const files = fs.readdirSync(tempDir);
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      logger.info('Temporary files cleaned up', { deletedCount });
    } catch (error) {
      logger.error('Failed to cleanup temporary files', { error });
    }
  }
}