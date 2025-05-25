/**
 * Types for ease preferences management in the Malaine knitting/crochet assistant
 * Corresponds to User Story 1.3 - Ease (Aisance) Preference Input and Management
 */

/**
 * Ease type - absolute values or percentage
 */
export type EaseType = 'absolute' | 'percentage';

/**
 * Measurement unit for absolute ease values
 */
export type MeasurementUnit = 'cm' | 'inch';

/**
 * Predefined ease categories with their typical values
 */
export interface EaseCategory {
  key: string;
  label: string;
  description: string;
  values: {
    bust_ease: number;
    waist_ease: number;
    hip_ease: number;
    sleeve_ease: number;
  };
  ease_type: EaseType;
  measurement_unit?: MeasurementUnit; // Only for absolute ease
}

/**
 * Complete ease preference as stored in the database
 */
export interface EasePreference {
  id: string;
  user_id: string;
  preference_name: string;
  ease_type: EaseType;
  bust_ease?: number;
  waist_ease?: number;
  hip_ease?: number;
  sleeve_ease?: number;
  measurement_unit?: MeasurementUnit;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create a new ease preference
 */
export interface CreateEasePreference {
  preference_name: string;
  ease_type: EaseType;
  bust_ease?: number;
  waist_ease?: number;
  hip_ease?: number;
  sleeve_ease?: number;
  measurement_unit?: MeasurementUnit;
  notes?: string;
}

/**
 * Data that can be updated in an existing ease preference
 */
export interface UpdateEasePreference {
  preference_name?: string;
  ease_type?: EaseType;
  bust_ease?: number;
  waist_ease?: number;
  hip_ease?: number;
  sleeve_ease?: number;
  measurement_unit?: MeasurementUnit;
  notes?: string;
}

/**
 * API response for ease preference operations
 */
export interface EasePreferenceResponse {
  success: boolean;
  data?: EasePreference;
  error?: string;
}

/**
 * API response for multiple ease preferences
 */
export interface EasePreferencesResponse {
  success: boolean;
  data?: EasePreference[];
  error?: string;
}

/**
 * Form validation errors for ease preference forms
 */
export interface EasePreferenceFormErrors {
  preference_name?: string;
  ease_type?: string;
  bust_ease?: string;
  waist_ease?: string;
  hip_ease?: string;
  sleeve_ease?: string;
  measurement_unit?: string;
  notes?: string;
}

/**
 * Predefined ease categories for common garment fits
 */
export const EASE_CATEGORIES: EaseCategory[] = [
  {
    key: 'negative_ease',
    label: 'Negative Ease',
    description: 'Tight-fitting garment, smaller than body measurements',
    values: {
      bust_ease: -5,
      waist_ease: -3,
      hip_ease: -3,
      sleeve_ease: -2
    },
    ease_type: 'absolute',
    measurement_unit: 'cm'
  },
  {
    key: 'zero_ease',
    label: 'Zero Ease',
    description: 'Garment matches body measurements exactly',
    values: {
      bust_ease: 0,
      waist_ease: 0,
      hip_ease: 0,
      sleeve_ease: 0
    },
    ease_type: 'absolute',
    measurement_unit: 'cm'
  },
  {
    key: 'classic_fit',
    label: 'Classic Fit',
    description: 'Traditional comfortable fit with moderate ease',
    values: {
      bust_ease: 5,
      waist_ease: 3,
      hip_ease: 3,
      sleeve_ease: 2
    },
    ease_type: 'absolute',
    measurement_unit: 'cm'
  },
  {
    key: 'relaxed_fit',
    label: 'Relaxed Fit',
    description: 'Comfortable loose fit',
    values: {
      bust_ease: 10,
      waist_ease: 8,
      hip_ease: 8,
      sleeve_ease: 5
    },
    ease_type: 'absolute',
    measurement_unit: 'cm'
  },
  {
    key: 'oversized',
    label: 'Oversized',
    description: 'Very loose, trendy oversized fit',
    values: {
      bust_ease: 15,
      waist_ease: 12,
      hip_ease: 12,
      sleeve_ease: 8
    },
    ease_type: 'absolute',
    measurement_unit: 'cm'
  }
];

/**
 * Ease field definition for form generation
 */
export interface EaseField {
  key: keyof Pick<EasePreference, 'bust_ease' | 'waist_ease' | 'hip_ease' | 'sleeve_ease'>;
  label: string;
  description?: string;
  min?: number;
  max?: number;
}

/**
 * Ease fields configuration
 */
export const EASE_FIELDS: EaseField[] = [
  {
    key: 'bust_ease',
    label: 'Bust/Chest Ease',
    description: 'Extra room around the bust/chest area',
    min: -20,
    max: 50
  },
  {
    key: 'waist_ease',
    label: 'Waist Ease',
    description: 'Extra room around the waist',
    min: -15,
    max: 40
  },
  {
    key: 'hip_ease',
    label: 'Hip Ease',
    description: 'Extra room around the hips',
    min: -15,
    max: 40
  },
  {
    key: 'sleeve_ease',
    label: 'Sleeve Ease',
    description: 'Extra room in the sleeves',
    min: -10,
    max: 30
  }
]; 