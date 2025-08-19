import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import projectTaskRoutes from './project.task.routes';
import supplierRoutes from './supplier.routes';
import fileRoutes from './file.routes';
import bomRoutes from './bom.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      auth: 'active',
      projects: 'active',
      tasks: 'active',
      suppliers: 'active',
      files: 'active',
      bom: 'active',
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/files', fileRoutes);

// Nested routes for project-specific resources
router.use('/projects/:projectId/tasks', projectTaskRoutes);
router.use('/projects/:projectId/bom', bomRoutes);

export default router;