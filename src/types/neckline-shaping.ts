/**
 * Types for Neckline Shaping Calculations (US_11.1)
 * Defines interfaces for complex neckline shaping calculations (rounded, V-neck)
 */

import { NecklineStyle, NecklineParameters } from './neckline';
import { CalculationGaugeData } from './pattern-calculation';

/**
 * Input parameters for neckline shaping calculations
 */
export interface NecklineShapingInput {
  /** Type of neckline (from US 4.4) */
  necklineType: NecklineStyle;
  /** Neckline parameters (from US 4.4) */
  necklineParameters: NecklineParameters;
  /** Total panel width in stitches at shoulder level */
  totalPanelWidthStitches: number;
  /** Desired finished shoulder width in cm per side */
  finishedShoulderWidthCm: number;
  /** Gauge information for conversions */
  gauge: CalculationGaugeData;
  /** Component key for identification */
  componentKey: string;
}

/**
 * Neckline shaping action
 */
export interface NecklineShapingAction {
  /** Type of action */
  action: 'bind_off' | 'decrease';
  /** Number of stitches affected */
  stitches: number;
  /** Row offset from start of neckline shaping */
  on_row_from_start_of_shaping: number;
  /** Side of fabric (Right Side / Wrong Side) */
  side_of_fabric: 'RS' | 'WS';
  /** Number of repeats for this action (optional) */
  repeats?: number;
  /** Frequency for repeated actions (every X rows) */
  every_x_rows?: number;
}

/**
 * Shaping instructions for one side of the neckline
 */
export interface NecklineSideShaping {
  /** Shaping actions for this side */
  actions: NecklineShapingAction[];
}

/**
 * Complete neckline shaping schedule (output format from US_11.1)
 */
export interface NecklineShapingSchedule {
  /** Type of neckline shaping */
  type: 'rounded' | 'v_neck';
  /** Number of stitches to bind off at center (if applicable) */
  center_bind_off_stitches?: number;
  /** Shaping for left and right sides */
  sides: {
    /** Left side shaping */
    left: NecklineShapingAction[];
    /** Right side shaping */
    right: NecklineShapingAction[];
  };
  /** Total number of rows for the complete shaping */
  total_rows_for_shaping: number;
  /** Final number of stitches remaining for each shoulder */
  final_shoulder_stitches_each_side: number;
}

/**
 * Result of neckline shaping calculation
 */
export interface NecklineShapingResult {
  /** Success status */
  success: boolean;
  /** Calculated shaping schedule */
  schedule?: NecklineShapingSchedule;
  /** Error message if calculation failed */
  error?: string;
  /** Warning messages */
  warnings?: string[];
  /** Metadata about the calculation */
  metadata?: {
    /** Algorithm used */
    algorithm: string;
    /** Calculation timestamp */
    calculatedAt: string;
    /** Input parameters summary */
    inputSummary?: Record<string, any>;
  };
}

/**
 * Intermediate calculation data for rounded necklines
 */
export interface RoundedNecklineCalculation {
  /** Total stitches to be shaped (decreased + bound off) */
  totalNecklineStitches: number;
  /** Stitches to bind off at center */
  centerBindOffStitches: number;
  /** Stitches to decrease on each side */
  decreaseStitchesEachSide: number;
  /** Rows available for shaping */
  shapingRows: number;
  /** Distribution of decreases */
  decreaseDistribution: {
    /** Rapid decreases (larger amounts) */
    rapid: { stitches: number; frequency: number; count: number };
    /** Gradual decreases (smaller amounts) */
    gradual: { stitches: number; frequency: number; count: number };
  };
}

/**
 * Intermediate calculation data for V-neck necklines
 */
export interface VNeckCalculation {
  /** Total stitches to decrease on each side */
  decreaseStitchesEachSide: number;
  /** Rows available for shaping */
  shapingRows: number;
  /** Center bind off stitches (if any, usually small for V-neck) */
  centerBindOffStitches: number;
  /** Frequency of decreases */
  decreaseFrequency: number;
  /** Number of decrease events per side */
  decreaseEventsPerSide: number;
}

/**
 * Validation result for neckline shaping input
 */
export interface NecklineShapingValidationResult {
  /** Whether the input is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Distribution ratios for rounded neckline shaping
 * Based on traditional pattern-making ratios
 */
export interface RoundedNecklineRatios {
  /** Proportion of neckline width to bind off at center (typically 1/3) */
  centerBindOffRatio: number;
  /** Proportion for rapid decreases (typically 1/3) */
  rapidDecreaseRatio: number;
  /** Proportion for gradual decreases (typically 1/3) */
  gradualDecreaseRatio: number;
  /** Rows between rapid decreases */
  rapidDecreaseRowInterval: number;
  /** Rows between gradual decreases */
  gradualDecreaseRowInterval: number;
} 