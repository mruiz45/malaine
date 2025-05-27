/**
 * Garment Component Service (US_4.1)
 * Handles CRUD operations for pattern definition components within sessions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { 
  PatternDefinitionComponent,
  PatternDefinitionComponentWithTemplate,
  CreatePatternDefinitionComponentData,
  UpdatePatternDefinitionComponentData,
  PatternDefinitionComponentsResponse,
  PatternDefinitionComponentResponse
} from '@/types/garment';

/**
 * Service class for managing pattern definition components
 * This service requires an authenticated Supabase client
 */
export class GarmentComponentService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Get all components for a specific pattern definition session
   * @param sessionId - The pattern definition session ID
   * @returns Promise<PatternDefinitionComponentsResponse> List of components with templates
   */
  async getComponentsForSession(sessionId: string): Promise<PatternDefinitionComponentsResponse> {
    try {
      const { data, error } = await this.supabase
        .from('pattern_definition_components')
        .select(`
          *,
          component_template:garment_component_templates(*)
        `)
        .eq('pattern_definition_session_id', sessionId)
        .order('sort_order');

      if (error) {
        console.error('Error fetching pattern definition components:', error);
        return {
          success: false,
          error: `Failed to fetch components: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as PatternDefinitionComponentWithTemplate[]
      };
    } catch (error) {
      console.error('Unexpected error in getComponentsForSession:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching components'
      };
    }
  }

  /**
   * Create a new pattern definition component
   * @param componentData - The component data to create
   * @returns Promise<PatternDefinitionComponentResponse> The created component
   */
  async createComponent(componentData: CreatePatternDefinitionComponentData): Promise<PatternDefinitionComponentResponse> {
    try {
      // Validate that the session exists and belongs to the user
      const { data: session, error: sessionError } = await this.supabase
        .from('pattern_definition_sessions')
        .select('id')
        .eq('id', componentData.pattern_definition_session_id)
        .single();

      if (sessionError || !session) {
        return {
          success: false,
          error: 'Pattern definition session not found or access denied'
        };
      }

      // Validate that the component template exists
      const { data: template, error: templateError } = await this.supabase
        .from('garment_component_templates')
        .select('id')
        .eq('id', componentData.component_template_id)
        .single();

      if (templateError || !template) {
        return {
          success: false,
          error: 'Component template not found'
        };
      }

      // Create the component
      const { data, error } = await this.supabase
        .from('pattern_definition_components')
        .insert([{
          pattern_definition_session_id: componentData.pattern_definition_session_id,
          component_template_id: componentData.component_template_id,
          component_label: componentData.component_label,
          selected_attributes: componentData.selected_attributes || {},
          measurement_overrides: componentData.measurement_overrides || {},
          ease_overrides: componentData.ease_overrides || {},
          notes: componentData.notes,
          sort_order: componentData.sort_order || 0
        }])
        .select(`
          *,
          component_template:garment_component_templates(*)
        `)
        .single();

      if (error) {
        console.error('Error creating pattern definition component:', error);
        return {
          success: false,
          error: `Failed to create component: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as PatternDefinitionComponentWithTemplate
      };
    } catch (error) {
      console.error('Unexpected error in createComponent:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while creating component'
      };
    }
  }

  /**
   * Update an existing pattern definition component
   * @param componentId - The component ID to update
   * @param updateData - The data to update
   * @returns Promise<PatternDefinitionComponentResponse> The updated component
   */
  async updateComponent(componentId: string, updateData: UpdatePatternDefinitionComponentData): Promise<PatternDefinitionComponentResponse> {
    try {
      const { data, error } = await this.supabase
        .from('pattern_definition_components')
        .update({
          component_label: updateData.component_label,
          selected_attributes: updateData.selected_attributes,
          measurement_overrides: updateData.measurement_overrides,
          ease_overrides: updateData.ease_overrides,
          notes: updateData.notes,
          sort_order: updateData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', componentId)
        .select(`
          *,
          component_template:garment_component_templates(*)
        `)
        .single();

      if (error) {
        console.error('Error updating pattern definition component:', error);
        return {
          success: false,
          error: `Failed to update component: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as PatternDefinitionComponentWithTemplate
      };
    } catch (error) {
      console.error('Unexpected error in updateComponent:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while updating component'
      };
    }
  }

  /**
   * Delete a pattern definition component
   * @param componentId - The component ID to delete
   * @returns Promise<{success: boolean, error?: string}> Success status
   */
  async deleteComponent(componentId: string): Promise<{success: boolean, error?: string}> {
    try {
      const { error } = await this.supabase
        .from('pattern_definition_components')
        .delete()
        .eq('id', componentId);

      if (error) {
        console.error('Error deleting pattern definition component:', error);
        return {
          success: false,
          error: `Failed to delete component: ${error.message}`
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in deleteComponent:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while deleting component'
      };
    }
  }

  /**
   * Get a specific pattern definition component by ID
   * @param componentId - The component ID
   * @returns Promise<PatternDefinitionComponentResponse> The component data
   */
  async getComponentById(componentId: string): Promise<PatternDefinitionComponentResponse> {
    try {
      const { data, error } = await this.supabase
        .from('pattern_definition_components')
        .select(`
          *,
          component_template:garment_component_templates(*)
        `)
        .eq('id', componentId)
        .single();

      if (error) {
        console.error('Error fetching pattern definition component:', error);
        return {
          success: false,
          error: `Failed to fetch component: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as PatternDefinitionComponentWithTemplate
      };
    } catch (error) {
      console.error('Unexpected error in getComponentById:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while fetching component'
      };
    }
  }

  /**
   * Bulk create components for a session based on a garment type
   * @param sessionId - The pattern definition session ID
   * @param garmentTypeKey - The garment type key to create components for
   * @returns Promise<PatternDefinitionComponentsResponse> The created components
   */
  async createComponentsFromGarmentType(sessionId: string, garmentTypeKey: string): Promise<PatternDefinitionComponentsResponse> {
    try {
      // First get the garment type and its required components
      const { data: garmentTypeData, error: garmentError } = await this.supabase
        .from('garment_types')
        .select(`
          id,
          garment_type_components(
            component_template_id,
            is_required,
            default_quantity,
            sort_order,
            component_template:garment_component_templates(*)
          )
        `)
        .eq('type_key', garmentTypeKey)
        .single();

      if (garmentError || !garmentTypeData) {
        return {
          success: false,
          error: 'Garment type not found'
        };
      }

      // Create components for all required and default components
      const componentsToCreate: CreatePatternDefinitionComponentData[] = [];
      
             garmentTypeData.garment_type_components.forEach((gtc: any) => {
         for (let i = 0; i < gtc.default_quantity; i++) {
           const label = gtc.default_quantity > 1 
             ? `${gtc.component_template.display_name} ${i + 1}`
             : gtc.component_template.display_name;

          componentsToCreate.push({
            pattern_definition_session_id: sessionId,
            component_template_id: gtc.component_template_id,
            component_label: label,
            selected_attributes: {},
            measurement_overrides: {},
            ease_overrides: {},
            sort_order: gtc.sort_order * 10 + i // Ensure proper ordering
          });
        }
      });

      // Bulk insert the components
      const { data, error } = await this.supabase
        .from('pattern_definition_components')
        .insert(componentsToCreate)
        .select(`
          *,
          component_template:garment_component_templates(*)
        `);

      if (error) {
        console.error('Error creating components from garment type:', error);
        return {
          success: false,
          error: `Failed to create components: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as PatternDefinitionComponentWithTemplate[]
      };
    } catch (error) {
      console.error('Unexpected error in createComponentsFromGarmentType:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while creating components from garment type'
      };
    }
  }

  /**
   * Validate component attributes against the template's configurable attributes
   * @param templateId - The component template ID
   * @param attributes - The attributes to validate
   * @returns Promise<{valid: boolean, errors?: string[]}> Validation result
   */
  async validateComponentAttributes(templateId: string, attributes: Record<string, any>): Promise<{valid: boolean, errors?: string[]}> {
    try {
      const { data: template, error } = await this.supabase
        .from('garment_component_templates')
        .select('configurable_attributes')
        .eq('id', templateId)
        .single();

      if (error || !template) {
        return {
          valid: false,
          errors: ['Component template not found']
        };
      }

      const errors: string[] = [];
      const configurableAttrs = template.configurable_attributes;

      // Validate each attribute against the template's allowed values
      Object.entries(attributes).forEach(([key, value]) => {
        if (configurableAttrs[key]) {
          const allowedValues = configurableAttrs[key];
          if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
            errors.push(`Invalid value '${value}' for attribute '${key}'. Allowed values: ${allowedValues.join(', ')}`);
          }
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Unexpected error in validateComponentAttributes:', error);
      return {
        valid: false,
        errors: ['An unexpected error occurred during validation']
      };
    }
  }
} 