import { Router } from 'express';
import { BOMController } from '@/controllers/bom.controller';
import { authenticate } from '@/middleware/auth';

const router = Router({ mergeParams: true });

// All BOM routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/projects/:projectId/bom
 * @desc    Get BOM items for a project
 * @access  Private
 * @query   page, limit, category, status, priority, supplierId, parentId, search
 */
router.get('/', BOMController.getBOMItems);

/**
 * @route   POST /api/v1/projects/:projectId/bom
 * @desc    Create a new BOM item
 * @access  Private
 */
router.post('/', BOMController.createBOMItem);

/**
 * @route   GET /api/v1/projects/:projectId/bom/hierarchy
 * @desc    Get BOM hierarchy for a project
 * @access  Private
 */
router.get('/hierarchy', BOMController.getBOMHierarchy);

/**
 * @route   GET /api/v1/projects/:projectId/bom/statistics
 * @desc    Get BOM statistics for a project
 * @access  Private
 */
router.get('/statistics', BOMController.getBOMStatistics);

/**
 * @route   POST /api/v1/projects/:projectId/bom/import
 * @desc    Import BOM items from CSV/Excel
 * @access  Private
 */
router.post('/import', BOMController.importBOMItems);

/**
 * @route   GET /api/v1/bom/:id
 * @desc    Get BOM item by ID
 * @access  Private
 */
router.get('/:id', BOMController.getBOMItemById);

/**
 * @route   PUT /api/v1/bom/:id
 * @desc    Update BOM item
 * @access  Private
 */
router.put('/:id', BOMController.updateBOMItem);

/**
 * @route   DELETE /api/v1/bom/:id
 * @desc    Delete BOM item
 * @access  Private
 */
router.delete('/:id', BOMController.deleteBOMItem);

export default router;