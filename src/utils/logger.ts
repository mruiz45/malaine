import { LogLevel, LogEntry, LoggingConfig } from '@/types/logging';

/**
 * Default logging configuration
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  minLevel: 'INFO',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  includeStateSnapshots: process.env.NODE_ENV === 'development',
  enabled: true,
};

/**
 * Log level hierarchy for filtering
 */
const LOG_LEVEL_HIERARCHY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Checks if a log level should be processed based on minimum level
 * @param level - Log level to check
 * @param minLevel - Minimum log level configured
 * @returns True if the log should be processed
 */
export function shouldLog(level: LogLevel, minLevel: LogLevel): boolean {
  return LOG_LEVEL_HIERARCHY[level] >= LOG_LEVEL_HIERARCHY[minLevel];
}

/**
 * Generates a unique session identifier
 * @returns Session ID string
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely serializes objects for logging, handling circular references
 * @param obj - Object to serialize
 * @returns Serialized string
 */
export function safeStringify(obj: any): string {
  const seen = new Set();
  
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  });
}

/**
 * Creates a sanitized snapshot of pattern state for logging
 * @param state - Pattern state object
 * @param includeSnapshots - Whether to include full snapshots
 * @returns Sanitized state snapshot or summary
 */
export function createStateSnapshot(state: any, includeSnapshots: boolean): any {
  if (!includeSnapshots) {
    return undefined;
  }

  if (!state) {
    return null;
  }

  try {
    // Create a shallow copy and remove sensitive or large data
    const snapshot = { ...state };
    
    // Remove functions and non-serializable data
    Object.keys(snapshot).forEach(key => {
      const value = snapshot[key];
      if (typeof value === 'function') {
        delete snapshot[key];
      } else if (value instanceof HTMLElement) {
        delete snapshot[key];
      } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token')) {
        snapshot[key] = '[REDACTED]';
      }
    });

    return snapshot;
  } catch (error) {
    return '[Snapshot Error: Unable to serialize state]';
  }
}

/**
 * Formats an error object for logging
 * @param error - Error instance or any error-like object
 * @returns Formatted error object
 */
export function formatError(error: any): { message: string; stack?: string; code?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object') {
    return {
      message: error.message || error.toString(),
      stack: error.stack,
      code: error.code,
    };
  }

  return { message: 'Unknown error occurred' };
}

/**
 * Validates a log entry structure
 * @param logEntry - Log entry to validate
 * @returns True if valid
 */
export function validateLogEntry(logEntry: LogEntry): boolean {
  try {
    return !!(
      logEntry.timestamp &&
      logEntry.level &&
      logEntry.event &&
      logEntry.details &&
      LOG_LEVEL_HIERARCHY.hasOwnProperty(logEntry.level)
    );
  } catch {
    return false;
  }
}

/**
 * Creates a standardized timestamp string
 * @returns ISO timestamp string
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Truncates large objects to prevent excessive log size
 * @param obj - Object to truncate
 * @param maxDepth - Maximum depth to traverse
 * @param currentDepth - Current traversal depth
 * @returns Truncated object
 */
export function truncateObject(obj: any, maxDepth: number = 3, currentDepth: number = 0): any {
  if (currentDepth >= maxDepth) {
    return '[Max depth reached]';
  }

  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 10) {
      return [
        ...obj.slice(0, 5).map(item => truncateObject(item, maxDepth, currentDepth + 1)),
        `[... ${obj.length - 10} more items ...]`,
        ...obj.slice(-5).map(item => truncateObject(item, maxDepth, currentDepth + 1))
      ];
    }
    return obj.map(item => truncateObject(item, maxDepth, currentDepth + 1));
  }

  const keys = Object.keys(obj);
  if (keys.length > 20) {
    const result: any = {};
    keys.slice(0, 10).forEach(key => {
      result[key] = truncateObject(obj[key], maxDepth, currentDepth + 1);
    });
    result['[truncated]'] = `${keys.length - 10} more properties`;
    return result;
  }

  const result: any = {};
  keys.forEach(key => {
    result[key] = truncateObject(obj[key], maxDepth, currentDepth + 1);
  });
  return result;
} 