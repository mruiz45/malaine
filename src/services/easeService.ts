/**
 * Ease Service - Handles all ease preference related API calls
 * Follows the established service pattern for the Malaine project
 */

import type { 
  EasePreference, 
  CreateEasePreference, 
  UpdateEasePreference, 
  EasePreferenceResponse, 
  EasePreferencesResponse 
} from '@/types/ease';

/**
 * Fetches all ease preferences for the authenticated user
 * @returns Promise<EasePreference[]> Array of ease preferences
 * @throws Error if the request fails or user is not authenticated
 */
export async function getEasePreferences(): Promise<EasePreference[]> {
  try {
    const response = await fetch('/api/ease-preferences', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: EasePreferencesResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch ease preferences');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getEasePreferences:', error);
    throw error;
  }
}

/**
 * Fetches a specific ease preference by ID
 * @param id - The ease preference ID
 * @returns Promise<EasePreference> The ease preference
 * @throws Error if the request fails, preference not found, or user is not authenticated
 */
export async function getEasePreference(id: string): Promise<EasePreference> {
  try {
    const response = await fetch(`/api/ease-preferences/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: EasePreferenceResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch ease preference');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getEasePreference:', error);
    throw error;
  }
}

/**
 * Creates a new ease preference
 * @param easeData - The ease preference data to create
 * @returns Promise<EasePreference> The created ease preference
 * @throws Error if the request fails, validation fails, or user is not authenticated
 */
export async function createEasePreference(easeData: CreateEasePreference): Promise<EasePreference> {
  try {
    const response = await fetch('/api/ease-preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(easeData),
    });

    const data: EasePreferenceResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create ease preference');
    }

    return data.data;
  } catch (error) {
    console.error('Error in createEasePreference:', error);
    throw error;
  }
}

/**
 * Updates an existing ease preference
 * @param id - The ease preference ID to update
 * @param updateData - The data to update
 * @returns Promise<EasePreference> The updated ease preference
 * @throws Error if the request fails, preference not found, validation fails, or user is not authenticated
 */
export async function updateEasePreference(id: string, updateData: UpdateEasePreference): Promise<EasePreference> {
  try {
    const response = await fetch(`/api/ease-preferences/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data: EasePreferenceResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update ease preference');
    }

    return data.data;
  } catch (error) {
    console.error('Error in updateEasePreference:', error);
    throw error;
  }
}

/**
 * Deletes an ease preference
 * @param id - The ease preference ID to delete
 * @returns Promise<void>
 * @throws Error if the request fails, preference not found, or user is not authenticated
 */
export async function deleteEasePreference(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/ease-preferences/${id}`, {
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
      throw new Error(data.error || 'Failed to delete ease preference');
    }
  } catch (error) {
    console.error('Error in deleteEasePreference:', error);
    throw error;
  }
}

/**
 * Validates ease preference data before submission
 * @param data - The ease preference data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateEasePreferenceData(data: CreateEasePreference | UpdateEasePreference): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  // Validate preference name (required for create, optional for update)
  if ('preference_name' in data && data.preference_name !== undefined) {
    if (!data.preference_name || data.preference_name.trim().length === 0) {
      errors.preference_name = 'Preference name is required';
    } else if (data.preference_name.trim().length > 255) {
      errors.preference_name = 'Preference name must be 255 characters or less';
    }
  }

  // Validate ease type
  if (data.ease_type !== undefined) {
    if (!data.ease_type || !['absolute', 'percentage'].includes(data.ease_type)) {
      errors.ease_type = 'Valid ease type is required (absolute or percentage)';
    }
  }

  // Validate measurement unit for absolute ease
  if (data.ease_type === 'absolute' && data.measurement_unit !== undefined) {
    if (data.measurement_unit && !['cm', 'inch'].includes(data.measurement_unit)) {
      errors.measurement_unit = 'Valid measurement unit is required for absolute ease (cm or inch)';
    }
  }

  // Validate ease values
  const easeFields = [
    { key: 'bust_ease', label: 'Bust ease' },
    { key: 'waist_ease', label: 'Waist ease' },
    { key: 'hip_ease', label: 'Hip ease' },
    { key: 'sleeve_ease', label: 'Sleeve ease' }
  ] as const;

  for (const field of easeFields) {
    const value = data[field.key];
    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors[field.key] = `${field.label} must be a valid number`;
      } else {
        // Validate range based on ease type
        if (data.ease_type === 'percentage') {
          if (value < -50 || value > 100) {
            errors[field.key] = `${field.label} percentage must be between -50% and 100%`;
          }
        } else {
          if (value < -50 || value > 100) {
            errors[field.key] = `${field.label} must be between -50 and 100`;
          }
        }
      }
    }
  }

  // Validate notes length
  if (data.notes !== undefined && data.notes !== null && data.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less';
  }

  return errors;
}

/**
 * Calculates the final garment measurement with ease applied
 * @param bodyMeasurement - The body measurement
 * @param easeValue - The ease value to apply
 * @param easeType - The type of ease (absolute or percentage)
 * @returns The final garment measurement
 */
export function calculateFinalMeasurement(
  bodyMeasurement: number,
  easeValue: number,
  easeType: 'absolute' | 'percentage'
): number {
  if (easeType === 'percentage') {
    return bodyMeasurement * (1 + easeValue / 100);
  } else {
    return bodyMeasurement + easeValue;
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
  fromUnit: 'cm' | 'inch',
  toUnit: 'cm' | 'inch'
): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'cm' && toUnit === 'inch') {
    return value / 2.54;
  } else if (fromUnit === 'inch' && toUnit === 'cm') {
    return value * 2.54;
  }
  
  return value;
} 