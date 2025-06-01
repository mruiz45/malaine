/**
 * Armhole Shaping Calculator (US_11.3)
 * Implements complex armhole shaping calculations for rounded set-in and raglan styles
 */

import {
  ArmholeShapingInput,
  ArmholeShapingResult,
  ArmholeShapingSchedule,
  ArmholeShapingAction,
  RoundedArmholeCalculation,
  RaglanArmholeCalculation,
  RoundedArmholeRatios,
  ArmholeShapingValidationResult
} from '@/types/armhole-shaping';

/**
 * Default ratios for rounded armhole shaping based on traditional pattern-making
 */
const DEFAULT_ROUNDED_ARMHOLE_RATIOS: RoundedArmholeRatios = {
  baseBindOffRatio: 1/4,        // 25% of armhole width bound off at base
  rapidDecreaseRatio: 1/2,      // 50% of remaining decreases rapid
  gradualDecreaseRatio: 1/2,    // 50% of remaining decreases gradual
  rapidDecreaseRowInterval: 2,   // Every other row for rapid decreases
  gradualDecreaseRowInterval: 4  // Every 4th row for gradual decreases
};

/**
 * Main function to calculate armhole shaping schedule
 * Implements the core algorithm described in US_11.3
 */
export function calculateArmholeShaping(input: ArmholeShapingInput): ArmholeShapingResult {
  try {
    // Validate input
    const validation = validateArmholeShapingInput(input);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid input: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      };
    }

    const { armholeType } = input;

    // Route to appropriate calculation based on armhole type
    let schedule: ArmholeShapingSchedule;
    let algorithm: string;

    switch (armholeType) {
      case 'rounded_set_in':
        const roundedResult = calculateRoundedArmholeShaping(input);
        schedule = roundedResult.schedule;
        algorithm = 'rounded-armhole';
        break;

      case 'raglan':
        const raglanResult = calculateRaglanArmholeShaping(input);
        schedule = raglanResult.schedule;
        algorithm = 'raglan-linear';
        break;

      default:
        return {
          success: false,
          error: `Unsupported armhole type for complex shaping: ${armholeType}`
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
          armholeType: input.armholeType,
          panelWidth: input.totalPanelWidthStitches,
          shoulderWidth: input.finishedShoulderWidthCm,
          armholeDepth: input.armholeParameters.depth_cm
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
 * Calculate shaping for rounded armholes (set-in sleeves)
 * Implements traditional armhole shaping with base bind-off and progressive decreases
 */
function calculateRoundedArmholeShaping(input: ArmholeShapingInput): { schedule: ArmholeShapingSchedule } {
  const {
    armholeParameters,
    totalPanelWidthStitches,
    finishedShoulderWidthCm,
    gauge,
    componentKey
  } = input;

  // Convert dimensions to stitches and rows
  const dimensions = convertDimensionsToStitchesAndRows(input);
  
  // Calculate intermediate values
  const calculation: RoundedArmholeCalculation = {
    totalArmholeStitches: dimensions.armholeWidthStitches,
    baseBindOffStitches: Math.round(dimensions.armholeWidthStitches * DEFAULT_ROUNDED_ARMHOLE_RATIOS.baseBindOffRatio),
    decreaseStitchesEachSide: 0, // Will be calculated
    shapingRows: dimensions.armholeDepthRows,
    decreaseDistribution: {
      rapid: { stitches: 0, frequency: 0, count: 0 },
      gradual: { stitches: 0, frequency: 0, count: 0 }
    }
  };

  // Calculate remaining stitches to decrease after base bind-off
  const remainingArmholeStitches = calculation.totalArmholeStitches - calculation.baseBindOffStitches;
  calculation.decreaseStitchesEachSide = Math.floor(remainingArmholeStitches / 2);

  // Distribute decreases using traditional ratios
  const rapidDecreaseStitches = Math.round(calculation.decreaseStitchesEachSide * DEFAULT_ROUNDED_ARMHOLE_RATIOS.rapidDecreaseRatio);
  const gradualDecreaseStitches = calculation.decreaseStitchesEachSide - rapidDecreaseStitches;

  // Configure decrease distribution
  calculation.decreaseDistribution.rapid = {
    stitches: 2, // Decrease 2 stitches at a time for rapid shaping
    frequency: DEFAULT_ROUNDED_ARMHOLE_RATIOS.rapidDecreaseRowInterval,
    count: Math.ceil(rapidDecreaseStitches / 2)
  };

  calculation.decreaseDistribution.gradual = {
    stitches: 1, // Decrease 1 stitch at a time for gradual shaping
    frequency: DEFAULT_ROUNDED_ARMHOLE_RATIOS.gradualDecreaseRowInterval,
    count: gradualDecreaseStitches
  };

  // Generate shaping actions
  const shapingActions = generateRoundedArmholeActions(calculation);

  // Calculate final shoulder stitches
  const finalShoulderStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  const schedule: ArmholeShapingSchedule = {
    type: 'rounded_set_in',
    base_bind_off_stitches: calculation.baseBindOffStitches,
    shaping_details: shapingActions,
    total_rows_for_shaping: calculation.shapingRows,
    final_stitches_at_shoulder_edge: finalShoulderStitches
  };

  return { schedule };
}

/**
 * Calculate shaping for raglan armholes
 * Implements linear decrease algorithm specified in US_11.3
 */
function calculateRaglanArmholeShaping(input: ArmholeShapingInput): { schedule: ArmholeShapingSchedule } {
  const {
    armholeParameters,
    totalPanelWidthStitches,
    finishedShoulderWidthCm,
    gauge
  } = input;

  // Convert dimensions to stitches and rows
  const dimensions = convertDimensionsToStitchesAndRows(input);
  
  // For raglan, small base bind-off for underarm ease (typically 3-6 stitches)
  const baseBindOffStitches = Math.min(6, Math.max(3, Math.round(dimensions.armholeWidthStitches * 0.1)));
  
  // Calculate remaining stitches to decrease along raglan line
  const remainingArmholeStitches = dimensions.armholeWidthStitches - baseBindOffStitches;
  const totalDecreaseStitches = remainingArmholeStitches;

  // Calculate raglan line length (use provided or default to armhole depth)
  const raglanLineLength = armholeParameters.raglan_line_length_cm || armholeParameters.depth_cm;
  const raglanRows = Math.round(raglanLineLength * (gauge.rowsPer10cm / 10));

  // Calculate decrease frequency for raglan (typically every 2 or 4 rows)
  const stitchesPerDecreaseEvent = 2; // Standard raglan decreases (1 stitch each side of raglan line)
  const decreaseEvents = Math.ceil(totalDecreaseStitches / stitchesPerDecreaseEvent);
  const decreaseFrequency = Math.min(4, Math.max(2, Math.floor(raglanRows / decreaseEvents)));

  const calculation: RaglanArmholeCalculation = {
    totalDecreaseStitches,
    shapingRows: raglanRows,
    baseBindOffStitches,
    decreaseFrequency,
    decreaseEvents,
    stitchesPerEvent: stitchesPerDecreaseEvent
  };

  // Generate shaping actions
  const shapingActions = generateRaglanArmholeActions(calculation);

  // Calculate final shoulder stitches
  const finalShoulderStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  const schedule: ArmholeShapingSchedule = {
    type: 'raglan',
    base_bind_off_stitches: calculation.baseBindOffStitches,
    shaping_details: shapingActions,
    total_rows_for_shaping: calculation.shapingRows,
    final_stitches_at_shoulder_edge: finalShoulderStitches
  };

  return { schedule };
}

/**
 * Convert armhole dimensions from cm to stitches and rows using gauge
 */
function convertDimensionsToStitchesAndRows(input: ArmholeShapingInput) {
  const { armholeParameters, gauge, totalPanelWidthStitches, finishedShoulderWidthCm } = input;

  // Get armhole dimensions
  const armholeDepthCm = armholeParameters.depth_cm;
  const armholeWidthCm = armholeParameters.width_cm;

  // Convert to stitches and rows
  const armholeWidthStitches = Math.round(armholeWidthCm * (gauge.stitchesPer10cm / 10));
  const armholeDepthRows = Math.round(armholeDepthCm * (gauge.rowsPer10cm / 10));
  const shoulderWidthStitches = Math.round(finishedShoulderWidthCm * (gauge.stitchesPer10cm / 10));

  return {
    armholeWidthStitches,
    armholeDepthRows,
    shoulderWidthStitches
  };
}

/**
 * Generate shaping actions for rounded armholes
 */
function generateRoundedArmholeActions(
  calculation: RoundedArmholeCalculation
): ArmholeShapingAction[] {
  const actions: ArmholeShapingAction[] = [];
  let currentRow = 1;

  // Add base bind-off first
  if (calculation.baseBindOffStitches > 0) {
    const bindOffAction: ArmholeShapingAction = {
      action: 'bind_off',
      stitches: calculation.baseBindOffStitches,
      on_row_from_start_of_shaping: currentRow,
      side_of_fabric: 'both' // Typically done at beginning of next 2 rows
    };
    actions.push(bindOffAction);
    currentRow += 2; // Skip 2 rows for bind-off execution
  }

  // Add rapid decreases
  if (calculation.decreaseDistribution.rapid.count > 0) {
    const rapidAction: ArmholeShapingAction = {
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
    const gradualAction: ArmholeShapingAction = {
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
 * Generate shaping actions for raglan armholes
 */
function generateRaglanArmholeActions(
  calculation: RaglanArmholeCalculation
): ArmholeShapingAction[] {
  const actions: ArmholeShapingAction[] = [];
  let currentRow = 1;

  // Add base bind-off for underarm ease if specified
  if (calculation.baseBindOffStitches > 0) {
    const bindOffAction: ArmholeShapingAction = {
      action: 'bind_off',
      stitches: calculation.baseBindOffStitches,
      on_row_from_start_of_shaping: currentRow,
      side_of_fabric: 'both'
    };
    actions.push(bindOffAction);
    currentRow += 2;
  }

  // Add raglan decreases
  if (calculation.decreaseEvents > 0) {
    const raglanAction: ArmholeShapingAction = {
      action: 'decrease',
      stitches: calculation.stitchesPerEvent,
      on_row_from_start_of_shaping: currentRow,
      side_of_fabric: 'RS',
      repeats: calculation.decreaseEvents,
      every_x_rows: calculation.decreaseFrequency
    };
    actions.push(raglanAction);
  }

  return actions;
}

/**
 * Validate armhole shaping input parameters
 */
function validateArmholeShapingInput(input: ArmholeShapingInput): ArmholeShapingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate armhole type
  if (!input.armholeType) {
    errors.push('Armhole type is required');
  }

  // Validate armhole parameters
  if (!input.armholeParameters) {
    errors.push('Armhole parameters are required');
  } else {
    if (!input.armholeParameters.depth_cm || input.armholeParameters.depth_cm <= 0) {
      errors.push('Armhole depth must be greater than 0');
    }

    if (!input.armholeParameters.width_cm || input.armholeParameters.width_cm <= 0) {
      errors.push('Armhole width must be greater than 0');
    }

    if (input.armholeParameters.depth_cm && input.armholeParameters.depth_cm > 35) {
      warnings.push('Very deep armhole - please verify measurements');
    }

    if (input.armholeParameters.width_cm && input.armholeParameters.width_cm > 25) {
      warnings.push('Very wide armhole - please verify measurements');
    }

    // Raglan-specific validations
    if (input.armholeType === 'raglan') {
      if (input.armholeParameters.raglan_line_length_cm && 
          input.armholeParameters.raglan_line_length_cm < input.armholeParameters.depth_cm) {
        warnings.push('Raglan line length should typically be at least equal to armhole depth');
      }
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

  if (input.armholeParameters && input.gauge && input.totalPanelWidthStitches) {
    const armholeWidthStitches = Math.round(input.armholeParameters.width_cm * (input.gauge.stitchesPer10cm / 10));
    if (armholeWidthStitches >= input.totalPanelWidthStitches * 0.4) {
      warnings.push('Armhole width seems very large relative to panel width - please verify measurements');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
} 