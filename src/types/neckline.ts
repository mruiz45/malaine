/**
 * Types for Neckline Style Selection (US_4.4)
 * Defines interfaces for neckline styles and their configurable parameters
 */

/**
 * Available neckline styles
 */
export type NecklineStyle = 
  | 'round'
  | 'v_neck'
  | 'boat_neck'
  | 'square_neck'
  | 'turtleneck'
  | 'scoop'
  | 'cowl';

/**
 * Configurable parameters for neckline styles
 */
export interface NecklineParameters {
  /** Depth of the neckline in cm */
  depth_cm?: number;
  /** Width of the neckline at shoulder in cm */
  width_at_shoulder_cm?: number;
  /** Width of the neckline at center in cm */
  width_at_center_cm?: number;
  /** Angle for V-neck styles in degrees */
  angle_degrees?: number;
}

/**
 * Neckline style option with metadata
 */
export interface NecklineStyleOption {
  /** Unique key for the style */
  key: NecklineStyle;
  /** Display name for the style */
  display_name: string;
  /** Description of the style */
  description: string;
  /** Configurable parameters for this style */
  configurable_params: (keyof NecklineParameters)[];
  /** Default values for parameters */
  default_values: Partial<NecklineParameters>;
  /** Difficulty level */
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Compatible garment types */
  compatible_garment_types: string[];
  /** Compatible construction methods */
  compatible_construction_methods?: string[];
}

/**
 * Selected neckline attributes
 */
export interface NecklineAttributes {
  /** Selected neckline style */
  style?: NecklineStyle;
  /** Selected parameters for the style */
  parameters?: NecklineParameters;
}

/**
 * Complete neckline configuration
 */
export interface NecklineConfig {
  /** Available neckline styles */
  styles: NecklineStyleOption[];
}

/**
 * Props for NecklineSelector component
 */
export interface NecklineSelectorProps {
  /** Currently selected garment type ID */
  selectedGarmentTypeId?: string;
  /** Currently selected construction method */
  selectedConstructionMethod?: string;
  /** Currently selected neckline style */
  selectedNecklineStyle?: NecklineStyle;
  /** Currently selected neckline parameters */
  selectedNecklineParameters?: NecklineParameters;
  /** Callback when neckline style is selected */
  onNecklineStyleSelect: (style: NecklineStyle) => void;
  /** Callback when neckline parameters are updated */
  onNecklineParametersUpdate: (parameters: NecklineParameters) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Validation result for neckline parameters
 */
export interface NecklineValidationResult {
  /** Whether the parameters are valid */
  isValid: boolean;
  /** Validation errors by parameter key */
  errors: Partial<Record<keyof NecklineParameters, string>>;
} 