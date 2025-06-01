/**
 * Types for Stitch Charts (US_11.5)
 * Defines interfaces for stitch chart generation, symbols, grids, and legends
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
 * Reading direction for chart rows
 */
export type ReadingDirection = 'left_to_right' | 'right_to_left';

/**
 * Chart grid cell - represents one stitch position
 */
export interface ChartGridCell {
  /** Symbol key for this cell */
  symbol_key: string;
  /** Whether this is a "no stitch" position for lace shaping */
  is_no_stitch?: boolean;
}

/**
 * Complete chart symbols definition stored in stitch_patterns.chart_symbols
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
  /** Reading direction for right side (RS) rows */
  reading_direction_rs: ReadingDirection;
  /** Reading direction for wrong side (WS) rows */
  reading_direction_ws: ReadingDirection;
  /** Default craft type for this chart */
  default_craft_type?: CraftType;
}

/**
 * Generated stitch chart data structure
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
  /** Reading directions */
  reading_directions: {
    rs: ReadingDirection;
    ws: ReadingDirection;
  };
  /** Chart metadata */
  metadata: {
    craft_type: CraftType;
    has_no_stitch_cells: boolean;
    generated_at: string;
    stitch_pattern_name: string;
  };
}

/**
 * Chart generation options
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
  count?: number;
}

/**
 * Filters for retrieving standard symbols
 */
export interface StandardSymbolFilters {
  /** Filter by craft type */
  craft_type?: CraftType;
  /** Search by symbol key or description */
  search?: string;
  /** Filter by specific symbol keys */
  symbol_keys?: string[];
} 