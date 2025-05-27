/**
 * Stitch Pattern Service - Handles all stitch pattern related API calls
 * Follows the established service pattern for the Malaine project
 * Implements US_1.5 requirements for stitch pattern selection and definition
 * Enhanced with US_3.3 preview functionality
 */

import type { 
  StitchPattern, 
  StitchPatternFilters,
  StitchPatternsResponse,
  StitchPatternResponse,
  StitchPatternProperties
} from '@/types/stitchPattern';

/**
 * Fetches stitch patterns with optional filtering
 * @param filters - Optional filters to apply to the query
 * @returns Promise<StitchPattern[]> Array of stitch patterns
 * @throws Error if the request fails
 */
export async function getStitchPatterns(filters?: StitchPatternFilters): Promise<StitchPattern[]> {
  try {
    // Build query parameters
    const searchParams = new URLSearchParams();
    
    if (filters?.basicOnly) {
      searchParams.append('basicOnly', 'true');
    }
    
    if (filters?.search) {
      searchParams.append('search', filters.search);
    }
    
    if (filters?.limit) {
      searchParams.append('limit', filters.limit.toString());
    }
    
    if (filters?.offset) {
      searchParams.append('offset', filters.offset.toString());
    }

    const url = `/api/stitch-patterns${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: StitchPatternsResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch stitch patterns');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getStitchPatterns:', error);
    throw error;
  }
}

/**
 * Fetches basic stitch patterns only (public access)
 * @returns Promise<StitchPattern[]> Array of basic stitch patterns
 * @throws Error if the request fails
 */
export async function getBasicStitchPatterns(): Promise<StitchPattern[]> {
  return getStitchPatterns({ basicOnly: true });
}

/**
 * Fetches a specific stitch pattern by ID
 * @param id - The stitch pattern ID
 * @returns Promise<StitchPattern> The stitch pattern
 * @throws Error if the request fails, pattern not found, or user is not authenticated
 */
export async function getStitchPattern(id: string): Promise<StitchPattern> {
  try {
    const response = await fetch(`/api/stitch-patterns/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: StitchPatternResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch stitch pattern');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getStitchPattern:', error);
    throw error;
  }
}

/**
 * Searches stitch patterns by name
 * @param searchTerm - The search term to look for in stitch pattern names
 * @param basicOnly - Whether to search only basic patterns (default: true)
 * @returns Promise<StitchPattern[]> Array of matching stitch patterns
 * @throws Error if the request fails
 */
export async function searchStitchPatterns(searchTerm: string, basicOnly: boolean = true): Promise<StitchPattern[]> {
  return getStitchPatterns({
    search: searchTerm,
    basicOnly
  });
}

/**
 * Validates stitch pattern selection
 * @param pattern - The stitch pattern to validate
 * @returns Object with validation errors or empty object if valid
 */
export function validateStitchPatternSelection(pattern: StitchPattern | null): { [key: string]: string } {
  const errors: { [key: string]: string } = {};

  if (!pattern) {
    errors.pattern = 'Please select a stitch pattern';
    return errors;
  }

  if (!pattern.stitch_name || pattern.stitch_name.trim().length === 0) {
    errors.stitch_name = 'Stitch pattern must have a valid name';
  }

  // Validate repeat dimensions if provided
  if (pattern.stitch_repeat_width !== undefined && pattern.stitch_repeat_width <= 0) {
    errors.stitch_repeat_width = 'Stitch repeat width must be a positive number';
  }

  if (pattern.stitch_repeat_height !== undefined && pattern.stitch_repeat_height <= 0) {
    errors.stitch_repeat_height = 'Stitch repeat height must be a positive number';
  }

  return errors;
}

/**
 * Gets stitch pattern display information for UI
 * @param pattern - The stitch pattern
 * @returns Object with formatted display information
 */
export function getStitchPatternDisplayInfo(pattern: StitchPattern) {
  return {
    name: pattern.stitch_name,
    description: pattern.description || 'No description available',
    repeatInfo: pattern.stitch_repeat_width && pattern.stitch_repeat_height 
      ? `${pattern.stitch_repeat_width} sts × ${pattern.stitch_repeat_height} rows`
      : 'Repeat information not available',
    isBasic: pattern.is_basic,
    hasRepeatData: !!(pattern.stitch_repeat_width && pattern.stitch_repeat_height),
    hasPreviewData: !!(pattern.swatch_image_url || pattern.properties)
  };
}

/**
 * Checks if a stitch pattern has preview data (US_3.3)
 * @param pattern - The stitch pattern to check
 * @returns Boolean indicating if preview data is available
 */
export function hasStitchPatternPreview(pattern: StitchPattern): boolean {
  return !!(pattern.swatch_image_url || (pattern.properties && Object.keys(pattern.properties).length > 0));
}

/**
 * Gets formatted properties for display (US_3.3)
 * @param properties - The stitch pattern properties
 * @returns Array of formatted property objects for display
 */
export function formatStitchPatternProperties(properties: StitchPatternProperties | undefined): Array<{key: string, label: string, value: string}> {
  if (!properties) {
    return [];
  }

  const formatted: Array<{key: string, label: string, value: string}> = [];

  if (properties.fabric_behavior) {
    formatted.push({
      key: 'fabric_behavior',
      label: 'Fabric Behavior',
      value: properties.fabric_behavior
    });
  }

  if (properties.texture_description) {
    formatted.push({
      key: 'texture_description',
      label: 'Texture',
      value: properties.texture_description
    });
  }

  if (properties.reversibility) {
    formatted.push({
      key: 'reversibility',
      label: 'Reversible',
      value: properties.reversibility
    });
  }

  if (properties.stretch_horizontal) {
    formatted.push({
      key: 'stretch_horizontal',
      label: 'Horizontal Stretch',
      value: properties.stretch_horizontal
    });
  }

  if (properties.stretch_vertical) {
    formatted.push({
      key: 'stretch_vertical',
      label: 'Vertical Stretch',
      value: properties.stretch_vertical
    });
  }

  if (properties.relative_yarn_consumption) {
    formatted.push({
      key: 'relative_yarn_consumption',
      label: 'Yarn Consumption',
      value: properties.relative_yarn_consumption
    });
  }

  if (properties.notes) {
    formatted.push({
      key: 'notes',
      label: 'Notes',
      value: properties.notes
    });
  }

  return formatted;
} 