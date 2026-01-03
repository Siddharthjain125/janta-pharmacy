import { BcryptPasswordHasher } from './bcrypt-password-hasher';

/**
 * BcryptPasswordHasher Tests
 *
 * Unit tests for the password hashing implementation.
 * These tests validate core security properties.
 */
describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const hash = await hasher.hash('password123');

      expect(hash).toBeDefined();
      expect(hash).not.toBe('password123');
    });

    it('should produce bcrypt format hash', async () => {
      const hash = await hasher.hash('password123');

      // Bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/);
    });

    it('should produce different hashes for same password', async () => {
      const hash1 = await hasher.hash('password123');
      const hash2 = await hasher.hash('password123');

      // Each hash includes a unique salt
      expect(hash1).not.toBe(hash2);
    });

    it('should reject empty password', async () => {
      await expect(hasher.hash('')).rejects.toThrow('Password cannot be empty');
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'SecurePass123';
      const hash = await hasher.hash(password);

      const result = await hasher.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hasher.hash('CorrectPassword');

      const result = await hasher.compare('WrongPassword', hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await hasher.hash('password123');

      const result = await hasher.compare('', hash);

      expect(result).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const result = await hasher.compare('password123', '');

      expect(result).toBe(false);
    });

    it('should return false for invalid hash format', async () => {
      const result = await hasher.compare('password123', 'not-a-valid-hash');

      expect(result).toBe(false);
    });
  });

  describe('security properties', () => {
    it('should use cost factor of at least 10', async () => {
      const hash = await hasher.hash('password123');

      // Extract cost factor from hash (format: $2b$XX$...)
      const costMatch = hash.match(/^\$2[ab]\$(\d{2})\$/);
      expect(costMatch).not.toBeNull();

      const costFactor = parseInt(costMatch![1], 10);
      expect(costFactor).toBeGreaterThanOrEqual(10);
    });

    it('should produce consistent verification', async () => {
      const password = 'TestPassword456';
      const hash = await hasher.hash(password);

      // Verify multiple times
      const results = await Promise.all([
        hasher.compare(password, hash),
        hasher.compare(password, hash),
        hasher.compare(password, hash),
      ]);

      expect(results.every((r) => r === true)).toBe(true);
    });
  });
});

