/**
 * Ease calculation utilities for the Malaine knitting/crochet assistant
 * Implements the calculation logic specified in User Story 1.3
 */

import type { EaseType, MeasurementUnit } from '@/types/ease';

/**
 * Calculates the final garment measurement with ease applied
 * @param bodyMeasurement - The body measurement in the specified unit
 * @param easeValue - The ease value to apply
 * @param easeType - The type of ease (absolute or percentage)
 * @returns The final garment measurement
 */
export function calculateFinalMeasurement(
  bodyMeasurement: number,
  easeValue: number,
  easeType: EaseType
): number {
  if (easeType === 'percentage') {
    return bodyMeasurement * (1 + easeValue / 100);
  } else {
    return bodyMeasurement + easeValue;
  }
}

/**
 * Calculates the ease value from body and garment measurements
 * @param bodyMeasurement - The body measurement
 * @param garmentMeasurement - The garment measurement
 * @param easeType - The type of ease to calculate
 * @returns The calculated ease value
 */
export function calculateEaseFromMeasurements(
  bodyMeasurement: number,
  garmentMeasurement: number,
  easeType: EaseType
): number {
  if (easeType === 'percentage') {
    return ((garmentMeasurement - bodyMeasurement) / bodyMeasurement) * 100;
  } else {
    return garmentMeasurement - bodyMeasurement;
  }
}

/**
 * Converts ease values between units (cm to inch or vice versa)
 * @param value - The ease value to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns The converted ease value
 */
export function convertEaseUnit(
  value: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit
): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'cm' && toUnit === 'inch') {
    return value / 2.54;
  } else if (fromUnit === 'inch' && toUnit === 'cm') {
    return value * 2.54;
  }
  
  return value;
}

/**
 * Validates that an ease value is within reasonable bounds
 * @param value - The ease value to validate
 * @param easeType - The type of ease
 * @returns True if the value is valid, false otherwise
 */
export function isValidEaseValue(value: number, easeType: EaseType): boolean {
  if (easeType === 'percentage') {
    // Allow -50% to +100% for percentage ease
    return value >= -50 && value <= 100;
  } else {
    // Allow -50 to +100 for absolute ease (in cm or inches)
    return value >= -50 && value <= 100;
  }
}

/**
 * Formats an ease value for display
 * @param value - The ease value
 * @param easeType - The type of ease
 * @param unit - The measurement unit (for absolute ease)
 * @returns Formatted string representation
 */
export function formatEaseValue(
  value: number,
  easeType: EaseType,
  unit?: MeasurementUnit
): string {
  const sign = value > 0 ? '+' : '';
  
  if (easeType === 'percentage') {
    return `${sign}${value.toFixed(1)}%`;
  } else {
    return `${sign}${value.toFixed(1)}${unit || 'cm'}`;
  }
}

/**
 * Calculates multiple ease values for different body parts
 * @param bodyMeasurements - Object with body measurements
 * @param easeValues - Object with ease values for each body part
 * @param easeType - The type of ease
 * @returns Object with final garment measurements
 */
export function calculateMultipleEaseMeasurements(
  bodyMeasurements: {
    bust?: number;
    waist?: number;
    hip?: number;
    sleeve?: number;
  },
  easeValues: {
    bust_ease?: number;
    waist_ease?: number;
    hip_ease?: number;
    sleeve_ease?: number;
  },
  easeType: EaseType
): {
  bust?: number;
  waist?: number;
  hip?: number;
  sleeve?: number;
} {
  const result: any = {};
  
  if (bodyMeasurements.bust !== undefined && easeValues.bust_ease !== undefined) {
    result.bust = calculateFinalMeasurement(bodyMeasurements.bust, easeValues.bust_ease, easeType);
  }
  
  if (bodyMeasurements.waist !== undefined && easeValues.waist_ease !== undefined) {
    result.waist = calculateFinalMeasurement(bodyMeasurements.waist, easeValues.waist_ease, easeType);
  }
  
  if (bodyMeasurements.hip !== undefined && easeValues.hip_ease !== undefined) {
    result.hip = calculateFinalMeasurement(bodyMeasurements.hip, easeValues.hip_ease, easeType);
  }
  
  if (bodyMeasurements.sleeve !== undefined && easeValues.sleeve_ease !== undefined) {
    result.sleeve = calculateFinalMeasurement(bodyMeasurements.sleeve, easeValues.sleeve_ease, easeType);
  }
  
  return result;
}

/**
 * Suggests appropriate ease values based on garment type
 * @param garmentType - The type of garment
 * @param unit - The measurement unit
 * @returns Suggested ease values
 */
export function suggestEaseValues(
  garmentType: 'sweater' | 'cardigan' | 'tank_top' | 'dress' | 'jacket',
  unit: MeasurementUnit = 'cm'
): {
  bust_ease: number;
  waist_ease: number;
  hip_ease: number;
  sleeve_ease: number;
} {
  const suggestions = {
    sweater: { bust: 5, waist: 3, hip: 3, sleeve: 2 },
    cardigan: { bust: 8, waist: 6, hip: 6, sleeve: 3 },
    tank_top: { bust: 0, waist: -2, hip: -2, sleeve: 0 },
    dress: { bust: 5, waist: 3, hip: 5, sleeve: 2 },
    jacket: { bust: 12, waist: 10, hip: 10, sleeve: 5 }
  };
  
  const baseSuggestion = suggestions[garmentType];
  
  // Convert to inches if needed
  if (unit === 'inch') {
    return {
      bust_ease: convertEaseUnit(baseSuggestion.bust, 'cm', 'inch'),
      waist_ease: convertEaseUnit(baseSuggestion.waist, 'cm', 'inch'),
      hip_ease: convertEaseUnit(baseSuggestion.hip, 'cm', 'inch'),
      sleeve_ease: convertEaseUnit(baseSuggestion.sleeve, 'cm', 'inch')
    };
  }
  
  return {
    bust_ease: baseSuggestion.bust,
    waist_ease: baseSuggestion.waist,
    hip_ease: baseSuggestion.hip,
    sleeve_ease: baseSuggestion.sleeve
  };
} 