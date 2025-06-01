/**
 * Types for Stitch Charts (US_11.5 & US_12.7 & US_12.8)
 * Defines interfaces for stitch chart generation, symbols, grids, legends and colorwork
 */

import type { CraftType } from './stitchPattern';

/**
 * Standard stitch symbol definition
 */
export interface StandardStitchSymbol {
  /** Unique key for the symbol (e.g., "k", "p", "yo", "k2tog") */
  symbol_key: string;
  /** Craft type this symbol applies to */
  craft_type: CraftType;
  /** Human-readable description of the symbol */
  description: string;
  /** URL/path to the graphic asset (SVG or image) */
  graphic_asset_url: string;
  /** Additional notes about the symbol */
  notes?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Symbol definition in a chart legend
 */
export interface ChartLegendSymbol {
  /** Symbol key used in the grid */
  symbol_key: string;
  /** Definition/description for this specific chart */
  definition: string;
  /** Reference to the graphic asset */
  graphic_ref: string;
}

/**
 * Color definition in a stitch pattern palette (US_12.7)
 */
export interface ColorDefinition {
  /** Color key used in the pattern (e.g., "MC", "CC1", "CC2") */
  key: string;
  /** Human-readable name for the color role */
  name: string;
  /** Default hex color code for this role */
  default_hex: string;
}

/**
 * Color legend entry for rendered charts (US_12.7)
 */
export interface ChartColorLegend {
  /** Color key from the pattern palette */
  color_key: string;
  /** Display name for this color */
  name: string;
  /** Actual hex color code to display */
  hex_code: string;
  /** Optional yarn information if assigned */
  yarn_info?: {
    yarn_profile_id: string;
    yarn_name: string;
    color_name?: string;
  };
}

/**
 * Reading direction for chart rows
 */
export type ReadingDirection = 'left_to_right' | 'right_to_left';

/**
 * Chart grid cell - represents one stitch position (US_11.5 & US_12.7)
 */
export interface ChartGridCell {
  /** Symbol key for this cell */
  symbol_key: string;
  /** Color key for this cell (US_12.7) */
  color_key?: string;
  /** Whether this is a "no stitch" position for lace shaping */
  is_no_stitch?: boolean;
}

/**
 * Complete chart symbols definition stored in stitch_patterns.chart_symbols (US_11.5 & US_12.7)
 */
export interface ChartSymbolsDefinition {
  /** Width of the chart in stitches */
  width: number;
  /** Height of the chart in rows */
  height: number;
  /** 2D grid representing the chart - [row][stitch] */
  grid: ChartGridCell[][];
  /** Legend of symbols used in this specific chart */
  legend: ChartLegendSymbol[];
  /** Color palette for colorwork patterns (US_12.7) */
  palette?: ColorDefinition[];
  /** Reading direction for right side (RS) rows */
  reading_direction_rs: ReadingDirection;
  /** Reading direction for wrong side (WS) rows */
  reading_direction_ws: ReadingDirection;
  /** Default craft type for this chart */
  default_craft_type?: CraftType;
}

/**
 * Generated stitch chart data structure (US_11.5 & US_12.7 & US_12.8)
 */
export interface StitchChartData {
  /** Unique identifier for the chart */
  id: string;
  /** Source stitch pattern ID */
  stitch_pattern_id: string;
  /** Chart dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** 2D grid of symbol keys */
  grid: ChartGridCell[][];
  /** Legend specific to this chart */
  legend: ChartLegendSymbol[];
  /** Color legend for colorwork patterns (US_12.7) */
  color_legend?: ChartColorLegend[];
  /** Reading directions */
  reading_directions: {
    rs: ReadingDirection;
    ws: ReadingDirection;
  };
  /** Chart metadata */
  metadata: {
    craft_type: CraftType;
    has_no_stitch_cells: boolean;
    has_colorwork: boolean;
    generated_at: string;
    stitch_pattern_name: string;
    /** Width of one stitch repeat (US_12.8) */
    stitch_repeat_width?: number;
    /** Height of one stitch repeat (US_12.8) */
    stitch_repeat_height?: number;
  };
}

/**
 * Chart generation options (US_11.5 & US_12.7)
 */
export interface ChartGenerationOptions {
  /** Whether to include row numbers */
  include_row_numbers?: boolean;
  /** Whether to include stitch numbers */
  include_stitch_numbers?: boolean;
  /** Whether to validate all symbols against standard library */
  validate_symbols?: boolean;
  /** Maximum chart dimensions for safety */
  max_dimensions?: {
    width: number;
    height: number;
  };
  /** Color assignments for colorwork patterns (US_12.7) */
  color_assignments?: Record<string, string>;
}

/**
 * Chart validation result
 */
export interface ChartValidationResult {
  /** Whether the chart is valid */
  is_valid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Missing symbols that need to be defined */
  missing_symbols: string[];
}

/**
 * Response type for chart generation
 */
export interface StitchChartResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Generated chart data */
  data?: StitchChartData;
  /** Error message if failed */
  error?: string;
  /** Validation details */
  validation?: ChartValidationResult;
}

/**
 * Response type for standard symbols
 */
export interface StandardSymbolsResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Array of standard symbols */
  data?: StandardStitchSymbol[];
  /** Error message if failed */
  error?: string;
  /** Total count of symbols */
  total?: number;
}

/**
 * Color assignment for colorwork chart generation (US_12.7)
 */
export interface ColorAssignment {
  /** Color key from the pattern palette */
  color_key: string;
  /** Assigned hex color code */
  hex_code: string;
  /** Optional yarn profile reference */
  yarn_profile_id?: string;
}

/**
 * Yarn profile for color resolution (US_12.7)
 */
export interface YarnProfile {
  /** Unique identifier */
  id: string;
  /** Yarn name/brand */
  name: string;
  /** Available colors */
  colors: YarnColor[];
}

/**
 * Yarn color definition (US_12.7)
 */
export interface YarnColor {
  /** Color name */
  name: string;
  /** Hex color code */
  hex_code: string;
  /** Color number/code from manufacturer */
  color_code?: string;
}

/**
 * Standard symbol filters for API queries
 */
export interface StandardSymbolFilters {
  /** Filter by craft type */
  craft_type?: CraftType;
  /** Search by symbol key or description */
  search?: string;
  /** Filter by specific symbol keys */
  symbol_keys?: string[];
} 