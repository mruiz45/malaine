/**
 * Types for Sleeve Selection (US_4.5)
 * Defines interfaces for sleeve styles, lengths, and cuff options
 */

import { ConstructionMethod } from './sweaterStructure';

/**
 * Available sleeve styles
 */
export type SleeveStyle = 
  | 'straight'
  | 'tapered'
  | 'puff_cap'
  | 'fitted'
  | 'bell';

/**
 * Available sleeve lengths
 */
export type SleeveLength = 
  | 'cap'
  | 'short'
  | 'elbow'
  | 'three_quarter'
  | 'long'
  | 'custom';

/**
 * Available cuff styles
 */
export type CuffStyle = 
  | 'none'
  | 'ribbed_1x1'
  | 'ribbed_2x2'
  | 'folded'
  | 'bell_flare'
  | 'fitted_band';

/**
 * Sleeve style option with metadata
 */
export interface SleeveStyleOption {
  /** Unique key for the sleeve style */
  key: SleeveStyle;
  /** Display name */
  name: string;
  /** Description of the sleeve style */
  description: string;
  /** Icon identifier for UI display */
  icon?: string;
}

/**
 * Sleeve length option with metadata
 */
export interface SleeveLengthOption {
  /** Unique key for the sleeve length */
  key: SleeveLength;
  /** Display name */
  name: string;
  /** Description of the sleeve length */
  description: string;
  /** Typical length in centimeters */
  typical_length_cm?: number;
  /** Whether this option requires custom input */
  requires_input?: boolean;
  /** Parameter name for custom input */
  input_param?: string;
  /** Icon identifier for UI display */
  icon?: string;
}

/**
 * Cuff style option with metadata
 */
export interface CuffStyleOption {
  /** Unique key for the cuff style */
  key: CuffStyle;
  /** Display name */
  name: string;
  /** Description of the cuff style */
  description: string;
  /** Required parameters for this cuff style */
  params?: string[];
  /** Default values for parameters */
  default_values?: Record<string, number>;
  /** Icon identifier for UI display */
  icon?: string;
}

/**
 * Sleeve styles organized by construction method
 */
export interface SleeveStylesByConstruction {
  [key: string]: SleeveStyleOption[];
}

/**
 * Complete sleeve configuration from component template
 */
export interface SleeveConfiguration {
  /** Sleeve styles organized by construction method */
  styles_by_construction: SleeveStylesByConstruction;
  /** Available sleeve lengths */
  lengths: SleeveLengthOption[];
  /** Available cuff styles */
  cuff_styles: CuffStyleOption[];
  /** Compatibility notes */
  compatibility_notes?: {
    construction_dependencies?: string;
    length_considerations?: string;
    cuff_compatibility?: string;
  };
}

/**
 * User-selected sleeve attributes (stored in pattern_definition_components)
 */
export interface SleeveAttributes {
  /** Selected sleeve style */
  style?: SleeveStyle;
  /** Selected sleeve length */
  length_key?: SleeveLength;
  /** Custom length in cm (if length_key is 'custom') */
  custom_length_cm?: number;
  /** Selected cuff style */
  cuff_style?: CuffStyle;
  /** Cuff depth in cm (for ribbed/folded cuffs) */
  cuff_depth_cm?: number;
  /** Fold depth in cm (for folded cuffs) */
  fold_depth_cm?: number;
  /** Flare width in cm (for bell flare cuffs) */
  flare_width_cm?: number;
  /** Band width in cm (for fitted band cuffs) */
  band_width_cm?: number;
}

/**
 * Cuff parameters for dynamic input fields
 */
export interface CuffParameters {
  /** Cuff depth in cm */
  cuff_depth_cm?: number;
  /** Fold depth in cm */
  fold_depth_cm?: number;
  /** Flare width in cm */
  flare_width_cm?: number;
  /** Band width in cm */
  band_width_cm?: number;
}

/**
 * Props for SleeveSelector component
 */
export interface SleeveSelectorProps {
  /** Currently selected garment type ID */
  selectedGarmentTypeId?: string;
  /** Currently selected construction method */
  selectedConstructionMethod?: ConstructionMethod;
  /** Currently selected sleeve attributes */
  selectedSleeveAttributes?: SleeveAttributes;
  /** Callback when sleeve style is selected */
  onSleeveStyleSelect: (style: SleeveStyle) => void;
  /** Callback when sleeve length is selected */
  onSleeveLengthSelect: (length: SleeveLength, customLength?: number) => void;
  /** Callback when cuff style is selected */
  onCuffStyleSelect: (cuffStyle: CuffStyle, parameters?: CuffParameters) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Validation result for sleeve configuration
 */
export interface SleeveValidationResult {
  /** Whether the configuration is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Helper function type for filtering sleeve styles by construction method
 */
export type SleeveStyleFilter = (
  styles: SleeveStylesByConstruction,
  constructionMethod?: ConstructionMethod
) => SleeveStyleOption[];

/**
 * Helper function type for validating sleeve configuration
 */
export type SleeveValidator = (
  attributes: SleeveAttributes,
  constructionMethod?: ConstructionMethod
) => SleeveValidationResult; 