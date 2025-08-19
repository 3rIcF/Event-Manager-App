import { Router } from 'express';
import { TaskController } from '@/controllers/task.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/tasks/my-tasks
 * @desc    Get current user's assigned tasks
 * @access  Private
 * @query   page, limit, status, priority, projectId, overdue
 */
router.get('/my-tasks', TaskController.getUserTasks);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get('/:id', TaskController.getTaskById);

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Update task
 * @access  Private (Task assignee, creator, or project manager)
 */
router.put('/:id', TaskController.updateTask);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Delete task
 * @access  Private (Task creator or project manager)
 */
router.delete('/:id', TaskController.deleteTask);

/**
 * @route   POST /api/v1/tasks/:id/comments
 * @desc    Add comment to task
 * @access  Private
 */
router.post('/:id/comments', TaskController.addTaskComment);

export default router;