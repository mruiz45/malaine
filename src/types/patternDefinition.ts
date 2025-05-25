/**
 * Types for Pattern Definition Sessions (US_1.6)
 * Defines interfaces for pattern definition session management
 */

import { GaugeProfile } from './gauge';
import { MeasurementSet } from './measurements';
import { EasePreference } from './ease';
import { YarnProfile } from './yarn';
import { StitchPattern } from './stitchPattern';

/**
 * Status of a pattern definition session
 */
export type SessionStatus = 'draft' | 'ready_for_calculation' | 'completed' | 'archived';

/**
 * Steps in the pattern definition process
 */
export type DefinitionStep = 'gauge' | 'measurements' | 'ease' | 'yarn' | 'stitch-pattern' | 'summary';

/**
 * Base pattern definition session interface matching the database schema
 */
export interface PatternDefinitionSession {
  /** Unique identifier for the session */
  id: string;
  /** User ID who owns this session */
  user_id: string;
  /** Optional name for the session */
  session_name?: string;
  /** Selected gauge profile ID */
  selected_gauge_profile_id?: string;
  /** Selected measurement set ID */
  selected_measurement_set_id?: string;
  /** Type of ease (positive, negative, zero) */
  ease_type?: string;
  /** Ease value for bust measurement */
  ease_value_bust?: number;
  /** Unit for ease measurements */
  ease_unit?: string;
  /** Selected yarn profile ID */
  selected_yarn_profile_id?: string;
  /** Selected stitch pattern ID */
  selected_stitch_pattern_id?: string;
  /** Current status of the session */
  status: SessionStatus;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Cached gauge stitch count */
  gauge_stitch_count?: number;
  /** Cached gauge row count */
  gauge_row_count?: number;
  /** Unit for gauge measurements */
  gauge_unit?: string;
  /** Snapshot of all parameters for calculation */
  parameter_snapshot?: Record<string, any>;
}

/**
 * Extended session interface with populated related data
 */
export interface PatternDefinitionSessionWithData extends PatternDefinitionSession {
  /** Populated gauge profile data */
  gauge_profile?: GaugeProfile;
  /** Populated measurement set data */
  measurement_set?: MeasurementSet;
  /** Populated ease preference data */
  ease_preference?: EasePreference;
  /** Populated yarn profile data */
  yarn_profile?: YarnProfile;
  /** Populated stitch pattern data */
  stitch_pattern?: StitchPattern;
}

/**
 * Data for creating a new pattern definition session
 */
export interface CreatePatternDefinitionSessionData {
  /** Optional name for the session */
  session_name?: string;
  /** Initial status (defaults to 'draft') */
  status?: SessionStatus;
}

/**
 * Data for updating a pattern definition session
 */
export interface UpdatePatternDefinitionSessionData {
  /** Updated session name */
  session_name?: string;
  /** Selected gauge profile ID */
  selected_gauge_profile_id?: string;
  /** Selected measurement set ID */
  selected_measurement_set_id?: string;
  /** Type of ease */
  ease_type?: string;
  /** Ease value for bust */
  ease_value_bust?: number;
  /** Unit for ease measurements */
  ease_unit?: string;
  /** Selected yarn profile ID */
  selected_yarn_profile_id?: string;
  /** Selected stitch pattern ID */
  selected_stitch_pattern_id?: string;
  /** Session status */
  status?: SessionStatus;
  /** Cached gauge values */
  gauge_stitch_count?: number;
  gauge_row_count?: number;
  gauge_unit?: string;
  /** Parameter snapshot */
  parameter_snapshot?: Record<string, any>;
}

/**
 * Summary data for a definition step
 */
export interface StepSummary {
  /** Step identifier */
  step: DefinitionStep;
  /** Whether the step is completed */
  completed: boolean;
  /** Summary text for the step */
  summary?: string;
  /** Additional data for the step */
  data?: Record<string, any>;
}

/**
 * Complete session summary
 */
export interface SessionSummary {
  /** Session basic info */
  session: PatternDefinitionSession;
  /** Summary for each step */
  steps: StepSummary[];
  /** Overall completion percentage */
  completionPercentage: number;
  /** Whether the session is ready for calculation */
  readyForCalculation: boolean;
}

/**
 * Navigation state for the definition process
 */
export interface DefinitionNavigation {
  /** Current active step */
  currentStep: DefinitionStep;
  /** Available steps */
  availableSteps: DefinitionStep[];
  /** Completed steps */
  completedSteps: DefinitionStep[];
  /** Whether navigation to next step is allowed */
  canProceed: boolean;
}

/**
 * Session context state
 */
export interface PatternDefinitionContextState {
  /** Current session */
  currentSession?: PatternDefinitionSessionWithData;
  /** Navigation state */
  navigation: DefinitionNavigation;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
  /** Whether auto-save is enabled */
  autoSave: boolean;
}

/**
 * Session context actions
 */
export interface PatternDefinitionContextActions {
  /** Create a new session */
  createSession: (data?: CreatePatternDefinitionSessionData) => Promise<PatternDefinitionSession>;
  /** Load an existing session */
  loadSession: (sessionId: string) => Promise<void>;
  /** Update the current session */
  updateSession: (data: UpdatePatternDefinitionSessionData) => Promise<void>;
  /** Save the current session */
  saveSession: () => Promise<void>;
  /** Navigate to a specific step */
  navigateToStep: (step: DefinitionStep) => void;
  /** Move to the next step */
  nextStep: () => void;
  /** Move to the previous step */
  previousStep: () => void;
  /** Generate session summary */
  generateSummary: () => SessionSummary;
  /** Clear the current session */
  clearSession: () => void;
}

/**
 * Complete pattern definition context
 */
export interface PatternDefinitionContext extends PatternDefinitionContextState, PatternDefinitionContextActions {}

/**
 * API response for pattern definition sessions
 */
export interface PatternDefinitionSessionResponse {
  /** Success status */
  success: boolean;
  /** Session data */
  data?: PatternDefinitionSession;
  /** Error message if any */
  error?: string;
}

/**
 * API response for multiple sessions
 */
export interface PatternDefinitionSessionsResponse {
  /** Success status */
  success: boolean;
  /** Sessions data */
  data?: PatternDefinitionSession[];
  /** Error message if any */
  error?: string;
} 