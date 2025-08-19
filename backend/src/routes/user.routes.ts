import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users
 * @desc    Get users with pagination and filters
 * @access  Private
 * @query   page, limit, roleId, isActive, search
 */
router.get('/', UserController.getUsers);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authorize(['admin', 'super_admin']), UserController.createUser);

/**
 * @route   GET /api/v1/users/roles
 * @desc    Get user roles
 * @access  Private
 */
router.get('/roles', UserController.getUserRoles);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', UserController.getUserById);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user (Self or Admin)
 * @access  Private
 */
router.put('/:id', UserController.updateUser);

/**
 * @route   POST /api/v1/users/:id/assign-role
 * @desc    Assign role to user (Admin only)
 * @access  Private (Admin)
 */
router.post('/:id/assign-role', authorize(['admin', 'super_admin']), UserController.assignRole);

export default router;