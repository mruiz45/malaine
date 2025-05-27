/**
 * Types for Garment Models (US_4.1)
 * Defines interfaces for garment types, component templates, and pattern definition components
 */

/**
 * Base garment type interface matching the database schema
 */
export interface GarmentType {
  /** Unique identifier for the garment type */
  id: string;
  /** Unique key for the garment type (e.g., 'sweater_pullover', 'cardigan') */
  type_key: string;
  /** Display name for the garment type */
  display_name: string;
  /** Description of the garment type */
  description?: string;
  /** Metadata including construction methods, difficulty level, etc. */
  metadata: Record<string, any>;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Garment component template interface matching the database schema
 */
export interface GarmentComponentTemplate {
  /** Unique identifier for the component template */
  id: string;
  /** Unique key for the component (e.g., 'body_panel', 'sleeve', 'neckband') */
  component_key: string;
  /** Display name for the component */
  display_name: string;
  /** Description of the component */
  description?: string;
  /** Configurable attributes for this component type */
  configurable_attributes: Record<string, any>;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Pattern definition component interface matching the database schema
 */
export interface PatternDefinitionComponent {
  /** Unique identifier for the component instance */
  id: string;
  /** Reference to the pattern definition session */
  pattern_definition_session_id: string;
  /** Reference to the component template */
  component_template_id: string;
  /** User-defined label for this component instance */
  component_label?: string;
  /** User-selected attributes for this specific component */
  selected_attributes: Record<string, any>;
  /** Measurement overrides specific to this component */
  measurement_overrides: Record<string, any>;
  /** Ease overrides specific to this component */
  ease_overrides: Record<string, any>;
  /** User notes for this component */
  notes?: string;
  /** Sort order for display */
  sort_order: number;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Junction table interface for garment type to component relationships
 */
export interface GarmentTypeComponent {
  /** Unique identifier */
  id: string;
  /** Reference to the garment type */
  garment_type_id: string;
  /** Reference to the component template */
  component_template_id: string;
  /** Whether this component is required for this garment type */
  is_required: boolean;
  /** Default quantity of this component for this garment type */
  default_quantity: number;
  /** Sort order for display */
  sort_order: number;
  /** Creation timestamp */
  created_at: string;
}

/**
 * Extended garment type with associated component templates
 */
export interface GarmentTypeWithComponents extends GarmentType {
  /** Associated component templates */
  components: GarmentTypeComponentWithTemplate[];
}

/**
 * Extended garment type component with populated template data
 */
export interface GarmentTypeComponentWithTemplate extends GarmentTypeComponent {
  /** Populated component template data */
  component_template: GarmentComponentTemplate;
}

/**
 * Extended pattern definition component with populated template data
 */
export interface PatternDefinitionComponentWithTemplate extends PatternDefinitionComponent {
  /** Populated component template data */
  component_template: GarmentComponentTemplate;
}

/**
 * Data for creating a new pattern definition component
 */
export interface CreatePatternDefinitionComponentData {
  /** Reference to the pattern definition session */
  pattern_definition_session_id: string;
  /** Reference to the component template */
  component_template_id: string;
  /** User-defined label for this component instance */
  component_label?: string;
  /** User-selected attributes for this specific component */
  selected_attributes?: Record<string, any>;
  /** Measurement overrides specific to this component */
  measurement_overrides?: Record<string, any>;
  /** Ease overrides specific to this component */
  ease_overrides?: Record<string, any>;
  /** User notes for this component */
  notes?: string;
  /** Sort order for display */
  sort_order?: number;
}

/**
 * Data for updating a pattern definition component
 */
export interface UpdatePatternDefinitionComponentData {
  /** User-defined label for this component instance */
  component_label?: string;
  /** User-selected attributes for this specific component */
  selected_attributes?: Record<string, any>;
  /** Measurement overrides specific to this component */
  measurement_overrides?: Record<string, any>;
  /** Ease overrides specific to this component */
  ease_overrides?: Record<string, any>;
  /** User notes for this component */
  notes?: string;
  /** Sort order for display */
  sort_order?: number;
}

/**
 * Common configurable attribute types for components
 */
export interface ComponentAttributes {
  /** Length options for components that have length */
  length_options?: string[];
  /** Style options for components */
  style_options?: string[];
  /** Shaping options for components */
  shaping_options?: string[];
  /** Construction options */
  construction?: string[];
  /** Cuff options for sleeves */
  cuff_options?: string[];
  /** Depth options for necklines */
  depth_options?: string[];
  /** Width options for bands */
  width_options?: string[];
  /** Button spacing options */
  button_spacing?: string[];
  /** Edge finish options */
  edge_finish?: string[];
  /** Shaping methods */
  shaping?: string[];
}

/**
 * Garment metadata structure
 */
export interface GarmentMetadata {
  /** Available construction methods for this garment type */
  construction_methods?: string[];
  /** Difficulty level */
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  /** Typical components for this garment */
  typical_components?: string[];
  /** Estimated time to complete */
  estimated_time?: string;
  /** Skill requirements */
  required_skills?: string[];
}

/**
 * API Response types
 */

/**
 * Response for garment types list
 */
export interface GarmentTypesResponse {
  /** Success status */
  success: boolean;
  /** Garment types data */
  data?: GarmentType[];
  /** Error message if any */
  error?: string;
}

/**
 * Response for single garment type
 */
export interface GarmentTypeResponse {
  /** Success status */
  success: boolean;
  /** Garment type data */
  data?: GarmentType;
  /** Error message if any */
  error?: string;
}

/**
 * Response for garment type with components
 */
export interface GarmentTypeWithComponentsResponse {
  /** Success status */
  success: boolean;
  /** Garment type with components data */
  data?: GarmentTypeWithComponents;
  /** Error message if any */
  error?: string;
}

/**
 * Response for component templates list
 */
export interface ComponentTemplatesResponse {
  /** Success status */
  success: boolean;
  /** Component templates data */
  data?: GarmentComponentTemplate[];
  /** Error message if any */
  error?: string;
}

/**
 * Response for pattern definition components
 */
export interface PatternDefinitionComponentsResponse {
  /** Success status */
  success: boolean;
  /** Pattern definition components data */
  data?: PatternDefinitionComponentWithTemplate[];
  /** Error message if any */
  error?: string;
}

/**
 * Response for single pattern definition component
 */
export interface PatternDefinitionComponentResponse {
  /** Success status */
  success: boolean;
  /** Pattern definition component data */
  data?: PatternDefinitionComponentWithTemplate;
  /** Error message if any */
  error?: string;
} 