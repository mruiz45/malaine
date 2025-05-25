/**
 * Measurement Service - Handles all measurement set related API calls
 * Follows the established service pattern for the Malaine project
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */

import type { 
  MeasurementSet, 
  CreateMeasurementSet, 
  UpdateMeasurementSet, 
  MeasurementSetResponse, 
  MeasurementSetsResponse,
  MeasurementSetFormErrors,
  StandardMeasurements
} from '@/types/measurements';
import { STANDARD_MEASUREMENT_FIELDS } from '@/types/measurements';

/**
 * Fetches all measurement sets for the authenticated user
 * @returns Promise<MeasurementSet[]> Array of measurement sets
 * @throws Error if the request fails or user is not authenticated
 */
export async function getMeasurementSets(): Promise<MeasurementSet[]> {
  try {
    const response = await fetch('/api/measurement-sets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: MeasurementSetsResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch measurement sets');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getMeasurementSets:', error);
    throw error;
  }
}

/**
 * Fetches a specific measurement set by ID
 * @param id - The measurement set ID
 * @returns Promise<MeasurementSet> The measurement set
 * @throws Error if the request fails, set not found, or user is not authenticated
 */
export async function getMeasurementSet(id: string): Promise<MeasurementSet> {
  try {
    const response = await fetch(`/api/measurement-sets/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: MeasurementSetResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch measurement set');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getMeasurementSet:', error);
    throw error;
  }
}

/**
 * Creates a new measurement set
 * @param measurementData - The measurement set data to create
 * @returns Promise<MeasurementSet> The created measurement set
 * @throws Error if the request fails, validation fails, or user is not authenticated
 */
export async function createMeasurementSet(measurementData: CreateMeasurementSet): Promise<MeasurementSet> {
  try {
    const response = await fetch('/api/measurement-sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(measurementData),
    });

    const data: MeasurementSetResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create measurement set');
    }

    return data.data;
  } catch (error) {
    console.error('Error in createMeasurementSet:', error);
    throw error;
  }
}

/**
 * Updates an existing measurement set
 * @param id - The measurement set ID to update
 * @param updateData - The data to update
 * @returns Promise<MeasurementSet> The updated measurement set
 * @throws Error if the request fails, set not found, validation fails, or user is not authenticated
 */
export async function updateMeasurementSet(id: string, updateData: UpdateMeasurementSet): Promise<MeasurementSet> {
  try {
    const response = await fetch(`/api/measurement-sets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data: MeasurementSetResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update measurement set');
    }

    return data.data;
  } catch (error) {
    console.error('Error in updateMeasurementSet:', error);
    throw error;
  }
}

/**
 * Deletes a measurement set
 * @param id - The measurement set ID to delete
 * @returns Promise<void>
 * @throws Error if the request fails, set not found, or user is not authenticated
 */
export async function deleteMeasurementSet(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/measurement-sets/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete measurement set');
    }
  } catch (error) {
    console.error('Error in deleteMeasurementSet:', error);
    throw error;
  }
}

/**
 * Validates measurement set data before submission
 * @param data - The measurement set data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateMeasurementSetData(data: CreateMeasurementSet | UpdateMeasurementSet): MeasurementSetFormErrors {
  const errors: MeasurementSetFormErrors = {};

  // Validate set name (required for create, optional for update)
  if ('set_name' in data && data.set_name !== undefined) {
    if (!data.set_name || data.set_name.trim().length === 0) {
      errors.set_name = 'Set name is required';
    } else if (data.set_name.trim().length > 255) {
      errors.set_name = 'Set name must be 255 characters or less';
    }
  }

  // Validate measurement unit
  if (data.measurement_unit !== undefined) {
    if (!data.measurement_unit || !['cm', 'inch'].includes(data.measurement_unit)) {
      errors.measurement_unit = 'Measurement unit must be either "cm" or "inch"';
    }
  }

  // Validate standard measurements
  STANDARD_MEASUREMENT_FIELDS.forEach(field => {
    const value = data[field.key];
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors[field.key] = `${field.label} must be a valid number`;
      } else if (value <= 0) {
        errors[field.key] = `${field.label} must be a positive number`;
      } else if (field.min && value < field.min) {
        errors[field.key] = `${field.label} must be at least ${field.min}`;
      } else if (field.max && value > field.max) {
        errors[field.key] = `${field.label} must be less than ${field.max}`;
      }
    }
  });

  // Validate custom measurements
  if (data.custom_measurements) {
    for (const [key, value] of Object.entries(data.custom_measurements)) {
      if (typeof value !== 'number' || isNaN(value) || value <= 0) {
        errors.custom_measurements = `Custom measurement "${key}" must be a positive number`;
        break;
      }
      if (value > 999.99) {
        errors.custom_measurements = `Custom measurement "${key}" must be less than 1000`;
        break;
      }
    }
  }

  // Validate notes length
  if (data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less';
  }

  return errors;
}

/**
 * Checks if measurement set data has any validation errors
 * @param data - The measurement set data to validate
 * @returns boolean - true if data is valid, false if there are errors
 */
export function isMeasurementSetDataValid(data: CreateMeasurementSet | UpdateMeasurementSet): boolean {
  const errors = validateMeasurementSetData(data);
  return Object.keys(errors).length === 0;
}

/**
 * Converts measurement values between units (cm to inches or vice versa)
 * @param value - The measurement value to convert
 * @param fromUnit - The current unit ('cm' or 'inch')
 * @param toUnit - The target unit ('cm' or 'inch')
 * @returns number - The converted value
 */
export function convertMeasurementUnit(value: number, fromUnit: 'cm' | 'inch', toUnit: 'cm' | 'inch'): number {
  if (fromUnit === toUnit) {
    return value;
  }

  if (fromUnit === 'cm' && toUnit === 'inch') {
    return Math.round((value / 2.54) * 100) / 100; // Round to 2 decimal places
  }

  if (fromUnit === 'inch' && toUnit === 'cm') {
    return Math.round((value * 2.54) * 100) / 100; // Round to 2 decimal places
  }

  return value;
}

/**
 * Converts all measurements in a measurement set to a different unit
 * @param measurementSet - The measurement set to convert
 * @param targetUnit - The target unit ('cm' or 'inch')
 * @returns MeasurementSet - A new measurement set with converted values
 */
export function convertMeasurementSetUnit(measurementSet: MeasurementSet, targetUnit: 'cm' | 'inch'): MeasurementSet {
  if (measurementSet.measurement_unit === targetUnit) {
    return measurementSet;
  }

  const convertedSet: MeasurementSet = {
    ...measurementSet,
    measurement_unit: targetUnit
  };

  // Convert standard measurements
  STANDARD_MEASUREMENT_FIELDS.forEach(field => {
    const value = measurementSet[field.key];
    if (value !== undefined && value !== null) {
      convertedSet[field.key] = convertMeasurementUnit(value, measurementSet.measurement_unit, targetUnit);
    }
  });

  // Convert custom measurements
  if (measurementSet.custom_measurements) {
    const convertedCustom: { [key: string]: number } = {};
    for (const [key, value] of Object.entries(measurementSet.custom_measurements)) {
      convertedCustom[key] = convertMeasurementUnit(value, measurementSet.measurement_unit, targetUnit);
    }
    convertedSet.custom_measurements = convertedCustom;
  }

  return convertedSet;
}

/**
 * Gets a formatted display string for a measurement value with unit
 * @param value - The measurement value
 * @param unit - The measurement unit
 * @returns string - Formatted measurement string (e.g., "85.5 cm" or "33.7 in")
 */
export function formatMeasurement(value: number, unit: 'cm' | 'inch'): string {
  const unitDisplay = unit === 'cm' ? 'cm' : 'in';
  return `${value.toFixed(1)} ${unitDisplay}`;
} 