import { Router } from 'express';
import { FileController } from '@/controllers/file.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All file routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/files
 * @desc    Get files with pagination and filters
 * @access  Private
 * @query   page, limit, projectId, category, mimeType, uploadedBy, isPublic, search, tags
 */
router.get('/', FileController.getFiles);

/**
 * @route   POST /api/v1/files/upload
 * @desc    Upload a new file
 * @access  Private
 * @body    file (multipart), projectId, category, tags, isPublic, displayName
 */
router.post('/upload', FileController.uploadMiddleware, FileController.uploadFile);

/**
 * @route   GET /api/v1/files/statistics
 * @desc    Get file statistics
 * @access  Private
 * @query   projectId
 */
router.get('/statistics', FileController.getFileStatistics);

/**
 * @route   GET /api/v1/files/:id
 * @desc    Get file metadata by ID
 * @access  Private
 */
router.get('/:id', FileController.getFileById);

/**
 * @route   GET /api/v1/files/:id/download
 * @desc    Download file
 * @access  Private
 */
router.get('/:id/download', FileController.downloadFile);

/**
 * @route   PUT /api/v1/files/:id
 * @desc    Update file metadata
 * @access  Private (File uploader or project manager)
 */
router.put('/:id', FileController.updateFile);

/**
 * @route   DELETE /api/v1/files/:id
 * @desc    Delete file
 * @access  Private (File uploader or project manager)
 */
router.delete('/:id', FileController.deleteFile);

/**
 * @route   POST /api/v1/files/:id/versions
 * @desc    Create new file version
 * @access  Private (File uploader or project manager)
 * @body    file (multipart), changeDescription
 */
router.post('/:id/versions', FileController.uploadMiddleware, FileController.createFileVersion);

export default router;