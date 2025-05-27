/**
 * Garment Type Service (US_4.1)
 * Handles CRUD operations for garment types and their associated component templates
 */

import { createClient } from '@supabase/supabase-js';
import { 
  GarmentType, 
  GarmentTypeWithComponents,
  GarmentTypeComponentWithTemplate,
  GarmentTypesResponse,
  GarmentTypeResponse,
  GarmentTypeWithComponentsResponse,
  ComponentTemplatesResponse
} from '@/types/garment';

/**
 * Service class for managing garment types
 */
export class GarmentTypeService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get all available garment types
   * @returns Promise<GarmentTypesResponse> List of all garment types
   */
  async getAllGarmentTypes(): Promise<GarmentTypesResponse> {
    try {
      const { data, error } = await this.supabase
        .from('garment_types')
        .select('*')
        .order('display_name');

      if (error) {
        console.error('Error fetching garment types:', error);
        return {
          success: false,
          error: `Failed to fetch garment types: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as GarmentType[]
      };
    } catch (error) {
      console.error('Unexpected error in getAllGarmentTypes:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching garment types'
      };
    }
  }

  /**
   * Get a specific garment type by its type key
   * @param typeKey - The unique type key for the garment
   * @returns Promise<GarmentTypeResponse> The garment type data
   */
  async getGarmentTypeByKey(typeKey: string): Promise<GarmentTypeResponse> {
    try {
      const { data, error } = await this.supabase
        .from('garment_types')
        .select('*')
        .eq('type_key', typeKey)
        .single();

      if (error) {
        console.error('Error fetching garment type:', error);
        return {
          success: false,
          error: `Failed to fetch garment type: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as GarmentType
      };
    } catch (error) {
      console.error('Unexpected error in getGarmentTypeByKey:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching garment type'
      };
    }
  }

  /**
   * Get a garment type with all its associated component templates
   * @param typeKey - The unique type key for the garment
   * @returns Promise<GarmentTypeWithComponentsResponse> The garment type with components
   */
  async getGarmentTypeWithComponents(typeKey: string): Promise<GarmentTypeWithComponentsResponse> {
    try {
      // First get the garment type
      const { data: garmentType, error: garmentError } = await this.supabase
        .from('garment_types')
        .select('*')
        .eq('type_key', typeKey)
        .single();

      if (garmentError) {
        console.error('Error fetching garment type:', garmentError);
        return {
          success: false,
          error: `Failed to fetch garment type: ${garmentError.message}`
        };
      }

      // Then get the associated components with their templates
      const { data: components, error: componentsError } = await this.supabase
        .from('garment_type_components')
        .select(`
          *,
          component_template:garment_component_templates(*)
        `)
        .eq('garment_type_id', garmentType.id)
        .order('sort_order');

      if (componentsError) {
        console.error('Error fetching garment components:', componentsError);
        return {
          success: false,
          error: `Failed to fetch garment components: ${componentsError.message}`
        };
      }

      const garmentWithComponents: GarmentTypeWithComponents = {
        ...garmentType,
        components: components as GarmentTypeComponentWithTemplate[]
      };

      return {
        success: true,
        data: garmentWithComponents
      };
    } catch (error) {
      console.error('Unexpected error in getGarmentTypeWithComponents:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching garment type with components'
      };
    }
  }

  /**
   * Get component templates for a specific garment type
   * @param typeKey - The unique type key for the garment
   * @returns Promise<ComponentTemplatesResponse> List of component templates for the garment type
   */
  async getComponentTemplatesForGarmentType(typeKey: string): Promise<ComponentTemplatesResponse> {
    try {
      // Get component templates using a join query
      const { data: templates, error } = await this.supabase
        .from('garment_component_templates')
        .select(`
          *,
          garment_type_components!inner(
            garment_types!inner(type_key)
          )
        `)
        .eq('garment_type_components.garment_types.type_key', typeKey)
        .order('garment_type_components.sort_order');

      if (error) {
        console.error('Error fetching component templates:', error);
        return {
          success: false,
          error: `Failed to fetch component templates: ${error.message}`
        };
      }

      // Clean up the response to return just the template data
      const cleanTemplates = templates?.map(template => ({
        id: template.id,
        component_key: template.component_key,
        display_name: template.display_name,
        description: template.description,
        configurable_attributes: template.configurable_attributes,
        created_at: template.created_at,
        updated_at: template.updated_at
      })) || [];

      return {
        success: true,
        data: cleanTemplates
      };
    } catch (error) {
      console.error('Unexpected error in getComponentTemplatesForGarmentType:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching component templates'
      };
    }
  }

  /**
   * Validate if a garment type key exists
   * @param typeKey - The type key to validate
   * @returns Promise<boolean> True if the garment type exists
   */
  async validateGarmentTypeKey(typeKey: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('garment_types')
        .select('id')
        .eq('type_key', typeKey)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error validating garment type key:', error);
      return false;
    }
  }

  /**
   * Get garment types filtered by difficulty level
   * @param difficultyLevel - The difficulty level to filter by
   * @returns Promise<GarmentTypesResponse> List of garment types for the difficulty level
   */
  async getGarmentTypesByDifficulty(difficultyLevel: 'beginner' | 'intermediate' | 'advanced'): Promise<GarmentTypesResponse> {
    try {
      const { data, error } = await this.supabase
        .from('garment_types')
        .select('*')
        .contains('metadata', { difficulty_level: difficultyLevel })
        .order('display_name');

      if (error) {
        console.error('Error fetching garment types by difficulty:', error);
        return {
          success: false,
          error: `Failed to fetch garment types: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as GarmentType[]
      };
    } catch (error) {
      console.error('Unexpected error in getGarmentTypesByDifficulty:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching garment types by difficulty'
      };
    }
  }
} 