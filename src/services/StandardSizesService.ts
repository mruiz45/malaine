/**
 * Standard Sizes Service (PD_PH2_US004)
 * Encapsulates API calls for standard size chart functionality
 * Follows the established architecture: Page -> Service -> API -> Supabase
 */

import {
  SizeFiltersResponse,
  SizeChartsResponse,
  SizeMeasurementsResponse,
  AppliedSizeFilters,
  StandardSizeChart,
  StandardSize,
  StandardSizeMeasurements,
  SizeSearchResult
} from '@/types/standardSizes';
import { GarmentType } from '@/types/pattern';

/**
 * Service class for standard sizes operations
 */
export class StandardSizesService {
  
  /**
   * Fetches available filter options for size chart selection
   * @param garmentType - Optional garment type to filter charts
   * @returns Promise with available filters
   */
  static async getAvailableFilters(garmentType?: GarmentType): Promise<SizeFiltersResponse> {
    try {
      const params = new URLSearchParams();
      if (garmentType && garmentType !== null) {
        params.append('garmentType', garmentType);
      }

      const url = `/api/sizes/filters${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available filters:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetches size charts based on applied filters
   * @param filters - Applied filter criteria
   * @returns Promise with matching size charts
   */
  static async getSizeCharts(filters: AppliedSizeFilters): Promise<SizeChartsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.garment_type && filters.garment_type !== null) {
        params.append('garmentType', filters.garment_type);
      }
      if (filters.region) {
        params.append('region', filters.region);
      }
      if (filters.age_category) {
        params.append('ageCategory', filters.age_category);
      }
      if (filters.target_group) {
        params.append('targetGroup', filters.target_group);
      }

      const url = `/api/sizes/charts${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching size charts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetches all standard sizes for a specific chart
   * @param chartId - The size chart ID
   * @returns Promise with standard sizes for the chart
   */
  static async getStandardSizes(chartId: string): Promise<{ success: boolean; data?: SizeSearchResult; error?: string }> {
    try {
      const response = await fetch(`/api/sizes/charts/${chartId}/sizes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching standard sizes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetches detailed measurements for a specific standard size
   * @param sizeId - The standard size ID
   * @returns Promise with detailed measurements
   */
  static async getSizeMeasurements(sizeId: string): Promise<SizeMeasurementsResponse> {
    try {
      const response = await fetch(`/api/sizes/${sizeId}/measurements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching size measurements:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Helper method to get measurements for a standard size and apply them to pattern state
   * @param sizeId - The standard size ID
   * @returns Promise with mapped measurements ready for pattern state
   */
  static async getMeasurementsForPatternState(sizeId: string): Promise<{
    success: boolean;
    measurements?: Partial<import('@/types/pattern').MeasurementsData>;
    sizeInfo?: { id: string; label: string };
    error?: string;
  }> {
    try {
      const result = await this.getSizeMeasurements(sizeId);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to fetch measurements'
        };
      }

      const { size, measurements } = result.data;

      // Map to pattern state format
      const patternMeasurements: Partial<import('@/types/pattern').MeasurementsData> = {
        mode: 'standard',
        standardSizeId: size.standard_size_id,
        standardSizeLabel: size.size_label || size.size_name,
        
        // Map measurements
        length: measurements.length || null,
        width: measurements.width || null,
        chestCircumference: measurements.chestCircumference || null,
        bodyLength: measurements.bodyLength || null,
        sleeveLength: measurements.sleeveLength || null,
        shoulderWidth: measurements.shoulderWidth || null,
        armholeDepth: measurements.armholeDepth || null,
        headCircumference: measurements.headCircumference || null,
        hatHeight: measurements.hatHeight || null,
        scarfLength: measurements.scarfLength || null,
        scarfWidth: measurements.scarfWidth || null,
      };

      return {
        success: true,
        measurements: patternMeasurements,
        sizeInfo: {
          id: size.standard_size_id,
          label: size.size_label || size.size_name
        }
      };

    } catch (error) {
      console.error('Error getting measurements for pattern state:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 