/**
 * Ease Advisor Service - Handles ease advice API calls
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 * Follows the established service pattern for the Malaine project
 */

import type { 
  EaseAdviceRequest, 
  EaseAdviceResponse,
  EaseAdvisorFormErrors,
  GarmentCategory,
  FitPreference,
  YarnWeightCategory
} from '@/types/easeAdvisor';

/**
 * Gets ease advice based on garment category, fit preference, and optional yarn weight
 * @param request - The ease advice request parameters
 * @returns Promise<EaseAdviceResponse> The ease advice response
 * @throws Error if the request fails or validation fails
 */
export async function getEaseAdvice(request: EaseAdviceRequest): Promise<EaseAdviceResponse> {
  try {
    const response = await fetch('/api/tools/ease-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: EaseAdviceResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to get ease advice');
    }

    return data;
  } catch (error) {
    console.error('Error in getEaseAdvice:', error);
    throw error;
  }
}

/**
 * Validates ease advisor form data before submission
 * @param data - The ease advisor request data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateEaseAdvisorData(data: Partial<EaseAdviceRequest>): EaseAdvisorFormErrors {
  const errors: EaseAdvisorFormErrors = {};

  // Validate garment category (required)
  if (!data.garment_category || data.garment_category.trim().length === 0) {
    errors.garment_category = 'Garment category is required';
  } else {
    const validCategories: GarmentCategory[] = ['sweater', 'cardigan', 'hat', 'socks', 'shawl'];
    if (!validCategories.includes(data.garment_category as GarmentCategory)) {
      errors.garment_category = 'Invalid garment category';
    }
  }

  // Validate fit preference (required)
  if (!data.fit_preference || data.fit_preference.trim().length === 0) {
    errors.fit_preference = 'Fit preference is required';
  } else {
    const validFitPreferences: FitPreference[] = [
      'very_close_fitting', 
      'close_fitting', 
      'classic', 
      'relaxed', 
      'oversized'
    ];
    if (!validFitPreferences.includes(data.fit_preference as FitPreference)) {
      errors.fit_preference = 'Invalid fit preference';
    }
  }

  // Validate yarn weight category (optional, but if provided must be valid)
  if (data.yarn_weight_category && data.yarn_weight_category.trim().length > 0) {
    const validYarnWeights: YarnWeightCategory[] = [
      'fingering', 
      'sport', 
      'dk', 
      'worsted', 
      'bulky'
    ];
    if (!validYarnWeights.includes(data.yarn_weight_category as YarnWeightCategory)) {
      errors.yarn_weight_category = 'Invalid yarn weight category';
    }
  }

  return errors;
}

/**
 * Checks if the ease advisor form data is valid
 * @param data - The ease advisor request data to validate
 * @returns True if valid, false otherwise
 */
export function isEaseAdvisorDataValid(data: Partial<EaseAdviceRequest>): boolean {
  const errors = validateEaseAdvisorData(data);
  return Object.keys(errors).length === 0;
}

/**
 * Converts ease measurements from cm to inches
 * @param value - Value in centimeters
 * @returns Value in inches, rounded to 2 decimal places
 */
export function convertCmToInches(value: number): number {
  return Math.round((value / 2.54) * 100) / 100;
}

/**
 * Converts ease measurements from inches to cm
 * @param value - Value in inches
 * @returns Value in centimeters, rounded to 1 decimal place
 */
export function convertInchesToCm(value: number): number {
  return Math.round((value * 2.54) * 10) / 10;
}

/**
 * Formats ease range for display
 * @param min - Minimum ease value
 * @param max - Maximum ease value
 * @param recommended - Recommended ease value
 * @param unit - Unit of measurement ('cm' or 'inch')
 * @returns Formatted string for display
 */
export function formatEaseRange(
  min: number, 
  max: number, 
  recommended: number, 
  unit: 'cm' | 'inch' = 'cm'
): string {
  const unitSymbol = unit === 'cm' ? 'cm' : '"';
  
  if (min === max) {
    return `${min}${unitSymbol}`;
  }
  
  return `${min} to ${max}${unitSymbol} (recommended: ${recommended}${unitSymbol})`;
}

/**
 * Gets display-friendly garment category name
 * @param category - The garment category key
 * @returns Display name for the category
 */
export function getGarmentCategoryDisplayName(category: GarmentCategory): string {
  const displayNames: Record<GarmentCategory, string> = {
    sweater: 'Sweater',
    cardigan: 'Cardigan',
    hat: 'Hat',
    socks: 'Socks',
    shawl: 'Shawl'
  };
  
  return displayNames[category] || category;
}

/**
 * Gets display-friendly fit preference name
 * @param fitPreference - The fit preference key
 * @returns Display name for the fit preference
 */
export function getFitPreferenceDisplayName(fitPreference: FitPreference): string {
  const displayNames: Record<FitPreference, string> = {
    very_close_fitting: 'Very Close-fitting/Negative Ease',
    close_fitting: 'Close-fitting/Zero Ease',
    classic: 'Classic/Slightly Positive Ease',
    relaxed: 'Relaxed Fit',
    oversized: 'Oversized'
  };
  
  return displayNames[fitPreference] || fitPreference;
}

/**
 * Gets display-friendly yarn weight name
 * @param yarnWeight - The yarn weight category key
 * @returns Display name for the yarn weight
 */
export function getYarnWeightDisplayName(yarnWeight: YarnWeightCategory): string {
  const displayNames: Record<YarnWeightCategory, string> = {
    fingering: 'Fingering Weight',
    sport: 'Sport Weight',
    dk: 'DK Weight',
    worsted: 'Worsted Weight',
    bulky: 'Bulky Weight'
  };
  
  return displayNames[yarnWeight] || yarnWeight;
}

/**
 * Determines if a garment category typically uses specific ease measurements
 * @param category - The garment category
 * @param measurement - The ease measurement type
 * @returns True if the measurement is relevant for this garment category
 */
export function isRelevantMeasurement(
  category: GarmentCategory, 
  measurement: string
): boolean {
  const relevantMeasurements: Record<GarmentCategory, string[]> = {
    sweater: ['bust_ease', 'waist_ease', 'hip_ease', 'sleeve_ease'],
    cardigan: ['bust_ease', 'waist_ease', 'hip_ease', 'sleeve_ease'],
    hat: ['head_circumference'],
    socks: ['foot_circumference'],
    shawl: [] // Shawls typically don't require specific ease measurements
  };
  
  return relevantMeasurements[category]?.includes(measurement) || false;
} 