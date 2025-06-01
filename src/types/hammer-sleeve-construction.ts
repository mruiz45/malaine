/**
 * Types for Hammer Sleeve Construction (US_12.3)
 * Defines interfaces for hammer sleeve calculations where the sleeve cap extends horizontally to form part of the shoulder
 */

import { CalculationGaugeData } from './pattern-calculation';

/**
 * Input data for hammer sleeve calculations
 */
export interface HammerSleeveInput {
  /** Total desired shoulder width from shoulder point to shoulder point in cm */
  totalShoulderWidth_cm: number;
  /** Upper arm width (for the sleeve) in cm */
  upperArmWidth_cm: number;
  /** Armhole depth in cm */
  armholeDepth_cm: number;
  /** Neckline width in cm (to determine where shoulder extension begins) */
  necklineWidth_cm: number;
  /** Gauge information for conversions */
  gauge: CalculationGaugeData;
  /** Component key for identification */
  componentKey: string;
}

/**
 * Sleeve cap extension calculations (horizontal part forming shoulder)
 */
export interface SleeveCapExtension {
  /** Width of shoulder extension in stitches: (totalShoulderWidth - necklineWidth) / 2 */
  width_stitches: number;
  /** Length/height to join neckline in rows */
  length_rows: number;
  /** Shaping details to join neckline (if shaped, empty array if rectangular) */
  shaping_to_neck_details: ShapingDetail[];
}

/**
 * Sleeve cap vertical part calculations (part that rises along the arm)
 */
export interface SleeveCapVerticalPart {
  /** Width corresponding to upper arm in stitches */
  width_stitches: number;
  /** Height corresponding to armhole depth in rows */
  height_rows: number;
  /** Shaping details from arm if cap is not completely straight */
  shaping_from_arm_details: ShapingDetail[];
}

/**
 * Complete hammer sleeve shaping calculations
 */
export interface HammerSleeveShaping {
  /** Horizontal extension part forming shoulder */
  sleeve_cap_extension: SleeveCapExtension;
  /** Vertical part rising along the arm */
  sleeve_cap_vertical_part: SleeveCapVerticalPart;
}

/**
 * Body panel armhole shaping for hammer sleeve construction
 */
export interface BodyPanelHammerArmholeShaping {
  /** Width of shoulder strap next to neckline in stitches */
  shoulder_strap_width_stitches: number;
  /** Width of cutout for sleeve in stitches */
  armhole_cutout_width_stitches: number;
  /** Depth of armhole cutout in rows */
  armhole_depth_rows: number;
  /** Stitches to bind off to create the cutout step */
  bind_off_for_cutout_stitches: number;
  /** Total body width at chest level in stitches (2*strap + 2*cutout) */
  body_width_at_chest_stitches: number;
}

/**
 * Complete hammer sleeve calculation results
 */
export interface HammerSleeveCalculations {
  /** Sleeve shaping calculations */
  hammer_sleeve_shaping: HammerSleeveShaping;
  /** Body panel shaping for front and back */
  body_panel_hammer_armhole_shaping: BodyPanelHammerArmholeShaping;
  /** Additional calculation metadata */
  calculation_metadata?: {
    /** Actual shoulder width achieved in cm */
    actual_shoulder_width_cm: number;
    /** Actual upper arm width achieved in cm */
    actual_upper_arm_width_cm: number;
    /** Actual armhole depth achieved in cm */
    actual_armhole_depth_cm: number;
    /** Warnings or notes about the calculation */
    warnings?: string[];
  };
}

/**
 * Result of hammer sleeve calculation
 */
export interface HammerSleeveResult {
  /** Success status */
  success: boolean;
  /** Calculated hammer sleeve data if successful */
  calculations?: HammerSleeveCalculations;
  /** Error message if calculation failed */
  error?: string;
  /** Validation errors */
  validationErrors?: string[];
  /** Warnings that don't prevent calculation but should be noted */
  warnings?: string[];
}

/**
 * Shaping detail for increases/decreases if needed
 */
export interface ShapingDetail {
  /** Type of shaping action */
  action: 'increase' | 'decrease' | 'bind_off';
  /** Number of stitches affected */
  stitches: number;
  /** Row number from start */
  on_row: number;
  /** Instructions for the shaping */
  instructions?: string;
}

/**
 * Validation result for hammer sleeve input
 */
export interface HammerSleeveValidationResult {
  /** Whether input is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Default values for hammer sleeve construction
 */
export const HAMMER_SLEEVE_DEFAULTS = {
  /** Minimum shoulder extension width in cm */
  MIN_SHOULDER_EXTENSION_CM: 5,
  /** Maximum reasonable shoulder extension width in cm */
  MAX_SHOULDER_EXTENSION_CM: 25,
  /** Minimum upper arm width in cm */
  MIN_UPPER_ARM_WIDTH_CM: 15,
  /** Maximum reasonable upper arm width in cm */
  MAX_UPPER_ARM_WIDTH_CM: 50,
  /** Minimum armhole depth in cm */
  MIN_ARMHOLE_DEPTH_CM: 15,
  /** Maximum reasonable armhole depth in cm */
  MAX_ARMHOLE_DEPTH_CM: 35,
  /** Default extension height in rows for joining neckline */
  DEFAULT_EXTENSION_HEIGHT_ROWS: 10
} as const;

/**
 * Helper type for construction method identification
 */
export type HammerSleeveConstructionMethod = 'hammer_sleeve'; 