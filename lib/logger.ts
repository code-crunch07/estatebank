/**
 * Environment-based logging utility
 * 
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   
 *   logger.debug('Detailed debug info'); // Only in development
 *   logger.info('General information');  // Only in development
 *   logger.warn('Warning message');      // Always logged
 *   logger.error('Error message');       // Always logged
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  /**
   * Debug logs - only in development
   * Use for detailed debugging information
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - only in development
   * Use for general informational messages
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Warning logs - always logged (dev + production)
   * Use for warnings that should be visible in production
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always logged (dev + production)
   * Use for errors that need to be tracked in production
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log with custom prefix - only in development
   * Useful for component-specific or feature-specific logging
   */
  log: (prefix: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${prefix}]`, ...args);
    }
  },

  /**
   * Group logs together - only in development
   * Useful for grouping related logs
   */
  group: (label: string, callback: () => void) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  },

  /**
   * Time operations - only in development
   * Useful for performance debugging
   */
  time: (label: string) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label: string) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

/**
 * Check if logging is enabled for development logs
 */
export const isLoggingEnabled = () => isDevelopment;

/**
 * Environment info for debugging
 */
export const getEnvInfo = () => ({
  nodeEnv: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
});
