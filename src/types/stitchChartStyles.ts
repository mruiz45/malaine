/**
 * Types for Stitch Chart Style Preferences (US_12.8)
 * Defines interfaces for customizing stitch chart appearance in web and PDF export
 */

/**
 * Color options for stitch chart styling
 */
export interface StitchChartColorOptions {
  /** Symbol color for monochrome charts */
  symbolColor?: string;
  /** Background color for cells */
  backgroundColor?: string;
  /** Grid line color */
  gridColor?: string;
  /** Color for "no stitch" cells */
  noStitchColor?: string;
  /** Text color for numbers and labels */
  textColor?: string;
}

/**
 * Grid display options
 */
export interface StitchChartGridOptions {
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Grid line width in pixels */
  gridLineWidth?: number;
  /** Grid line style */
  gridLineStyle?: 'solid' | 'dashed' | 'dotted';
}

/**
 * Pattern repeat highlighting options
 */
export interface StitchChartRepeatOptions {
  /** Whether to highlight pattern repeats */
  highlightRepeats?: boolean;
  /** Color for repeat highlighting */
  repeatHighlightColor?: string;
  /** Opacity for repeat highlighting (0-1) */
  repeatHighlightOpacity?: number;
  /** Style for repeat borders */
  repeatBorderStyle?: 'solid' | 'dashed' | 'dotted';
  /** Width of repeat borders */
  repeatBorderWidth?: number;
}

/**
 * Complete style preferences for stitch charts
 */
export interface StitchChartStylePreferences {
  /** Unique identifier for the preference set */
  id: string;
  /** User-friendly name for the preference set */
  name?: string;
  /** Color styling options */
  colors: StitchChartColorOptions;
  /** Grid display options */
  grid: StitchChartGridOptions;
  /** Pattern repeat highlighting options */
  repeats: StitchChartRepeatOptions;
  /** Whether this is a user-created or default preference */
  isDefault?: boolean;
  /** Timestamp when preference was created */
  createdAt?: string;
  /** Timestamp when preference was last updated */
  updatedAt?: string;
}

/**
 * Options for applying styles to a stitch chart component
 */
export interface DiagramStyleOptions {
  /** Color options to apply */
  colors?: StitchChartColorOptions;
  /** Grid options to apply */
  grid?: StitchChartGridOptions;
  /** Repeat highlighting options to apply */
  repeats?: StitchChartRepeatOptions;
  /** Whether the chart is monochrome (affects available color options) */
  isMonochrome?: boolean;
  /** Whether the chart has pattern repeats defined */
  hasRepeats?: boolean;
}

/**
 * Default color schemes for quick selection
 */
export type ColorScheme = 'default' | 'high_contrast' | 'print_friendly' | 'dark_mode' | 'colorblind_friendly';

/**
 * Predefined color schemes
 */
export interface PredefinedColorScheme {
  id: ColorScheme;
  name: string;
  description: string;
  colors: StitchChartColorOptions;
}

/**
 * Style preset combining all styling options
 */
export interface StitchChartStylePreset {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  preferences: StitchChartStylePreferences;
}

/**
 * Export format for style preferences
 */
export interface StylePreferencesExport {
  /** Exported preferences */
  preferences: StitchChartStylePreferences[];
  /** Export timestamp */
  exportedAt: string;
  /** Export version for compatibility */
  exportVersion: string;
}

/**
 * Default style values
 */
export const DEFAULT_STYLE_PREFERENCES: StitchChartStylePreferences = {
  id: 'default',
  name: 'Default',
  colors: {
    symbolColor: '#333333',
    backgroundColor: '#ffffff',
    gridColor: '#333333',
    noStitchColor: '#e5e5e5',
    textColor: '#333333'
  },
  grid: {
    showGrid: true,
    gridLineWidth: 1,
    gridLineStyle: 'solid'
  },
  repeats: {
    highlightRepeats: false,
    repeatHighlightColor: '#3b82f6',
    repeatHighlightOpacity: 0.2,
    repeatBorderStyle: 'dashed',
    repeatBorderWidth: 2
  },
  isDefault: true
};

/**
 * Predefined color schemes for common use cases
 */
export const PREDEFINED_COLOR_SCHEMES: PredefinedColorScheme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard black symbols on white background',
    colors: {
      symbolColor: '#333333',
      backgroundColor: '#ffffff',
      gridColor: '#333333',
      noStitchColor: '#e5e5e5',
      textColor: '#333333'
    }
  },
  {
    id: 'high_contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for better visibility',
    colors: {
      symbolColor: '#000000',
      backgroundColor: '#ffffff',
      gridColor: '#000000',
      noStitchColor: '#cccccc',
      textColor: '#000000'
    }
  },
  {
    id: 'print_friendly',
    name: 'Print Friendly',
    description: 'Optimized for black and white printing',
    colors: {
      symbolColor: '#000000',
      backgroundColor: '#ffffff',
      gridColor: '#666666',
      noStitchColor: '#f0f0f0',
      textColor: '#000000'
    }
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Dark background for reduced eye strain',
    colors: {
      symbolColor: '#ffffff',
      backgroundColor: '#1f2937',
      gridColor: '#9ca3af',
      noStitchColor: '#374151',
      textColor: '#ffffff'
    }
  },
  {
    id: 'colorblind_friendly',
    name: 'Colorblind Friendly',
    description: 'High contrast with colorblind-safe colors',
    colors: {
      symbolColor: '#000000',
      backgroundColor: '#fff8dc',
      gridColor: '#8b4513',
      noStitchColor: '#d2b48c',
      textColor: '#000000'
    }
  }
]; 