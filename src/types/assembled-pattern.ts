/**
 * Types for Assembled Pattern Structure (US_9.1)
 * Defines interfaces for the assembled pattern document structure
 */

import type { StitchChartData } from './stitchChart';
import { GarmentAssemblyData } from './assembly-visualization';

/**
 * Standard abbreviation used in patterns
 */
export interface PatternAbbreviation {
  /** Abbreviation text (e.g., "k", "p") */
  abbr: string;
  /** Full definition (e.g., "knit", "purl") */
  definition: string;
}

/**
 * Special stitch technique with detailed instructions
 */
export interface SpecialStitch {
  /** Name of the special stitch */
  name: string;
  /** Detailed instructions for executing the stitch */
  instructions: string;
  /** Optional abbreviation for this stitch */
  abbreviation?: string;
}

/**
 * Yarn information with quantity estimates
 */
export interface PatternYarn {
  /** Yarn name */
  name: string;
  /** Estimated quantity needed */
  estimated_quantity: string;
  /** Yarn weight category */
  weight_category?: string;
  /** Fiber content */
  fiber?: string;
}

/**
 * Gauge information for the pattern
 */
export interface PatternGauge {
  /** Stitches per 10cm */
  stitchesPer10cm: number;
  /** Rows per 10cm */
  rowsPer10cm: number;
  /** Measurement unit */
  unit: string;
  /** Optional gauge profile name */
  profileName?: string;
}

/**
 * Finished measurements of the garment
 */
export interface FinishedMeasurements {
  /** Chest/bust circumference */
  chest?: string;
  /** Total garment length */
  length?: string;
  /** Waist circumference */
  waist?: string;
  /** Hip circumference */
  hips?: string;
  /** Shoulder width */
  shoulder_width?: string;
  /** Arm length */
  arm_length?: string;
  /** Upper arm circumference */
  upper_arm?: string;
  /** Neck circumference */
  neck?: string;
  /** Additional measurements */
  [key: string]: string | undefined;
}

/**
 * Single instruction step for a component
 */
export interface ComponentInstruction {
  /** Step number */
  step: number;
  /** Instruction text */
  text: string;
  /** Optional row number */
  rowNumber?: number;
  /** Stitch count after this step */
  stitchCount?: number;
  /** Whether this is a shaping row */
  isShapingRow?: boolean;
}

/**
 * Calculation details for a component
 */
export interface ComponentCalculations {
  /** Cast-on stitch count */
  cast_on?: number;
  /** Total rows */
  rows?: number;
  /** Target width used */
  target_width_cm?: number;
  /** Target length used */
  target_length_cm?: number;
  /** Actual calculated width */
  actual_width_cm?: number;
  /** Actual calculated length */
  actual_length_cm?: number;
  /** Pattern repeats if applicable */
  pattern_repeats?: number;
}

/**
 * Complete component definition with instructions
 */
export interface PatternComponent {
  /** Component name (e.g., "Back Panel", "Sleeve") */
  componentName: string;
  /** Calculation details */
  calculations: ComponentCalculations;
  /** Step-by-step instructions */
  instructions: ComponentInstruction[];
  /** Optional shaping summary */
  shaping_summary?: string;
  /** Optional special notes for this component */
  notes?: string[];
  /** Optional stitch chart for this component (US_11.6) */
  stitch_chart?: StitchChartData;
}

/**
 * Assembly instruction step
 */
export interface AssemblyInstruction {
  /** Step number in assembly process */
  step: number;
  /** Assembly instruction text */
  text: string;
  /** Optional notes for this step */
  note?: string;
}

/**
 * Complete assembled pattern structure
 */
export interface AssembledPattern {
  /** Pattern title/name */
  patternTitle: string;
  /** Target size label */
  targetSizeLabel: string;
  /** Craft type */
  craftType: 'knitting' | 'crochet';
  /** Gauge information */
  gauge: PatternGauge;
  /** Yarns with quantities */
  yarns: PatternYarn[];
  /** Needles/hooks required */
  needles_hooks: string[];
  /** Standard abbreviations used */
  abbreviations: PatternAbbreviation[];
  /** Special stitches if any */
  special_stitches: SpecialStitch[];
  /** Finished measurements */
  finished_measurements: FinishedMeasurements;
  /** Component instructions */
  components: PatternComponent[];
  /** Assembly/finishing instructions */
  assembly_instructions: AssemblyInstruction[];
  /** Pattern notes and warnings */
  pattern_notes: string[];
  /** Generation metadata */
  generated_at: string;
  /** Source session ID */
  session_id: string;
  /** 2D Assembly visualization data (US_12.9) - Optional */
  assembly_2d?: GarmentAssemblyData;
}

/**
 * Request structure for assembling a pattern
 */
export interface AssemblePatternRequest {
  /** Session ID to assemble pattern for */
  sessionId: string;
  /** Optional assembly options */
  options?: {
    /** Include detailed shaping summaries */
    includeShapingSummaries?: boolean;
    /** Include yarn quantity estimates */
    includeYarnEstimates?: boolean;
    /** Language for generated text */
    language?: 'en' | 'fr';
  };
}

/**
 * Response structure for assembled pattern
 */
export interface AssemblePatternResponse {
  /** Success status */
  success: boolean;
  /** Assembled pattern data */
  data?: AssembledPattern;
  /** Error message if any */
  error?: string;
  /** Validation errors */
  validationErrors?: string[];
}

/**
 * Pattern viewer state for UI
 */
export interface PatternViewerState {
  /** Current pattern being viewed */
  pattern: AssembledPattern | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Current section being viewed */
  currentSection?: string;
  /** Whether print mode is active */
  printMode: boolean;
} 