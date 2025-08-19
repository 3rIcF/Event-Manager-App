import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { PaginationParams, PaginatedResponse } from '@/types/api';
import { User, UserRole } from '@prisma/client';
import { PasswordService } from '@/utils/password';

export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  roleId?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  avatarUrl?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface UserWithDetails extends Omit<User, 'passwordHash'> {
  role?: UserRole;
  _count: {
    managedProjects: number;
    assignedTasks: number;
    uploadedFiles: number;
  };
}

export class UserService {
  /**
   * Create a new user (Admin only)
   */
  static async createUser(data: CreateUserData): Promise<UserWithDetails> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new Error('User with this email already exists');
        }
        if (existingUser.username === data.username) {
          throw new Error('User with this username already exists');
        }
      }

      // Hash password
      const passwordHash = await PasswordService.hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...data,
          passwordHash,
          timezone: data.timezone || 'UTC',
          language: data.language || 'de',
        },
        include: {
          role: true,
          _count: {
            select: {
              managedProjects: true,
              assignedTasks: true,
              uploadedFiles: true,
            },
          },
        },
      });

      logger.info('User created successfully', { 
        userId: user.id, 
        email: user.email,
        username: user.username,
      });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as UserWithDetails;
    } catch (error) {
      logger.error('Failed to create user', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserWithDetails | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          role: true,
          _count: {
            select: {
              managedProjects: true,
              assignedTasks: true,
              uploadedFiles: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as UserWithDetails;
    } catch (error) {
      logger.error('Failed to get user by ID', { error, id });
      throw error;
    }
  }

  /**
   * Get users with pagination and filters
   */
  static async getUsers(
    pagination: PaginationParams,
    filters?: {
      roleId?: string;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<PaginatedResponse<UserWithDetails>> {
    try {
      const { page, limit, offset } = pagination;

      // Build where clause
      const where: any = {};

      if (filters) {
        if (filters.roleId) {
          where.roleId = filters.roleId;
        }
        if (filters.isActive !== undefined) {
          where.isActive = filters.isActive;
        }
        if (filters.search) {
          where.OR = [
            { firstName: { contains: filters.search, mode: 'insensitive' } },
            { lastName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
            { username: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
      }

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users
      const users = await prisma.user.findMany({
        where,
        include: {
          role: true,
          _count: {
            select: {
              managedProjects: true,
              assignedTasks: true,
              uploadedFiles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);

      // Remove password hashes
      const usersWithoutPasswords = users.map(user => {
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword as UserWithDetails;
      });

      return {
        data: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Failed to get users', { error, pagination, filters });
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<UserWithDetails> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        include: {
          role: true,
          _count: {
            select: {
              managedProjects: true,
              assignedTasks: true,
              uploadedFiles: true,
            },
          },
        },
      });

      logger.info('User updated successfully', { userId: id });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as UserWithDetails;
    } catch (error) {
      logger.error('Failed to update user', { error, id, data });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      // Check if user has active projects
      const activeProjects = await prisma.project.count({
        where: { managerId: id },
      });

      if (activeProjects > 0) {
        throw new Error('Cannot delete user with active projects');
      }

      // Soft delete by deactivating
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      // Invalidate all sessions
      await prisma.userSession.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });

      logger.info('User deleted successfully', { userId: id });
    } catch (error) {
      logger.error('Failed to delete user', { error, id });
      throw error;
    }
  }

  /**
   * Get user roles
   */
  static async getUserRoles(): Promise<UserRole[]> {
    try {
      const roles = await prisma.userRole.findMany({
        orderBy: { name: 'asc' },
      });

      return roles;
    } catch (error) {
      logger.error('Failed to get user roles', { error });
      throw error;
    }
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { roleId },
      });

      logger.info('Role assigned successfully', { userId, roleId });
    } catch (error) {
      logger.error('Failed to assign role', { error, userId, roleId });
      throw error;
    }
  }
}