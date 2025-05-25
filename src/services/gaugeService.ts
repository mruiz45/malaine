/**
 * Gauge Service - Handles all gauge profile related API calls
 * Follows the established service pattern for the Malaine project
 */

import type { 
  GaugeProfile, 
  CreateGaugeProfile, 
  UpdateGaugeProfile, 
  GaugeProfileResponse, 
  GaugeProfilesResponse 
} from '@/types/gauge';

/**
 * Fetches all gauge profiles for the authenticated user
 * @returns Promise<GaugeProfile[]> Array of gauge profiles
 * @throws Error if the request fails or user is not authenticated
 */
export async function getGaugeProfiles(): Promise<GaugeProfile[]> {
  try {
    const response = await fetch('/api/gauge-profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: GaugeProfilesResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch gauge profiles');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getGaugeProfiles:', error);
    throw error;
  }
}

/**
 * Fetches a specific gauge profile by ID
 * @param id - The gauge profile ID
 * @returns Promise<GaugeProfile> The gauge profile
 * @throws Error if the request fails, profile not found, or user is not authenticated
 */
export async function getGaugeProfile(id: string): Promise<GaugeProfile> {
  try {
    const response = await fetch(`/api/gauge-profiles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: GaugeProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch gauge profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getGaugeProfile:', error);
    throw error;
  }
}

/**
 * Creates a new gauge profile
 * @param gaugeData - The gauge profile data to create
 * @returns Promise<GaugeProfile> The created gauge profile
 * @throws Error if the request fails, validation fails, or user is not authenticated
 */
export async function createGaugeProfile(gaugeData: CreateGaugeProfile): Promise<GaugeProfile> {
  try {
    const response = await fetch('/api/gauge-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gaugeData),
    });

    const data: GaugeProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create gauge profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in createGaugeProfile:', error);
    throw error;
  }
}

/**
 * Updates an existing gauge profile
 * @param id - The gauge profile ID to update
 * @param updateData - The data to update
 * @returns Promise<GaugeProfile> The updated gauge profile
 * @throws Error if the request fails, profile not found, validation fails, or user is not authenticated
 */
export async function updateGaugeProfile(id: string, updateData: UpdateGaugeProfile): Promise<GaugeProfile> {
  try {
    const response = await fetch(`/api/gauge-profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data: GaugeProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update gauge profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in updateGaugeProfile:', error);
    throw error;
  }
}

/**
 * Deletes a gauge profile
 * @param id - The gauge profile ID to delete
 * @returns Promise<void>
 * @throws Error if the request fails, profile not found, or user is not authenticated
 */
export async function deleteGaugeProfile(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/gauge-profiles/${id}`, {
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
      throw new Error(data.error || 'Failed to delete gauge profile');
    }
  } catch (error) {
    console.error('Error in deleteGaugeProfile:', error);
    throw error;
  }
}

/**
 * Validates gauge profile data before submission
 * @param data - The gauge profile data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateGaugeProfileData(data: CreateGaugeProfile | UpdateGaugeProfile): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  // Validate profile name (required for create, optional for update)
  if ('profile_name' in data && data.profile_name !== undefined) {
    if (!data.profile_name || data.profile_name.trim().length === 0) {
      errors.profile_name = 'Profile name is required';
    } else if (data.profile_name.trim().length > 255) {
      errors.profile_name = 'Profile name must be 255 characters or less';
    }
  }

  // Validate stitch count
  if (data.stitch_count !== undefined) {
    if (data.stitch_count <= 0) {
      errors.stitch_count = 'Stitch count must be a positive number';
    } else if (data.stitch_count > 999.99) {
      errors.stitch_count = 'Stitch count must be less than 1000';
    }
  }

  // Validate row count
  if (data.row_count !== undefined) {
    if (data.row_count <= 0) {
      errors.row_count = 'Row count must be a positive number';
    } else if (data.row_count > 999.99) {
      errors.row_count = 'Row count must be less than 1000';
    }
  }

  // Validate measurement unit
  if (data.measurement_unit !== undefined) {
    if (!['cm', 'inch'].includes(data.measurement_unit)) {
      errors.measurement_unit = 'Measurement unit must be either "cm" or "inch"';
    }
  }

  // Validate swatch width
  if (data.swatch_width !== undefined) {
    if (data.swatch_width <= 0) {
      errors.swatch_width = 'Swatch width must be a positive number';
    } else if (data.swatch_width > 999.99) {
      errors.swatch_width = 'Swatch width must be less than 1000';
    }
  }

  // Validate swatch height
  if (data.swatch_height !== undefined) {
    if (data.swatch_height <= 0) {
      errors.swatch_height = 'Swatch height must be a positive number';
    } else if (data.swatch_height > 999.99) {
      errors.swatch_height = 'Swatch height must be less than 1000';
    }
  }

  // Validate notes length
  if (data.notes !== undefined && data.notes && data.notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less';
  }

  return errors;
} 