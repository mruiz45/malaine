/**
 * Types for Stitch Patterns (US_1.5)
 * Defines interfaces for stitch pattern selection and definition
 */

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