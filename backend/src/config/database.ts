import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Prisma Client Singleton
class DatabaseConnection {
  private static instance: PrismaClient;
  private static isConnected = false;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'info',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'colored',
      });

      // Event Listeners für Logging
      DatabaseConnection.instance.$on('query', (e) => {
        logger.debug('Query executed', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
        });
      });

      DatabaseConnection.instance.$on('error', (e) => {
        logger.error('Database error', { error: e });
      });

      DatabaseConnection.instance.$on('info', (e) => {
        logger.info('Database info', { message: e.message });
      });

      DatabaseConnection.instance.$on('warn', (e) => {
        logger.warn('Database warning', { message: e.message });
      });
    }

    return DatabaseConnection.instance;
  }

  public static async connect(): Promise<void> {
    if (DatabaseConnection.isConnected) {
      return;
    }

    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$connect();
      DatabaseConnection.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', { error });
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (!DatabaseConnection.isConnected) {
      return;
    }

    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$disconnect();
      DatabaseConnection.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', { error });
      throw error;
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseConnection.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }

  public static isHealthy(): boolean {
    return DatabaseConnection.isConnected;
  }
}

// Export Prisma instance
export const prisma = DatabaseConnection.getInstance();

// Export connection utilities
export const connectDatabase = DatabaseConnection.connect;
export const disconnectDatabase = DatabaseConnection.disconnect;
export const databaseHealthCheck = DatabaseConnection.healthCheck;
export const isDatabaseHealthy = DatabaseConnection.isHealthy;