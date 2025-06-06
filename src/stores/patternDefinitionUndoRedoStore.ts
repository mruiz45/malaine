/**
 * Pattern Definition Undo/Redo Store
 * Specialized undo/redo functionality for pattern definition contexts
 */

import { createUndoRedoStore } from './undoRedoStore';
import { 
  PatternDefinitionSessionWithData,
  PatternDefinitionContextState 
} from '@/types/patternDefinition';
import { 
  InMemoryPatternDefinition,
  InMemoryPatternDefinitionState 
} from '@/types/patternDefinitionInMemory';

/**
 * Undo/redo store for InMemoryPatternDefinition
 */
export const { useUndoRedoStore: useInMemoryPatternUndoRedo } = createUndoRedoStore<InMemoryPatternDefinition | null>(
  null,
  {
    maxHistorySize: 20,
    enabled: true,
    autoSnapshot: true,
  }
);

/**
 * Undo/redo store for PatternDefinitionSession (with database)
 */
export const { useUndoRedoStore: usePatternDefinitionUndoRedo } = createUndoRedoStore<PatternDefinitionSessionWithData | null>(
  null,
  {
    maxHistorySize: 20,
    enabled: true,
    autoSnapshot: true,
  }
);

/**
 * Configuration constants for pattern definition undo/redo
 */
export const PATTERN_DEFINITION_UNDO_REDO_CONFIG = {
  /** Default maximum history size for pattern definitions */
  DEFAULT_MAX_HISTORY: 20,
  /** Minimum history size */
  MIN_HISTORY_SIZE: 5,
  /** Maximum history size */
  MAX_HISTORY_SIZE: 100,
  /** Default auto-snapshot setting */
  DEFAULT_AUTO_SNAPSHOT: true,
} as const;

/**
 * Utility functions for pattern definition undo/redo
 */
export const patternDefinitionUndoRedoUtils = {
  /**
   * Check if two pattern definitions are significantly different
   * Used to determine when to create snapshots
   */
  isSignificantChange: (
    previous: InMemoryPatternDefinition | null,
    current: InMemoryPatternDefinition | null
  ): boolean => {
    if (!previous && !current) return false;
    if (!previous || !current) return true;

    // Check garment type change
    if (previous.garmentType !== current.garmentType) return true;

    // Check section data changes using proper property names
    const sections = [
      'gauge', 'measurements', 'ease', 'yarn', 'stitchPattern',
      'bodyStructure', 'neckline', 'sleeves', 'accessoryDefinition'
    ] as const;

    for (const section of sections) {
      const prevData = previous[section];
      const currData = current[section];
      
      if (JSON.stringify(prevData) !== JSON.stringify(currData)) {
        return true;
      }
    }

    return false;
  },

  /**
   * Check if two session data are significantly different
   */
  isSignificantSessionChange: (
    previous: PatternDefinitionSessionWithData | null,
    current: PatternDefinitionSessionWithData | null
  ): boolean => {
    if (!previous && !current) return false;
    if (!previous || !current) return true;

    // Check basic session properties
    if (previous.session_name !== current.session_name) return true;
    if (previous.craft_type !== current.craft_type) return true;

    // Check if data has changed (excluding timestamps)
    const prevData = { ...previous } as Partial<PatternDefinitionSessionWithData>;
    const currData = { ...current } as Partial<PatternDefinitionSessionWithData>;
    
    // Remove timestamps and IDs for comparison
    delete prevData.created_at;
    delete currData.created_at;
    delete prevData.updated_at;
    delete currData.updated_at;

    return JSON.stringify(prevData) !== JSON.stringify(currData);
  },

  /**
   * Create a deep copy of pattern definition
   */
  cloneInMemoryPattern: (pattern: InMemoryPatternDefinition | null): InMemoryPatternDefinition | null => {
    if (!pattern) return null;
    return JSON.parse(JSON.stringify(pattern));
  },

  /**
   * Create a deep copy of pattern definition session
   */
  clonePatternSession: (session: PatternDefinitionSessionWithData | null): PatternDefinitionSessionWithData | null => {
    if (!session) return null;
    return JSON.parse(JSON.stringify(session));
  },
} as const; 