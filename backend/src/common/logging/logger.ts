import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class Logger implements LoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    this.print('INFO', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.print('ERROR', message, context);
    if (trace && process.env.NODE_ENV !== 'production') {
      console.error(trace);
    }
  }

  warn(message: string, context?: string): void {
    this.print('WARN', message, context);
  }

  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.print('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string): void {
    if (process.env.LOG_LEVEL === 'verbose') {
      this.print('VERBOSE', message, context);
    }
  }

  private print(level: string, message: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    console.log(`[${timestamp}] [${level.padEnd(7)}] [${ctx}] ${message}`);
  }
}

/**
 * Structured log entry for correlation tracking
 */
export function logWithCorrelation(
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
  correlationId: string,
  message: string,
  context?: string,
  data?: Record<string, unknown>,
): void {
  const timestamp = new Date().toISOString();
  const ctx = context || 'Application';
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  console.log(
    `[${timestamp}] [${level.padEnd(7)}] [${correlationId}] [${ctx}] ${message}${dataStr}`,
  );
}
