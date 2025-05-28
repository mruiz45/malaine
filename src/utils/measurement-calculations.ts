/**
 * Measurement calculation utilities for Pattern Calculation Engine (US_6.1)
 * Provides functions to apply ease to body measurements and calculate finished garment dimensions
 */

import { CalculationMeasurements } from '@/types/pattern-calculation';
import { MeasurementSet } from '@/types/measurements';
import { EasePreference } from '@/types/ease';

/**
 * Ease application result
 */
export interface EaseApplicationResult {
  /** Success status */
  success: boolean;
  /** Calculated finished measurements */
  finishedMeasurements?: CalculationMeasurements;
  /** Errors during calculation */
  errors?: string[];
  /** Warnings during calculation */
  warnings?: string[];
}

/**
 * Ease values for different measurement types
 */
export interface EaseValues {
  /** Ease for chest/bust measurement */
  chest: number;
  /** Ease for waist measurement */
  waist?: number;
  /** Ease for hip measurement */
  hip?: number;
  /** Ease for length measurement */
  length?: number;
  /** Ease for arm length */
  armLength?: number;
  /** Ease for upper arm circumference */
  upperArm?: number;
  /** Ease for shoulder width */
  shoulder?: number;
  /** Ease for neck circumference */
  neck?: number;
  /** Unit for ease values */
  unit: string;
}

/**
 * Applies ease to body measurements to calculate finished garment dimensions
 * @param bodyMeasurements - Raw body measurements
 * @param easePreference - User's ease preferences
 * @param garmentType - Type of garment (affects default ease values)
 * @returns Finished measurements with ease applied
 */
export function applyEaseToMeasurements(
  bodyMeasurements: MeasurementSet,
  easePreference: EasePreference,
  garmentType: string = 'sweater'
): EaseApplicationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Extract ease values from preference
    const easeValues = extractEaseValues(easePreference, garmentType);
    
    // Validate body measurements - check if we have at least chest and length measurements
    if (!bodyMeasurements.chest_circumference && !bodyMeasurements.torso_length) {
      errors.push('Missing essential body measurements (chest circumference and torso length)');
      return { success: false, errors };
    }

    // Calculate finished measurements
    const finishedMeasurements: CalculationMeasurements = {
      finishedChestCircumference: calculateFinishedMeasurement(
        bodyMeasurements.chest_circumference,
        easeValues.chest,
        'chest circumference'
      ),
      finishedLength: calculateFinishedMeasurement(
        bodyMeasurements.torso_length,
        easeValues.length || 0,
        'garment length'
      )
    };

    // Add optional measurements if available
    if (bodyMeasurements.waist_circumference) {
      finishedMeasurements.finishedWaistCircumference = calculateFinishedMeasurement(
        bodyMeasurements.waist_circumference,
        easeValues.waist || easeValues.chest,
        'waist circumference'
      );
    }

    if (bodyMeasurements.hip_circumference) {
      finishedMeasurements.finishedHipCircumference = calculateFinishedMeasurement(
        bodyMeasurements.hip_circumference,
        easeValues.hip || easeValues.chest,
        'hip circumference'
      );
    }

    if (bodyMeasurements.shoulder_width) {
      finishedMeasurements.finishedShoulderWidth = calculateFinishedMeasurement(
        bodyMeasurements.shoulder_width,
        easeValues.shoulder || 0,
        'shoulder width'
      );
    }

    if (bodyMeasurements.arm_length) {
      finishedMeasurements.finishedArmLength = calculateFinishedMeasurement(
        bodyMeasurements.arm_length,
        easeValues.armLength || 0,
        'arm length'
      );
    }

    // Note: upper_arm_circumference is not in StandardMeasurements, so we'll skip it for now
    // This could be added as a custom measurement if needed

    if (bodyMeasurements.neck_circumference) {
      finishedMeasurements.finishedNeckCircumference = calculateFinishedMeasurement(
        bodyMeasurements.neck_circumference,
        easeValues.neck || 0,
        'neck circumference'
      );
    }

    // Add any custom measurements
    if (bodyMeasurements.custom_measurements) {
      const additionalMeasurements: Record<string, number> = {};
      Object.entries(bodyMeasurements.custom_measurements).forEach(([key, value]) => {
        if (typeof value === 'number') {
          additionalMeasurements[`finished_${key}`] = value;
        }
      });
      
      if (Object.keys(additionalMeasurements).length > 0) {
        finishedMeasurements.additionalMeasurements = additionalMeasurements;
      }
    }

    // Validate finished measurements
    const validationResult = validateFinishedMeasurements(finishedMeasurements);
    warnings.push(...validationResult.warnings);
    errors.push(...validationResult.errors);

    return {
      success: errors.length === 0,
      finishedMeasurements,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    errors.push(`Error applying ease: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, errors };
  }
}

/**
 * Extracts ease values from ease preference
 */
function extractEaseValues(easePreference: EasePreference, garmentType: string): EaseValues {
  const baseEase = easePreference.bust_ease || 0;
  const unit = easePreference.measurement_unit || 'cm';

  // Default ease values based on garment type
  const defaultEaseMultipliers = getDefaultEaseMultipliers(garmentType);

  return {
    chest: baseEase,
    waist: (easePreference.waist_ease !== undefined) ? easePreference.waist_ease : baseEase * defaultEaseMultipliers.waist,
    hip: (easePreference.hip_ease !== undefined) ? easePreference.hip_ease : baseEase * defaultEaseMultipliers.hip,
    length: baseEase * defaultEaseMultipliers.length,
    armLength: baseEase * defaultEaseMultipliers.armLength,
    upperArm: (easePreference.sleeve_ease !== undefined) ? easePreference.sleeve_ease : baseEase * defaultEaseMultipliers.upperArm,
    shoulder: baseEase * defaultEaseMultipliers.shoulder,
    neck: baseEase * defaultEaseMultipliers.neck,
    unit
  };
}

/**
 * Gets default ease multipliers for different garment types
 */
function getDefaultEaseMultipliers(garmentType: string): Record<string, number> {
  const multipliers: Record<string, Record<string, number>> = {
    sweater: {
      waist: 1.0,
      hip: 1.0,
      length: 0.0,
      armLength: 0.0,
      upperArm: 0.5,
      shoulder: 0.2,
      neck: 0.0
    },
    cardigan: {
      waist: 1.2,
      hip: 1.2,
      length: 0.0,
      armLength: 0.0,
      upperArm: 0.6,
      shoulder: 0.3,
      neck: 0.0
    },
    vest: {
      waist: 0.8,
      hip: 0.8,
      length: 0.0,
      armLength: 0.0,
      upperArm: 0.0,
      shoulder: 0.1,
      neck: 0.0
    }
  };

  return multipliers[garmentType] || multipliers.sweater;
}

/**
 * Calculates a finished measurement by applying ease
 */
function calculateFinishedMeasurement(
  bodyMeasurement: number | undefined,
  ease: number,
  measurementName: string
): number {
  if (!bodyMeasurement || bodyMeasurement <= 0) {
    throw new Error(`Invalid ${measurementName}: ${bodyMeasurement}`);
  }

  return bodyMeasurement + ease;
}

/**
 * Checks if a measurement key is a standard measurement
 */
function isStandardMeasurement(key: string): boolean {
  const standardMeasurements = [
    'chest_circumference',
    'bust_circumference',
    'waist_circumference',
    'hip_circumference',
    'torso_length',
    'body_length',
    'shoulder_width',
    'arm_length',
    'upper_arm_circumference',
    'neck_circumference'
  ];

  return standardMeasurements.includes(key);
}

/**
 * Validates finished measurements for reasonableness
 */
function validateFinishedMeasurements(measurements: CalculationMeasurements): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check chest circumference
  if (measurements.finishedChestCircumference < 50) {
    warnings.push(`Very small chest circumference: ${measurements.finishedChestCircumference}cm`);
  } else if (measurements.finishedChestCircumference > 200) {
    warnings.push(`Very large chest circumference: ${measurements.finishedChestCircumference}cm`);
  }

  // Check garment length
  if (measurements.finishedLength < 30) {
    warnings.push(`Very short garment length: ${measurements.finishedLength}cm`);
  } else if (measurements.finishedLength > 120) {
    warnings.push(`Very long garment length: ${measurements.finishedLength}cm`);
  }

  // Check proportions
  if (measurements.finishedWaistCircumference && measurements.finishedChestCircumference) {
    const waistToChestRatio = measurements.finishedWaistCircumference / measurements.finishedChestCircumference;
    if (waistToChestRatio > 1.2) {
      warnings.push('Waist measurement is significantly larger than chest measurement');
    } else if (waistToChestRatio < 0.6) {
      warnings.push('Waist measurement is significantly smaller than chest measurement');
    }
  }

  return { errors, warnings };
}

/**
 * Converts measurements between units
 * @param value - Value to convert
 * @param fromUnit - Source unit
 * @param toUnit - Target unit
 * @returns Converted value
 */
export function convertMeasurementUnit(value: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) {
    return value;
  }

  // Convert to cm first
  let valueInCm = value;
  if (fromUnit === 'inches') {
    valueInCm = value * 2.54;
  }

  // Convert from cm to target unit
  if (toUnit === 'inches') {
    return valueInCm / 2.54;
  }

  return valueInCm;
}

/**
 * Formats a measurement value for display
 * @param value - Measurement value
 * @param unit - Unit of measurement
 * @param precision - Decimal places
 * @returns Formatted string
 */
export function formatMeasurement(value: number, unit: string, precision: number = 1): string {
  return `${value.toFixed(precision)}${unit}`;
} 