import { z } from 'zod';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

// Environment schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Server Configuration
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database Configuration
  DATABASE_URL: z.string().url(),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.string().transform(Number).default('5432'),
  DATABASE_NAME: z.string().default('event_manager'),
  DATABASE_USER: z.string().default('event_user'),
  DATABASE_PASSWORD: z.string(),

  // Redis Configuration
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Security Configuration
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_PATH: z.string().default('./uploads'),
  ALLOWED_FILE_TYPES: z.string().default('image/*,application/pdf'),

  // MinIO Configuration
  MINIO_ENDPOINT: z.string().default('localhost:9000'),
  MINIO_ACCESS_KEY: z.string().default('minio_admin'),
  MINIO_SECRET_KEY: z.string().default('minio_password'),
  MINIO_BUCKET: z.string().default('event-manager-files'),
  MINIO_USE_SSL: z.string().transform(val => val === 'true').default('false'),

  // Email Configuration (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@eventmanager.local'),

  // Logging Configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple']).default('json'),

  // Monitoring Configuration
  ENABLE_METRICS: z.string().transform(val => val === 'true').default('true'),
  METRICS_PORT: z.string().transform(Number).default('9090'),
  ENABLE_HEALTH_CHECKS: z.string().transform(val => val === 'true').default('true'),

  // Development Specific
  ENABLE_SWAGGER: z.string().transform(val => val === 'true').default('true'),
  ENABLE_DEBUG_ROUTES: z.string().transform(val => val === 'true').default('false'),
  ENABLE_MOCK_DATA: z.string().transform(val => val === 'true').default('false'),

  // AI Orchestrator Configuration
  AI_ORCHESTRATOR_ENABLED: z.string().transform(val => val === 'true').default('false'),
  AI_ORCHESTRATOR_URL: z.string().url().optional(),
  AI_ORCHESTRATOR_API_KEY: z.string().optional(),
});

// Validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:');
    error.errors.forEach((err) => {
      console.error(`  ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export validated environment
export default env;

// Export specific configurations
export const {
  NODE_ENV,
  PORT,
  HOST,
  API_BASE_URL,
  CORS_ORIGIN,
  DATABASE_URL,
  REDIS_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
  MAX_FILE_SIZE,
  UPLOAD_PATH,
  ALLOWED_FILE_TYPES,
  LOG_LEVEL,
  ENABLE_SWAGGER,
  ENABLE_DEBUG_ROUTES,
  ENABLE_MOCK_DATA,
} = env;

// Helper functions
export const isDevelopment = () => NODE_ENV === 'development';
export const isProduction = () => NODE_ENV === 'production';
export const isTest = () => NODE_ENV === 'test';