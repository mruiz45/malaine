/**
 * Stitch Chart Generator Service (US_11.5 & US_12.7)
 * Handles generation of stitch chart data structures from stitch patterns
 * Extended to support colorwork patterns with color assignments
 * Follows the established service pattern for the Malaine project
 */

import type { 
  StitchPattern,
  CraftType 
} from '@/types/stitchPattern';
import type {
  StitchChartData,
  ChartValidationResult,
  ChartGenerationOptions,
  StandardStitchSymbol,
  ChartGridCell,
  ChartLegendSymbol,
  ChartSymbolsDefinition,
  ChartColorLegend,
  ColorDefinition
} from '@/types/stitchChart';
import type { YarnProfile } from '@/types/yarn';
import type { 
  ColorAssignment,
  ResolvedColorInfo
} from '@/types/colorworkAssignments';
import { getStitchPattern } from './stitchPatternService';
import { 
  resolveColorInformation,
  validateColorworkAssignments
} from './colorworkAssignmentService';

/**
 * Default chart generation options
 */
const DEFAULT_CHART_OPTIONS: ChartGenerationOptions = {
  include_row_numbers: true,
  include_stitch_numbers: true,
  validate_symbols: true,
  max_dimensions: {
    width: 50,
    height: 50
  }
};

/**
 * Generates a stitch chart data structure from a stitch pattern (US_11.5 & US_12.7)
 * @param stitchPatternId - ID of the stitch pattern to generate chart from
 * @param options - Chart generation options
 * @param colorAssignments - Optional color assignments for colorwork patterns (US_12.7)
 * @param availableYarnProfiles - Available yarn profiles for color resolution (US_12.7)
 * @returns Promise<StitchChartData> The generated chart data
 * @throws Error if pattern not found, invalid chart definition, or generation fails
 */
export async function generateStitchChart(
  stitchPatternId: string,
  options: ChartGenerationOptions = {},
  colorAssignments?: ColorAssignment[],
  availableYarnProfiles?: YarnProfile[]
): Promise<StitchChartData> {
  try {
    // Merge with default options
    const chartOptions = { ...DEFAULT_CHART_OPTIONS, ...options };

    // Fetch the stitch pattern
    const stitchPattern = await getStitchPattern(stitchPatternId);
    
    if (!stitchPattern) {
      throw new Error(`Stitch pattern with ID ${stitchPatternId} not found`);
    }

    // Check if pattern has chart symbols definition
    if (!stitchPattern.chart_symbols) {
      throw new Error(`Stitch pattern '${stitchPattern.stitch_name}' does not have chart symbols definition`);
    }

    // Check dimensions against limits before detailed validation
    if (chartOptions.max_dimensions) {
      const { width, height } = stitchPattern.chart_symbols;
      const { width: maxWidth, height: maxHeight } = chartOptions.max_dimensions;
      
      if (width > maxWidth || height > maxHeight) {
        throw new Error(`Chart dimensions (${width}x${height}) exceed maximum allowed (${maxWidth}x${maxHeight})`);
      }
    }

    // Validate the chart definition
    if (chartOptions.validate_symbols) {
      const validation = await validateChartDefinition(stitchPattern.chart_symbols, stitchPattern.craft_type);
      
      if (!validation.is_valid) {
        throw new Error(`Chart validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Determine if this is a colorwork pattern
    const hasColorwork = !!(stitchPattern.chart_symbols.palette && stitchPattern.chart_symbols.palette.length > 0);
    const hasColorInGrid = stitchPattern.chart_symbols.grid.some(row => 
      row.some(cell => cell.color_key !== undefined)
    );

    // Generate color legend if colorwork pattern (US_12.7)
    let colorLegend: ChartColorLegend[] | undefined;
    if (hasColorwork && (hasColorInGrid || colorAssignments)) {
      colorLegend = await generateColorLegend(
        stitchPattern.chart_symbols.palette!,
        colorAssignments || [],
        availableYarnProfiles || []
      );
    }

    // Generate the chart data structure
    const chartData: StitchChartData = {
      id: `chart_${stitchPatternId}_${Date.now()}`,
      stitch_pattern_id: stitchPatternId,
      dimensions: {
        width: stitchPattern.chart_symbols.width,
        height: stitchPattern.chart_symbols.height
      },
      grid: stitchPattern.chart_symbols.grid,
      legend: stitchPattern.chart_symbols.legend,
      color_legend: colorLegend,
      reading_directions: {
        rs: stitchPattern.chart_symbols.reading_direction_rs,
        ws: stitchPattern.chart_symbols.reading_direction_ws
      },
      metadata: {
        craft_type: stitchPattern.craft_type,
        has_no_stitch_cells: hasNoStitchCells(stitchPattern.chart_symbols.grid),
        has_colorwork: hasColorwork && hasColorInGrid,
        generated_at: new Date().toISOString(),
        stitch_pattern_name: stitchPattern.stitch_name
      }
    };

    return chartData;
  } catch (error) {
    console.error('Error in generateStitchChart:', error);
    throw error;
  }
}

/**
 * Validates a chart symbols definition against standard symbols
 * @param chartDefinition - The chart symbols definition to validate
 * @param craftType - The craft type for validation context
 * @returns Promise<ChartValidationResult> Validation results
 */
export async function validateChartDefinition(
  chartDefinition: ChartSymbolsDefinition,
  craftType: CraftType
): Promise<ChartValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingSymbols: string[] = [];

  try {
    // Basic structure validation
    if (!chartDefinition.grid || !Array.isArray(chartDefinition.grid)) {
      errors.push('Chart grid is missing or invalid');
      return { is_valid: false, errors, warnings, missing_symbols: missingSymbols };
    }

    if (!chartDefinition.legend || !Array.isArray(chartDefinition.legend)) {
      errors.push('Chart legend is missing or invalid');
      return { is_valid: false, errors, warnings, missing_symbols: missingSymbols };
    }

    // Validate dimensions
    if (chartDefinition.width <= 0 || chartDefinition.height <= 0) {
      errors.push('Chart dimensions must be positive numbers');
    }

    if (chartDefinition.grid.length !== chartDefinition.height) {
      errors.push(`Grid height (${chartDefinition.grid.length}) does not match declared height (${chartDefinition.height})`);
    }

    // Validate each row has correct width
    chartDefinition.grid.forEach((row, rowIndex) => {
      if (!Array.isArray(row)) {
        errors.push(`Row ${rowIndex} is not an array`);
        return;
      }
      
      if (row.length !== chartDefinition.width) {
        errors.push(`Row ${rowIndex} has width ${row.length}, expected ${chartDefinition.width}`);
      }
    });

    // Collect all symbol keys used in the grid
    const usedSymbols = new Set<string>();
    chartDefinition.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && cell.symbol_key) {
          usedSymbols.add(cell.symbol_key);
        }
      });
    });

    // Check that all used symbols have legend entries
    const legendSymbols = new Set(chartDefinition.legend.map(l => l.symbol_key));
    
    usedSymbols.forEach(symbol => {
      if (!legendSymbols.has(symbol)) {
        missingSymbols.push(symbol);
        errors.push(`Symbol '${symbol}' is used in grid but not defined in legend`);
      }
    });

    // Check for unused legend entries (warning only)
    legendSymbols.forEach(symbol => {
      if (!usedSymbols.has(symbol)) {
        warnings.push(`Symbol '${symbol}' is defined in legend but not used in grid`);
      }
    });

    // Validate against standard symbols if available
    try {
      const standardSymbols = await getStandardSymbols({ craft_type: craftType });
      const standardSymbolKeys = new Set(standardSymbols.map(s => s.symbol_key));
      
      usedSymbols.forEach(symbol => {
        if (!standardSymbolKeys.has(symbol) && symbol !== 'no_stitch') {
          warnings.push(`Symbol '${symbol}' is not a standard symbol for ${craftType}`);
        }
      });
    } catch (error) {
      // If we can't fetch standard symbols, just log a warning
      warnings.push('Could not validate against standard symbols');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      missing_symbols: missingSymbols
    };

  } catch (error) {
    console.error('Error in validateChartDefinition:', error);
    return {
      is_valid: false,
      errors: ['Validation failed due to unexpected error'],
      warnings,
      missing_symbols: missingSymbols
    };
  }
}

/**
 * Checks if a chart grid contains "no stitch" cells
 * @param grid - The chart grid to check
 * @returns boolean Whether the grid has no-stitch cells
 */
export function hasNoStitchCells(grid: ChartGridCell[][]): boolean {
  return grid.some(row => 
    row.some(cell => 
      cell?.is_no_stitch === true || cell?.symbol_key === 'no_stitch'
    )
  );
}

/**
 * Retrieves standard stitch symbols from the API
 * @param filters - Optional filters for the symbols
 * @returns Promise<StandardStitchSymbol[]> Array of standard symbols
 */
async function getStandardSymbols(filters?: { craft_type?: CraftType }): Promise<StandardStitchSymbol[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (filters?.craft_type) {
      searchParams.append('craft_type', filters.craft_type);
    }

    const url = `/api/stitch-symbols${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch standard symbols');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching standard symbols:', error);
    throw error;
  }
}

/**
 * Generates a legend specific to the symbols used in a chart
 * @param usedSymbolKeys - Array of symbol keys used in the chart
 * @param craftType - Craft type for filtering standard symbols
 * @returns Promise<ChartLegendSymbol[]> Generated legend
 */
export async function generateChartLegend(
  usedSymbolKeys: string[],
  craftType: CraftType
): Promise<ChartLegendSymbol[]> {
  try {
    const standardSymbols = await getStandardSymbols({ craft_type: craftType });
    const symbolMap = new Map(standardSymbols.map(s => [s.symbol_key, s]));
    
    const legend: ChartLegendSymbol[] = [];
    
    usedSymbolKeys.forEach(symbolKey => {
      const standardSymbol = symbolMap.get(symbolKey);
      
      if (standardSymbol) {
        legend.push({
          symbol_key: symbolKey,
          definition: standardSymbol.description,
          graphic_ref: standardSymbol.graphic_asset_url
        });
      } else {
        // For unknown symbols, provide a basic definition
        legend.push({
          symbol_key: symbolKey,
          definition: `Unknown symbol: ${symbolKey}`,
          graphic_ref: '' // Will need to be handled in rendering
        });
      }
    });
    
    return legend;
  } catch (error) {
    console.error('Error generating chart legend:', error);
    throw error;
  }
}

/**
 * Builds a simple chart definition from written instructions (basic conversion)
 * This is a simplified implementation for basic patterns
 * @param stitchPattern - The stitch pattern with written instructions
 * @returns ChartSymbolsDefinition | null The generated chart definition or null if not possible
 */
export function buildChartFromInstructions(stitchPattern: StitchPattern): ChartSymbolsDefinition | null {
  try {
    // This is a basic implementation - more complex patterns would need advanced parsing
    if (!stitchPattern.instructions_written || !stitchPattern.instructions_written.rows) {
      return null;
    }

    const { rows } = stitchPattern.instructions_written;
    const width = stitchPattern.stitch_repeat_width || 4;
    const height = rows.length;

    // For this basic implementation, we'll create a simple grid
    // In a real implementation, this would need sophisticated instruction parsing
    const grid: ChartGridCell[][] = [];
    
    rows.forEach((row, rowIndex) => {
      const gridRow: ChartGridCell[] = [];
      
      // Simple pattern: create basic cells based on row number
      for (let stitchIndex = 0; stitchIndex < width; stitchIndex++) {
        // This is very simplified - real implementation would parse instructions
        gridRow.push({
          symbol_key: (rowIndex + stitchIndex) % 2 === 0 ? 'k' : 'p'
        });
      }
      
      grid.push(gridRow);
    });

    const legend: ChartLegendSymbol[] = [
      {
        symbol_key: 'k',
        definition: 'Knit on RS, purl on WS',
        graphic_ref: 'symbol_knit.svg'
      },
      {
        symbol_key: 'p',
        definition: 'Purl on RS, knit on WS',
        graphic_ref: 'symbol_purl.svg'
      }
    ];

    return {
      width,
      height,
      grid,
      legend,
      reading_direction_rs: 'right_to_left',
      reading_direction_ws: 'left_to_right',
      default_craft_type: stitchPattern.craft_type
    };

  } catch (error) {
    console.error('Error building chart from instructions:', error);
    return null;
  }
}

/**
 * Utility function to extract unique symbol keys from a chart grid
 * @param grid - The chart grid
 * @returns string[] Array of unique symbol keys
 */
export function extractSymbolKeys(grid: ChartGridCell[][]): string[] {
  const symbolKeys = new Set<string>();
  
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell?.symbol_key) {
        symbolKeys.add(cell.symbol_key);
      }
    });
  });
  
  return Array.from(symbolKeys);
}

/**
 * Generates color legend for colorwork patterns (US_12.7)
 * @param colorPalette - Pattern color palette definitions
 * @param colorAssignments - User color assignments
 * @param availableYarnProfiles - Available yarn profiles for resolution
 * @returns Promise<ChartColorLegend[]> Generated color legend
 */
export async function generateColorLegend(
  colorPalette: ColorDefinition[],
  colorAssignments: ColorAssignment[],
  availableYarnProfiles: YarnProfile[]
): Promise<ChartColorLegend[]> {
  try {
    // Validate assignments if provided
    if (colorAssignments.length > 0) {
      const validation = validateColorworkAssignments(
        colorAssignments,
        colorPalette,
        availableYarnProfiles
      );

      if (!validation.isValid) {
        console.warn('Color assignment validation warnings:', validation.errors);
        // Continue with generation but log warnings
      }
    }

    // Resolve color information
    const resolvedColors = await resolveColorInformation(
      colorPalette,
      colorAssignments,
      availableYarnProfiles
    );

    // Convert to chart color legend format
    const colorLegend: ChartColorLegend[] = resolvedColors.map(resolved => ({
      color_key: resolved.color_key,
      name: resolved.color_name,
      hex_code: resolved.hex_code,
      yarn_info: resolved.yarn_profile ? {
        yarn_profile_id: resolved.yarn_profile.id,
        yarn_name: resolved.yarn_profile.yarn_name,
        color_name: resolved.yarn_profile.color_name
      } : undefined
    }));

    return colorLegend;
  } catch (error) {
    console.error('Error generating color legend:', error);
    throw error;
  }
}

/**
 * Checks if a pattern has colorwork (US_12.7)
 * @param chartSymbols - Chart symbols definition
 * @returns boolean Whether the pattern contains colorwork
 */
export function hasColorwork(chartSymbols: ChartSymbolsDefinition): boolean {
  // Check if palette is defined
  if (!chartSymbols.palette || chartSymbols.palette.length === 0) {
    return false;
  }

  // Check if any grid cells have color keys
  return chartSymbols.grid.some(row => 
    row.some(cell => cell.color_key !== undefined)
  );
}

/**
 * Extracts all color keys used in a chart grid (US_12.7)
 * @param grid - Chart grid
 * @returns string[] Array of unique color keys found in the grid
 */
export function extractColorKeys(grid: ChartGridCell[][]): string[] {
  const colorKeys = new Set<string>();

  grid.forEach(row => {
    row.forEach(cell => {
      if (cell.color_key) {
        colorKeys.add(cell.color_key);
      }
    });
  });

  return Array.from(colorKeys);
} 