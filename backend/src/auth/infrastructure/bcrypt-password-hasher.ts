import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';

/**
 * Bcrypt Password Hasher
 *
 * Production-grade password hashing using bcrypt.
 *
 * Features:
 * - Automatic salt generation
 * - Configurable cost factor (work factor)
 * - Timing-safe comparison
 *
 * Security notes:
 * - Cost factor of 12 is recommended for production (2024)
 * - Each hash includes the salt, algorithm, and cost factor
 * - bcrypt.compare is timing-safe to prevent timing attacks
 */
@Injectable()
export class BcryptPasswordHasher implements IPasswordHasher {
  /**
   * Cost factor (work factor) for bcrypt
   * Higher = more secure but slower
   * 10 = ~100ms, 12 = ~300ms, 14 = ~1s
   */
  private readonly saltRounds: number;

  constructor() {
    // Use environment variable or default to 12
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  }

  /**
   * Hash a plain text password using bcrypt
   */
  async hash(plainText: string): Promise<string> {
    if (!plainText || plainText.length === 0) {
      throw new Error('Password cannot be empty');
    }

    // bcrypt generates a unique salt for each hash
    return bcrypt.hash(plainText, this.saltRounds);
  }

  /**
   * Compare a plain text password against a bcrypt hash
   * Uses timing-safe comparison to prevent timing attacks
   */
  async compare(plainText: string, hash: string): Promise<boolean> {
    if (!plainText || !hash) {
      return false;
    }

    try {
      return await bcrypt.compare(plainText, hash);
    } catch {
      // Invalid hash format or other error
      return false;
    }
  }
}
