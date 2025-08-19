import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Event Manager API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): object {
    return {
      status: 'healthy',
      service: 'event-manager-api',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // Will be enhanced with actual DB check
      features: [
        'authentication',
        'project-management',
        'material-management',
        'supplier-management',
        'user-management',
      ],
    };
  }
}