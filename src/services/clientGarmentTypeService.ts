/**
 * Client-side Garment Type Service (US_4.2)
 * Handles client-side operations for garment types following the Page -> Service -> API -> Supabase pattern
 */

import { GarmentType, GarmentTypesResponse } from '@/types/garment';

/**
 * Client-side service for garment type operations
 */
export class ClientGarmentTypeService {
  /**
   * Fetch all available garment types
   * @param difficulty - Optional difficulty filter
   * @returns Promise<GarmentType[]> List of garment types
   */
  static async getAllGarmentTypes(difficulty?: 'beginner' | 'intermediate' | 'advanced'): Promise<GarmentType[]> {
    try {
      const url = new URL('/api/garment-types', window.location.origin);
      if (difficulty) {
        url.searchParams.set('difficulty', difficulty);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GarmentTypesResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch garment types');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching garment types:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch garment types');
    }
  }

  /**
   * Fetch garment types filtered by difficulty level
   * @param difficulty - The difficulty level to filter by
   * @returns Promise<GarmentType[]> List of garment types for the difficulty level
   */
  static async getGarmentTypesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<GarmentType[]> {
    return this.getAllGarmentTypes(difficulty);
  }
}

export default ClientGarmentTypeService; 