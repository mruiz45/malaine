/**
 * Stitch Pattern Service - Handles all stitch pattern related API calls
 * Follows the established service pattern for the Malaine project
 * Implements US_1.5 requirements for stitch pattern selection and definition
 * Enhanced with US_3.3 preview functionality
 * Extended with US_8.1 library features
 */

import type { 
  StitchPattern, 
  StitchPatternFilters,
  StitchPatternsResponse,
  StitchPatternResponse,
  StitchPatternProperties,
  StitchPatternInstructions,
  StitchPatternCategorySummary,
  StitchPatternCategoriesResponse,
  CraftType,
  StitchPatternCategory,
  DifficultyLevel
} from '@/types/stitchPattern';

/**
 * Fetches stitch patterns with optional filtering
 * Enhanced for US_8.1 with category, craft type, and difficulty filtering
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
    
    if (filters?.craftType) {
      searchParams.append('craftType', filters.craftType);
    }
    
    if (filters?.category) {
      searchParams.append('category', filters.category);
    }
    
    if (filters?.difficultyLevel) {
      searchParams.append('difficultyLevel', filters.difficultyLevel);
    }
    
    if (filters?.search) {
      searchParams.append('search', filters.search);
    }
    
    if (filters?.keywords && filters.keywords.length > 0) {
      searchParams.append('keywords', filters.keywords.join(','));
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
 * Fetches stitch patterns by craft type (US_8.1)
 * @param craftType - The craft type to filter by
 * @param basicOnly - Whether to include only basic patterns
 * @returns Promise<StitchPattern[]> Array of stitch patterns
 * @throws Error if the request fails
 */
export async function getStitchPatternsByCraftType(
  craftType: CraftType, 
  basicOnly: boolean = false
): Promise<StitchPattern[]> {
  return getStitchPatterns({ craftType, basicOnly });
}

/**
 * Fetches stitch patterns by category (US_8.1)
 * @param category - The category to filter by
 * @param craftType - Optional craft type filter
 * @returns Promise<StitchPattern[]> Array of stitch patterns in the category
 * @throws Error if the request fails
 */
export async function getStitchPatternsByCategory(
  category: StitchPatternCategory,
  craftType?: CraftType
): Promise<StitchPattern[]> {
  return getStitchPatterns({ category, craftType });
}

/**
 * Fetches stitch patterns by difficulty level (US_8.1)
 * @param difficultyLevel - The difficulty level to filter by
 * @param craftType - Optional craft type filter
 * @returns Promise<StitchPattern[]> Array of stitch patterns
 * @throws Error if the request fails
 */
export async function getStitchPatternsByDifficulty(
  difficultyLevel: DifficultyLevel,
  craftType?: CraftType
): Promise<StitchPattern[]> {
  return getStitchPatterns({ difficultyLevel, craftType });
}

/**
 * Fetches available categories with pattern counts (US_8.1)
 * @param craftType - Optional craft type filter
 * @returns Promise<StitchPatternCategorySummary[]> Array of categories with counts
 * @throws Error if the request fails
 */
export async function getStitchPatternCategories(craftType?: CraftType): Promise<StitchPatternCategorySummary[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (craftType) {
      searchParams.append('craftType', craftType);
    }

    const url = `/api/stitch-patterns/categories${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: StitchPatternCategoriesResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch stitch pattern categories');
    }

    return data.data;
  } catch (error) {
    console.error('Error in getStitchPatternCategories:', error);
    throw error;
  }
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
 * Advanced search for stitch patterns (US_8.1)
 * @param searchTerm - The search term to look for
 * @param filters - Additional filters to apply
 * @returns Promise<StitchPattern[]> Array of matching stitch patterns
 * @throws Error if the request fails
 */
export async function searchStitchPatterns(
  searchTerm: string, 
  filters?: Omit<StitchPatternFilters, 'search'>
): Promise<StitchPattern[]> {
  return getStitchPatterns({
    ...filters,
    search: searchTerm
  });
}

/**
 * Search stitch patterns by keywords (US_8.1)
 * @param keywords - Array of keywords to search for
 * @param filters - Additional filters to apply
 * @returns Promise<StitchPattern[]> Array of matching stitch patterns
 * @throws Error if the request fails
 */
export async function searchStitchPatternsByKeywords(
  keywords: string[],
  filters?: Omit<StitchPatternFilters, 'keywords'>
): Promise<StitchPattern[]> {
  return getStitchPatterns({
    ...filters,
    keywords
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

  if (!pattern.craft_type) {
    errors.craft_type = 'Stitch pattern must have a valid craft type';
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
 * Enhanced for US_8.1 with category and difficulty info
 * @param pattern - The stitch pattern
 * @returns Object with formatted display information
 */
export function getStitchPatternDisplayInfo(pattern: StitchPattern) {
  return {
    name: pattern.stitch_name,
    description: pattern.description || 'No description available',
    craftType: pattern.craft_type,
    category: pattern.category || 'Uncategorized',
    difficulty: pattern.difficulty_level || 'Unknown',
    repeatInfo: pattern.stitch_repeat_width && pattern.stitch_repeat_height 
      ? `${pattern.stitch_repeat_width} sts × ${pattern.stitch_repeat_height} rows`
      : 'Repeat information not available',
    isBasic: pattern.is_basic,
    hasRepeatData: !!(pattern.stitch_repeat_width && pattern.stitch_repeat_height),
    hasPreviewData: !!(pattern.swatch_image_url || pattern.properties),
    hasInstructions: !!(pattern.instructions_written),
    commonUses: pattern.common_uses || [],
    keywords: pattern.search_keywords || []
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
 * Checks if a stitch pattern has detailed instructions (US_8.1)
 * @param pattern - The stitch pattern to check
 * @returns Boolean indicating if detailed instructions are available
 */
export function hasDetailedInstructions(pattern: StitchPattern): boolean {
  return !!(pattern.instructions_written && 
    (pattern.instructions_written.rows?.length || pattern.instructions_written.rounds?.length));
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
      label: 'Yarn Usage',
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

/**
 * Formats structured instructions for display (US_8.1)
 * @param instructions - The structured instructions
 * @returns Formatted instructions for UI display
 */
export function formatStitchPatternInstructions(instructions: StitchPatternInstructions | undefined): {
  type: 'rows' | 'rounds' | 'none';
  steps: Array<{number: number, instruction: string, note?: string}>;
  notes?: string;
  abbreviation?: string;
} {
  if (!instructions) {
    return { type: 'none', steps: [] };
  }

  if (instructions.rows && instructions.rows.length > 0) {
    return {
      type: 'rows',
      steps: instructions.rows.map(row => ({
        number: row.row_num,
        instruction: row.instruction,
        note: row.note
      })),
      notes: instructions.notes,
      abbreviation: instructions.abbreviation
    };
  }

  if (instructions.rounds && instructions.rounds.length > 0) {
    return {
      type: 'rounds',
      steps: instructions.rounds.map(round => ({
        number: round.round_num,
        instruction: round.instruction,
        note: round.note
      })),
      notes: instructions.notes,
      abbreviation: instructions.abbreviation
    };
  }

  return { type: 'none', steps: [] };
}

/**
 * Gets difficulty level display information (US_8.1)
 * @param difficultyLevel - The difficulty level
 * @returns Object with display info for the difficulty level
 */
export function getDifficultyDisplayInfo(difficultyLevel: DifficultyLevel | undefined): {
  level: string;
  color: string;
  description: string;
} {
  switch (difficultyLevel) {
    case 'beginner':
      return {
        level: 'Beginner',
        color: 'green',
        description: 'Perfect for those new to the craft'
      };
    case 'easy':
      return {
        level: 'Easy',
        color: 'blue',
        description: 'Simple techniques, minimal experience needed'
      };
    case 'intermediate':
      return {
        level: 'Intermediate',
        color: 'yellow',
        description: 'Some experience with basic techniques required'
      };
    case 'advanced':
      return {
        level: 'Advanced',
        color: 'orange',
        description: 'Complex techniques, significant experience needed'
      };
    case 'expert':
      return {
        level: 'Expert',
        color: 'red',
        description: 'Master level techniques and precision required'
      };
    default:
      return {
        level: 'Unknown',
        color: 'gray',
        description: 'Difficulty level not specified'
      };
  }
}

/**
 * Formats difficulty level for simple display (US_8.1)
 * @param difficultyLevel - The difficulty level
 * @returns Formatted difficulty level string
 */
export function formatDifficultyLevel(difficultyLevel: DifficultyLevel | undefined): string {
  return getDifficultyDisplayInfo(difficultyLevel).level;
} 