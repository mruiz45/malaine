/**
 * Color Scheme Simulator Types for Malaine Project
 * Corresponds to US_5.1 - Color Scheme Simulator Tool
 */

/**
 * Available template types for color scheme preview
 */
export type ColorSchemeTemplateType = 'stripes' | 'blocks' | 'garment_outline';

/**
 * Color source - either from yarn profile or general palette
 */
export interface ColorSource {
  /** Source type */
  type: 'yarn_profile' | 'palette';
  /** Yarn profile ID if from yarn profile */
  yarn_profile_id?: string;
  /** HEX color code */
  color_hex_code: string;
  /** Display name for the color */
  color_name?: string;
  /** Yarn name if from yarn profile */
  yarn_name?: string;
}

/**
 * Color assignment to template sections
 */
export interface ColorAssignment {
  /** Section identifier in the template */
  section_id: string;
  /** Assigned color source */
  color_source: ColorSource;
}

/**
 * Stripe pattern configuration
 */
export interface StripePattern {
  /** Type of stripe pattern */
  type: 'alternating' | 'sequence';
  /** Color sequence for stripes */
  color_sequence: ColorSource[];
  /** Stripe width in relative units */
  stripe_width?: number;
}

/**
 * Color block configuration
 */
export interface ColorBlockPattern {
  /** Number of blocks */
  block_count: 2 | 3;
  /** Color assignments for each block */
  block_colors: ColorSource[];
  /** Block arrangement */
  arrangement: 'horizontal' | 'vertical';
}

/**
 * Garment outline configuration
 */
export interface GarmentOutlinePattern {
  /** Garment type for outline */
  garment_type: 'sweater' | 'cardigan' | 'vest';
  /** Color assignments for different garment areas */
  area_colors: {
    body?: ColorSource;
    sleeves?: ColorSource;
    neckline?: ColorSource;
    hem?: ColorSource;
  };
}

/**
 * Template-specific configuration
 */
export type TemplateConfiguration = 
  | { type: 'stripes'; config: StripePattern }
  | { type: 'blocks'; config: ColorBlockPattern }
  | { type: 'garment_outline'; config: GarmentOutlinePattern };

/**
 * Complete color scheme definition
 */
export interface ColorScheme {
  /** Unique identifier */
  id?: string;
  /** User-defined name for the scheme */
  name?: string;
  /** Selected template type */
  template_type: ColorSchemeTemplateType;
  /** Selected colors */
  selected_colors: ColorSource[];
  /** Template configuration */
  template_config: TemplateConfiguration;
  /** Color assignments */
  color_assignments: ColorAssignment[];
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Color scheme simulator state
 */
export interface ColorSchemeSimulatorState {
  /** Currently selected colors */
  selectedColors: ColorSource[];
  /** Current template type */
  templateType: ColorSchemeTemplateType;
  /** Current template configuration */
  templateConfig?: TemplateConfiguration;
  /** Current color assignments */
  colorAssignments: ColorAssignment[];
  /** Whether the scheme has been saved */
  isSaved: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
}

/**
 * Props for color scheme simulator component
 */
export interface ColorSchemeSimulatorProps {
  /** Available yarn profiles */
  availableYarnProfiles?: Array<{
    id: string;
    yarn_name: string;
    color_name?: string;
    color_hex_code?: string;
  }>;
  /** Initial color scheme to load */
  initialColorScheme?: ColorScheme;
  /** Callback when scheme is saved */
  onSchemeSaved?: (scheme: ColorScheme) => void;
  /** Callback when simulator is closed */
  onClose?: () => void;
  /** Whether the simulator is in modal mode */
  isModal?: boolean;
}

/**
 * Template section definition for color assignment
 */
export interface TemplateSection {
  /** Section identifier */
  id: string;
  /** Display name for the section */
  name: string;
  /** SVG path or element identifier */
  svg_element: string;
  /** Default color if no assignment */
  default_color?: string;
}

/**
 * Template definition
 */
export interface ColorSchemeTemplate {
  /** Template type */
  type: ColorSchemeTemplateType;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Available sections for color assignment */
  sections: TemplateSection[];
  /** SVG viewBox dimensions */
  viewBox: {
    width: number;
    height: number;
  };
}

/**
 * API response for saving color scheme
 */
export interface SaveColorSchemeResponse {
  success: boolean;
  data?: ColorScheme;
  error?: string;
}

/**
 * Predefined color palette for general colors
 */
export interface ColorPalette {
  /** Palette name */
  name: string;
  /** Available colors */
  colors: Array<{
    name: string;
    hex_code: string;
  }>;
}

/**
 * Default color palettes
 */
export const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  {
    name: 'Basic Colors',
    colors: [
      { name: 'Red', hex_code: '#FF0000' },
      { name: 'Blue', hex_code: '#0000FF' },
      { name: 'Green', hex_code: '#00FF00' },
      { name: 'Yellow', hex_code: '#FFFF00' },
      { name: 'Purple', hex_code: '#800080' },
      { name: 'Orange', hex_code: '#FFA500' },
      { name: 'Pink', hex_code: '#FFC0CB' },
      { name: 'Brown', hex_code: '#A52A2A' },
      { name: 'Black', hex_code: '#000000' },
      { name: 'White', hex_code: '#FFFFFF' },
      { name: 'Gray', hex_code: '#808080' }
    ]
  },
  {
    name: 'Pastels',
    colors: [
      { name: 'Pastel Pink', hex_code: '#FFD1DC' },
      { name: 'Pastel Blue', hex_code: '#AEC6CF' },
      { name: 'Pastel Green', hex_code: '#77DD77' },
      { name: 'Pastel Yellow', hex_code: '#FDFD96' },
      { name: 'Pastel Purple', hex_code: '#DDA0DD' },
      { name: 'Pastel Orange', hex_code: '#FFCBA4' }
    ]
  },
  {
    name: 'Earth Tones',
    colors: [
      { name: 'Terracotta', hex_code: '#E2725B' },
      { name: 'Sage Green', hex_code: '#9CAF88' },
      { name: 'Warm Beige', hex_code: '#F5F5DC' },
      { name: 'Rust', hex_code: '#B7410E' },
      { name: 'Olive', hex_code: '#808000' },
      { name: 'Cream', hex_code: '#FFFDD0' }
    ]
  }
]; 