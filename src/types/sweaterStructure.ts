/**
 * Types for Sweater Structure Selection (US_4.3)
 * Defines interfaces for construction methods and body shapes
 * Extended for US_12.1: Raglan Top-Down Construction
 */

/**
 * Available construction methods for sweaters
 * Extended for US_12.1 to include raglan_top_down
 */
export type ConstructionMethod = 
  | 'drop_shoulder'
  | 'set_in_sleeve' 
  | 'raglan'
  | 'raglan_top_down'
  | 'dolman';

/**
 * Available body shapes for sweaters
 */
export type BodyShape = 
  | 'straight'
  | 'a_line'
  | 'fitted_shaped_waist'
  | 'oversized_boxy';

/**
 * Construction method option with metadata
 */
export interface ConstructionMethodOption {
  /** Unique key for the construction method */
  key: ConstructionMethod;
  /** Display name */
  display_name: string;
  /** Description of the construction method */
  description: string;
  /** Icon identifier for UI display */
  icon?: string;
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Compatible garment types */
  compatible_garment_types?: string[];
}

/**
 * Body shape option with metadata
 */
export interface BodyShapeOption {
  /** Unique key for the body shape */
  key: BodyShape;
  /** Display name */
  display_name: string;
  /** Description of the body shape */
  description: string;
  /** Icon identifier for UI display */
  icon?: string;
  /** Fit characteristics */
  fit_type?: 'loose' | 'fitted' | 'oversized';
  /** Compatible construction methods */
  compatible_construction_methods?: ConstructionMethod[];
}

/**
 * Selected sweater structure attributes
 */
export interface SweaterStructureAttributes {
  /** Selected construction method */
  construction_method?: ConstructionMethod;
  /** Selected body shape */
  body_shape?: BodyShape;
}

/**
 * Complete sweater structure configuration
 */
export interface SweaterStructureConfig {
  /** Available construction methods */
  construction_methods: ConstructionMethodOption[];
  /** Available body shapes */
  body_shapes: BodyShapeOption[];
}

/**
 * Props for SweaterStructureSelector component
 */
export interface SweaterStructureSelectorProps {
  /** Currently selected garment type ID */
  selectedGarmentTypeId?: string;
  /** Currently selected construction method */
  selectedConstructionMethod?: ConstructionMethod;
  /** Currently selected body shape */
  selectedBodyShape?: BodyShape;
  /** Callback when construction method is selected */
  onConstructionMethodSelect: (method: ConstructionMethod) => void;
  /** Callback when body shape is selected */
  onBodyShapeSelect: (shape: BodyShape) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
} 