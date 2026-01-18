/**
 * Jest Setup
 *
 * Global test configuration and utilities.
 * This file runs before each test file.
 */

// =============================================================================
// Force in-memory repositories for tests
// =============================================================================
// This ensures tests always use in-memory repositories regardless of
// environment configuration. Tests should be isolated and not depend on
// external databases.
process.env.REPOSITORY_TYPE = 'memory';

// Suppress console output during tests for cleaner output
// Comment out these lines if you need to debug test failures
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  // Keep console.warn and console.error for important messages
});

afterAll(() => {
  jest.restoreAllMocks();
});

/**
 * Increase timeout for tests involving bcrypt
 * bcrypt is intentionally slow (security feature)
 */
jest.setTimeout(10000);
