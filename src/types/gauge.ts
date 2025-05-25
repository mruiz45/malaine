/**
 * Types for gauge (échantillon) management in the Malaine knitting/crochet assistant
 */

/**
 * Measurement unit for gauge calculations
 */
export type MeasurementUnit = 'cm' | 'inch';

/**
 * Complete gauge profile as stored in the database
 */
export interface GaugeProfile {
  id: string;
  user_id: string;
  profile_name: string;
  stitch_count: number;
  row_count: number;
  measurement_unit: MeasurementUnit;
  swatch_width: number;
  swatch_height: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new gauge profile
 */
export interface CreateGaugeProfile {
  profile_name: string;
  stitch_count: number;
  row_count: number;
  measurement_unit: MeasurementUnit;
  swatch_width?: number;
  swatch_height?: number;
  notes?: string;
}

/**
 * Data that can be updated in an existing gauge profile
 */
export interface UpdateGaugeProfile {
  profile_name?: string;
  stitch_count?: number;
  row_count?: number;
  measurement_unit?: MeasurementUnit;
  swatch_width?: number;
  swatch_height?: number;
  notes?: string;
}

/**
 * API response for gauge profile operations
 */
export interface GaugeProfileResponse {
  success: boolean;
  data?: GaugeProfile;
  error?: string;
}

/**
 * API response for multiple gauge profiles
 */
export interface GaugeProfilesResponse {
  success: boolean;
  data?: GaugeProfile[];
  error?: string;
}

/**
 * Form validation errors for gauge profile forms
 */
export interface GaugeProfileFormErrors {
  profile_name?: string;
  stitch_count?: string;
  row_count?: string;
  measurement_unit?: string;
  swatch_width?: string;
  swatch_height?: string;
  notes?: string;
} 