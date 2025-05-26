/**
 * Types for the Reverse Gauge Calculator tool
 * Supports three calculation scenarios as specified in US_2.1
 */

import type { MeasurementUnit } from './gauge';

/**
 * Gauge information for calculations
 */
export interface GaugeInfo {
  stitches: number;
  rows: number;
  unit_dimension: number; // e.g., 10 for "10cm" or 4 for "4 inches"
  unit: MeasurementUnit;
}

/**
 * Calculation scenarios supported by the reverse gauge calculator
 */
export type CalculationScenario = 'target_to_stitches' | 'stitches_to_dimension' | 'gauge_comparison';

/**
 * Input data for Scenario A: Target dimension to required stitches/rows
 */
export interface ScenarioAInput {
  user_gauge: GaugeInfo;
  target_dimension: number;
  dimension_unit: MeasurementUnit;
  calculate_for: 'stitches' | 'rows';
}

/**
 * Input data for Scenario B: Stitch/row count to resulting dimension
 */
export interface ScenarioBInput {
  user_gauge: GaugeInfo;
  stitch_or_row_count: number;
  calculate_for: 'dimension_width' | 'dimension_height';
}

/**
 * Input data for Scenario C: Pattern gauge vs user gauge comparison
 */
export interface ScenarioCInput {
  pattern_gauge: GaugeInfo;
  pattern_stitch_row_count: number;
  user_gauge: GaugeInfo;
  calculate_for_component: 'width' | 'height';
}

/**
 * Union type for all calculation inputs
 */
export type CalculationInput = ScenarioAInput | ScenarioBInput | ScenarioCInput;

/**
 * Result for Scenario A calculations
 */
export interface ScenarioAResult {
  scenario: 'target_to_stitches';
  required_count: number; // stitches or rows needed
  target_dimension: number;
  dimension_unit: MeasurementUnit;
  calculate_for: 'stitches' | 'rows';
  gauge_used: GaugeInfo;
}

/**
 * Result for Scenario B calculations
 */
export interface ScenarioBResult {
  scenario: 'stitches_to_dimension';
  resulting_dimension: number;
  dimension_unit: MeasurementUnit;
  stitch_or_row_count: number;
  calculate_for: 'dimension_width' | 'dimension_height';
  gauge_used: GaugeInfo;
}

/**
 * Result for Scenario C calculations
 */
export interface ScenarioCResult {
  scenario: 'gauge_comparison';
  original_dimension: number;
  dimension_with_user_gauge: number;
  adjusted_count_for_original_dimension: number;
  dimension_unit: MeasurementUnit;
  calculate_for_component: 'width' | 'height';
  pattern_gauge: GaugeInfo;
  user_gauge: GaugeInfo;
  pattern_count: number;
}

/**
 * Union type for all calculation results
 */
export type CalculationResult = ScenarioAResult | ScenarioBResult | ScenarioCResult;

/**
 * API request payload for reverse gauge calculations
 */
export interface ReverseGaugeCalculationRequest {
  scenario: CalculationScenario;
  input: CalculationInput;
}

/**
 * API response for reverse gauge calculations
 */
export interface ReverseGaugeCalculationResponse {
  success: boolean;
  data?: CalculationResult;
  error?: string;
}

/**
 * Form validation errors for the calculator
 */
export interface ReverseGaugeCalculatorFormErrors {
  user_gauge?: {
    stitches?: string;
    rows?: string;
    unit_dimension?: string;
    unit?: string;
  };
  pattern_gauge?: {
    stitches?: string;
    rows?: string;
    unit_dimension?: string;
    unit?: string;
  };
  target_dimension?: string;
  stitch_or_row_count?: string;
  pattern_stitch_row_count?: string;
  calculate_for?: string;
  calculate_for_component?: string;
  dimension_unit?: string;
} 