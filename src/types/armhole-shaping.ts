/**
 * Types for Armhole Shaping Calculations (US_11.3)
 * Defines interfaces for complex armhole shaping calculations (rounded set-in, raglan)
 */

import { CalculationGaugeData } from './pattern-calculation';

/**
 * Available armhole types
 */
export type ArmholeType = 'rounded_set_in' | 'raglan';

/**
 * Input parameters for armhole shaping calculations
 */
export interface ArmholeShapingInput {
  /** Type of armhole construction */
  armholeType: ArmholeType;
  /** Armhole parameters */
  armholeParameters: ArmholeParameters;
  /** Total panel width in stitches at chest level */
  totalPanelWidthStitches: number;
  /** Desired finished shoulder width in cm per side */
  finishedShoulderWidthCm: number;
  /** Gauge information for conversions */
  gauge: CalculationGaugeData;
  /** Component key for identification */
  componentKey: string;
}

/**
 * Armhole construction parameters
 */
export interface ArmholeParameters {
  /** Total armhole depth in cm */
  depth_cm: number;
  /** Width of armhole to "remove" from panel in cm */
  width_cm: number;
  /** For raglan: length of raglan line in cm */
  raglan_line_length_cm?: number;
  /** Additional parameters for specific constructions */
  construction_details?: {
    /** Ease under arm in cm */
    underarm_ease_cm?: number;
    /** Bind-off preference at base */
    base_bind_off_preference?: 'minimal' | 'standard' | 'generous';
  };
}

/**
 * Single armhole shaping action
 */
export interface ArmholeShapingAction {
  /** Type of action: bind_off, decrease */
  action: 'bind_off' | 'decrease';
  /** Number of stitches affected */
  stitches: number;
  /** Row number from start of shaping */
  on_row_from_start_of_shaping: number;
  /** Side of fabric for the action */
  side_of_fabric: 'RS' | 'WS' | 'both';
  /** Number of repetitions (for decrease series) */
  repeats?: number;
  /** Interval between repeats */
  every_x_rows?: number;
}

/**
 * Complete armhole shaping schedule
 */
export interface ArmholeShapingSchedule {
  /** Type of armhole shaping */
  type: ArmholeType;
  /** Stitches to bind off at base of armhole */
  base_bind_off_stitches: number;
  /** Detailed shaping actions */
  shaping_details: ArmholeShapingAction[];
  /** Total rows needed for shaping */
  total_rows_for_shaping: number;
  /** Final stitches remaining at shoulder edge */
  final_stitches_at_shoulder_edge: number;
}

/**
 * Result of armhole shaping calculation
 */
export interface ArmholeShapingResult {
  /** Success status */
  success: boolean;
  /** Calculated shaping schedule */
  schedule?: ArmholeShapingSchedule;
  /** Error message if calculation failed */
  error?: string;
  /** Validation warnings */
  warnings?: string[];
  /** Calculation metadata */
  metadata?: {
    /** Algorithm used */
    algorithm: string;
    /** Calculation timestamp */
    calculatedAt: string;
    /** Input summary */
    inputSummary: {
      armholeType: ArmholeType;
      panelWidth: number;
      shoulderWidth: number;
      armholeDepth: number;
    };
  };
}

/**
 * Intermediate calculation data for rounded armholes (set-in sleeves)
 */
export interface RoundedArmholeCalculation {
  /** Total stitches to be shaped (decreased + bound off) */
  totalArmholeStitches: number;
  /** Stitches to bind off at base */
  baseBindOffStitches: number;
  /** Stitches to decrease on each side */
  decreaseStitchesEachSide: number;
  /** Rows available for shaping */
  shapingRows: number;
  /** Distribution of decreases */
  decreaseDistribution: {
    /** Rapid decreases (larger amounts, closer to base) */
    rapid: { stitches: number; frequency: number; count: number };
    /** Gradual decreases (smaller amounts, toward shoulder) */
    gradual: { stitches: number; frequency: number; count: number };
  };
}

/**
 * Intermediate calculation data for raglan armholes
 */
export interface RaglanArmholeCalculation {
  /** Total stitches to decrease along raglan line */
  totalDecreaseStitches: number;
  /** Rows available for raglan shaping */
  shapingRows: number;
  /** Base bind off stitches (if any, for underarm ease) */
  baseBindOffStitches: number;
  /** Frequency of decreases */
  decreaseFrequency: number;
  /** Number of decrease events */
  decreaseEvents: number;
  /** Stitches per decrease event */
  stitchesPerEvent: number;
}

/**
 * Distribution ratios for rounded armhole shaping
 * Based on traditional pattern-making ratios
 */
export interface RoundedArmholeRatios {
  /** Proportion of armhole width to bind off at base (typically 1/6 to 1/4) */
  baseBindOffRatio: number;
  /** Proportion for rapid decreases (typically 1/2 of remaining) */
  rapidDecreaseRatio: number;
  /** Proportion for gradual decreases (typically 1/2 of remaining) */
  gradualDecreaseRatio: number;
  /** Rows between rapid decreases */
  rapidDecreaseRowInterval: number;
  /** Rows between gradual decreases */
  gradualDecreaseRowInterval: number;
}

/**
 * Validation result for armhole shaping input
 */
export interface ArmholeShapingValidationResult {
  /** Whether input is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Optional sleeve cap shaping schedule (for future US extensions)
 * Placeholder for when sleeve cap calculations are implemented
 */
export interface SleeveCapShapingSchedule {
  /** Type of sleeve cap */
  type: 'rounded_set_in' | 'raglan_sleeve_top';
  /** Initial stitches at sleeve start */
  initial_stitches: number;
  /** Shaping details for increases and decreases */
  cap_shaping_details: ArmholeShapingAction[];
  /** Total rows for cap shaping */
  total_cap_rows: number;
  /** Final stitches at top of cap */
  final_cap_stitches: number;
} 