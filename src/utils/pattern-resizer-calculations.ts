/**
 * Pattern Resizer Calculations (US 10.1)
 * Core calculation logic for resizing existing patterns to new gauge and dimensions
 */

import { 
  PatternResizerInput, 
  PatternResizerResult, 
  CalculatedNewValues,
  ResizerShapingData 
} from '@/types/pattern-resizer';
import { ShapingCalculationInput } from '@/types/shaping';
import { getTemplateByKey } from './pattern-resizer-templates';
import { calculateShaping } from './shaping-calculator';

/**
 * Main function to calculate new pattern values for an existing pattern
 * Implements the core algorithm described in US 10.1
 */
export function calculatePatternResize(input: PatternResizerInput): PatternResizerResult {
  try {
    // Validate input
    const validationErrors = validateResizerInput(input);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Invalid input: ${validationErrors.join(', ')}`
      };
    }

    // Get template
    const template = getTemplateByKey(input.template_key);
    if (!template) {
      return {
        success: false,
        error: `Template not found: ${input.template_key}`
      };
    }

    // Calculate based on template type
    let calculatedValues: CalculatedNewValues;
    const warnings: string[] = [];

    switch (input.template_key) {
      case 'simple_body_panel_rectangular':
      case 'simple_scarf_rectangular':
        calculatedValues = calculateRectangularResize(input, warnings);
        break;
      
      case 'simple_sleeve_tapered':
        calculatedValues = calculateSleeveResize(input, warnings);
        break;
      
      case 'simple_hat_cylindrical':
        calculatedValues = calculateHatResize(input, warnings);
        break;
      
      default:
        return {
          success: false,
          error: `Unsupported template: ${input.template_key}`
        };
    }

    return {
      success: true,
      calculated_new_values: calculatedValues,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        template_used: input.template_key,
        calculated_at: new Date().toISOString(),
        had_shaping: template.supports_shaping && input.template_key === 'simple_sleeve_tapered'
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
 * Calculate new values for rectangular pieces (body panels, scarves)
 */
function calculateRectangularResize(
  input: PatternResizerInput, 
  warnings: string[]
): CalculatedNewValues {
  const { original_gauge, new_gauge, original_pattern_values, new_dimension_values } = input;

  // Extract original values
  const originalCastOn = Number(original_pattern_values.original_cast_on);
  const originalRows = Number(original_pattern_values.original_rows_total || 0);
  const originalWidth = Number(original_pattern_values.original_finished_width);
  const originalLength = Number(original_pattern_values.original_finished_length);

  // Extract new desired dimensions
  const newDesiredWidth = Number(new_dimension_values.new_finished_width);
  const newDesiredLength = Number(new_dimension_values.new_finished_length);

  // Convert units if necessary
  const originalUnit = original_gauge.original_gauge_unit;
  const newUnit = new_gauge.new_gauge_unit;
  
  let adjustedNewWidth = newDesiredWidth;
  let adjustedNewLength = newDesiredLength;
  
  if (originalUnit !== newUnit) {
    // Convert new dimensions to original unit for calculation
    if (originalUnit === 'cm' && newUnit === 'inch') {
      adjustedNewWidth = newDesiredWidth * 2.54;
      adjustedNewLength = newDesiredLength * 2.54;
    } else if (originalUnit === 'inch' && newUnit === 'cm') {
      adjustedNewWidth = newDesiredWidth / 2.54;
      adjustedNewLength = newDesiredLength / 2.54;
    }
    warnings.push(`Unit conversion applied: ${newUnit} to ${originalUnit}`);
  }

  // Calculate stitch rate per unit for new gauge
  const newStitchesPerUnit = new_gauge.new_gauge_stitches / (new_gauge.new_swatch_width || 10);
  const newRowsPerUnit = new_gauge.new_gauge_rows / (new_gauge.new_swatch_height || 10);

  // Calculate new cast-on stitches
  const newCastOnStitches = Math.round(adjustedNewWidth * newStitchesPerUnit);

  // Calculate new total rows
  const newTotalRows = Math.round(adjustedNewLength * newRowsPerUnit);

  // Calculate actual achieved dimensions
  const newActualWidth = newCastOnStitches / newStitchesPerUnit;
  const newActualLength = newTotalRows / newRowsPerUnit;

  // Convert back to desired unit for display
  let displayActualWidth = newActualWidth;
  let displayActualLength = newActualLength;
  
  if (originalUnit !== newUnit) {
    if (originalUnit === 'cm' && newUnit === 'inch') {
      displayActualWidth = newActualWidth / 2.54;
      displayActualLength = newActualLength / 2.54;
    } else if (originalUnit === 'inch' && newUnit === 'cm') {
      displayActualWidth = newActualWidth * 2.54;
      displayActualLength = newActualLength * 2.54;
    }
  }

  // Add warnings for significant differences
  const widthDifference = Math.abs(newDesiredWidth - displayActualWidth);
  const lengthDifference = Math.abs(newDesiredLength - displayActualLength);
  
  if (widthDifference > (newUnit === 'cm' ? 2 : 0.8)) {
    warnings.push(`Width differs by ${widthDifference.toFixed(1)}${newUnit} from desired due to stitch count rounding`);
  }
  
  if (lengthDifference > (newUnit === 'cm' ? 2 : 0.8)) {
    warnings.push(`Length differs by ${lengthDifference.toFixed(1)}${newUnit} from desired due to row count rounding`);
  }

  // Warn about large gauge differences
  const originalStitchesPerUnit = original_gauge.original_gauge_stitches / (original_gauge.original_swatch_width || 10);
  const gaugeChange = Math.abs((newStitchesPerUnit - originalStitchesPerUnit) / originalStitchesPerUnit);
  
  if (gaugeChange > 0.2) {
    warnings.push(`Large gauge change (${(gaugeChange * 100).toFixed(1)}%) - verify yarn compatibility`);
  }

  return {
    new_cast_on_stitches: newCastOnStitches,
    new_total_rows: newTotalRows,
    new_actual_width: Number(displayActualWidth.toFixed(1)),
    new_actual_length: Number(displayActualLength.toFixed(1))
  };
}

/**
 * Calculate new values for tapered sleeves with shaping
 */
function calculateSleeveResize(
  input: PatternResizerInput, 
  warnings: string[]
): CalculatedNewValues {
  const { original_gauge, new_gauge, original_pattern_values, new_dimension_values } = input;

  // Extract original values
  const originalCuffStitches = Number(original_pattern_values.original_cuff_stitches);
  const originalUpperArmStitches = Number(original_pattern_values.original_upper_arm_stitches);
  const originalSleeveRows = Number(original_pattern_values.original_sleeve_length_rows);
  const originalShapingStitchesPerEvent = Number(original_pattern_values.original_shaping_stitches_per_event);

  // Extract new desired dimensions
  const newDesiredCuffWidth = Number(new_dimension_values.new_cuff_width);
  const newDesiredUpperArmWidth = Number(new_dimension_values.new_upper_arm_width);
  const newDesiredSleeveLength = Number(new_dimension_values.new_sleeve_length);

  // Handle unit conversion
  const originalUnit = original_gauge.original_gauge_unit;
  const newUnit = new_gauge.new_gauge_unit;
  
  let adjustedCuffWidth = newDesiredCuffWidth;
  let adjustedUpperArmWidth = newDesiredUpperArmWidth;
  let adjustedSleeveLength = newDesiredSleeveLength;
  
  if (originalUnit !== newUnit) {
    if (originalUnit === 'cm' && newUnit === 'inch') {
      adjustedCuffWidth = newDesiredCuffWidth * 2.54;
      adjustedUpperArmWidth = newDesiredUpperArmWidth * 2.54;
      adjustedSleeveLength = newDesiredSleeveLength * 2.54;
    } else if (originalUnit === 'inch' && newUnit === 'cm') {
      adjustedCuffWidth = newDesiredCuffWidth / 2.54;
      adjustedUpperArmWidth = newDesiredUpperArmWidth / 2.54;
      adjustedSleeveLength = newDesiredSleeveLength / 2.54;
    }
    warnings.push(`Unit conversion applied: ${newUnit} to ${originalUnit}`);
  }

  // Calculate stitch and row rates for new gauge
  const newStitchesPerUnit = new_gauge.new_gauge_stitches / (new_gauge.new_swatch_width || 10);
  const newRowsPerUnit = new_gauge.new_gauge_rows / (new_gauge.new_swatch_height || 10);

  // Calculate new stitch counts
  const newCuffStitches = Math.round(adjustedCuffWidth * newStitchesPerUnit);
  const newUpperArmStitches = Math.round(adjustedUpperArmWidth * newStitchesPerUnit);
  const newSleeveRows = Math.round(adjustedSleeveLength * newRowsPerUnit);

  // Calculate shaping schedule using existing shaping calculator
  let shapingScheduleSummary = 'No shaping needed';
  
  if (newCuffStitches !== newUpperArmStitches) {
    const shapingInput: ShapingCalculationInput = {
      startingStitchCount: newCuffStitches,
      targetStitchCount: newUpperArmStitches,
      totalRowsForShaping: newSleeveRows,
      stitchesPerShapingEvent: originalShapingStitchesPerEvent,
      rowsPerUnit: newRowsPerUnit,
      unit: originalUnit
    };

    const shapingResult = calculateShaping(shapingInput);
    
    if (shapingResult.success && shapingResult.schedule && shapingResult.schedule.shapingEvents && shapingResult.schedule.shapingEvents.length > 0) {
      shapingScheduleSummary = shapingResult.schedule.shapingEvents[0].instructionsTextSimple;
      
      // Add shaping warnings
      if (shapingResult.warnings) {
        warnings.push(...shapingResult.warnings);
      }
    } else if (shapingResult.error) {
      warnings.push(`Shaping calculation issue: ${shapingResult.error}`);
      shapingScheduleSummary = 'Manual shaping calculation needed';
    }
  }

  // Add warnings for significant gauge changes
  const originalStitchesPerUnit = original_gauge.original_gauge_stitches / (original_gauge.original_swatch_width || 10);
  const gaugeChange = Math.abs((newStitchesPerUnit - originalStitchesPerUnit) / originalStitchesPerUnit);
  
  if (gaugeChange > 0.2) {
    warnings.push(`Large gauge change (${(gaugeChange * 100).toFixed(1)}%) - verify yarn compatibility`);
  }

  // Warn about very different sleeve proportions
  const originalShapingRatio = originalUpperArmStitches / originalCuffStitches;
  const newShapingRatio = newUpperArmStitches / newCuffStitches;
  
  if (Math.abs(originalShapingRatio - newShapingRatio) > 0.3) {
    warnings.push('Significant change in sleeve taper ratio - verify fit');
  }

  return {
    new_cuff_stitches: newCuffStitches,
    new_upper_arm_stitches: newUpperArmStitches,
    new_sleeve_length_rows: newSleeveRows,
    new_shaping_schedule_summary: shapingScheduleSummary
  };
}

/**
 * Calculate new values for cylindrical hat bodies
 */
function calculateHatResize(
  input: PatternResizerInput, 
  warnings: string[]
): CalculatedNewValues {
  const { original_gauge, new_gauge, original_pattern_values, new_dimension_values } = input;

  // Extract original values
  const originalCastOn = Number(original_pattern_values.original_cast_on);
  const originalCircumference = Number(original_pattern_values.original_head_circumference);
  const originalHeight = Number(original_pattern_values.original_hat_height);

  // Extract new desired dimensions
  const newDesiredCircumference = Number(new_dimension_values.new_head_circumference);
  const newDesiredHeight = Number(new_dimension_values.new_hat_height);

  // Handle unit conversion
  const originalUnit = original_gauge.original_gauge_unit;
  const newUnit = new_gauge.new_gauge_unit;
  
  let adjustedCircumference = newDesiredCircumference;
  let adjustedHeight = newDesiredHeight;
  
  if (originalUnit !== newUnit) {
    if (originalUnit === 'cm' && newUnit === 'inch') {
      adjustedCircumference = newDesiredCircumference * 2.54;
      adjustedHeight = newDesiredHeight * 2.54;
    } else if (originalUnit === 'inch' && newUnit === 'cm') {
      adjustedCircumference = newDesiredCircumference / 2.54;
      adjustedHeight = newDesiredHeight / 2.54;
    }
    warnings.push(`Unit conversion applied: ${newUnit} to ${originalUnit}`);
  }

  // Calculate stitch and row rates for new gauge
  const newStitchesPerUnit = new_gauge.new_gauge_stitches / (new_gauge.new_swatch_width || 10);
  const newRowsPerUnit = new_gauge.new_gauge_rows / (new_gauge.new_swatch_height || 10);

  // Calculate new cast-on stitches for circumference
  const newCastOnStitches = Math.round(adjustedCircumference * newStitchesPerUnit);

  // Calculate new total rows for height
  const newTotalRows = Math.round(adjustedHeight * newRowsPerUnit);

  // Calculate actual achieved dimensions
  const newActualCircumference = newCastOnStitches / newStitchesPerUnit;
  const newActualHeight = newTotalRows / newRowsPerUnit;

  // Convert back to desired unit for display
  let displayActualCircumference = newActualCircumference;
  let displayActualHeight = newActualHeight;
  
  if (originalUnit !== newUnit) {
    if (originalUnit === 'cm' && newUnit === 'inch') {
      displayActualCircumference = newActualCircumference / 2.54;
      displayActualHeight = newActualHeight / 2.54;
    } else if (originalUnit === 'inch' && newUnit === 'cm') {
      displayActualCircumference = newActualCircumference * 2.54;
      displayActualHeight = newActualHeight * 2.54;
    }
  }

  // Add warnings for significant differences
  const circumferenceDifference = Math.abs(newDesiredCircumference - displayActualCircumference);
  const heightDifference = Math.abs(newDesiredHeight - displayActualHeight);
  
  if (circumferenceDifference > (newUnit === 'cm' ? 1 : 0.4)) {
    warnings.push(`Circumference differs by ${circumferenceDifference.toFixed(1)}${newUnit} from desired due to stitch count rounding`);
  }
  
  if (heightDifference > (newUnit === 'cm' ? 1 : 0.4)) {
    warnings.push(`Height differs by ${heightDifference.toFixed(1)}${newUnit} from desired due to row count rounding`);
  }

  // Warn about fit implications for hats
  if (circumferenceDifference > (newUnit === 'cm' ? 2 : 0.8)) {
    warnings.push('Significant circumference change - consider ease for comfortable fit');
  }

  return {
    new_cast_on_stitches: newCastOnStitches,
    new_total_rows: newTotalRows,
    new_actual_circumference: Number(displayActualCircumference.toFixed(1)),
    new_actual_height: Number(displayActualHeight.toFixed(1))
  };
}

/**
 * Validate pattern resizer input
 */
function validateResizerInput(input: PatternResizerInput): string[] {
  const errors: string[] = [];

  // Validate template key
  if (!input.template_key) {
    errors.push('Template key is required');
  }

  // Validate original gauge
  if (!input.original_gauge.original_gauge_stitches || input.original_gauge.original_gauge_stitches <= 0) {
    errors.push('Original gauge stitches must be positive');
  }
  
  if (!input.original_gauge.original_gauge_rows || input.original_gauge.original_gauge_rows <= 0) {
    errors.push('Original gauge rows must be positive');
  }

  // Validate new gauge
  if (!input.new_gauge.new_gauge_stitches || input.new_gauge.new_gauge_stitches <= 0) {
    errors.push('New gauge stitches must be positive');
  }
  
  if (!input.new_gauge.new_gauge_rows || input.new_gauge.new_gauge_rows <= 0) {
    errors.push('New gauge rows must be positive');
  }

  // Validate that we have pattern values and dimension values
  if (!input.original_pattern_values || Object.keys(input.original_pattern_values).length === 0) {
    errors.push('Original pattern values are required');
  }
  
  if (!input.new_dimension_values || Object.keys(input.new_dimension_values).length === 0) {
    errors.push('New dimension values are required');
  }

  // Validate positive numbers in pattern values
  Object.entries(input.original_pattern_values).forEach(([key, value]) => {
    if (typeof value === 'number' && value <= 0) {
      errors.push(`${key} must be positive`);
    }
  });

  // Validate positive numbers in dimension values
  Object.entries(input.new_dimension_values).forEach(([key, value]) => {
    if (typeof value === 'number' && value <= 0) {
      errors.push(`${key} must be positive`);
    }
  });

  return errors;
} 