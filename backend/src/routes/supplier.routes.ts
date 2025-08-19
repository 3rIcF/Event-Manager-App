import { Router } from 'express';
import { SupplierController } from '@/controllers/supplier.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All supplier routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/suppliers
 * @desc    Get suppliers with pagination and filters
 * @access  Private
 * @query   page, limit, category, isActive, rating, search, specialties
 */
router.get('/', SupplierController.getSuppliers);

/**
 * @route   POST /api/v1/suppliers
 * @desc    Create a new supplier
 * @access  Private
 */
router.post('/', SupplierController.createSupplier);

/**
 * @route   GET /api/v1/suppliers/search
 * @desc    Search suppliers by criteria
 * @access  Private
 * @query   category, specialties, minRating, location, minPrice, maxPrice
 */
router.get('/search', SupplierController.searchSuppliers);

/**
 * @route   GET /api/v1/suppliers/recommendations
 * @desc    Get supplier recommendations
 * @access  Private
 * @query   category, quantity, location
 */
router.get('/recommendations', SupplierController.getSupplierRecommendations);

/**
 * @route   GET /api/v1/suppliers/top
 * @desc    Get top suppliers
 * @access  Private
 * @query   category, limit
 */
router.get('/top', SupplierController.getTopSuppliers);

/**
 * @route   GET /api/v1/suppliers/categories
 * @desc    Get supplier categories
 * @access  Private
 */
router.get('/categories', SupplierController.getSupplierCategories);

/**
 * @route   GET /api/v1/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private
 */
router.get('/:id', SupplierController.getSupplierById);

/**
 * @route   PUT /api/v1/suppliers/:id
 * @desc    Update supplier
 * @access  Private
 */
router.put('/:id', SupplierController.updateSupplier);

/**
 * @route   DELETE /api/v1/suppliers/:id
 * @desc    Delete supplier
 * @access  Private
 */
router.delete('/:id', SupplierController.deleteSupplier);

/**
 * @route   GET /api/v1/suppliers/:id/statistics
 * @desc    Get supplier statistics
 * @access  Private
 */
router.get('/:id/statistics', SupplierController.getSupplierStatistics);

export default router;