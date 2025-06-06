/**
 * Restore Points Types for Pattern Definition (PD_PH3_US002)
 * Types for managing restore point functionality in pattern definition contexts
 */

/**
 * A single restore point containing a snapshot of pattern state
 */
export interface RestorePoint<T = any> {
  /** Unique identifier for the restore point */
  id: string;
  /** User-provided name for the restore point */
  name: string;
  /** Timestamp when the restore point was created */
  timestamp: string;
  /** Snapshot of the pattern state at the time of creation */
  state: T;
  /** Optional description of what this restore point represents */
  description?: string;
}

/**
 * Configuration options for restore point management
 */
export interface RestorePointConfig {
  /** Maximum number of restore points to keep */
  maxRestorePoints: number;
  /** Whether restore point functionality is enabled */
  enabled: boolean;
  /** Whether to auto-generate names if none provided */
  autoGenerateNames: boolean;
  /** Default name prefix for auto-generated names */
  defaultNamePrefix: string;
}

/**
 * Actions available for restore point management
 */
export interface RestorePointActions<T> {
  /** Create a new restore point with optional name */
  createRestorePoint: (name?: string, description?: string) => RestorePoint<T>;
  /** Revert to a specific restore point by ID */
  revertToRestorePoint: (restorePointId: string) => void;
  /** Delete a specific restore point */
  deleteRestorePoint: (restorePointId: string) => void;
  /** Clear all restore points */
  clearRestorePoints: () => void;
  /** Get all restore points */
  getRestorePoints: () => RestorePoint<T>[];
  /** Update restore point configuration */
  updateConfig: (config: Partial<RestorePointConfig>) => void;
}

/**
 * State information for restore points
 */
export interface RestorePointState {
  /** List of available restore points */
  restorePoints: RestorePoint<any>[];
  /** Configuration settings */
  config: RestorePointConfig;
  /** Whether restore point operations are in progress */
  isProcessing: boolean;
  /** Current error if any */
  error?: string;
}

/**
 * Complete restore point manager interface
 */
export interface RestorePointManager<T> extends RestorePointActions<T> {
  /** Current restore point state */
  state: RestorePointState;
}

/**
 * Hook return type for useRestorePoints
 */
export interface UseRestorePointsReturn<T> extends RestorePointManager<T> {
  /** Whether there are any restore points available */
  hasRestorePoints: boolean;
  /** Whether the maximum number of restore points has been reached */
  isAtMaxCapacity: boolean;
}

/**
 * Default configuration for restore points
 */
export const DEFAULT_RESTORE_POINT_CONFIG: RestorePointConfig = {
  maxRestorePoints: 10,
  enabled: true,
  autoGenerateNames: true,
  defaultNamePrefix: 'Restore Point',
};

/**
 * Utility type to exclude restore points from state snapshot
 * This prevents infinite recursion when creating snapshots
 */
export type StateWithoutRestorePoints<T> = Omit<T, 'restorePoints'>;

/**
 * Options for creating a restore point
 */
export interface CreateRestorePointOptions {
  /** Custom name for the restore point */
  name?: string;
  /** Optional description */
  description?: string;
  /** Whether to force creation even if at max capacity */
  forceCreate?: boolean;
}

/**
 * Result of a restore point operation
 */
export interface RestorePointOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if operation failed */
  error?: string;
  /** The restore point that was created/modified */
  restorePoint?: RestorePoint<any>;
} 