import bcrypt from 'bcryptjs';
import env from '@/config/env';
import { logger } from '@/config/logger';

export class PasswordService {
  private static readonly SALT_ROUNDS = env.BCRYPT_ROUNDS;

  /**
   * Hash a password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      logger.debug('Password hashed successfully');
      return hashedPassword;
    } catch (error) {
      logger.error('Error hashing password', { error });
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hashedPassword);
      
      logger.debug('Password verification completed', { isValid });
      return isValid;
    } catch (error) {
      logger.error('Error verifying password', { error });
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Password should be at least 8 characters long');
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should contain special characters');
    }

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
    } else {
      feedback.push('Password should not contain repeated characters');
    }

    // Sequential characters check
    const sequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
    const hasSequence = sequences.some(seq => 
      password.toLowerCase().includes(seq) || 
      password.toLowerCase().includes(seq.split('').reverse().join(''))
    );
    
    if (!hasSequence) {
      score += 1;
    } else {
      feedback.push('Password should not contain common sequences');
    }

    const isStrong = score >= 6;
    
    return {
      score,
      feedback,
      isStrong,
    };
  }

  /**
   * Generate password reset token
   */
  static generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
  }

  /**
   * Check if password needs rehashing (e.g., salt rounds changed)
   */
  static needsRehash(hashedPassword: string): boolean {
    try {
      // Extract salt rounds from hash
      const rounds = bcrypt.getRounds(hashedPassword);
      return rounds !== this.SALT_ROUNDS;
    } catch (error) {
      // If we can't determine rounds, assume it needs rehashing
      return true;
    }
  }

  /**
   * Validate password format
   */
  static validatePasswordFormat(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be at most 128 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for null bytes or other problematic characters
    if (password.includes('\0')) {
      errors.push('Password contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}