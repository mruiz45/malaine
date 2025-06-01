/**
 * Neckline Shaping Helper Utilities (US_11.1)
 * Support functions for neckline shaping calculations
 */

import {
  NecklineShapingInput,
  NecklineShapingSchedule,
  NecklineShapingAction,
  RoundedNecklineRatios
} from '@/types/neckline-shaping';
import { NecklineStyle, NecklineParameters } from '@/types/neckline';
import { CalculationGaugeData } from '@/types/pattern-calculation';

/**
 * Extract neckline attributes from component definition
 * Used to build NecklineShapingInput from existing pattern data
 */
export function extractNecklineShapingInput(
  componentData: any,
  gauge: CalculationGaugeData,
  componentKey: string
): NecklineShapingInput | null {
  try {
    // Check if component has neckline attributes
    const necklineAttributes = componentData.attributes?.neckline;
    if (!necklineAttributes) {
      return null; // No neckline configuration
    }

    // Extract required parameters
    const necklineType: NecklineStyle = necklineAttributes.style;
    const necklineParameters: NecklineParameters = necklineAttributes.parameters || {};
    
    // Get panel width and shoulder measurements
    const totalPanelWidthStitches = componentData.stitchCount || 
                                  componentData.detailedCalculations?.castOnStitches ||
                                  0;
    
    const finishedShoulderWidthCm = componentData.attributes?.shoulderWidth || 
                                   extractShoulderWidthFromMeasurements(componentData) ||
                                   10; // Default shoulder width

    // Validate essential parameters
    if (!necklineType || !totalPanelWidthStitches || totalPanelWidthStitches <= 0) {
      return null;
    }

    return {
      necklineType,
      necklineParameters,
      totalPanelWidthStitches,
      finishedShoulderWidthCm,
      gauge,
      componentKey
    };

  } catch (error) {
    console.warn('Error extracting neckline shaping input:', error);
    return null;
  }
}

/**
 * Extract shoulder width from various possible measurement sources
 */
function extractShoulderWidthFromMeasurements(componentData: any): number | null {
  // Try different measurement sources
  const measurements = componentData.measurements || 
                      componentData.attributes?.measurements ||
                      componentData.targetMeasurements;

  if (!measurements) {
    return null;
  }

  // Look for shoulder width in various formats
  return measurements.shoulderWidth ||
         measurements.finishedShoulderWidth ||
         measurements.shoulder_width_cm ||
         measurements.finishedShoulderWidthCm ||
         null;
}

/**
 * Check if a component requires neckline shaping
 * Based on component type and attributes
 */
export function componentRequiresNecklineShaping(componentData: any): boolean {
  // Check component key/type
  const componentKey = componentData.componentKey || componentData.key || '';
  const componentType = componentData.type || '';
  
  // Body panels that might have necklines
  const bodyPanelKeys = [
    'front_panel', 'back_panel', 'body_front', 'body_back',
    'front', 'back', 'body_panel'
  ];
  
  const hasBodyPanelKey = bodyPanelKeys.some(key => 
    componentKey.toLowerCase().includes(key) || 
    componentType.toLowerCase().includes(key)
  );

  // Check if neckline attributes are present
  const hasNecklineAttributes = componentData.attributes?.neckline &&
                               componentData.attributes.neckline.style;

  return hasBodyPanelKey && hasNecklineAttributes;
}

/**
 * Calculate the starting row for neckline shaping within a component
 * Based on component length and neckline depth
 */
export function calculateNecklineShapingStartRow(
  totalComponentRows: number,
  necklineDepthRows: number,
  necklineParameters: NecklineParameters
): number {
  // For most garments, neckline shaping starts near the top
  // Leave some rows at the very top for shoulder construction if needed
  const shoulderRows = 2; // Minimal rows for shoulder finishing
  
  // Calculate start row (counting from bottom of component)
  const startRow = Math.max(1, totalComponentRows - necklineDepthRows - shoulderRows);
  
  return startRow;
}

/**
 * Adjust neckline ratios based on neckline style and depth
 * Provides style-specific ratio adjustments
 */
export function getAdjustedNecklineRatios(
  necklineType: NecklineStyle,
  necklineDepthCm: number
): RoundedNecklineRatios {
  // Base ratios
  const baseRatios: RoundedNecklineRatios = {
    centerBindOffRatio: 1/3,
    rapidDecreaseRatio: 1/3,
    gradualDecreaseRatio: 1/3,
    rapidDecreaseRowInterval: 2,
    gradualDecreaseRowInterval: 4
  };

  // Adjust ratios based on neckline style
  switch (necklineType) {
    case 'round':
      // Standard round neckline - use base ratios
      break;
      
    case 'scoop':
      // Scoop neckline - wider center bind-off, less gradual shaping
      baseRatios.centerBindOffRatio = 0.4;
      baseRatios.rapidDecreaseRatio = 0.4;
      baseRatios.gradualDecreaseRatio = 0.2;
      break;
      
    default:
      // Use base ratios for other types
      break;
  }

  // Adjust based on depth
  if (necklineDepthCm < 6) {
    // Shallow neckline - more aggressive shaping
    baseRatios.rapidDecreaseRowInterval = 1; // Every row
    baseRatios.gradualDecreaseRowInterval = 2;
  } else if (necklineDepthCm > 12) {
    // Deep neckline - more gradual shaping
    baseRatios.rapidDecreaseRowInterval = 3;
    baseRatios.gradualDecreaseRowInterval = 6;
  }

  return baseRatios;
}

/**
 * Validate that a neckline shaping schedule is reasonable
 * Performs sanity checks on the calculated schedule
 */
export function validateNecklineShapingSchedule(
  schedule: NecklineShapingSchedule,
  input: NecklineShapingInput
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check center bind-off reasonableness
  if (schedule.center_bind_off_stitches) {
    const centerRatio = schedule.center_bind_off_stitches / input.totalPanelWidthStitches;
    if (centerRatio > 0.5) {
      errors.push('Center bind-off is more than 50% of panel width');
    } else if (centerRatio < 0.1) {
      warnings.push('Center bind-off seems very small');
    }
  }

  // Check that we have shaping actions
  const leftActions = schedule.sides.left || [];
  const rightActions = schedule.sides.right || [];
  
  if (leftActions.length === 0 && rightActions.length === 0) {
    warnings.push('No shaping actions generated');
  }

  // Check row count reasonableness
  if (schedule.total_rows_for_shaping <= 0) {
    errors.push('Invalid total rows for shaping');
  }

  // Check shoulder stitches
  if (schedule.final_shoulder_stitches_each_side <= 0) {
    errors.push('Invalid final shoulder stitch count');
  }

  const totalShoulderStitches = schedule.final_shoulder_stitches_each_side * 2;
  if (totalShoulderStitches >= input.totalPanelWidthStitches) {
    warnings.push('Shoulder width seems very large relative to panel width');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate total stitches affected by a shaping action
 * Accounts for repeats and multiple stitches per action
 */
export function calculateTotalStitchesInAction(action: NecklineShapingAction): number {
  const stitchesPerEvent = action.stitches;
  const repeats = action.repeats || 1;
  
  return stitchesPerEvent * repeats;
}

/**
 * Calculate total rows spanned by a shaping action
 * Accounts for frequency and repeats
 */
export function calculateTotalRowsInAction(action: NecklineShapingAction): number {
  const repeats = action.repeats || 1;
  const frequency = action.every_x_rows || 1;
  
  if (repeats <= 1) {
    return 1; // Single action
  }
  
  // For multiple repeats: (repeats - 1) * frequency + 1
  return (repeats - 1) * frequency + 1;
}

/**
 * Generate a summary of neckline shaping for display
 * Creates human-readable summary of the shaping schedule
 */
export function generateNecklineShapingSummary(schedule: NecklineShapingSchedule): string {
  const parts: string[] = [];

  // Add center bind-off info
  if (schedule.center_bind_off_stitches && schedule.center_bind_off_stitches > 0) {
    parts.push(`Bind off ${schedule.center_bind_off_stitches} stitches at center`);
  }

  // Add shaping info for each side
  const leftActions = schedule.sides.left || [];
  if (leftActions.length > 0) {
    const leftSummary = leftActions.map(action => {
      if (action.repeats && action.repeats > 1) {
        return `${action.action} ${action.stitches} sts every ${action.every_x_rows} rows, ${action.repeats} times`;
      } else {
        return `${action.action} ${action.stitches} sts`;
      }
    }).join(', then ');
    
    parts.push(`Each side: ${leftSummary}`);
  }

  // Add final info
  parts.push(`Final: ${schedule.final_shoulder_stitches_each_side} sts each shoulder`);
  parts.push(`Total shaping rows: ${schedule.total_rows_for_shaping}`);

  return parts.join('. ');
}

/**
 * Convert neckline shaping schedule to simplified format for instruction generation
 * Prepares data for integration with existing instruction generators
 */
export function convertToInstructionFormat(schedule: NecklineShapingSchedule) {
  return {
    shapingType: 'neckline',
    necklineType: schedule.type,
    centerBindOff: schedule.center_bind_off_stitches,
    leftSideActions: schedule.sides.left,
    rightSideActions: schedule.sides.right,
    totalRows: schedule.total_rows_for_shaping,
    finalShoulderStitches: schedule.final_shoulder_stitches_each_side
  };
} 