import { prisma } from '@/config/database';
import { logger } from '@/config/logger';
import { JWTService } from '@/utils/jwt';
import { PasswordService } from '@/utils/password';
import { 
  AuthUser, 
  AuthTokens, 
  LoginCredentials, 
  RegisterData,
  JWTPayload 
} from '@/types/auth';
import { ErrorCode } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
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

      // Get default role (team_member)
      const defaultRole = await prisma.userRole.findFirst({
        where: { name: 'team_member' }
      });

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          timezone: data.timezone || 'UTC',
          language: data.language || 'de',
          roleId: defaultRole?.id,
          isVerified: false, // Email verification required
        },
        include: {
          role: true,
        },
      });

      // Create session
      const sessionId = uuidv4();
      const session = await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: uuidv4(),
          refreshToken: uuidv4(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Generate tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId || undefined,
        sessionId: session.id,
      };

      const tokens = JWTService.generateTokens(tokenPayload);

      // Update session with tokens
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      // Log registration
      logger.info('User registered successfully', { 
        userId: user.id, 
        email: user.email,
        username: user.username,
      });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as AuthUser,
        tokens,
      };
    } catch (error) {
      logger.error('Registration failed', { error, email: data.email });
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(
        credentials.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        logger.warn('Login failed - invalid password', { email: credentials.email });
        throw new Error('Invalid credentials');
      }

      // Check if password needs rehashing
      if (PasswordService.needsRehash(user.passwordHash)) {
        const newPasswordHash = await PasswordService.hashPassword(credentials.password);
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: newPasswordHash },
        });
      }

      // Create or update session
      const sessionId = uuidv4();
      const expiresAt = credentials.rememberMe 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const session = await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionToken: uuidv4(),
          refreshToken: uuidv4(),
          expiresAt,
        },
      });

      // Generate tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId || undefined,
        sessionId: session.id,
      };

      const tokens = JWTService.generateTokens(tokenPayload);

      // Update session with tokens
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Log successful login
      logger.info('User logged in successfully', { 
        userId: user.id, 
        email: user.email,
        sessionId: session.id,
      });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword as AuthUser,
        tokens,
      };
    } catch (error) {
      logger.error('Login failed', { error, email: credentials.email });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Find session
      const session = await prisma.userSession.findFirst({
        where: {
          id: payload.sessionId,
          refreshToken,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        include: {
          user: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!session) {
        throw new Error('Invalid refresh token');
      }

      if (!session.user.isActive) {
        throw new Error('User account is inactive');
      }

      // Generate new tokens
      const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: session.user.id,
        email: session.user.email,
        roleId: session.user.roleId || undefined,
        sessionId: session.id,
      };

      const tokens = JWTService.generateTokens(tokenPayload);

      // Update session with new tokens
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          sessionToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          lastActivityAt: new Date(),
        },
      });

      logger.info('Token refreshed successfully', { 
        userId: session.user.id,
        sessionId: session.id,
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        await prisma.userSession.update({
          where: { id: sessionId },
          data: { isActive: false },
        });

        logger.info('User logged out successfully', { sessionId });
      }
    } catch (error) {
      logger.error('Logout failed', { error, sessionId });
      throw error;
    }
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(userId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      logger.info('User logged out from all devices', { userId });
    } catch (error) {
      logger.error('Logout all failed', { error, userId });
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordService.verifyPassword(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await PasswordService.hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Invalidate all sessions except current one
      await prisma.userSession.updateMany({
        where: { 
          userId,
          isActive: true,
        },
        data: { isActive: false },
      });

      logger.info('Password changed successfully', { userId });
    } catch (error) {
      logger.error('Password change failed', { error, userId });
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      logger.info('Email verified successfully', { userId });
    } catch (error) {
      logger.error('Email verification failed', { error, userId });
      throw error;
    }
  }

  /**
   * Get user sessions
   */
  static async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await prisma.userSession.findMany({
        where: { 
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          lastActivityAt: true,
          expiresAt: true,
        },
        orderBy: { lastActivityAt: 'desc' },
      });

      return sessions;
    } catch (error) {
      logger.error('Failed to get user sessions', { error, userId });
      throw error;
    }
  }

  /**
   * Revoke session
   */
  static async revokeSession(userId: string, sessionId: string): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: { 
          id: sessionId,
          userId, // Ensure user can only revoke their own sessions
        },
        data: { isActive: false },
      });

      logger.info('Session revoked successfully', { userId, sessionId });
    } catch (error) {
      logger.error('Session revocation failed', { error, userId, sessionId });
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const result = await prisma.userSession.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false },
          ],
        },
      });

      logger.info('Expired sessions cleaned up', { deletedCount: result.count });
    } catch (error) {
      logger.error('Session cleanup failed', { error });
      throw error;
    }
  }
}