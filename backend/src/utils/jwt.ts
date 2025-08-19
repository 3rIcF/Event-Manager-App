import jwt from 'jsonwebtoken';
import { JWTPayload, AuthTokens } from '@/types/auth';
import env from '@/config/env';
import { logger } from '@/config/logger';

export class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = env.JWT_SECRET;
  private static readonly REFRESH_TOKEN_SECRET = env.JWT_SECRET + '_refresh';
  private static readonly ACCESS_TOKEN_EXPIRES_IN = env.JWT_EXPIRES_IN;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN;

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
        issuer: 'event-manager-api',
        audience: 'event-manager-app',
      });
    } catch (error) {
      logger.error('Error generating access token', { error, payload });
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'event-manager-api',
        audience: 'event-manager-app',
      });
    } catch (error) {
      logger.error('Error generating refresh token', { error, payload });
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): AuthTokens {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    
    // Calculate expiration time in seconds
    const expiresIn = this.getTokenExpiration(this.ACCESS_TOKEN_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'event-manager-api',
        audience: 'event-manager-app',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        logger.error('Error verifying access token', { error });
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'event-manager-api',
        audience: 'event-manager-app',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        logger.error('Error verifying refresh token', { error });
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      logger.error('Error decoding token', { error });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time in seconds
   */
  private static getTokenExpiration(expiresIn: string): number {
    // Convert string like '24h', '7d', '30m' to seconds
    const timeUnit = expiresIn.slice(-1);
    const timeValue = parseInt(expiresIn.slice(0, -1));

    switch (timeUnit) {
      case 's':
        return timeValue;
      case 'm':
        return timeValue * 60;
      case 'h':
        return timeValue * 60 * 60;
      case 'd':
        return timeValue * 24 * 60 * 60;
      default:
        return 24 * 60 * 60; // Default to 24 hours
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Get token expiration date
   */
  static getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  static getTimeUntilExpiration(token: string): number | null {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      return null;
    }
    
    return expirationDate.getTime() - Date.now();
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshAccessToken(refreshToken: string): string {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      // Create new payload without iat and exp
      const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userId: payload.userId,
        email: payload.email,
        roleId: payload.roleId,
        sessionId: payload.sessionId,
      };
      
      return this.generateAccessToken(newPayload);
    } catch (error) {
      logger.error('Error refreshing access token', { error });
      throw new Error('Failed to refresh access token');
    }
  }
}