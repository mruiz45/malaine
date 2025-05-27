/**
 * Types for Stitch Patterns (US_1.5 & US_3.3)
 * Defines interfaces for stitch pattern selection, definition, and preview
 */

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
 * Base stitch pattern interface matching the database schema
 */
export interface StitchPattern {
  /** Unique identifier for the stitch pattern */
  id: string;
  /** Name of the stitch pattern (e.g., "Stockinette Stitch") */
  stitch_name: string;
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
  description?: string;
  stitch_repeat_width?: number;
  stitch_repeat_height?: number;
  is_basic?: boolean;
  swatch_image_url?: string;
  properties?: StitchPatternProperties;
}

/**
 * Stitch pattern for updates (partial fields)
 */
export interface UpdateStitchPattern {
  stitch_name?: string;
  description?: string;
  stitch_repeat_width?: number;
  stitch_repeat_height?: number;
  is_basic?: boolean;
  swatch_image_url?: string;
  properties?: StitchPatternProperties;
}

/**
 * API response for stitch patterns list
 */
export interface StitchPatternsResponse {
  success: boolean;
  data?: StitchPattern[];
  count?: number;
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
 * Filter options for stitch patterns
 */
export interface StitchPatternFilters {
  /** Filter by basic patterns only */
  basicOnly?: boolean;
  /** Search by name */
  search?: string;
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
} 