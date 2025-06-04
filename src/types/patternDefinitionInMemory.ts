/**
 * In-Memory Pattern Definition Types (PD_PH1_US001)
 * Types for managing pattern definition state purely in memory
 */

import { PatternDefinitionSection } from '@/types/garmentTypeConfig';

/**
 * In-memory pattern definition state
 * All data is stored in memory and not persisted until explicitly saved
 */
export interface InMemoryPatternDefinition {
  /** Unique session identifier */
  sessionId: string;
  /** User-defined session name */
  sessionName: string;
  /** Craft type (knitting, crochet, etc.) */
  craftType: 'knitting' | 'crochet';
  /** Selected garment type key */
  garmentType: string | null;
  /** Timestamp when session was created */
  createdAt: Date;
  /** Timestamp when session was last updated */
  updatedAt: Date;
  
  // Section Data - all optional until filled
  gauge?: GaugeSectionData;
  measurements?: MeasurementsSectionData;
  ease?: EaseSectionData;
  yarn?: YarnSectionData;
  stitchPattern?: StitchPatternSectionData;
  bodyStructure?: BodyStructureSectionData;
  neckline?: NecklineSectionData;
  sleeves?: SleevesSectionData;
  accessoryDefinition?: AccessoryDefinitionSectionData;
}

/**
 * Gauge section data
 */
export interface GaugeSectionData {
  /** Manual gauge entry or selected profile */
  source: 'manual' | 'profile';
  /** Gauge profile ID if using profile */
  profileId?: string;
  /** Stitches per unit */
  stitchCount: number;
  /** Rows per unit */
  rowCount: number;
  /** Unit of measurement */
  unit: 'inch' | 'cm';
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Measurements section data
 */
export interface MeasurementsSectionData {
  /** Measurement set ID if using preset */
  setId?: string;
  /** Individual measurements */
  measurements: Record<string, number>;
  /** Unit of measurement */
  unit: 'inch' | 'cm';
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Ease section data
 */
export interface EaseSectionData {
  /** Ease preference ID if using preset */
  preferenceId?: string;
  /** Ease type */
  type: 'positive' | 'negative' | 'zero';
  /** Ease values for different measurements */
  values: {
    bust?: number;
    waist?: number;
    hip?: number;
    [key: string]: number | undefined;
  };
  /** Unit of measurement */
  unit: 'inch' | 'cm';
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Yarn section data
 */
export interface YarnSectionData {
  /** Yarn profile ID if using profile */
  profileId?: string;
  /** Yarn properties */
  properties: {
    weight?: string;
    fiber?: string;
    yardage?: number;
    color?: string;
    brand?: string;
    name?: string;
  };
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Stitch pattern section data
 */
export interface StitchPatternSectionData {
  /** Stitch pattern ID if using library pattern */
  patternId?: string;
  /** Pattern properties */
  properties: {
    name?: string;
    type?: string;
    difficulty?: string;
    repeat?: {
      stitches: number;
      rows: number;
    };
  };
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Body structure section data (for sweaters/cardigans)
 */
export interface BodyStructureSectionData {
  /** Construction method */
  constructionMethod?: string;
  /** Body shape */
  bodyShape?: string;
  /** Additional parameters */
  parameters: Record<string, any>;
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Neckline section data (for sweaters/cardigans)
 */
export interface NecklineSectionData {
  /** Neckline style */
  style?: string;
  /** Neckline parameters */
  parameters: Record<string, any>;
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Sleeves section data (for sweaters/cardigans)
 */
export interface SleevesSectionData {
  /** Sleeve style */
  style?: string;
  /** Sleeve length */
  length?: string;
  /** Custom length if applicable */
  customLength?: number;
  /** Cuff style */
  cuffStyle?: string;
  /** Additional parameters */
  parameters: Record<string, any>;
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Accessory definition section data (for hats, scarves, etc.)
 */
export interface AccessoryDefinitionSectionData {
  /** Accessory type specific attributes */
  attributes: Record<string, any>;
  /** Completed status */
  isCompleted: boolean;
}

/**
 * Navigation state for in-memory pattern definition
 */
export interface InMemoryNavigationState {
  /** Currently active section */
  currentSection: PatternDefinitionSection | null;
  /** Sections available for the current garment type */
  availableSections: PatternDefinitionSection[];
  /** Sections that have been completed */
  completedSections: PatternDefinitionSection[];
  /** Sections that are required for this garment type */
  requiredSections: PatternDefinitionSection[];
}

/**
 * Context state for in-memory pattern definition management
 */
export interface InMemoryPatternDefinitionState {
  /** Current pattern definition */
  currentPattern: InMemoryPatternDefinition | null;
  /** Navigation state */
  navigation: InMemoryNavigationState;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Actions for updating pattern definition state
 */
export type PatternDefinitionAction =
  | { type: 'CREATE_PATTERN'; payload: { sessionName: string; craftType: 'knitting' | 'crochet' } }
  | { type: 'SELECT_GARMENT_TYPE'; payload: string }
  | { type: 'SET_CURRENT_SECTION'; payload: PatternDefinitionSection }
  | { type: 'UPDATE_SECTION_DATA'; payload: { section: PatternDefinitionSection; data: any } }
  | { type: 'MARK_SECTION_COMPLETED'; payload: PatternDefinitionSection }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_PATTERN' };

/**
 * Context interface for in-memory pattern definition
 */
export interface InMemoryPatternDefinitionContext {
  /** Current state */
  state: InMemoryPatternDefinitionState;
  /** Create a new pattern */
  createPattern: (sessionName: string, craftType: 'knitting' | 'crochet') => void;
  /** Select garment type */
  selectGarmentType: (garmentTypeKey: string) => void;
  /** Navigate to a specific section */
  navigateToSection: (section: PatternDefinitionSection) => void;
  /** Update section data */
  updateSectionData: (section: PatternDefinitionSection, data: any) => void;
  /** Mark section as completed */
  markSectionCompleted: (section: PatternDefinitionSection) => void;
  /** Clear current pattern */
  clearPattern: () => void;
} 