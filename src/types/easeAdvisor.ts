/**
 * Types for the Ease Selection Advisor tool
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 */

/**
 * Garment categories supported by the ease advisor
 */
export type GarmentCategory = 'sweater' | 'cardigan' | 'hat' | 'socks' | 'shawl';

/**
 * Fit preferences for garments
 */
export type FitPreference = 
  | 'very_close_fitting'  // Very Close-fitting/Negative Ease
  | 'close_fitting'       // Close-fitting/Zero Ease
  | 'classic'             // Classic/Slightly Positive Ease
  | 'relaxed'             // Relaxed Fit
  | 'oversized';          // Oversized

/**
 * Yarn weight categories
 */
export type YarnWeightCategory = 'fingering' | 'sport' | 'dk' | 'worsted' | 'bulky';

/**
 * Measurement unit for display
 */
export type MeasurementUnit = 'cm' | 'inch';

/**
 * Ease measurement types for different garment areas
 */
export interface EaseMeasurement {
  min: number;
  max: number;
  recommended: number;
}

/**
 * Advised ease values for different body areas
 */
export interface AdvisedEase {
  bust_ease?: EaseMeasurement;
  waist_ease?: EaseMeasurement;
  hip_ease?: EaseMeasurement;
  sleeve_ease?: EaseMeasurement;
  head_circumference?: EaseMeasurement;
  foot_circumference?: EaseMeasurement;
}

/**
 * Ease advice rule structure
 */
export interface EaseAdviceRule {
  id: string;
  garment_category: GarmentCategory;
  fit_preference: FitPreference;
  yarn_weight_categories?: YarnWeightCategory[];
  advised_ease: AdvisedEase;
  explanation: string;
  priority?: number; // Higher priority rules are preferred when multiple match
}

/**
 * Request payload for getting ease advice
 */
export interface EaseAdviceRequest {
  garment_category: GarmentCategory;
  fit_preference: FitPreference;
  yarn_weight_category?: YarnWeightCategory;
  display_unit?: MeasurementUnit;
}

/**
 * Response from the ease advice API
 */
export interface EaseAdviceResponse {
  success: boolean;
  data?: {
    advised_ease: AdvisedEase;
    explanation: string;
    display_unit: MeasurementUnit;
    is_fallback?: boolean; // Indicates if a general rule was used
  };
  error?: string;
}

/**
 * Configuration option for dropdowns
 */
export interface ConfigOption {
  value: string;
  label: string;
}

/**
 * Configuration data for the ease advisor tool
 */
export interface EaseAdvisorConfig {
  garment_categories: Array<{
    value: GarmentCategory;
    label: string;
  }>;
  fit_preferences: Array<{
    value: FitPreference;
    label: string;
  }>;
  yarn_weight_categories: Array<{
    value: YarnWeightCategory;
    label: string;
  }>;
}

/**
 * Validation errors for the ease advisor form
 */
export interface EaseAdvisorFormErrors {
  garment_category?: string;
  fit_preference?: string;
  yarn_weight_category?: string;
  display_unit?: string;
}

/**
 * Form data for the ease advisor
 */
export interface EaseAdvisorFormData {
  garment_category: GarmentCategory | '';
  fit_preference: FitPreference | '';
  yarn_weight_category: YarnWeightCategory | '';
  display_unit: MeasurementUnit;
}

/**
 * Application data structure for applying suggestions to ease preferences
 */
export interface EaseApplicationData {
  bust_ease?: number;
  waist_ease?: number;
  hip_ease?: number;
  sleeve_ease?: number;
  measurement_unit: MeasurementUnit;
} 