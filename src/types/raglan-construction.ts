/**
 * Types for Raglan Top-Down Construction (US_12.1)
 * Defines interfaces for raglan sweater calculations knitted from the top down
 */

import { CalculationGaugeData } from './pattern-calculation';

/**
 * Input data for raglan top-down calculations
 */
export interface RaglanTopDownInput {
  /** Final desired dimensions */
  targetDimensions: {
    /** Finished bust circumference in cm */
    bustCircumference_cm: number;
    /** Body length from underarm to hem in cm */
    bodyLength_cm: number;
    /** Sleeve length from underarm to cuff in cm */
    sleeveLength_cm: number;
    /** Upper arm circumference in cm */
    upperArmCircumference_cm: number;
  };
  
  /** Gauge information */
  gauge: CalculationGaugeData;
  
  /** Neckline specifications */
  neckline: {
    /** Desired finished neckline depth in cm */
    depth_cm: number;
    /** Desired finished neckline circumference in cm */
    circumference_cm: number;
  };
  
  /** Raglan line specifications */
  raglanLineStitches: number; // Number of stitches dedicated to each raglan line (typically 1, 2, or small pattern)
  
  /** Optional ease adjustments */
  ease?: {
    /** Additional ease for neckline (default: 2cm) */
    neckline_cm?: number;
    /** Additional ease for body (default: 5cm) */
    body_cm?: number;
    /** Additional ease for sleeves (default: 3cm) */
    sleeve_cm?: number;
  };
  
  /** Component identification */
  componentKey: string;
}

/**
 * Initial distribution of stitches around the neckline
 */
export interface RaglanInitialDistribution {
  /** Stitches for front panel */
  front_stitches: number;
  /** Stitches for back panel */
  back_stitches: number;
  /** Stitches for left sleeve */
  sleeve_left_stitches: number;
  /** Stitches for right sleeve */
  sleeve_right_stitches: number;
  /** Stitches for each raglan line (typically same for all 4 lines) */
  raglan_line_stitches_each: number;
  /** Total stitches check (should equal neckline_cast_on_total) */
  total_check: number;
}

/**
 * Raglan shaping schedule and calculations
 */
export interface RaglanShapingSchedule {
  /** Length of raglan line in rows/rounds */
  raglan_line_length_rows_or_rounds: number;
  /** Description of augmentation frequency */
  augmentation_frequency_description: string;
  /** Total number of augmentation rounds/rows */
  total_augmentation_rounds_or_rows: number;
  /** Total increases per sleeve section */
  total_increases_per_sleeve: number;
  /** Total increases per body panel (front and back each) */
  total_increases_per_body_panel: number;
  /** Frequency pattern (e.g., every 2nd round) */
  increase_frequency: number;
}

/**
 * Stitch counts at the point of separation (body from sleeves)
 */
export interface RaglanSeparationData {
  /** Total stitches for body (front + back + raglan stitches absorbed) */
  body_total_stitches: number;
  /** Stitches for each sleeve (including raglan stitches absorbed) */
  sleeve_each_stitches: number;
  /** Stitches to cast on under each arm during separation */
  underarm_cast_on_stitches: number;
}

/**
 * Complete raglan top-down calculation results
 */
export interface RaglanTopDownCalculations {
  /** Total stitches to cast on for neckline */
  neckline_cast_on_total: number;
  /** Initial distribution of neckline stitches */
  initial_distribution: RaglanInitialDistribution;
  /** Raglan shaping calculations */
  raglan_shaping: RaglanShapingSchedule;
  /** Stitch counts at separation point */
  stitches_at_separation: RaglanSeparationData;
  /** Additional calculation metadata */
  calculation_metadata?: {
    /** Actual neckline circumference achieved in cm */
    actual_neckline_circumference_cm: number;
    /** Actual body width at separation in cm */
    actual_body_width_at_separation_cm: number;
    /** Actual sleeve width at separation in cm */
    actual_sleeve_width_at_separation_cm: number;
    /** Warnings or notes about the calculation */
    warnings?: string[];
  };
}

/**
 * Result of raglan top-down calculation
 */
export interface RaglanTopDownResult {
  /** Success status */
  success: boolean;
  /** Calculated raglan data if successful */
  calculations?: RaglanTopDownCalculations;
  /** Error message if calculation failed */
  error?: string;
  /** Validation errors */
  validationErrors?: string[];
  /** Warnings that don't prevent calculation but should be noted */
  warnings?: string[];
}

/**
 * Standard raglan distribution ratios (Elizabeth Zimmermann method)
 */
export const STANDARD_RAGLAN_DISTRIBUTION = {
  /** Back panel ratio */
  BACK_RATIO: 1/3,
  /** Front panel ratio */
  FRONT_RATIO: 1/3,
  /** Each sleeve ratio */
  SLEEVE_RATIO: 1/6
} as const;

/**
 * Default values for raglan construction
 */
export const RAGLAN_DEFAULTS = {
  /** Default ease for neckline in cm */
  NECKLINE_EASE_CM: 2,
  /** Default ease for body in cm */
  BODY_EASE_CM: 5,
  /** Default ease for sleeves in cm */
  SLEEVE_EASE_CM: 3,
  /** Default raglan line stitches */
  RAGLAN_LINE_STITCHES: 2,
  /** Default underarm cast-on stitches */
  UNDERARM_CAST_ON_STITCHES: 8,
  /** Standard increase frequency (every nth round) */
  STANDARD_INCREASE_FREQUENCY: 2
} as const; 