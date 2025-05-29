/**
 * Types for Pattern Resizer Tool (US 10.1)
 * Defines interfaces for the existing pattern numerical resizer functionality
 */

import { MeasurementUnit } from './gauge';

/**
 * Template input field definition
 */
export interface TemplateInputField {
  /** Field identifier key */
  key: string;
  /** Display label for the field */
  label: string;
  /** Optional placeholder text */
  placeholder?: string;
  /** Field data type */
  type?: 'number' | 'text';
  /** Minimum value for number inputs */
  min?: number;
  /** Step value for number inputs */
  step?: number;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Pattern resizer template definition
 */
export interface PatternResizerTemplate {
  /** Unique template identifier */
  template_key: string;
  /** Human-readable template name */
  display_name: string;
  /** Description of what this template handles */
  description: string;
  /** Input fields for original pattern data */
  inputs_original_pattern: TemplateInputField[];
  /** Input fields for new parameters (excluding gauge) */
  inputs_new_params: TemplateInputField[];
  /** Output field keys that will be calculated */
  outputs_calculated: string[];
  /** Whether this template supports shaping calculations */
  supports_shaping: boolean;
}

/**
 * Original pattern gauge data
 */
export interface OriginalPatternGauge {
  /** Original pattern stitches per unit */
  original_gauge_stitches: number;
  /** Original pattern rows per unit */
  original_gauge_rows: number;
  /** Unit of measurement for original gauge */
  original_gauge_unit: MeasurementUnit;
  /** Swatch width for original gauge */
  original_swatch_width?: number;
  /** Swatch height for original gauge */
  original_swatch_height?: number;
}

/**
 * New gauge data (from user's gauge profile or manual input)
 */
export interface NewGaugeData {
  /** New gauge stitches per unit */
  new_gauge_stitches: number;
  /** New gauge rows per unit */
  new_gauge_rows: number;
  /** Unit of measurement for new gauge */
  new_gauge_unit: MeasurementUnit;
  /** Swatch width for new gauge */
  new_swatch_width?: number;
  /** Swatch height for new gauge */
  new_swatch_height?: number;
  /** Optional gauge profile name if using saved profile */
  profile_name?: string;
}

/**
 * Original pattern values input by user
 */
export interface OriginalPatternValues {
  [key: string]: number | string;
}

/**
 * New dimension values desired by user
 */
export interface NewDimensionValues {
  [key: string]: number | string;
}

/**
 * Calculated new pattern values
 */
export interface CalculatedNewValues {
  /** New cast-on stitches */
  new_cast_on_stitches?: number;
  /** New total rows */
  new_total_rows?: number;
  /** New actual width achieved */
  new_actual_width?: number;
  /** New actual length achieved */
  new_actual_length?: number;
  /** New cuff stitches (for sleeves) */
  new_cuff_stitches?: number;
  /** New upper arm stitches (for sleeves) */
  new_upper_arm_stitches?: number;
  /** New sleeve length in rows */
  new_sleeve_length_rows?: number;
  /** New shaping schedule summary */
  new_shaping_schedule_summary?: string;
  /** Additional calculated values */
  [key: string]: number | string | undefined;
}

/**
 * Pattern resizer calculation input
 */
export interface PatternResizerInput {
  /** Selected template key */
  template_key: string;
  /** Original pattern gauge data */
  original_gauge: OriginalPatternGauge;
  /** New gauge data */
  new_gauge: NewGaugeData;
  /** Original pattern values */
  original_pattern_values: OriginalPatternValues;
  /** New dimension values */
  new_dimension_values: NewDimensionValues;
}

/**
 * Pattern resizer calculation result
 */
export interface PatternResizerResult {
  /** Success status */
  success: boolean;
  /** Calculated new values */
  calculated_new_values?: CalculatedNewValues;
  /** Warning messages */
  warnings?: string[];
  /** Error message if calculation failed */
  error?: string;
  /** Metadata about the calculation */
  metadata?: {
    /** Template used */
    template_used: string;
    /** Calculation timestamp */
    calculated_at: string;
    /** Whether shaping was involved */
    had_shaping: boolean;
  };
}

/**
 * API response for pattern resizer calculation
 */
export interface PatternResizerApiResponse {
  /** Success status */
  success: boolean;
  /** Calculation result data */
  data?: PatternResizerResult;
  /** Error message */
  error?: string;
}

/**
 * Form validation errors
 */
export interface PatternResizerFormErrors {
  /** Template selection errors */
  template_key?: string;
  /** Original gauge errors */
  original_gauge?: { [key: string]: string };
  /** New gauge errors */
  new_gauge?: { [key: string]: string };
  /** Original pattern values errors */
  original_pattern_values?: { [key: string]: string };
  /** New dimension values errors */
  new_dimension_values?: { [key: string]: string };
  /** General form errors */
  general?: string;
}

/**
 * Shaping calculation data for resizer
 */
export interface ResizerShapingData {
  /** Starting stitches for shaping */
  starting_stitches: number;
  /** Ending stitches for shaping */
  ending_stitches: number;
  /** Total rows for shaping */
  total_shaping_rows: number;
  /** Stitches changed per shaping event */
  stitches_per_event: number;
} 