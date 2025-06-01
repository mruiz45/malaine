/**
 * Types for Stitch Patterns (US_1.5, US_3.3 & US_8.1)
 * Defines interfaces for stitch pattern selection, definition, preview, and library
 */

import type { ChartSymbolsDefinition } from './stitchChart';

/**
 * Supported craft types
 */
export type CraftType = 'knitting' | 'crochet';

/**
 * Stitch pattern categories for the library (US_8.1)
 */
export type StitchPatternCategory = 
  | 'Basic' 
  | 'Cables' 
  | 'Lace' 
  | 'Textured' 
  | 'Ribbing' 
  | 'Colorwork' 
  | 'Motifs';

/**
 * Difficulty levels for stitch patterns (US_8.1)
 */
export type DifficultyLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced' | 'expert';

/**
 * Structured instructions for stitch patterns (US_8.1)
 */
export interface StitchPatternInstructions {
  /** Type of craft this instruction is for */
  craft_type: CraftType;
  /** Abbreviation used for this stitch */
  abbreviation?: string;
  /** Row-by-row instructions for knitting */
  rows?: Array<{
    row_num: number;
    instruction: string;
    note?: string;
  }>;
  /** Round-by-round instructions for crochet */
  rounds?: Array<{
    round_num: number;
    instruction: string;
    note?: string;
  }>;
  /** Additional notes about the pattern */
  notes?: string;
}

/**
 * Properties describing stitch pattern characteristics for preview (US_3.3)
 */
export interface StitchPatternProperties {
  /** How the fabric behaves (e.g., "Curls at edges", "Lies flat") */
  fabric_behavior?: string;
  /** Texture description (e.g., "Smooth with V's", "Bumpy rows") */
  texture_description?: string;
  /** Whether the pattern is reversible */
  reversibility?: string;
  /** Horizontal stretch characteristics */
  stretch_horizontal?: string;
  /** Vertical stretch characteristics */
  stretch_vertical?: string;
  /** Relative yarn consumption compared to stockinette */
  relative_yarn_consumption?: string;
  /** Additional notes about the stitch pattern */
  notes?: string;
}

/**
 * Enhanced stitch pattern interface for US_8.1 library
 */
export interface StitchPattern {
  /** Unique identifier for the stitch pattern */
  id: string;
  /** Name of the stitch pattern (e.g., "Stockinette Stitch") */
  stitch_name: string;
  /** Type of craft: knitting or crochet (US_8.1) */
  craft_type: CraftType;
  /** Category of the stitch pattern (US_8.1) */
  category?: StitchPatternCategory;
  /** Detailed description of the stitch pattern */
  description?: string;
  /** Number of stitches in one horizontal repeat */
  stitch_repeat_width?: number;
  /** Number of rows in one vertical repeat */
  stitch_repeat_height?: number;
  /** Whether this is a basic/predefined stitch pattern */
  is_basic: boolean;
  /** URL path to swatch image for visual preview (US_3.3) */
  swatch_image_url?: string;
  /** Stitch pattern characteristics and properties (US_3.3) */
  properties?: StitchPatternProperties;
  /** Structured row-by-row instructions (US_8.1) */
  instructions_written?: StitchPatternInstructions;
  /** Chart symbols definition for diagram generation (US_11.5) */
  chart_symbols?: ChartSymbolsDefinition;
  /** Keywords for search functionality (US_8.1) */
  search_keywords?: string[];
  /** Difficulty level of the pattern (US_8.1) */
  difficulty_level?: DifficultyLevel;
  /** Common uses for this stitch pattern (US_8.1) */
  common_uses?: string[];
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Stitch pattern for creation (without generated fields)
 */
export interface CreateStitchPattern {
  stitch_name: string;
  craft_type: CraftType;
  category?: StitchPatternCategory;
  description?: string;
  stitch_repeat_width?: number;
  stitch_repeat_height?: number;
  is_basic?: boolean;
  swatch_image_url?: string;
  properties?: StitchPatternProperties;
  instructions_written?: StitchPatternInstructions;
  chart_symbols?: ChartSymbolsDefinition;
  search_keywords?: string[];
  difficulty_level?: DifficultyLevel;
  common_uses?: string[];
}

/**
 * Stitch pattern for updates (partial fields)
 */
export interface UpdateStitchPattern {
  stitch_name?: string;
  craft_type?: CraftType;
  category?: StitchPatternCategory;
  description?: string;
  stitch_repeat_width?: number;
  stitch_repeat_height?: number;
  is_basic?: boolean;
  swatch_image_url?: string;
  properties?: StitchPatternProperties;
  instructions_written?: StitchPatternInstructions;
  chart_symbols?: ChartSymbolsDefinition;
  search_keywords?: string[];
  difficulty_level?: DifficultyLevel;
  common_uses?: string[];
}

/**
 * Enhanced filter options for stitch patterns (US_8.1)
 */
export interface StitchPatternFilters {
  /** Filter by basic patterns only */
  basicOnly?: boolean;
  /** Filter by craft type */
  craftType?: CraftType;
  /** Filter by category */
  category?: StitchPatternCategory;
  /** Filter by difficulty level */
  difficultyLevel?: DifficultyLevel;
  /** Search by name or keywords */
  search?: string;
  /** Search in keywords array */
  keywords?: string[];
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Library browsing options (US_8.1)
 */
export interface StitchLibraryBrowseOptions {
  /** View mode: grid or list */
  viewMode?: 'grid' | 'list';
  /** Sort options */
  sortBy?: 'name' | 'category' | 'difficulty' | 'recent';
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Number of items per page */
  itemsPerPage?: number;
  /** Current page number */
  page?: number;
}

/**
 * Category summary for library browsing (US_8.1)
 */
export interface StitchPatternCategorySummary {
  /** Category name */
  category: StitchPatternCategory;
  /** Number of patterns in this category */
  count: number;
  /** Array of difficulty levels present in this category */
  difficulty_levels: DifficultyLevel[];
  /** Sample patterns from this category (for preview) */
  sample_patterns?: StitchPattern[];
}

/**
 * API response for stitch patterns list
 */
export interface StitchPatternsResponse {
  success: boolean;
  data?: StitchPattern[];
  count?: number;
  totalCount?: number;
  error?: string;
}

/**
 * API response for single stitch pattern
 */
export interface StitchPatternResponse {
  success: boolean;
  data?: StitchPattern | null;
  error?: string;
}

/**
 * API response for categories (US_8.1)
 */
export interface StitchPatternCategoriesResponse {
  success: boolean;
  data?: StitchPatternCategorySummary[];
  error?: string;
}

/**
 * Stitch pattern selection state for UI components
 */
export interface StitchPatternSelection {
  /** Selected stitch pattern */
  pattern: StitchPattern | null;
  /** Whether selection is loading */
  isLoading: boolean;
  /** Any error during selection */
  error?: string;
}

/**
 * Library browser state (US_8.1)
 */
export interface StitchLibraryState {
  /** Currently loaded patterns */
  patterns: StitchPattern[];
  /** Available categories with counts */
  categories: StitchPatternCategorySummary[];
  /** Current filters applied */
  filters: StitchPatternFilters;
  /** Browse options */
  browseOptions: StitchLibraryBrowseOptions;
  /** Loading states */
  isLoading: boolean;
  isLoadingCategories: boolean;
  /** Error states */
  error?: string;
  categoriesError?: string;
  /** Pagination info */
  totalCount: number;
  hasMore: boolean;
}

/**
 * Favorite/Selection management for patterns (US_8.1)
 */
export interface StitchPatternFavorites {
  /** Array of favorited pattern IDs */
  favoriteIds: string[];
  /** Currently selected pattern for project */
  selectedForProject?: StitchPattern;
  /** Temporary selections during browsing */
  temporarySelections: string[];
} 