/**
 * Pattern Progress Types (US_11.7)
 * Types for tracking user progress through pattern instructions
 */

/**
 * Progress tracking for a specific pattern session
 */
export interface PatternProgress {
  /** Session ID of the pattern */
  sessionId: string;
  /** Currently active component key */
  currentComponent?: string;
  /** Current instruction step being viewed/worked */
  currentInstructionStep?: number;
  /** Current row number for chart synchronization */
  currentRowNumber?: number;
  /** Repetition counters for repeat instructions */
  repetitionCounters: Record<string, number>;
  /** Timestamp of last update */
  lastUpdated: string;
  /** Version for potential future migrations */
  version: number;
}

/**
 * Repetition instruction data
 */
export interface RepetitionInstruction {
  /** Unique identifier for this repetition */
  id: string;
  /** Text description of what to repeat */
  description: string;
  /** Maximum number of repetitions */
  maxRepetitions: number;
  /** Current count of completed repetitions */
  currentCount: number;
  /** Associated instruction step */
  instructionStep: number;
  /** Associated component */
  componentName: string;
}

/**
 * Row highlight information for synchronization
 */
export interface RowHighlight {
  /** Component name */
  componentName: string;
  /** Row number (1-based) */
  rowNumber: number;
  /** Instruction step associated with this row */
  instructionStep: number;
  /** Whether this is active in text instructions */
  isActiveInText: boolean;
  /** Whether this is active in chart */
  isActiveInChart: boolean;
}

/**
 * Progress navigation state
 */
export interface ProgressNavigation {
  /** Whether we can go to previous step */
  canGoPrevious: boolean;
  /** Whether we can go to next step */
  canGoNext: boolean;
  /** Current position in overall pattern */
  currentPosition: number;
  /** Total number of steps in pattern */
  totalSteps: number;
  /** Current component being worked */
  currentComponent?: string;
}

/**
 * Pattern progress context state
 */
export interface PatternProgressState {
  /** Current progress data */
  progress: PatternProgress | null;
  /** Navigation state */
  navigation: ProgressNavigation;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
  /** Whether auto-save is enabled */
  autoSave: boolean;
}

/**
 * Pattern progress context interface
 */
export interface PatternProgressContextType extends PatternProgressState {
  /** Initialize progress for a session */
  initializeProgress: (sessionId: string) => void;
  /** Navigate to specific step */
  goToStep: (componentName: string, stepNumber: number) => void;
  /** Navigate to previous step */
  goToPreviousStep: () => void;
  /** Navigate to next step */
  goToNextStep: () => void;
  /** Update repetition counter */
  updateRepetitionCounter: (counterId: string, increment: number) => void;
  /** Reset repetition counter */
  resetRepetitionCounter: (counterId: string) => void;
  /** Clear all progress */
  clearProgress: () => void;
  /** Manually save progress */
  saveProgress: () => void;
  /** Update current row for chart synchronization */
  updateCurrentRow: (rowNumber: number) => void;
}

/**
 * Options for progress initialization
 */
export interface ProgressInitializationOptions {
  /** Whether to load existing progress from localStorage */
  loadExisting?: boolean;
  /** Whether to enable auto-save */
  enableAutoSave?: boolean;
  /** Custom auto-save interval in milliseconds */
  autoSaveInterval?: number;
}

/**
 * Progress export/import format
 */
export interface ProgressExport {
  /** Progress data */
  progress: PatternProgress;
  /** Export timestamp */
  exportedAt: string;
  /** Export version */
  exportVersion: string;
} 