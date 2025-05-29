/**
 * Types for Pattern Showcase (US_10.3)
 * Defines interfaces for the public pattern gallery
 */

import { AssembledPattern } from './assembled-pattern';

/**
 * Showcased pattern metadata for gallery display
 */
export interface ShowcasedPattern {
  /** Unique identifier */
  id: string;
  /** Pattern title */
  title: string;
  /** Brief description */
  description?: string;
  /** URL to thumbnail image */
  thumbnail_image_url?: string;
  /** Category classification */
  category?: string;
  /** Difficulty level */
  difficulty_level?: string;
  /** Complete pattern data for PatternViewer */
  full_pattern_data: AssembledPattern;
  /** Whether the pattern is published */
  is_published: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Showcased pattern summary for gallery cards (without full pattern data)
 */
export interface ShowcasedPatternSummary {
  /** Unique identifier */
  id: string;
  /** Pattern title */
  title: string;
  /** Brief description */
  description?: string;
  /** URL to thumbnail image */
  thumbnail_image_url?: string;
  /** Category classification */
  category?: string;
  /** Difficulty level */
  difficulty_level?: string;
  /** Whether the pattern is published */
  is_published: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Available pattern categories
 */
export type PatternCategory = 
  | 'Sweaters'
  | 'Accessories' 
  | 'Garments'
  | 'Home & Decor'
  | 'Baby & Kids'
  | 'Beginner Friendly';

/**
 * Available difficulty levels
 */
export type DifficultyLevel = 
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert';

/**
 * Showcase gallery filters
 */
export interface ShowcaseFilters {
  /** Filter by category */
  category?: PatternCategory;
  /** Filter by difficulty */
  difficulty_level?: DifficultyLevel;
  /** Search term for title/description */
  search?: string;
}

/**
 * Pagination parameters for showcase
 */
export interface ShowcasePagination {
  /** Page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
}

/**
 * Request for showcase patterns list
 */
export interface ShowcasePatternsRequest {
  /** Optional filters */
  filters?: ShowcaseFilters;
  /** Pagination parameters */
  pagination?: ShowcasePagination;
}

/**
 * Response for showcase patterns list
 */
export interface ShowcasePatternsResponse {
  /** Success status */
  success: boolean;
  /** Pattern summaries (without full pattern data) */
  data?: {
    patterns: ShowcasedPatternSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  /** Error message if any */
  error?: string;
}

/**
 * Response for single showcased pattern
 */
export interface ShowcasedPatternResponse {
  /** Success status */
  success: boolean;
  /** Complete pattern data */
  data?: ShowcasedPattern;
  /** Error message if any */
  error?: string;
}

/**
 * Showcase gallery state for UI
 */
export interface ShowcaseState {
  /** List of pattern summaries */
  patterns: ShowcasedPatternSummary[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Current filters */
  filters: ShowcaseFilters;
  /** Current pagination */
  pagination: ShowcasePagination & { total: number; totalPages: number };
  /** Whether there are more patterns to load */
  hasMore: boolean;
} 