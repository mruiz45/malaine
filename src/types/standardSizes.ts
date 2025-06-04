/**
 * Types for Standard Size Charts (PD_PH2_US004)
 * Defines interfaces for standard sizing system integration
 */

import { GarmentType } from './pattern';

/**
 * Available regions for size charts
 */
export type SizeRegion = 'EU' | 'US' | 'UK' | 'JP' | 'INTL';

/**
 * Available age categories
 */
export type AgeCategory = 'Adult' | 'Child' | 'Baby' | 'Teen';

/**
 * Available target groups
 */
export type TargetGroup = 'Women' | 'Men' | 'Unisex';

/**
 * Measurement mode for the measurements section
 */
export type MeasurementMode = 'custom' | 'standard';

/**
 * Standard size chart definition
 */
export interface StandardSizeChart {
  size_chart_id: string;
  chart_name: string;
  region: SizeRegion;
  age_category: AgeCategory;
  target_group: TargetGroup;
  garment_types: GarmentType[];
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Individual standard size with measurements
 */
export interface StandardSize {
  standard_size_id: string;
  size_chart_id: string;
  size_name: string;
  size_label?: string;
  sort_order: number;
  
  // Core measurements (matching MeasurementsData structure)
  chest_circumference_cm?: number;
  body_length_cm?: number;
  sleeve_length_cm?: number;
  shoulder_width_cm?: number;
  armhole_depth_cm?: number;
  
  // Hat specific
  head_circumference_cm?: number;
  hat_height_cm?: number;
  
  // Scarf specific
  scarf_length_cm?: number;
  scarf_width_cm?: number;
  
  // Common measurements
  length_cm?: number;
  width_cm?: number;
  
  // Additional measurements
  additional_measurements?: Record<string, number>;
  
  created_at?: string;
  updated_at?: string;
}

/**
 * Filter options for size chart selection
 */
export interface SizeChartFilters {
  age_categories: AgeCategory[];
  target_groups: TargetGroup[];
  regions: SizeRegion[];
}

/**
 * Applied filters for size chart search
 */
export interface AppliedSizeFilters {
  garment_type?: GarmentType;
  age_category?: AgeCategory;
  target_group?: TargetGroup;
  region?: SizeRegion;
}

/**
 * Size chart search result
 */
export interface SizeChartSearchResult {
  charts: StandardSizeChart[];
  total_count: number;
}

/**
 * Size search result for a specific chart
 */
export interface SizeSearchResult {
  sizes: StandardSize[];
  chart: StandardSizeChart;
  total_count: number;
}

/**
 * Measurements extracted from a standard size
 */
export interface StandardSizeMeasurements {
  // Common measurements
  length?: number;
  width?: number;
  
  // Sweater/Cardigan specific
  chestCircumference?: number;
  bodyLength?: number;
  sleeveLength?: number;
  shoulderWidth?: number;
  armholeDepth?: number;
  
  // Hat specific
  headCircumference?: number;
  hatHeight?: number;
  
  // Scarf specific
  scarfLength?: number;
  scarfWidth?: number;
}

/**
 * API response for size filters
 */
export interface SizeFiltersResponse {
  success: boolean;
  data?: SizeChartFilters;
  error?: string;
}

/**
 * API response for size charts
 */
export interface SizeChartsResponse {
  success: boolean;
  data?: SizeChartSearchResult;
  error?: string;
}

/**
 * API response for size measurements
 */
export interface SizeMeasurementsResponse {
  success: boolean;
  data?: {
    size: StandardSize;
    measurements: StandardSizeMeasurements;
  };
  error?: string;
}

/**
 * UI state for standard size selection
 */
export interface StandardSizeSelectionState {
  mode: MeasurementMode;
  filters: AppliedSizeFilters;
  availableFilters?: SizeChartFilters;
  availableCharts: StandardSizeChart[];
  availableSizes: StandardSize[];
  selectedChart?: StandardSizeChart;
  selectedSize?: StandardSize;
  isLoading: boolean;
  error?: string;
}

/**
 * Helper function to map standard size measurements to pattern measurements
 */
export function mapStandardSizeToMeasurements(size: StandardSize): StandardSizeMeasurements {
  return {
    // Map database fields to pattern measurement fields
    length: size.length_cm || undefined,
    width: size.width_cm || undefined,
    chestCircumference: size.chest_circumference_cm || undefined,
    bodyLength: size.body_length_cm || undefined,
    sleeveLength: size.sleeve_length_cm || undefined,
    shoulderWidth: size.shoulder_width_cm || undefined,
    armholeDepth: size.armhole_depth_cm || undefined,
    headCircumference: size.head_circumference_cm || undefined,
    hatHeight: size.hat_height_cm || undefined,
    scarfLength: size.scarf_length_cm || undefined,
    scarfWidth: size.scarf_width_cm || undefined,
  };
}

/**
 * Helper function to format size label for display
 */
export function formatSizeLabel(size: StandardSize): string {
  return size.size_label || size.size_name;
}

/**
 * Helper function to get chart display name
 */
export function getChartDisplayName(chart: StandardSizeChart): string {
  return `${chart.target_group} - ${chart.region} - ${chart.age_category}`;
} 