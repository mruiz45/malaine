/**
 * Hammer Sleeve Helper Functions (US_12.3)
 * Utility functions for hammer sleeve calculations
 */

import { 
  HammerSleeveInput, 
  HammerSleeveValidationResult,
  HAMMER_SLEEVE_DEFAULTS 
} from '@/types/hammer-sleeve-construction';
import { CalculationGaugeData } from '@/types/pattern-calculation';

/**
 * Validate hammer sleeve input data
 * @param input - Hammer sleeve calculation input
 * @returns Validation result with errors and warnings
 */
export function validateHammerSleeveInput(input: HammerSleeveInput): HammerSleeveValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!input.totalShoulderWidth_cm || input.totalShoulderWidth_cm <= 0) {
    errors.push('Total shoulder width must be a positive number');
  }
  
  if (!input.upperArmWidth_cm || input.upperArmWidth_cm <= 0) {
    errors.push('Upper arm width must be a positive number');
  }
  
  if (!input.armholeDepth_cm || input.armholeDepth_cm <= 0) {
    errors.push('Armhole depth must be a positive number');
  }
  
  if (!input.necklineWidth_cm || input.necklineWidth_cm <= 0) {
    errors.push('Neckline width must be a positive number');
  }

  if (!input.gauge || !input.gauge.stitchesPer10cm || !input.gauge.rowsPer10cm) {
    errors.push('Valid gauge information is required');
  }

  // Validate logical relationships
  if (input.totalShoulderWidth_cm && input.necklineWidth_cm) {
    const shoulderExtensionWidth = (input.totalShoulderWidth_cm - input.necklineWidth_cm) / 2;
    
    if (shoulderExtensionWidth < HAMMER_SLEEVE_DEFAULTS.MIN_SHOULDER_EXTENSION_CM) {
      errors.push(`Shoulder extension width (${shoulderExtensionWidth.toFixed(1)}cm) is too small. Minimum: ${HAMMER_SLEEVE_DEFAULTS.MIN_SHOULDER_EXTENSION_CM}cm`);
    }
    
    if (shoulderExtensionWidth > HAMMER_SLEEVE_DEFAULTS.MAX_SHOULDER_EXTENSION_CM) {
      warnings.push(`Shoulder extension width (${shoulderExtensionWidth.toFixed(1)}cm) is quite large. Maximum recommended: ${HAMMER_SLEEVE_DEFAULTS.MAX_SHOULDER_EXTENSION_CM}cm`);
    }
    
    if (input.necklineWidth_cm >= input.totalShoulderWidth_cm) {
      errors.push('Neckline width must be smaller than total shoulder width');
    }
  }

  // Validate reasonable dimensions
  if (input.upperArmWidth_cm < HAMMER_SLEEVE_DEFAULTS.MIN_UPPER_ARM_WIDTH_CM) {
    warnings.push(`Upper arm width (${input.upperArmWidth_cm}cm) is quite small for an adult garment`);
  }
  
  if (input.upperArmWidth_cm > HAMMER_SLEEVE_DEFAULTS.MAX_UPPER_ARM_WIDTH_CM) {
    warnings.push(`Upper arm width (${input.upperArmWidth_cm}cm) is quite large`);
  }
  
  if (input.armholeDepth_cm < HAMMER_SLEEVE_DEFAULTS.MIN_ARMHOLE_DEPTH_CM) {
    warnings.push(`Armhole depth (${input.armholeDepth_cm}cm) is quite shallow`);
  }
  
  if (input.armholeDepth_cm > HAMMER_SLEEVE_DEFAULTS.MAX_ARMHOLE_DEPTH_CM) {
    warnings.push(`Armhole depth (${input.armholeDepth_cm}cm) is quite deep`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate shoulder extension width in cm
 * @param totalShoulderWidth_cm - Total shoulder width
 * @param necklineWidth_cm - Neckline width
 * @returns Shoulder extension width per side
 */
export function calculateShoulderExtensionWidth(
  totalShoulderWidth_cm: number, 
  necklineWidth_cm: number
): number {
  return (totalShoulderWidth_cm - necklineWidth_cm) / 2;
}

/**
 * Calculate shoulder extension width in stitches
 * @param extensionWidth_cm - Extension width in cm
 * @param gauge - Gauge information
 * @returns Extension width in stitches
 */
export function calculateShoulderExtensionStitches(
  extensionWidth_cm: number, 
  gauge: CalculationGaugeData
): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return Math.round(extensionWidth_cm * stitchesPerCm);
}

/**
 * Calculate vertical part width in stitches (upper arm)
 * @param upperArmWidth_cm - Upper arm width in cm
 * @param gauge - Gauge information
 * @returns Vertical part width in stitches
 */
export function calculateVerticalPartStitches(
  upperArmWidth_cm: number, 
  gauge: CalculationGaugeData
): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return Math.round(upperArmWidth_cm * stitchesPerCm);
}

/**
 * Calculate armhole depth in rows
 * @param armholeDepth_cm - Armhole depth in cm
 * @param gauge - Gauge information
 * @returns Armhole depth in rows
 */
export function calculateArmholeDepthRows(
  armholeDepth_cm: number, 
  gauge: CalculationGaugeData
): number {
  const rowsPerCm = gauge.rowsPer10cm / 10;
  return Math.round(armholeDepth_cm * rowsPerCm);
}

/**
 * Calculate shoulder strap width for body panel
 * @param necklineWidth_cm - Neckline width in cm
 * @param gauge - Gauge information
 * @returns Shoulder strap width in stitches per side
 */
export function calculateShoulderStrapStitches(
  necklineWidth_cm: number, 
  gauge: CalculationGaugeData
): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return Math.round((necklineWidth_cm / 2) * stitchesPerCm);
}

/**
 * Calculate body panel width at chest level
 * @param shoulderStrapStitches - Shoulder strap width per side
 * @param armholeCutoutStitches - Armhole cutout width per side
 * @returns Total body width in stitches
 */
export function calculateBodyWidthAtChest(
  shoulderStrapStitches: number, 
  armholeCutoutStitches: number
): number {
  return (shoulderStrapStitches * 2) + (armholeCutoutStitches * 2);
}

/**
 * Convert centimeters to stitches using gauge
 * @param cm - Measurement in centimeters
 * @param gauge - Gauge information
 * @returns Measurement in stitches (rounded)
 */
export function convertCmToStitches(cm: number, gauge: CalculationGaugeData): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return Math.round(cm * stitchesPerCm);
}

/**
 * Convert centimeters to rows using gauge
 * @param cm - Measurement in centimeters
 * @param gauge - Gauge information
 * @returns Measurement in rows (rounded)
 */
export function convertCmToRows(cm: number, gauge: CalculationGaugeData): number {
  const rowsPerCm = gauge.rowsPer10cm / 10;
  return Math.round(cm * rowsPerCm);
}

/**
 * Convert stitches to centimeters using gauge
 * @param stitches - Number of stitches
 * @param gauge - Gauge information
 * @returns Measurement in centimeters
 */
export function convertStitchesToCm(stitches: number, gauge: CalculationGaugeData): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return stitches / stitchesPerCm;
}

/**
 * Convert rows to centimeters using gauge
 * @param rows - Number of rows
 * @param gauge - Gauge information
 * @returns Measurement in centimeters
 */
export function convertRowsToCm(rows: number, gauge: CalculationGaugeData): number {
  const rowsPerCm = gauge.rowsPer10cm / 10;
  return rows / rowsPerCm;
}

/**
 * Extract hammer sleeve input from component data
 * Helper function to transform component data into hammer sleeve calculation input
 * 
 * @param componentData - Component data from pattern calculation input
 * @param gauge - Gauge information
 * @returns Hammer sleeve calculation input or null if not applicable
 */
export function extractHammerSleeveInputFromComponent(
  componentData: any,
  gauge: CalculationGaugeData
): HammerSleeveInput | null {
  try {
    // Check if this is a hammer sleeve component
    const constructionMethod = componentData.attributes?.construction_method;
    if (constructionMethod !== 'hammer_sleeve') {
      return null;
    }

    // Extract required attributes
    const attributes = componentData.attributes || {};
    
    // Extract dimensions
    const totalShoulderWidth_cm = attributes.total_shoulder_width_cm;
    const upperArmWidth_cm = attributes.upper_arm_width_cm;
    const armholeDepth_cm = attributes.armhole_depth_cm;
    const necklineWidth_cm = attributes.neckline_width_cm;

    // Validate required dimensions are present
    if (!totalShoulderWidth_cm || !upperArmWidth_cm || !armholeDepth_cm || !necklineWidth_cm) {
      console.warn('Missing required hammer sleeve dimensions:', {
        totalShoulderWidth_cm,
        upperArmWidth_cm,
        armholeDepth_cm,
        necklineWidth_cm
      });
      return null;
    }

    const hammerSleeveInput: HammerSleeveInput = {
      totalShoulderWidth_cm,
      upperArmWidth_cm,
      armholeDepth_cm,
      necklineWidth_cm,
      gauge,
      componentKey: componentData.componentKey || 'hammer_sleeve'
    };

    return hammerSleeveInput;

  } catch (error) {
    console.error('Error extracting hammer sleeve input from component:', error);
    return null;
  }
} 