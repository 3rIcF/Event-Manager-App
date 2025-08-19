import { Router } from 'express';
import { TaskController } from '@/controllers/task.controller';
import { authenticate } from '@/middleware/auth';

const router = Router({ mergeParams: true });

// All project task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/projects/:projectId/tasks
 * @desc    Get tasks for a specific project
 * @access  Private
 * @query   page, limit, status, priority, assignedTo, type, search, parentTaskId, tags
 */
router.get('/', TaskController.getProjectTasks);

/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Create a new task in project
 * @access  Private
 */
router.post('/', TaskController.createTask);

export default router;