/**
 * Neckline Shaping Calculator (US_11.1)
 * Implements complex neckline shaping calculations for rounded and V-neck styles
 */

import {
  NecklineShapingInput,
  NecklineShapingResult,
  NecklineShapingSchedule,
  NecklineShapingAction,
  RoundedNecklineCalculation,
  VNeckCalculation,
  RoundedNecklineRatios,
  NecklineShapingValidationResult
} from '@/types/neckline-shaping';

/**
 * Default ratios for rounded neckline shaping based on traditional pattern-making
 */
const DEFAULT_ROUNDED_NECKLINE_RATIOS: RoundedNecklineRatios = {
  centerBindOffRatio: 1/3,
  rapidDecreaseRatio: 1/3,
  gradualDecreaseRatio: 1/3,
  rapidDecreaseRowInterval: 2, // Every other row for rapid decreases
  gradualDecreaseRowInterval: 4 // Every 4th row for gradual decreases
};

/**
 * Main function to calculate neckline shaping schedule
 * Implements the core algorithm described in US_11.1
 */
export function calculateNecklineShaping(input: NecklineShapingInput): NecklineShapingResult {
  try {
    // Validate input
    const validation = validateNecklineShapingInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid input: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      };
    }

    const { necklineType } = input;

    // Route to appropriate calculation based on neckline type
    let schedule: NecklineShapingSchedule;
    let algorithm: string;

    switch (necklineType) {
      case 'round':
      case 'scoop':
        const roundedResult = calculateRoundedNecklineShaping(input);
        schedule = roundedResult.schedule;
        algorithm = 'rounded-neckline';
        break;

      case 'v_neck':
        const vNeckResult = calculateVNeckShaping(input);
        schedule = vNeckResult.schedule;
        algorithm = 'v-neck-linear';
        break;

      default:
        return {
          success: false,
          error: `Unsupported neckline type for complex shaping: ${necklineType}`
        };
    }

    return {
      success: true,
      schedule,
      warnings: validation.warnings,
      metadata: {
        algorithm,
        calculatedAt: new Date().toISOString(),
        inputSummary: {
          necklineType: input.necklineType,
          panelWidth: input.totalPanelWidthStitches,
          shoulderWidth: input.finishedShoulderWidthCm,
          necklineDepth: input.necklineParameters.depth_cm
        }
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Calculate shaping for rounded necklines (round, scoop)
 * Implements the 1/3 distribution algorithm specified in US_11.1
 */
function calculateRoundedNecklineShaping(input: NecklineShapingInput): { schedule: NecklineShapingSchedule } {
  const {
    necklineParameters,
    totalPanelWidthStitches,
    finishedShoulderWidthCm,
    gauge,
    componentKey
  } = input;

  // Convert dimensions to stitches and rows
  const dimensions = convertDimensionsToStitchesAndRows(input);
  
  // Calculate intermediate values
  const calculation: RoundedNecklineCalculation = {
    totalNecklineStitches: dimensions.necklineWidthStitches,
    centerBindOffStitches: Math.round(dimensions.necklineWidthStitches * DEFAULT_ROUNDED_NECKLINE_RATIOS.centerBindOffRatio),
    decreaseStitchesEachSide: 0, // Will be calculated
    shapingRows: dimensions.necklineDepthRows,
    decreaseDistribution: {
      rapid: { stitches: 0, frequency: 0, count: 0 },
      gradual: { stitches: 0, frequency: 0, count: 0 }
    }
  };

  // Calculate remaining stitches to decrease on each side
  const remainingNecklineStitches = calculation.totalNecklineStitches - calculation.centerBindOffStitches;
  calculation.decreaseStitchesEachSide = Math.floor(remainingNecklineStitches / 2);

  // Distribute decreases using traditional ratios
  const rapidDecreaseStitches = Math.round(calculation.decreaseStitchesEachSide * DEFAULT_ROUNDED_NECKLINE_RATIOS.rapidDecreaseRatio);
  const gradualDecreaseStitches = calculation.decreaseStitchesEachSide - rapidDecreaseStitches;

  // Configure decrease distribution
  calculation.decreaseDistribution.rapid = {
    stitches: 2, // Decrease 2 stitches at a time for rapid shaping
    frequency: DEFAULT_ROUNDED_NECKLINE_RATIOS.rapidDecreaseRowInterval,
    count: Math.ceil(rapidDecreaseStitches / 2)
  };

  calculation.decreaseDistribution.gradual = {
    stitches: 1, // Decrease 1 stitch at a time for gradual shaping
    frequency: DEFAULT_ROUNDED_NECKLINE_RATIOS.gradualDecreaseRowInterval,
    count: gradualDecreaseStitches
  };

  // Generate shaping actions for both sides
  const leftSideActions = generateRoundedNecklineActions(calculation, 'left');
  const rightSideActions = generateRoundedNecklineActions(calculation, 'right');

  // Calculate final shoulder stitches
  const finalShoulderStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  const schedule: NecklineShapingSchedule = {
    type: 'rounded',
    center_bind_off_stitches: calculation.centerBindOffStitches,
    sides: {
      left: leftSideActions,
      right: rightSideActions
    },
    total_rows_for_shaping: calculation.shapingRows,
    final_shoulder_stitches_each_side: finalShoulderStitches
  };

  return { schedule };
}

/**
 * Calculate shaping for V-neck necklines
 * Implements linear decrease algorithm specified in US_11.1
 */
function calculateVNeckShaping(input: NecklineShapingInput): { schedule: NecklineShapingSchedule } {
  const {
    necklineParameters,
    totalPanelWidthStitches,
    finishedShoulderWidthCm,
    gauge
  } = input;

  // Convert dimensions to stitches and rows
  const dimensions = convertDimensionsToStitchesAndRows(input);
  
  // For V-neck, typically start with small center bind-off or none
  const centerBindOffStitches = Math.min(4, Math.round(dimensions.necklineWidthStitches * 0.1));
  
  // Calculate remaining stitches to decrease on each side
  const remainingNecklineStitches = dimensions.necklineWidthStitches - centerBindOffStitches;
  const decreaseStitchesEachSide = Math.floor(remainingNecklineStitches / 2);

  // Calculate decrease frequency for V-neck (linear distribution)
  const decreaseFrequency = Math.max(2, Math.floor(dimensions.necklineDepthRows / (decreaseStitchesEachSide / 2)));
  const decreaseEventsPerSide = Math.ceil(decreaseStitchesEachSide / 2); // Assuming 2 stitches per decrease event

  const calculation: VNeckCalculation = {
    decreaseStitchesEachSide,
    shapingRows: dimensions.necklineDepthRows,
    centerBindOffStitches,
    decreaseFrequency,
    decreaseEventsPerSide
  };

  // Generate shaping actions for both sides
  const leftSideActions = generateVNeckActions(calculation, 'left');
  const rightSideActions = generateVNeckActions(calculation, 'right');

  // Calculate final shoulder stitches
  const finalShoulderStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  const schedule: NecklineShapingSchedule = {
    type: 'v_neck',
    center_bind_off_stitches: calculation.centerBindOffStitches,
    sides: {
      left: leftSideActions,
      right: rightSideActions
    },
    total_rows_for_shaping: calculation.shapingRows,
    final_shoulder_stitches_each_side: finalShoulderStitches
  };

  return { schedule };
}

/**
 * Convert neckline dimensions from cm to stitches and rows using gauge
 */
function convertDimensionsToStitchesAndRows(input: NecklineShapingInput) {
  const { necklineParameters, gauge, totalPanelWidthStitches, finishedShoulderWidthCm } = input;

  // Get neckline dimensions with defaults
  const necklineDepthCm = necklineParameters.depth_cm || 8;
  const necklineWidthCm = necklineParameters.width_at_center_cm || 
                         necklineParameters.width_at_shoulder_cm || 
                         20; // Default width

  // Convert to stitches and rows
  const necklineWidthStitches = Math.round(necklineWidthCm * (gauge.stitchesPer10cm / 10));
  const necklineDepthRows = Math.round(necklineDepthCm * (gauge.rowsPer10cm / 10));
  const shoulderWidthStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  return {
    necklineWidthStitches,
    necklineDepthRows,
    shoulderWidthStitches
  };
}

/**
 * Generate shaping actions for rounded necklines
 */
function generateRoundedNecklineActions(
  calculation: RoundedNecklineCalculation, 
  side: 'left' | 'right'
): NecklineShapingAction[] {
  const actions: NecklineShapingAction[] = [];
  let currentRow = 1;

  // Add rapid decreases first
  if (calculation.decreaseDistribution.rapid.count > 0) {
    const rapidAction: NecklineShapingAction = {
      action: 'decrease',
      stitches: calculation.decreaseDistribution.rapid.stitches,
      on_row_from_start_of_shaping: currentRow,
      side_of_fabric: 'RS',
      repeats: calculation.decreaseDistribution.rapid.count,
      every_x_rows: calculation.decreaseDistribution.rapid.frequency
    };
    actions.push(rapidAction);
    
    // Update current row position
    currentRow += (calculation.decreaseDistribution.rapid.count - 1) * calculation.decreaseDistribution.rapid.frequency + 1;
  }

  // Add gradual decreases
  if (calculation.decreaseDistribution.gradual.count > 0) {
    const gradualAction: NecklineShapingAction = {
      action: 'decrease',
      stitches: calculation.decreaseDistribution.gradual.stitches,
      on_row_from_start_of_shaping: currentRow,
      side_of_fabric: 'RS',
      repeats: calculation.decreaseDistribution.gradual.count,
      every_x_rows: calculation.decreaseDistribution.gradual.frequency
    };
    actions.push(gradualAction);
  }

  return actions;
}

/**
 * Generate shaping actions for V-neck necklines
 */
function generateVNeckActions(
  calculation: VNeckCalculation, 
  side: 'left' | 'right'
): NecklineShapingAction[] {
  const actions: NecklineShapingAction[] = [];

  if (calculation.decreaseEventsPerSide > 0) {
    const vNeckAction: NecklineShapingAction = {
      action: 'decrease',
      stitches: 2, // Standard V-neck decrease (1 stitch each side of the V)
      on_row_from_start_of_shaping: 1,
      side_of_fabric: 'RS',
      repeats: calculation.decreaseEventsPerSide,
      every_x_rows: calculation.decreaseFrequency
    };
    actions.push(vNeckAction);
  }

  return actions;
}

/**
 * Validate neckline shaping input parameters
 */
function validateNecklineShapingInput(input: NecklineShapingInput): NecklineShapingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate neckline type
  if (!input.necklineType) {
    errors.push('Neckline type is required');
  }

  // Validate neckline parameters
  if (!input.necklineParameters) {
    errors.push('Neckline parameters are required');
  } else {
    if (!input.necklineParameters.depth_cm || input.necklineParameters.depth_cm <= 0) {
      errors.push('Neckline depth must be greater than 0');
    }

    if (input.necklineParameters.depth_cm && input.necklineParameters.depth_cm > 30) {
      warnings.push('Very deep neckline - please verify measurements');
    }
  }

  // Validate panel width
  if (!input.totalPanelWidthStitches || input.totalPanelWidthStitches <= 0) {
    errors.push('Total panel width in stitches must be greater than 0');
  }

  // Validate shoulder width
  if (!input.finishedShoulderWidthCm || input.finishedShoulderWidthCm <= 0) {
    errors.push('Finished shoulder width must be greater than 0');
  }

  // Validate gauge
  if (!input.gauge) {
    errors.push('Gauge information is required');
  } else {
    if (input.gauge.stitchesPer10cm <= 0 || input.gauge.rowsPer10cm <= 0) {
      errors.push('Gauge values must be greater than 0');
    }
  }

  // Logical validations
  if (input.totalPanelWidthStitches && input.finishedShoulderWidthCm && input.gauge) {
    const shoulderWidthStitches = Math.round(input.finishedShoulderWidthCm * (input.gauge.stitchesPer10cm / 10));
    if (shoulderWidthStitches * 2 >= input.totalPanelWidthStitches) {
      warnings.push('Shoulder width seems very large relative to panel width - please verify measurements');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 