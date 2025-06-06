/**
 * Types and interfaces for the pattern design logging system
 */

/**
 * Log levels for the logging system
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * Pattern design event types that can be logged
 */
export type PatternDesignEventType =
  | 'GARMENT_TYPE_SELECTED'
  | 'MEASUREMENT_UPDATED'
  | 'NECKLINE_TYPE_CHANGED'
  | 'SLEEVE_TYPE_CHANGED'
  | 'FIT_PREFERENCE_CHANGED'
  | 'UNDO_TRIGGERED'
  | 'REDO_TRIGGERED'
  | 'RESTORE_POINT_CREATED'
  | 'RESTORE_POINT_RESTORED'
  | 'PATTERN_CALCULATION_STARTED'
  | 'PATTERN_CALCULATION_COMPLETED'
  | 'PATTERN_CALCULATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'COMPONENT_INITIALIZED'
  | 'USER_INPUT_CHANGED'
  | 'STATE_MUTATION'
  | 'ERROR_OCCURRED';

/**
 * Base structure for log entry details
 */
export interface LogEventDetails {
  /** Optional snapshot or diff of pattern state */
  patternStateSnapshot?: any;
  /** Any additional context data */
  [key: string]: any;
}

/**
 * Garment type selection event details
 */
export interface GarmentTypeSelectedDetails extends LogEventDetails {
  type: string;
  previousType?: string;
}

/**
 * Measurement update event details
 */
export interface MeasurementUpdatedDetails extends LogEventDetails {
  field: string;
  oldValue: number | string;
  newValue: number | string;
  unit?: string;
}

/**
 * Neckline type change event details
 */
export interface NecklineTypeChangedDetails extends LogEventDetails {
  oldType: string;
  newType: string;
}

/**
 * Restore point event details
 */
export interface RestorePointDetails extends LogEventDetails {
  name: string;
  description?: string;
}

/**
 * Error event details
 */
export interface ErrorEventDetails extends LogEventDetails {
  error: {
    message: string;
    stack?: string;
    code?: string;
  };
  context?: string;
}

/**
 * Main log entry structure
 */
export interface LogEntry {
  /** ISO timestamp of the log entry */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** Type of event being logged */
  event: PatternDesignEventType;
  /** Detailed information about the event */
  details: LogEventDetails;
  /** Optional session identifier */
  sessionId?: string;
  /** Optional user identifier */
  userId?: string;
  /** Optional component context where the event occurred */
  component?: string;
}

/**
 * Request payload for sending logs to the API
 */
export interface LogApiRequest {
  logs: LogEntry[];
}

/**
 * Response from the logging API
 */
export interface LogApiResponse {
  success: boolean;
  message?: string;
  logsProcessed?: number;
}

/**
 * Configuration for the logging system
 */
export interface LoggingConfig {
  /** Minimum log level to process */
  minLevel: LogLevel;
  /** Maximum number of logs to batch before sending */
  batchSize: number;
  /** Interval in milliseconds to flush logs */
  flushInterval: number;
  /** Whether to include pattern state snapshots */
  includeStateSnapshots: boolean;
  /** Whether logging is enabled */
  enabled: boolean;
} 