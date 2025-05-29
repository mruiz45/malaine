/**
 * Showcase Service (US_10.3)
 * Client-side service for showcase pattern operations
 */

import {
  ShowcasePatternsRequest,
  ShowcasePatternsResponse,
  ShowcasedPatternResponse,
  ShowcasedPattern,
  ShowcasedPatternSummary,
  ShowcaseFilters,
  ShowcasePagination
} from '@/types/showcase';

/**
 * Service class for showcase pattern operations
 */
export class ShowcaseService {
  private baseUrl = '/api/showcase';

  /**
   * Retrieves list of showcased patterns with pagination and filtering
   * @param request - Request parameters with filters and pagination
   * @returns List of pattern summaries with pagination info
   */
  async getPatterns(request?: ShowcasePatternsRequest): Promise<{
    patterns: ShowcasedPatternSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const params = new URLSearchParams();

      // Add pagination parameters
      if (request?.pagination?.page) {
        params.append('page', request.pagination.page.toString());
      }
      if (request?.pagination?.limit) {
        params.append('limit', request.pagination.limit.toString());
      }

      // Add filter parameters
      if (request?.filters?.category) {
        params.append('category', request.filters.category);
      }
      if (request?.filters?.difficulty_level) {
        params.append('difficulty_level', request.filters.difficulty_level);
      }
      if (request?.filters?.search) {
        params.append('search', request.filters.search);
      }

      const url = `${this.baseUrl}/patterns${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: ShowcasePatternsResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch patterns');
      }

      if (!result.data) {
        throw new Error('No data returned from patterns list');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching showcase patterns:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific showcased pattern with complete data
   * @param id - Pattern ID
   * @returns Complete pattern data for PatternViewer
   */
  async getPattern(id: string): Promise<ShowcasedPattern> {
    try {
      if (!id) {
        throw new Error('Pattern ID is required');
      }

      const response = await fetch(`${this.baseUrl}/patterns/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: ShowcasedPatternResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pattern');
      }

      if (!result.data) {
        throw new Error('No pattern data returned');
      }

      return result.data;

    } catch (error) {
      console.error('Error fetching showcase pattern:', error);
      throw error;
    }
  }

  /**
   * Retrieves patterns for quick gallery display with default pagination
   * @param filters - Optional filters to apply
   * @returns List of pattern summaries with default pagination
   */
  async getPatternsQuick(filters?: ShowcaseFilters): Promise<{
    patterns: ShowcasedPatternSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.getPatterns({
      filters,
      pagination: {
        page: 1,
        limit: 12
      }
    });
  }

  /**
   * Searches patterns by title or description
   * @param searchTerm - Search term
   * @param additionalFilters - Optional additional filters
   * @returns Filtered pattern summaries
   */
  async searchPatterns(
    searchTerm: string,
    additionalFilters?: Omit<ShowcaseFilters, 'search'>
  ): Promise<{
    patterns: ShowcasedPatternSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return this.getPatterns({
      filters: {
        ...additionalFilters,
        search: searchTerm
      },
      pagination: {
        page: 1,
        limit: 12
      }
    });
  }

  /**
   * Gets available categories from patterns (client-side implementation)
   * Note: In a future enhancement, this could be a separate API endpoint
   * @returns List of available categories
   */
  async getAvailableCategories(): Promise<string[]> {
    try {
      // For now, get a large sample and extract unique categories
      const result = await this.getPatterns({
        pagination: { page: 1, limit: 50 }
      });

      const categories = new Set<string>();
      result.patterns.forEach(pattern => {
        if (pattern.category) {
          categories.add(pattern.category);
        }
      });

      return Array.from(categories).sort();

    } catch (error) {
      console.error('Error getting available categories:', error);
      // Return fallback categories
      return ['Sweaters', 'Accessories', 'Garments', 'Home & Decor', 'Baby & Kids', 'Beginner Friendly'];
    }
  }

  /**
   * Gets available difficulty levels from patterns (client-side implementation)
   * Note: In a future enhancement, this could be a separate API endpoint
   * @returns List of available difficulty levels
   */
  async getAvailableDifficultyLevels(): Promise<string[]> {
    try {
      // For now, get a large sample and extract unique difficulty levels
      const result = await this.getPatterns({
        pagination: { page: 1, limit: 50 }
      });

      const difficulties = new Set<string>();
      result.patterns.forEach(pattern => {
        if (pattern.difficulty_level) {
          difficulties.add(pattern.difficulty_level);
        }
      });

      return Array.from(difficulties).sort();

    } catch (error) {
      console.error('Error getting available difficulty levels:', error);
      // Return fallback difficulty levels
      return ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    }
  }
}

/**
 * Default singleton instance for use throughout the application
 */
export const showcaseService = new ShowcaseService(); 