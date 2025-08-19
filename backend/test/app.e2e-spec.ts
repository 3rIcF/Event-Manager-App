import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';

describe('Event Manager API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let testProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // Apply same configuration as main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    });
    
    app.setGlobalPrefix('api/v1');

    await app.init();

    // Clean database before tests
    await prisma.cleanDatabase();

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    await prisma.cleanDatabase();
    await app.close();
  });

  const seedTestData = async () => {
    // Create test users
    const adminResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'ADMIN'
      });

    adminToken = adminResponse.body.access_token;

    const userResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
        role: 'USER'
      });

    userToken = userResponse.body.access_token;
  };

  describe('/api/v1/auth', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('newuser@test.com');
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('admin@test.com');
        });
    });

    it('should reject login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe('admin@test.com');
        });
    });

    it('should reject profile request without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });
  });

  describe('/api/v1/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'A test project for E2E testing',
          startDate: '2025-09-15T00:00:00.000Z',
          endDate: '2025-09-17T00:00:00.000Z',
          location: 'Test Location',
          status: 'PLANNING',
          budget: 50000,
        })
        .expect(201);

      testProjectId = response.body.id;
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Project');
      expect(response.body.status).toBe('PLANNING');
    });

    it('should get all projects', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should get project by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testProjectId);
          expect(res.body.name).toBe('Test Project');
        });
    });

    it('should update project', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Test Project',
          status: 'APPROVAL',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Test Project');
          expect(res.body.status).toBe('APPROVAL');
        });
    });

    it('should get project statistics', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/projects/${testProjectId}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('materialsCount');
          expect(res.body).toHaveProperty('suppliersCount');
          expect(res.body).toHaveProperty('commentsCount');
          expect(res.body).toHaveProperty('membersCount');
        });
    });

    it('should reject unauthorized access', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(401);
    });
  });

  describe('/api/v1/users', () => {
    it('should get all users (admin only)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should reject non-admin access to all users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('user@test.com');
        });
    });

    it('should get user statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('projectsCount');
          expect(res.body).toHaveProperty('commentsCount');
          expect(res.body).toHaveProperty('materialsCreatedCount');
        });
    });
  });

  describe('/api/v1 (Health Check)', () => {
    it('should return API health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Event Manager API');
        });
    });

    it('should return detailed health information', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'healthy');
          expect(res.body).toHaveProperty('service', 'event-manager-api');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('features');
        });
    });
  });

  describe('Input Validation', () => {
    it('should validate project creation input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '', // Invalid: empty name
          startDate: 'invalid-date', // Invalid: bad date format
          endDate: '2025-09-17T00:00:00.000Z',
          location: 'Test Location',
        })
        .expect(400);
    });

    it('should validate registration input', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          name: 'A', // Invalid: too short
          email: 'invalid-email', // Invalid: bad email format
          password: '123', // Invalid: too short
        })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should handle 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/non-existent-endpoint')
        .expect(404);
    });
  });
});