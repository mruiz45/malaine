import { 
  LogEntry, 
  LogLevel, 
  PatternDesignEventType, 
  LogEventDetails, 
  LogApiRequest, 
  LogApiResponse, 
  LoggingConfig 
} from '@/types/logging';
import { 
  DEFAULT_LOGGING_CONFIG, 
  shouldLog, 
  generateSessionId, 
  validateLogEntry, 
  createTimestamp,
  truncateObject,
  createStateSnapshot,
  formatError
} from '@/utils/logger';

/**
 * Service class for managing pattern design logging on the client side
 * Follows the Malaine architecture: Page -> Service -> API -> Supabase
 */
export class LoggingService {
  private config: LoggingConfig;
  private logBuffer: LogEntry[] = [];
  private sessionId: string;
  private flushTimeout: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(config?: Partial<LoggingConfig>) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config };
    this.sessionId = generateSessionId();
    
    // Start the automatic flush timer if enabled
    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Logs a pattern design event
   * @param level - Log level
   * @param event - Event type
   * @param details - Event details
   * @param component - Optional component context
   * @param userId - Optional user ID
   */
  public log(
    level: LogLevel,
    event: PatternDesignEventType,
    details: LogEventDetails,
    component?: string,
    userId?: string
  ): void {
    if (!this.config.enabled || this.isDestroyed) {
      return;
    }

    if (!shouldLog(level, this.config.minLevel)) {
      return;
    }

    try {
      const logEntry: LogEntry = {
        timestamp: createTimestamp(),
        level,
        event,
        details: this.sanitizeDetails(details),
        sessionId: this.sessionId,
        userId,
        component,
      };

      if (!validateLogEntry(logEntry)) {
        console.warn('Invalid log entry, skipping:', logEntry);
        return;
      }

      this.logBuffer.push(logEntry);

      // Flush immediately if buffer is full or if it's an error
      if (this.logBuffer.length >= this.config.batchSize || level === 'ERROR') {
        this.flush();
      }
    } catch (error) {
      console.error('Error creating log entry:', error);
    }
  }

  /**
   * Logs a garment type selection event
   * @param type - Selected garment type
   * @param previousType - Previously selected type
   * @param component - Component context
   * @param userId - User ID
   */
  public logGarmentTypeSelected(
    type: string,
    previousType?: string,
    component?: string,
    userId?: string
  ): void {
    this.log('INFO', 'GARMENT_TYPE_SELECTED', {
      type,
      previousType,
    }, component, userId);
  }

  /**
   * Logs a measurement update event
   * @param field - Measurement field name
   * @param oldValue - Previous value
   * @param newValue - New value
   * @param unit - Measurement unit
   * @param component - Component context
   * @param userId - User ID
   */
  public logMeasurementUpdated(
    field: string,
    oldValue: number | string,
    newValue: number | string,
    unit?: string,
    component?: string,
    userId?: string
  ): void {
    this.log('INFO', 'MEASUREMENT_UPDATED', {
      field,
      oldValue,
      newValue,
      unit,
    }, component, userId);
  }

  /**
   * Logs a neckline type change event
   * @param oldType - Previous neckline type
   * @param newType - New neckline type
   * @param component - Component context
   * @param userId - User ID
   */
  public logNecklineTypeChanged(
    oldType: string,
    newType: string,
    component?: string,
    userId?: string
  ): void {
    this.log('INFO', 'NECKLINE_TYPE_CHANGED', {
      oldType,
      newType,
    }, component, userId);
  }

  /**
   * Logs an undo action
   * @param component - Component context
   * @param userId - User ID
   */
  public logUndoTriggered(component?: string, userId?: string): void {
    this.log('INFO', 'UNDO_TRIGGERED', {}, component, userId);
  }

  /**
   * Logs a redo action
   * @param component - Component context
   * @param userId - User ID
   */
  public logRedoTriggered(component?: string, userId?: string): void {
    this.log('INFO', 'REDO_TRIGGERED', {}, component, userId);
  }

  /**
   * Logs restore point creation
   * @param name - Restore point name
   * @param description - Optional description
   * @param component - Component context
   * @param userId - User ID
   */
  public logRestorePointCreated(
    name: string,
    description?: string,
    component?: string,
    userId?: string
  ): void {
    this.log('INFO', 'RESTORE_POINT_CREATED', {
      name,
      description,
    }, component, userId);
  }

  /**
   * Logs an error event
   * @param error - Error object or message
   * @param context - Error context
   * @param component - Component context
   * @param userId - User ID
   */
  public logError(
    error: any,
    context?: string,
    component?: string,
    userId?: string
  ): void {
    this.log('ERROR', 'ERROR_OCCURRED', {
      error: formatError(error),
      context,
    }, component, userId);
  }

  /**
   * Logs component initialization
   * @param componentName - Name of the component
   * @param userId - User ID
   */
  public logComponentInitialized(componentName: string, userId?: string): void {
    this.log('DEBUG', 'COMPONENT_INITIALIZED', {
      componentName,
    }, componentName, userId);
  }

  /**
   * Logs a state mutation event
   * @param mutation - Description of the mutation
   * @param before - State before mutation (optional)
   * @param after - State after mutation (optional)
   * @param component - Component context
   * @param userId - User ID
   */
  public logStateMutation(
    mutation: string,
    before?: any,
    after?: any,
    component?: string,
    userId?: string
  ): void {
    this.log('DEBUG', 'STATE_MUTATION', {
      mutation,
      before: this.config.includeStateSnapshots ? truncateObject(before) : undefined,
      after: this.config.includeStateSnapshots ? truncateObject(after) : undefined,
    }, component, userId);
  }

  /**
   * Manually flushes the log buffer to the server
   */
  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0 || this.isDestroyed) {
      return;
    }

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
        } as LogApiRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: LogApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Logging API returned failure');
      }

    } catch (error) {
      console.error('Failed to send logs to server:', error);
      
      // Put logs back in buffer if they failed to send (with a limit to prevent infinite growth)
      if (this.logBuffer.length < this.config.batchSize * 3) {
        this.logBuffer.unshift(...logsToSend);
      }
    }
  }

  /**
   * Updates the logging configuration
   * @param newConfig - Partial configuration to update
   */
  public updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enabled && !this.flushTimeout) {
      this.startFlushTimer();
    } else if (!this.config.enabled && this.flushTimeout) {
      this.stopFlushTimer();
    }
  }

  /**
   * Gets the current session ID
   * @returns Session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Destroys the logging service and flushes remaining logs
   */
  public async destroy(): Promise<void> {
    this.isDestroyed = true;
    this.stopFlushTimer();
    await this.flush();
  }

  /**
   * Sanitizes log details to prevent excessive data and security issues
   * @param details - Raw event details
   * @returns Sanitized details
   */
  private sanitizeDetails(details: LogEventDetails): LogEventDetails {
    try {
      const sanitized = { ...details };

      // Create state snapshot if configured
      if (sanitized.patternStateSnapshot) {
        sanitized.patternStateSnapshot = createStateSnapshot(
          sanitized.patternStateSnapshot,
          this.config.includeStateSnapshots
        );
      }

      // Truncate large objects
      return truncateObject(sanitized);
    } catch (error) {
      console.error('Error sanitizing log details:', error);
      return { error: 'Failed to sanitize details' };
    }
  }

  /**
   * Starts the automatic flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimeout) {
      return;
    }

    this.flushTimeout = setInterval(() => {
      if (this.logBuffer.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Stops the automatic flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
      this.flushTimeout = null;
    }
  }
}

// Singleton instance for global use
let loggingServiceInstance: LoggingService | null = null;

/**
 * Gets or creates the global logging service instance
 * @param config - Optional configuration for first-time initialization
 * @returns Logging service instance
 */
export function getLoggingService(config?: Partial<LoggingConfig>): LoggingService {
  if (!loggingServiceInstance) {
    loggingServiceInstance = new LoggingService(config);
  }
  return loggingServiceInstance;
}

/**
 * Resets the global logging service instance (useful for testing)
 */
export function resetLoggingService(): void {
  if (loggingServiceInstance) {
    loggingServiceInstance.destroy();
    loggingServiceInstance = null;
  }
} 