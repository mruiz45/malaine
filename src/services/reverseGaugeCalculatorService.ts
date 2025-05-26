/**
 * Reverse Gauge Calculator Service
 * Handles all calculation logic for the reverse gauge calculator tool
 * Follows the established service pattern for the Malaine project
 */

import type {
  GaugeInfo,
  CalculationScenario,
  CalculationInput,
  CalculationResult,
  ScenarioAInput,
  ScenarioBInput,
  ScenarioCInput,
  ScenarioAResult,
  ScenarioBResult,
  ScenarioCResult,
  ReverseGaugeCalculationRequest,
  ReverseGaugeCalculationResponse,
  ReverseGaugeCalculatorFormErrors
} from '@/types/reverseGaugeCalculator';
import type { MeasurementUnit } from '@/types/gauge';

/**
 * Converts measurements between cm and inches
 * @param value - The value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted value
 */
function convertUnit(value: number, fromUnit: MeasurementUnit, toUnit: MeasurementUnit): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'cm' && toUnit === 'inch') {
    return value / 2.54;
  } else if (fromUnit === 'inch' && toUnit === 'cm') {
    return value * 2.54;
  }
  
  return value;
}

/**
 * Calculates stitches per unit for a given gauge
 * @param gauge - Gauge information
 * @param targetUnit - Unit to calculate per (cm or inch)
 * @returns Stitches per target unit
 */
function calculateStitchesPerUnit(gauge: GaugeInfo, targetUnit: MeasurementUnit): number {
  const gaugeDimensionInTargetUnit = convertUnit(gauge.unit_dimension, gauge.unit, targetUnit);
  return gauge.stitches / gaugeDimensionInTargetUnit;
}

/**
 * Calculates rows per unit for a given gauge
 * @param gauge - Gauge information
 * @param targetUnit - Unit to calculate per (cm or inch)
 * @returns Rows per target unit
 */
function calculateRowsPerUnit(gauge: GaugeInfo, targetUnit: MeasurementUnit): number {
  const gaugeDimensionInTargetUnit = convertUnit(gauge.unit_dimension, gauge.unit, targetUnit);
  return gauge.rows / gaugeDimensionInTargetUnit;
}

/**
 * Scenario A: Calculate required stitches/rows for a target dimension
 * @param input - Scenario A input data
 * @returns Calculation result
 */
function calculateScenarioA(input: ScenarioAInput): ScenarioAResult {
  const targetDimensionInGaugeUnit = convertUnit(input.target_dimension, input.dimension_unit, input.user_gauge.unit);
  
  let requiredCount: number;
  
  if (input.calculate_for === 'stitches') {
    const stitchesPerUnit = calculateStitchesPerUnit(input.user_gauge, input.user_gauge.unit);
    requiredCount = Math.round(targetDimensionInGaugeUnit * stitchesPerUnit);
  } else {
    const rowsPerUnit = calculateRowsPerUnit(input.user_gauge, input.user_gauge.unit);
    requiredCount = Math.round(targetDimensionInGaugeUnit * rowsPerUnit);
  }

  return {
    scenario: 'target_to_stitches',
    required_count: requiredCount,
    target_dimension: input.target_dimension,
    dimension_unit: input.dimension_unit,
    calculate_for: input.calculate_for,
    gauge_used: input.user_gauge
  };
}

/**
 * Scenario B: Calculate resulting dimension from stitch/row count
 * @param input - Scenario B input data
 * @returns Calculation result
 */
function calculateScenarioB(input: ScenarioBInput): ScenarioBResult {
  let resultingDimension: number;
  
  if (input.calculate_for === 'dimension_width') {
    const stitchesPerUnit = calculateStitchesPerUnit(input.user_gauge, input.user_gauge.unit);
    resultingDimension = input.stitch_or_row_count / stitchesPerUnit;
  } else {
    const rowsPerUnit = calculateRowsPerUnit(input.user_gauge, input.user_gauge.unit);
    resultingDimension = input.stitch_or_row_count / rowsPerUnit;
  }

  return {
    scenario: 'stitches_to_dimension',
    resulting_dimension: Math.round(resultingDimension * 100) / 100, // Round to 2 decimal places
    dimension_unit: input.user_gauge.unit,
    stitch_or_row_count: input.stitch_or_row_count,
    calculate_for: input.calculate_for,
    gauge_used: input.user_gauge
  };
}

/**
 * Scenario C: Compare pattern gauge vs user gauge
 * @param input - Scenario C input data
 * @returns Calculation result
 */
function calculateScenarioC(input: ScenarioCInput): ScenarioCResult {
  // Ensure both gauges use the same unit for comparison
  const commonUnit = input.pattern_gauge.unit;
  
  // Calculate original dimension from pattern
  let originalDimension: number;
  let dimensionWithUserGauge: number;
  let adjustedCountForOriginalDimension: number;
  
  if (input.calculate_for_component === 'width') {
    const patternStitchesPerUnit = calculateStitchesPerUnit(input.pattern_gauge, commonUnit);
    const userStitchesPerUnit = calculateStitchesPerUnit(input.user_gauge, commonUnit);
    
    originalDimension = input.pattern_stitch_row_count / patternStitchesPerUnit;
    dimensionWithUserGauge = input.pattern_stitch_row_count / userStitchesPerUnit;
    adjustedCountForOriginalDimension = Math.round(originalDimension * userStitchesPerUnit);
  } else {
    const patternRowsPerUnit = calculateRowsPerUnit(input.pattern_gauge, commonUnit);
    const userRowsPerUnit = calculateRowsPerUnit(input.user_gauge, commonUnit);
    
    originalDimension = input.pattern_stitch_row_count / patternRowsPerUnit;
    dimensionWithUserGauge = input.pattern_stitch_row_count / userRowsPerUnit;
    adjustedCountForOriginalDimension = Math.round(originalDimension * userRowsPerUnit);
  }

  return {
    scenario: 'gauge_comparison',
    original_dimension: Math.round(originalDimension * 100) / 100,
    dimension_with_user_gauge: Math.round(dimensionWithUserGauge * 100) / 100,
    adjusted_count_for_original_dimension: adjustedCountForOriginalDimension,
    dimension_unit: commonUnit,
    calculate_for_component: input.calculate_for_component,
    pattern_gauge: input.pattern_gauge,
    user_gauge: input.user_gauge,
    pattern_count: input.pattern_stitch_row_count
  };
}

/**
 * Main calculation function that routes to appropriate scenario
 * @param scenario - Calculation scenario
 * @param input - Input data
 * @returns Calculation result
 */
export function calculateReverseGauge(scenario: CalculationScenario, input: CalculationInput): CalculationResult {
  switch (scenario) {
    case 'target_to_stitches':
      return calculateScenarioA(input as ScenarioAInput);
    case 'stitches_to_dimension':
      return calculateScenarioB(input as ScenarioBInput);
    case 'gauge_comparison':
      return calculateScenarioC(input as ScenarioCInput);
    default:
      throw new Error(`Unknown calculation scenario: ${scenario}`);
  }
}

/**
 * Validates gauge information
 * @param gauge - Gauge to validate
 * @param fieldPrefix - Prefix for error field names
 * @returns Validation errors object
 */
function validateGaugeInfo(gauge: GaugeInfo, fieldPrefix: string): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!gauge.stitches || gauge.stitches <= 0) {
    errors[`${fieldPrefix}.stitches`] = 'Stitch count must be a positive number';
  }

  if (!gauge.rows || gauge.rows <= 0) {
    errors[`${fieldPrefix}.rows`] = 'Row count must be a positive number';
  }

  if (!gauge.unit_dimension || gauge.unit_dimension <= 0) {
    errors[`${fieldPrefix}.unit_dimension`] = 'Unit dimension must be a positive number';
  }

  if (!gauge.unit || !['cm', 'inch'].includes(gauge.unit)) {
    errors[`${fieldPrefix}.unit`] = 'Unit must be cm or inch';
  }

  return errors;
}

/**
 * Validates calculation input data
 * @param scenario - Calculation scenario
 * @param input - Input data to validate
 * @returns Validation errors object
 */
export function validateCalculationInput(scenario: CalculationScenario, input: CalculationInput): ReverseGaugeCalculatorFormErrors {
  const errors: ReverseGaugeCalculatorFormErrors = {};

  switch (scenario) {
    case 'target_to_stitches': {
      const scenarioInput = input as ScenarioAInput;
      
      // Validate user gauge
      const userGaugeErrors = validateGaugeInfo(scenarioInput.user_gauge, 'user_gauge');
      if (Object.keys(userGaugeErrors).length > 0) {
        errors.user_gauge = {};
        Object.entries(userGaugeErrors).forEach(([key, value]) => {
          const gaugeField = key.split('.')[1] as keyof typeof errors.user_gauge;
          if (errors.user_gauge && gaugeField) {
            errors.user_gauge[gaugeField] = value;
          }
        });
      }

      // Validate target dimension
      if (!scenarioInput.target_dimension || scenarioInput.target_dimension <= 0) {
        errors.target_dimension = 'Target dimension must be a positive number';
      }

      // Validate calculate_for
      if (!scenarioInput.calculate_for || !['stitches', 'rows'].includes(scenarioInput.calculate_for)) {
        errors.calculate_for = 'Must specify whether to calculate stitches or rows';
      }

      break;
    }

    case 'stitches_to_dimension': {
      const scenarioInput = input as ScenarioBInput;
      
      // Validate user gauge
      const userGaugeErrors = validateGaugeInfo(scenarioInput.user_gauge, 'user_gauge');
      if (Object.keys(userGaugeErrors).length > 0) {
        errors.user_gauge = {};
        Object.entries(userGaugeErrors).forEach(([key, value]) => {
          const gaugeField = key.split('.')[1] as keyof typeof errors.user_gauge;
          if (errors.user_gauge && gaugeField) {
            errors.user_gauge[gaugeField] = value;
          }
        });
      }

      // Validate stitch/row count
      if (!scenarioInput.stitch_or_row_count || scenarioInput.stitch_or_row_count <= 0) {
        errors.stitch_or_row_count = 'Stitch or row count must be a positive number';
      }

      // Validate calculate_for
      if (!scenarioInput.calculate_for || !['dimension_width', 'dimension_height'].includes(scenarioInput.calculate_for)) {
        errors.calculate_for = 'Must specify whether to calculate width or height dimension';
      }

      break;
    }

    case 'gauge_comparison': {
      const scenarioInput = input as ScenarioCInput;
      
      // Validate pattern gauge
      const patternGaugeErrors = validateGaugeInfo(scenarioInput.pattern_gauge, 'pattern_gauge');
      if (Object.keys(patternGaugeErrors).length > 0) {
        errors.pattern_gauge = {};
        Object.entries(patternGaugeErrors).forEach(([key, value]) => {
          const gaugeField = key.split('.')[1] as keyof typeof errors.pattern_gauge;
          if (errors.pattern_gauge && gaugeField) {
            errors.pattern_gauge[gaugeField] = value;
          }
        });
      }

      // Validate user gauge
      const userGaugeErrors = validateGaugeInfo(scenarioInput.user_gauge, 'user_gauge');
      if (Object.keys(userGaugeErrors).length > 0) {
        errors.user_gauge = {};
        Object.entries(userGaugeErrors).forEach(([key, value]) => {
          const gaugeField = key.split('.')[1] as keyof typeof errors.user_gauge;
          if (errors.user_gauge && gaugeField) {
            errors.user_gauge[gaugeField] = value;
          }
        });
      }

      // Validate pattern stitch/row count
      if (!scenarioInput.pattern_stitch_row_count || scenarioInput.pattern_stitch_row_count <= 0) {
        errors.pattern_stitch_row_count = 'Pattern stitch or row count must be a positive number';
      }

      // Validate calculate_for_component
      if (!scenarioInput.calculate_for_component || !['width', 'height'].includes(scenarioInput.calculate_for_component)) {
        errors.calculate_for_component = 'Must specify whether to calculate for width or height';
      }

      break;
    }

    default:
      throw new Error(`Unknown calculation scenario: ${scenario}`);
  }

  return errors;
}

/**
 * Makes API call to calculate reverse gauge
 * @param scenario - Calculation scenario
 * @param input - Input data
 * @returns Promise<CalculationResult> The calculation result
 * @throws Error if the request fails or validation fails
 */
export async function calculateReverseGaugeAPI(scenario: CalculationScenario, input: CalculationInput): Promise<CalculationResult> {
  try {
    const requestData: ReverseGaugeCalculationRequest = {
      scenario,
      input
    };

    const response = await fetch('/api/tools/reverse-gauge-calculator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data: ReverseGaugeCalculationResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to calculate reverse gauge');
    }

    return data.data;
  } catch (error) {
    console.error('Error in calculateReverseGaugeAPI:', error);
    throw error;
  }
} 