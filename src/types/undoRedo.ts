/**
 * Undo/Redo Types for Pattern Definition
 * Types for managing undo/redo functionality in pattern definition contexts
 */

/**
 * Configuration options for undo/redo store
 */
export interface UndoRedoConfig {
  /** Maximum number of undo steps to keep in history */
  maxHistorySize: number;
  /** Whether to enable undo/redo functionality */
  enabled: boolean;
  /** Whether to automatically save snapshots on state changes */
  autoSnapshot: boolean;
}

/**
 * Undo/redo state information
 */
export interface UndoRedoState {
  /** Whether there are actions that can be undone */
  canUndo: boolean;
  /** Whether there are actions that can be redone */
  canRedo: boolean;
  /** Current position in the history stack */
  currentIndex: number;
  /** Total number of items in history */
  historySize: number;
  /** Configuration settings */
  config: UndoRedoConfig;
}

/**
 * Actions available for undo/redo management
 */
export interface UndoRedoActions {
  /** Undo the last action */
  undo: () => void;
  /** Redo the previously undone action */
  redo: () => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Update configuration */
  updateConfig: (config: Partial<UndoRedoConfig>) => void;
  /** Get current undo/redo state */
  getUndoRedoState: () => UndoRedoState;
}

/**
 * Complete undo/redo store interface
 */
export interface UndoRedoStore<T> extends UndoRedoActions {
  /** Current state */
  present: T;
  /** Set the current state and create a snapshot */
  setState: (state: T, shouldSnapshot?: boolean) => void;
  /** Create a manual snapshot of current state */
  snapshot: () => void;
}

/**
 * Default configuration for undo/redo
 */
export const DEFAULT_UNDO_REDO_CONFIG: UndoRedoConfig = {
  maxHistorySize: 20,
  enabled: true,
  autoSnapshot: true,
};

/**
 * Hook return type for useUndoRedoStore
 */
export interface UseUndoRedoStoreReturn<T> {
  /** Current state */
  state: T;
  /** Set state with optional snapshot */
  setState: (state: T, shouldSnapshot?: boolean) => void;
  /** Undo last action */
  undo: () => void;
  /** Redo previously undone action */
  redo: () => void;
  /** Create manual snapshot */
  snapshot: () => void;
  /** Clear all history */
  clearHistory: () => void;
  /** Undo/redo state information */
  undoRedoState: UndoRedoState;
  /** Update configuration */
  updateConfig: (config: Partial<UndoRedoConfig>) => void;
} 