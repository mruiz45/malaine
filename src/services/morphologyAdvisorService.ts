/**
 * Morphology Advisor Service
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 * 
 * Handles client-side business logic for morphology advice
 */

import type {
  MorphologyCharacteristic,
  MorphologyAdvisory,
  MorphologyAdviceRequest,
  MorphologyAdviceResponse,
  MorphologyAdvisoryResponse,
  MorphologyAdvisorFormErrors
} from '@/types/morphologyAdvisor';

import { MORPHOLOGY_CHARACTERISTICS } from '@/types/morphologyAdvisor';

/**
 * Gets morphology advice for selected characteristics
 * @param characteristics - Array of selected morphology characteristics
 * @returns Promise with morphology advice response
 */
export async function getMorphologyAdvice(
  characteristics: MorphologyCharacteristic[]
): Promise<MorphologyAdviceResponse> {
  try {
    const request: MorphologyAdviceRequest = {
      morphology_characteristics: characteristics
    };

    const response = await fetch('/api/morphology-advisories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MorphologyAdviceResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('Error getting morphology advice:', error);
    return {
      success: false,
      error: error.message || 'Failed to get morphology advice'
    };
  }
}

/**
 * Gets a specific morphology advisory by key
 * @param morphologyKey - The morphology characteristic key
 * @returns Promise with single morphology advisory response
 */
export async function getMorphologyAdvisory(
  morphologyKey: MorphologyCharacteristic
): Promise<MorphologyAdvisoryResponse> {
  try {
    const response = await fetch(`/api/morphology-advisories/${morphologyKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MorphologyAdvisoryResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('Error getting morphology advisory:', error);
    return {
      success: false,
      error: error.message || 'Failed to get morphology advisory'
    };
  }
}

/**
 * Gets all available morphology advisories
 * @returns Promise with all morphology advisories response
 */
export async function getAllMorphologyAdvisories(): Promise<MorphologyAdviceResponse> {
  try {
    const response = await fetch('/api/morphology-advisories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MorphologyAdviceResponse = await response.json();
    return data;

  } catch (error: any) {
    console.error('Error getting all morphology advisories:', error);
    return {
      success: false,
      error: error.message || 'Failed to get morphology advisories'
    };
  }
}

/**
 * Validates morphology advisor form data
 * @param characteristics - Selected morphology characteristics
 * @returns Validation errors object
 */
export function validateMorphologyAdvisorData(
  characteristics: MorphologyCharacteristic[]
): MorphologyAdvisorFormErrors {
  const errors: MorphologyAdvisorFormErrors = {};

  // Check if at least one characteristic is selected
  if (!characteristics || characteristics.length === 0) {
    errors.selected_characteristics = 'Please select at least one morphology characteristic';
  }

  // Validate that all characteristics are valid
  if (characteristics && characteristics.length > 0) {
    const validCharacteristics = MORPHOLOGY_CHARACTERISTICS.map(c => c.value);
    const invalidCharacteristics = characteristics.filter(
      char => !validCharacteristics.includes(char)
    );
    
    if (invalidCharacteristics.length > 0) {
      errors.selected_characteristics = `Invalid characteristics: ${invalidCharacteristics.join(', ')}`;
    }
  }

  return errors;
}

/**
 * Gets display-friendly morphology characteristic name
 * @param characteristic - The morphology characteristic key
 * @returns Display name for the characteristic
 */
export function getMorphologyCharacteristicDisplayName(
  characteristic: MorphologyCharacteristic
): string {
  const config = MORPHOLOGY_CHARACTERISTICS.find(c => c.value === characteristic);
  return config?.label || characteristic;
}

/**
 * Gets morphology characteristic category
 * @param characteristic - The morphology characteristic key
 * @returns Category of the characteristic
 */
export function getMorphologyCharacteristicCategory(
  characteristic: MorphologyCharacteristic
): string {
  const config = MORPHOLOGY_CHARACTERISTICS.find(c => c.value === characteristic);
  return config?.category || 'unknown';
}

/**
 * Groups morphology characteristics by category
 * @param characteristics - Array of morphology characteristics
 * @returns Object with characteristics grouped by category
 */
export function groupCharacteristicsByCategory(
  characteristics: MorphologyCharacteristic[]
): Record<string, MorphologyCharacteristic[]> {
  const grouped: Record<string, MorphologyCharacteristic[]> = {};

  characteristics.forEach(characteristic => {
    const category = getMorphologyCharacteristicCategory(characteristic);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(characteristic);
  });

  return grouped;
}

/**
 * Filters morphology advisories by category
 * @param advisories - Array of morphology advisories
 * @param category - Category to filter by
 * @returns Filtered advisories
 */
export function filterAdvisoriesByCategory(
  advisories: MorphologyAdvisory[],
  category: string
): MorphologyAdvisory[] {
  return advisories.filter(advisory => 
    getMorphologyCharacteristicCategory(advisory.morphology_key) === category
  );
}

/**
 * Sorts morphology advisories by display name
 * @param advisories - Array of morphology advisories
 * @returns Sorted advisories
 */
export function sortAdvisoriesByName(
  advisories: MorphologyAdvisory[]
): MorphologyAdvisory[] {
  return [...advisories].sort((a, b) => 
    a.display_name.localeCompare(b.display_name)
  );
} 