import { Router } from 'express';
import { ProjectController } from '@/controllers/project.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All project routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/projects
 * @desc    Get projects with pagination and filters
 * @access  Private
 * @query   page, limit, status, priority, managerId, clientId, search
 */
router.get('/', ProjectController.getProjects);

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', ProjectController.createProject);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', ProjectController.getProjectById);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update project
 * @access  Private (Project manager or admin)
 */
router.put('/:id', ProjectController.updateProject);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete project
 * @access  Private (Project manager or admin)
 */
router.delete('/:id', ProjectController.deleteProject);

/**
 * @route   GET /api/v1/projects/:id/statistics
 * @desc    Get project statistics
 * @access  Private
 */
router.get('/:id/statistics', ProjectController.getProjectStatistics);

/**
 * @route   POST /api/v1/projects/:id/members
 * @desc    Add project member
 * @access  Private (Project manager or admin)
 */
router.post('/:id/members', ProjectController.addProjectMember);

/**
 * @route   DELETE /api/v1/projects/:id/members/:memberId
 * @desc    Remove project member
 * @access  Private (Project manager or admin)
 */
router.delete('/:id/members/:memberId', ProjectController.removeProjectMember);

export default router;