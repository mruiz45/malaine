/**
 * Types for Pattern Definition Sessions (US_1.6)
 * Defines interfaces for pattern definition session management
 */

import { GaugeProfile } from './gauge';
import { MeasurementSet } from './measurements';
import { EasePreference } from './ease';
import { YarnProfile } from './yarn';
import { StitchPattern } from './stitchPattern';
import { PatternDefinitionComponentWithTemplate, GarmentType } from './garment';
import { SweaterStructureAttributes } from './sweaterStructure';
import { NecklineAttributes } from './neckline';
import { SleeveAttributes } from './sleeve';
import { BeanieAttributes, ScarfCowlAttributes } from './accessories';
import { ColorScheme } from './colorScheme';

/**
 * Status of a pattern definition session
 */
export type SessionStatus = 'draft' | 'ready_for_calculation' | 'completed' | 'archived';

/**
 * Steps in the pattern definition process
 */
export type DefinitionStep = 
  | 'garment-type'
  | 'gauge'
  | 'measurements'
  | 'ease'
  | 'yarn'
  | 'stitch-pattern'
  | 'garment-structure'
  | 'neckline'
  | 'sleeves'
  | 'accessory-definition'
  | 'summary';

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
  /** Selected garment type ID (US 4.2) */
  selected_garment_type_id?: string;
  /** Craft type for terminology differentiation (US 6.3) */
  craft_type: 'knitting' | 'crochet';
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
  /** Snapshot of current parameter selections */
  parameter_snapshot?: ParameterSnapshot;
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
  /** Populated garment type data (US 4.2) */
  garment_type?: GarmentType;
  /** Pattern definition components for this session */
  components?: PatternDefinitionComponentWithTemplate[];
  /** Snapshot of current parameter selections */
  parameter_snapshot?: ParameterSnapshot;
}

/**
 * Data for creating a new pattern definition session
 */
export interface CreatePatternDefinitionSessionData {
  /** Optional name for the session */
  session_name?: string;
  /** Craft type for terminology differentiation (US 6.3) */
  craft_type: 'knitting' | 'crochet';
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
  /** Selected garment type ID (US 4.2) */
  selected_garment_type_id?: string;
  /** Craft type for terminology differentiation (US 6.3) */
  craft_type?: 'knitting' | 'crochet';
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

/**
 * Pattern Outline interfaces for US_5.3
 */

/**
 * Foundation section of the pattern outline
 */
export interface PatternFoundations {
  /** Gauge information */
  gauge?: {
    stitch_count: number;
    row_count: number;
    unit: string;
    profile_name?: string;
  };
  /** Measurement set information */
  measurements?: {
    set_name?: string;
    key_measurements?: string[];
  };
  /** Ease preferences */
  ease?: {
    type: string;
    value_bust?: number;
    unit?: string;
  };
  /** Yarn information */
  yarn?: {
    name?: string;
    weight?: string;
    fiber?: string;
  };
  /** Stitch pattern information */
  stitch_pattern?: {
    name?: string;
    repeat_info?: string;
  };
}

/**
 * Garment overview section
 */
export interface GarmentOverview {
  /** Selected garment type */
  type?: {
    name: string;
    description?: string;
    difficulty?: string;
  };
  /** Construction method if applicable */
  construction_method?: string;
}

/**
 * Component breakdown item
 */
export interface ComponentBreakdown {
  /** Component label */
  label: string;
  /** Component type */
  type: string;
  /** Selected style/shape */
  style?: string;
  /** Key parameters */
  parameters?: Record<string, any>;
  /** Additional notes */
  notes?: string;
}

/**
 * Color scheme summary (optional)
 */
export interface ColorSchemeSummary {
  /** Scheme name */
  name?: string;
  /** Number of colors */
  color_count?: number;
  /** Color distribution */
  distribution?: string;
}

/**
 * Morphology notes summary (optional)
 */
export interface MorphologyNotes {
  /** Characteristics reviewed */
  characteristics?: string[];
  /** Key advice points */
  advice_summary?: string;
}

/**
 * Complete pattern outline structure
 */
export interface PatternOutline {
  /** Session basic information */
  session_info: {
    id: string;
    name?: string;
    status: SessionStatus;
    last_updated: string;
  };
  /** Pattern foundations */
  foundations: PatternFoundations;
  /** Garment overview */
  garment_overview: GarmentOverview;
  /** Component breakdown */
  components: ComponentBreakdown[];
  /** Color scheme (optional) */
  color_scheme?: ColorSchemeSummary;
  /** Morphology notes (optional) */
  morphology_notes?: MorphologyNotes;
  /** Generation timestamp */
  generated_at: string;
  /** Completion status */
  completion_status: {
    total_sections: number;
    completed_sections: number;
    missing_sections: string[];
  };
}

/**
 * API response for pattern outline generation
 */
export interface PatternOutlineResponse {
  /** Success status */
  success: boolean;
  /** Outline data */
  data?: PatternOutline;
  /** Error message if any */
  error?: string;
}

/**
 * Parameter snapshot interface for storing session-specific attributes
 */
export interface ParameterSnapshot {
  sweater_structure?: SweaterStructureAttributes;
  neckline?: NecklineAttributes;
  sleeves?: SleeveAttributes;
  beanie?: BeanieAttributes;
  scarf_cowl?: ScarfCowlAttributes;
  color_scheme?: ColorScheme;
  [key: string]: any; // Allow for additional dynamic properties
} 