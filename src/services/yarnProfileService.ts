/**
 * Yarn Profile Service - Handles all yarn profile related API calls
 * Follows the established service pattern for the Malaine project
 * Corresponds to US_1.4 - Yarn and Material Details Input and Management
 */

import type { 
  YarnProfile, 
  CreateYarnProfile, 
  UpdateYarnProfile, 
  YarnProfileResponse, 
  YarnProfilesResponse,
  FiberContent,
  YarnWeightCategory
} from '@/types/yarn';

/**
 * Fetches all yarn profiles for the authenticated user
 * @returns Promise<YarnProfile[]> Array of yarn profiles
 * @throws Error if the request fails or user is not authenticated
 */
export async function getYarnProfiles(): Promise<YarnProfile[]> {
  try {
    const response = await fetch('/api/yarn-profiles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: YarnProfilesResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch yarn profiles');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getYarnProfiles:', error);
    throw error;
  }
}

/**
 * Fetches a specific yarn profile by ID
 * @param id - The yarn profile ID
 * @returns Promise<YarnProfile> The yarn profile
 * @throws Error if the request fails, profile not found, or user is not authenticated
 */
export async function getYarnProfile(id: string): Promise<YarnProfile> {
  try {
    const response = await fetch(`/api/yarn-profiles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: YarnProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch yarn profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getYarnProfile:', error);
    throw error;
  }
}

/**
 * Creates a new yarn profile
 * @param yarnData - The yarn profile data to create
 * @returns Promise<YarnProfile> The created yarn profile
 * @throws Error if the request fails, validation fails, or user is not authenticated
 */
export async function createYarnProfile(yarnData: CreateYarnProfile): Promise<YarnProfile> {
  try {
    const response = await fetch('/api/yarn-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yarnData),
    });

    const data: YarnProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create yarn profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in createYarnProfile:', error);
    throw error;
  }
}

/**
 * Updates an existing yarn profile
 * @param id - The yarn profile ID to update
 * @param updateData - The data to update
 * @returns Promise<YarnProfile> The updated yarn profile
 * @throws Error if the request fails, profile not found, validation fails, or user is not authenticated
 */
export async function updateYarnProfile(id: string, updateData: UpdateYarnProfile): Promise<YarnProfile> {
  try {
    const response = await fetch(`/api/yarn-profiles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data: YarnProfileResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update yarn profile');
    }

    return data.data;
  } catch (error) {
    console.error('Error in updateYarnProfile:', error);
    throw error;
  }
}

/**
 * Deletes a yarn profile
 * @param id - The yarn profile ID to delete
 * @returns Promise<void>
 * @throws Error if the request fails, profile not found, or user is not authenticated
 */
export async function deleteYarnProfile(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/yarn-profiles/${id}`, {
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
      throw new Error(data.error || 'Failed to delete yarn profile');
    }
  } catch (error) {
    console.error('Error in deleteYarnProfile:', error);
    throw error;
  }
}

/**
 * Validates yarn profile data before submission
 * @param data - The yarn profile data to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateYarnProfileData(data: CreateYarnProfile | UpdateYarnProfile): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  // Validate yarn name (required for create, optional for update)
  if ('yarn_name' in data && data.yarn_name !== undefined) {
    if (!data.yarn_name || data.yarn_name.trim().length === 0) {
      errors.yarn_name = 'Yarn name is required';
    } else if (data.yarn_name.trim().length > 255) {
      errors.yarn_name = 'Yarn name must be 255 characters or less';
    }
  }

  // Validate brand name length
  if (data.brand_name && data.brand_name.trim().length > 255) {
    errors.brand_name = 'Brand name must be 255 characters or less';
  }

  // Validate numeric values
  if (data.skein_yardage !== undefined && data.skein_yardage !== null) {
    if (data.skein_yardage <= 0) {
      errors.skein_yardage = 'Skein yardage must be a positive number';
    } else if (data.skein_yardage > 99999.99) {
      errors.skein_yardage = 'Skein yardage must be less than 100,000';
    }
  }

  if (data.skein_meterage !== undefined && data.skein_meterage !== null) {
    if (data.skein_meterage <= 0) {
      errors.skein_meterage = 'Skein meterage must be a positive number';
    } else if (data.skein_meterage > 99999.99) {
      errors.skein_meterage = 'Skein meterage must be less than 100,000';
    }
  }

  if (data.skein_weight_grams !== undefined && data.skein_weight_grams !== null) {
    if (data.skein_weight_grams <= 0) {
      errors.skein_weight_grams = 'Skein weight must be a positive number';
    } else if (data.skein_weight_grams > 9999.99) {
      errors.skein_weight_grams = 'Skein weight must be less than 10,000 grams';
    }
  }

  // Validate color hex code format
  if (data.color_hex_code && !/^#[0-9A-Fa-f]{6}$/.test(data.color_hex_code)) {
    errors.color_hex_code = 'Color hex code must be in format #RRGGBB';
  }

  // Validate fiber content
  if (data.fiber_content && data.fiber_content.length > 0) {
    const totalPercentage = data.fiber_content.reduce((sum, fiber) => sum + fiber.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.fiber_content = 'Fiber content percentages must sum to 100%';
    }

    for (let i = 0; i < data.fiber_content.length; i++) {
      const fiber = data.fiber_content[i];
      if (!fiber.fiber || fiber.fiber.trim().length === 0) {
        errors[`fiber_content_${i}_name`] = 'Fiber name cannot be empty';
      }
      if (fiber.percentage <= 0 || fiber.percentage > 100) {
        errors[`fiber_content_${i}_percentage`] = 'Fiber percentage must be between 0 and 100';
      }
    }
  }

  // Validate URL format for purchase link
  if (data.purchase_link && data.purchase_link.trim().length > 0) {
    try {
      new URL(data.purchase_link);
    } catch {
      errors.purchase_link = 'Purchase link must be a valid URL';
    }
  }

  return errors;
}

/**
 * Converts yardage to meterage
 * @param yardage - Yardage value
 * @returns Meterage value
 */
export function yardsToMeters(yardage: number): number {
  return Math.round(yardage * 0.9144 * 100) / 100;
}

/**
 * Converts meterage to yardage
 * @param meterage - Meterage value
 * @returns Yardage value
 */
export function metersToYards(meterage: number): number {
  return Math.round(meterage * 1.0936 * 100) / 100;
}

/**
 * Formats fiber content for display
 * @param fiberContent - Array of fiber content
 * @returns Formatted string
 */
export function formatFiberContent(fiberContent: FiberContent[]): string {
  if (!fiberContent || fiberContent.length === 0) {
    return '';
  }

  return fiberContent
    .map(fiber => `${fiber.percentage}% ${fiber.fiber}`)
    .join(', ');
}

/**
 * Gets the display name for a yarn weight category
 * @param category - Yarn weight category
 * @returns Display name with weight number
 */
export function getYarnWeightDisplayName(category: YarnWeightCategory): string {
  const weightMap: Record<YarnWeightCategory, string> = {
    'Lace': '0 - Lace',
    'Fingering': '1 - Fingering',
    'DK': '3 - DK',
    'Worsted': '4 - Worsted',
    'Bulky': '5 - Bulky',
    'Super Bulky': '6 - Super Bulky',
    'Jumbo': '7 - Jumbo'
  };

  return weightMap[category] || category;
} 