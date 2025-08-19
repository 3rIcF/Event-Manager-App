import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import env, { isDevelopment, isProduction } from '@/config/env';
import { logger } from '@/config/logger';
import { connectDatabase } from '@/config/database';

import { requestId, requestLogger, requestTimeout, userContext } from '@/middleware/request';
import { errorHandler, notFoundHandler } from '@/middleware/error';

import routes from '@/routes';

// Create Express app
const app = express();

// Trust proxy (for reverse proxy deployments)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID',
  ],
  exposedHeaders: ['X-Request-ID'],
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });
    
    res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'],
    });
  },
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request middleware
app.use(requestId);
app.use(requestTimeout(30000)); // 30 seconds timeout

// Logging middleware
if (isDevelopment()) {
  app.use(morgan('dev'));
}
app.use(requestLogger);
app.use(userContext);

// API routes
app.use('/api/v1', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Event Manager API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    docs: isDevelopment() ? '/api/v1/docs' : undefined,
  });
});

// Health check route (outside of /api/v1 for load balancers)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Event Manager API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown handler
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}, starting graceful shutdown...`);
  
  // Close server
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections
    import('@/config/database').then(({ disconnectDatabase }) => {
      disconnectDatabase().then(() => {
        logger.info('Database connections closed');
        process.exit(0);
      }).catch((error) => {
        logger.error('Error closing database connections', { error });
        process.exit(1);
      });
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 10 seconds');
    process.exit(1);
  }, 10000);
}

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start HTTP server
    const server = app.listen(env.PORT, env.HOST, () => {
      logger.info(`Event Manager API server started`, {
        port: env.PORT,
        host: env.HOST,
        environment: env.NODE_ENV,
        pid: process.pid,
      });

      if (isDevelopment()) {
        console.log(`
🚀 Event Manager API is running!

📍 Server URL: ${env.API_BASE_URL}
🏥 Health Check: ${env.API_BASE_URL}/health
📊 API Docs: ${env.API_BASE_URL}/api/v1/docs (coming soon)

Environment: ${env.NODE_ENV}
Port: ${env.PORT}
Process ID: ${process.pid}
        `);
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.PORT} is already in use`);
      } else {
        logger.error('Server error', { error });
      }
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Export for testing
export default app;

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { reason, promise });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});