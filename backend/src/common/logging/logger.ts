import { Injectable, LoggerService, Scope } from '@nestjs/common';

/**
 * Application Logger
 *
 * Provides structured logging with consistent formatting.
 * Can be extended to integrate with external logging services.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class Logger implements LoggerService {
  private context?: string;

  /**
   * Set the logging context
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Log an informational message
   */
  log(message: string, context?: string): void {
    this.printMessage('INFO', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, trace?: string, context?: string): void {
    this.printMessage('ERROR', message, context);
    if (trace) {
      console.error(trace);
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: string): void {
    this.printMessage('WARN', message, context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage('DEBUG', message, context);
    }
  }

  /**
   * Log a verbose message
   */
  verbose(message: string, context?: string): void {
    if (process.env.LOG_LEVEL === 'verbose') {
      this.printMessage('VERBOSE', message, context);
    }
  }

  /**
   * Format and print the log message
   */
  private printMessage(level: string, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    const coloredLevel = this.colorize(level);

    console.log(`[${timestamp}] ${coloredLevel} [${ctx}] ${message}`);
  }

  /**
   * Add ANSI color codes to log levels
   */
  private colorize(level: string): string {
    const colors: Record<string, string> = {
      INFO: '\x1b[32m',    // Green
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      DEBUG: '\x1b[36m',   // Cyan
      VERBOSE: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';
    const color = colors[level] || '';
    return `${color}${level.padEnd(7)}${reset}`;
  }
}

/**
 * Create a logger instance with a specific context
 */
export function createLogger(context: string): Logger {
  const logger = new Logger();
  logger.setContext(context);
  return logger;
}

