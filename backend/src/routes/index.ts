import { Router } from 'express';
import authRoutes from './auth.routes';
// Import other route modules here as they are created
// import userRoutes from './user.routes';
// import projectRoutes from './project.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Manager API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// API routes
router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/projects', projectRoutes);

export default router;