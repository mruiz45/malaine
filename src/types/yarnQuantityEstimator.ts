/**
 * Types for Yarn Quantity Estimator Tool (US_2.2)
 * Provides types for estimating yarn requirements based on gauge, yarn, and project specifications
 */

import type { GaugeProfile } from './gauge';
import type { YarnProfile, YarnWeightCategory } from './yarn';

/**
 * Available project types for estimation
 */
export type ProjectType = 
  | 'scarf'
  | 'baby_blanket'
  | 'simple_hat'
  | 'adult_sweater';

/**
 * Available garment sizes for predefined projects
 */
export type GarmentSize = 'S' | 'M' | 'L' | 'XL';

/**
 * Measurement units for dimensions
 */
export type DimensionUnit = 'cm' | 'inch';

/**
 * Project dimensions for custom-sized projects
 */
export interface ProjectDimensions {
  width: number;
  length: number;
  unit: DimensionUnit;
}

/**
 * Gauge information for estimation (can be from profile or direct input)
 */
export interface EstimationGaugeInfo {
  stitch_count: number;
  row_count: number;
  measurement_unit: DimensionUnit;
  swatch_width: number;
  swatch_height: number;
}

/**
 * Yarn information for estimation (can be from profile or direct input)
 */
export interface EstimationYarnInfo {
  yarn_weight_category?: YarnWeightCategory;
  skein_meterage?: number;
  skein_weight_grams?: number;
}

/**
 * Input data for yarn quantity estimation
 */
export interface YarnQuantityEstimationInput {
  // Gauge information
  gauge_profile_id?: string;
  gauge_info?: EstimationGaugeInfo;
  
  // Yarn information
  yarn_profile_id?: string;
  yarn_info?: EstimationYarnInfo;
  
  // Project specifications
  project_type: ProjectType;
  dimensions?: ProjectDimensions;
  garment_size?: GarmentSize;
}

/**
 * Calculated yarn quantity results
 */
export interface YarnQuantityEstimation {
  // Total yarn requirements
  total_length_meters: number;
  total_weight_grams: number;
  number_of_skeins: number;
  
  // Calculation details
  surface_area_m2: number;
  yarn_factor_used: number;
  buffer_percentage: number;
  
  // Source information
  calculation_method: 'area_based' | 'fixed_yardage';
  yarn_weight_category_used?: YarnWeightCategory;
}

/**
 * API request for yarn quantity estimation
 */
export interface YarnQuantityEstimationRequest {
  input: YarnQuantityEstimationInput;
}

/**
 * API response for yarn quantity estimation
 */
export interface YarnQuantityEstimationResponse {
  success: boolean;
  data?: YarnQuantityEstimation;
  error?: string;
}

/**
 * Project type configuration for calculations
 */
export interface ProjectTypeConfig {
  project_type_key: ProjectType;
  estimation_method: 'area_based' | 'fixed_yardage';
  requires_dimensions: boolean;
  requires_size: boolean;
  predefined_surface_areas?: Record<GarmentSize, number>; // in m²
  default_dimensions?: ProjectDimensions;
}

/**
 * Yarn consumption factors by weight category (meters per m²)
 */
export interface YarnConsumptionFactors {
  [key: string]: number; // YarnWeightCategory -> meters per m²
}

/**
 * Complete estimation context with resolved data
 */
export interface EstimationContext {
  gauge: EstimationGaugeInfo;
  yarn: EstimationYarnInfo;
  project_config: ProjectTypeConfig;
  surface_area_m2: number;
  yarn_factor: number;
}

/**
 * Validation errors for estimation input
 */
export interface EstimationValidationErrors {
  gauge_profile_id?: string;
  gauge_info?: string;
  yarn_profile_id?: string;
  yarn_info?: string;
  project_type?: string;
  dimensions?: string;
  garment_size?: string;
  general?: string;
}

/**
 * Formatted estimation results for display
 */
export interface FormattedEstimationResults {
  totalLength: {
    meters: number;
    yards: number;
  };
  totalWeight: {
    grams: number;
    ounces: number;
  };
  numberOfSkeins: number;
  surfaceArea: number;
  bufferPercentage: number;
  calculationMethod?: string;
  yarnWeightUsed?: string;
} 