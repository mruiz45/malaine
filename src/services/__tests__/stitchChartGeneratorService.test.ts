/**
 * Tests for Stitch Chart Generator Service (US_11.5)
 * Tests chart generation, validation, and utility functions
 */

import {
  generateStitchChart,
  validateChartDefinition,
  hasNoStitchCells,
  generateChartLegend,
  buildChartFromInstructions,
  extractSymbolKeys
} from '../stitchChartGeneratorService';
import { getStitchPattern } from '../stitchPatternService';
import type { 
  StitchPattern,
  CraftType 
} from '@/types/stitchPattern';
import type {
  ChartSymbolsDefinition,
  ChartGridCell,
  StandardStitchSymbol
} from '@/types/stitchChart';

// Mock the stitchPatternService
jest.mock('../stitchPatternService');
const mockGetStitchPattern = getStitchPattern as jest.MockedFunction<typeof getStitchPattern>;

// Mock fetch for API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('StitchChartGeneratorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStitchChart', () => {
    const mockStitchPattern: StitchPattern = {
      id: 'test-pattern-1',
      stitch_name: 'Test Cable Pattern',
      craft_type: 'knitting',
      is_basic: false,
      chart_symbols: {
        width: 4,
        height: 4,
        grid: [
          [
            { symbol_key: 'k' },
            { symbol_key: 'p' },
            { symbol_key: 'k' },
            { symbol_key: 'p' }
          ],
          [
            { symbol_key: 'yo' },
            { symbol_key: 'k2tog' },
            { symbol_key: 'k' },
            { symbol_key: 'k' }
          ],
          [
            { symbol_key: 'k' },
            { symbol_key: 'p' },
            { symbol_key: 'k' },
            { symbol_key: 'p' }
          ],
          [
            { symbol_key: 'ssk' },
            { symbol_key: 'yo' },
            { symbol_key: 'p' },
            { symbol_key: 'p' }
          ]
        ],
        legend: [
          {
            symbol_key: 'k',
            definition: 'Knit on RS, purl on WS',
            graphic_ref: 'symbol_knit.svg'
          },
          {
            symbol_key: 'p',
            definition: 'Purl on RS, knit on WS',
            graphic_ref: 'symbol_purl.svg'
          },
          {
            symbol_key: 'yo',
            definition: 'Yarn over',
            graphic_ref: 'symbol_yo.svg'
          },
          {
            symbol_key: 'k2tog',
            definition: 'Knit 2 together',
            graphic_ref: 'symbol_k2tog.svg'
          },
          {
            symbol_key: 'ssk',
            definition: 'Slip, slip, knit',
            graphic_ref: 'symbol_ssk.svg'
          }
        ],
        reading_direction_rs: 'right_to_left',
        reading_direction_ws: 'left_to_right',
        default_craft_type: 'knitting'
      },
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    };

    const mockStandardSymbols: StandardStitchSymbol[] = [
      {
        symbol_key: 'k',
        craft_type: 'knitting',
        description: 'Knit on RS, purl on WS',
        graphic_asset_url: '/assets/symbols/knit.svg'
      },
      {
        symbol_key: 'p',
        craft_type: 'knitting',
        description: 'Purl on RS, knit on WS',
        graphic_asset_url: '/assets/symbols/purl.svg'
      },
      {
        symbol_key: 'yo',
        craft_type: 'knitting',
        description: 'Yarn over',
        graphic_asset_url: '/assets/symbols/yarn_over.svg'
      },
      {
        symbol_key: 'k2tog',
        craft_type: 'knitting',
        description: 'Knit 2 together',
        graphic_asset_url: '/assets/symbols/k2tog.svg'
      },
      {
        symbol_key: 'ssk',
        craft_type: 'knitting',
        description: 'Slip, slip, knit',
        graphic_asset_url: '/assets/symbols/ssk.svg'
      }
    ];

    beforeEach(() => {
      // Mock successful API response for standard symbols
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStandardSymbols
        })
      } as Response);
    });

    it('should generate chart data for valid stitch pattern', async () => {
      mockGetStitchPattern.mockResolvedValue(mockStitchPattern);

      const chartData = await generateStitchChart('test-pattern-1');

      expect(chartData).toBeDefined();
      expect(chartData.stitch_pattern_id).toBe('test-pattern-1');
      expect(chartData.dimensions.width).toBe(4);
      expect(chartData.dimensions.height).toBe(4);
      expect(chartData.grid).toEqual(mockStitchPattern.chart_symbols!.grid);
      expect(chartData.legend).toEqual(mockStitchPattern.chart_symbols!.legend);
      expect(chartData.reading_directions.rs).toBe('right_to_left');
      expect(chartData.reading_directions.ws).toBe('left_to_right');
      expect(chartData.metadata.craft_type).toBe('knitting');
      expect(chartData.metadata.stitch_pattern_name).toBe('Test Cable Pattern');
      expect(chartData.metadata.has_no_stitch_cells).toBe(false);
    });

    it('should throw error when pattern not found', async () => {
      mockGetStitchPattern.mockResolvedValue(null as any);

      await expect(generateStitchChart('non-existent-pattern'))
        .rejects.toThrow('Stitch pattern with ID non-existent-pattern not found');
    });

    it('should throw error when pattern has no chart symbols', async () => {
      const patternWithoutChart = { ...mockStitchPattern, chart_symbols: undefined };
      mockGetStitchPattern.mockResolvedValue(patternWithoutChart);

      await expect(generateStitchChart('test-pattern-1'))
        .rejects.toThrow("Stitch pattern 'Test Cable Pattern' does not have chart symbols definition");
    });

    it('should respect dimension limits', async () => {
      const largePattern = {
        ...mockStitchPattern,
        chart_symbols: {
          ...mockStitchPattern.chart_symbols!,
          width: 100,
          height: 100
        }
      };
      mockGetStitchPattern.mockResolvedValue(largePattern);

      await expect(generateStitchChart('test-pattern-1', {
        max_dimensions: { width: 50, height: 50 }
      })).rejects.toThrow('Chart dimensions (100x100) exceed maximum allowed (50x50)');
    });

    it('should skip validation when disabled', async () => {
      // Create pattern with invalid chart (missing legend)
      const invalidPattern = {
        ...mockStitchPattern,
        chart_symbols: {
          ...mockStitchPattern.chart_symbols!,
          legend: [] // Empty legend should cause validation error
        }
      };
      mockGetStitchPattern.mockResolvedValue(invalidPattern);

      // Should succeed when validation is disabled
      const chartData = await generateStitchChart('test-pattern-1', {
        validate_symbols: false
      });

      expect(chartData).toBeDefined();
    });
  });

  describe('validateChartDefinition', () => {
    const validChart: ChartSymbolsDefinition = {
      width: 2,
      height: 2,
      grid: [
        [{ symbol_key: 'k' }, { symbol_key: 'p' }],
        [{ symbol_key: 'p' }, { symbol_key: 'k' }]
      ],
      legend: [
        { symbol_key: 'k', definition: 'Knit', graphic_ref: 'knit.svg' },
        { symbol_key: 'p', definition: 'Purl', graphic_ref: 'purl.svg' }
      ],
      reading_direction_rs: 'right_to_left',
      reading_direction_ws: 'left_to_right'
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { symbol_key: 'k', craft_type: 'knitting', description: 'Knit', graphic_asset_url: 'knit.svg' },
            { symbol_key: 'p', craft_type: 'knitting', description: 'Purl', graphic_asset_url: 'purl.svg' }
          ]
        })
      } as Response);
    });

    it('should validate correct chart definition', async () => {
      const result = await validateChartDefinition(validChart, 'knitting');

      expect(result.is_valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missing_symbols).toHaveLength(0);
    });

    it('should detect missing grid', async () => {
      const invalidChart = { ...validChart, grid: undefined as any };

      const result = await validateChartDefinition(invalidChart, 'knitting');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain('Chart grid is missing or invalid');
    });

    it('should detect missing legend', async () => {
      const invalidChart = { ...validChart, legend: undefined as any };

      const result = await validateChartDefinition(invalidChart, 'knitting');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain('Chart legend is missing or invalid');
    });

    it('should detect dimension mismatch', async () => {
      const invalidChart = { ...validChart, height: 3 }; // Grid has 2 rows but height says 3

      const result = await validateChartDefinition(invalidChart, 'knitting');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain('Grid height (2) does not match declared height (3)');
    });

    it('should detect row width mismatch', async () => {
      const invalidChart = {
        ...validChart,
        grid: [
          [{ symbol_key: 'k' }], // Only 1 stitch, should be 2
          [{ symbol_key: 'p' }, { symbol_key: 'k' }]
        ]
      };

      const result = await validateChartDefinition(invalidChart, 'knitting');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain('Row 0 has width 1, expected 2');
    });

    it('should detect symbols used but not in legend', async () => {
      const invalidChart = {
        ...validChart,
        grid: [
          [{ symbol_key: 'k' }, { symbol_key: 'yo' }], // 'yo' not in legend
          [{ symbol_key: 'p' }, { symbol_key: 'k' }]
        ]
      };

      const result = await validateChartDefinition(invalidChart, 'knitting');

      expect(result.is_valid).toBe(false);
      expect(result.errors).toContain("Symbol 'yo' is used in grid but not defined in legend");
      expect(result.missing_symbols).toContain('yo');
    });

    it('should warn about unused legend symbols', async () => {
      const chartWithUnusedSymbol = {
        ...validChart,
        legend: [
          ...validChart.legend,
          { symbol_key: 'yo', definition: 'Yarn over', graphic_ref: 'yo.svg' } // Not used in grid
        ]
      };

      const result = await validateChartDefinition(chartWithUnusedSymbol, 'knitting');

      expect(result.is_valid).toBe(true);
      expect(result.warnings).toContain("Symbol 'yo' is defined in legend but not used in grid");
    });
  });

  describe('hasNoStitchCells', () => {
    it('should detect no-stitch cells by symbol_key', () => {
      const grid: ChartGridCell[][] = [
        [{ symbol_key: 'k' }, { symbol_key: 'no_stitch' }]
      ];

      expect(hasNoStitchCells(grid)).toBe(true);
    });

    it('should detect no-stitch cells by is_no_stitch flag', () => {
      const grid: ChartGridCell[][] = [
        [{ symbol_key: 'k' }, { symbol_key: 'p', is_no_stitch: true }]
      ];

      expect(hasNoStitchCells(grid)).toBe(true);
    });

    it('should return false when no no-stitch cells', () => {
      const grid: ChartGridCell[][] = [
        [{ symbol_key: 'k' }, { symbol_key: 'p' }]
      ];

      expect(hasNoStitchCells(grid)).toBe(false);
    });
  });

  describe('extractSymbolKeys', () => {
    it('should extract unique symbol keys from grid', () => {
      const grid: ChartGridCell[][] = [
        [{ symbol_key: 'k' }, { symbol_key: 'p' }],
        [{ symbol_key: 'p' }, { symbol_key: 'k' }],
        [{ symbol_key: 'yo' }, { symbol_key: 'k' }]
      ];

      const symbolKeys = extractSymbolKeys(grid);

      expect(symbolKeys.sort()).toEqual(['k', 'p', 'yo']);
    });

    it('should handle empty grid', () => {
      const symbolKeys = extractSymbolKeys([]);
      expect(symbolKeys).toEqual([]);
    });

    it('should handle grid with undefined cells', () => {
      const grid: ChartGridCell[][] = [
        [{ symbol_key: 'k' }, undefined as any],
        [{ symbol_key: 'p' }]
      ];

      const symbolKeys = extractSymbolKeys(grid);

      expect(symbolKeys.sort()).toEqual(['k', 'p']);
    });
  });

  describe('buildChartFromInstructions', () => {
    it('should build basic chart from written instructions', () => {
      const pattern: StitchPattern = {
        id: 'test-1',
        stitch_name: 'Basic Ribbing',
        craft_type: 'knitting',
        is_basic: true,
        stitch_repeat_width: 4,
        instructions_written: {
          craft_type: 'knitting',
          rows: [
            { row_num: 1, instruction: 'K2, P2' },
            { row_num: 2, instruction: 'P2, K2' }
          ]
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      const chartDefinition = buildChartFromInstructions(pattern);

      expect(chartDefinition).toBeDefined();
      expect(chartDefinition!.width).toBe(4);
      expect(chartDefinition!.height).toBe(2);
      expect(chartDefinition!.grid).toHaveLength(2);
      expect(chartDefinition!.grid[0]).toHaveLength(4);
      expect(chartDefinition!.legend).toBeDefined();
      expect(chartDefinition!.reading_direction_rs).toBe('right_to_left');
      expect(chartDefinition!.reading_direction_ws).toBe('left_to_right');
    });

    it('should return null for pattern without written instructions', () => {
      const pattern: StitchPattern = {
        id: 'test-1',
        stitch_name: 'No Instructions',
        craft_type: 'knitting',
        is_basic: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      const chartDefinition = buildChartFromInstructions(pattern);

      expect(chartDefinition).toBeNull();
    });

    it('should return null for pattern without rows', () => {
      const pattern: StitchPattern = {
        id: 'test-1',
        stitch_name: 'No Rows',
        craft_type: 'knitting',
        is_basic: true,
        instructions_written: {
          craft_type: 'knitting'
          // No rows property
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      const chartDefinition = buildChartFromInstructions(pattern);

      expect(chartDefinition).toBeNull();
    });
  });

  describe('generateChartLegend', () => {
    const mockStandardSymbols: StandardStitchSymbol[] = [
      {
        symbol_key: 'k',
        craft_type: 'knitting',
        description: 'Knit stitch',
        graphic_asset_url: '/assets/symbols/knit.svg'
      },
      {
        symbol_key: 'p',
        craft_type: 'knitting',
        description: 'Purl stitch',
        graphic_asset_url: '/assets/symbols/purl.svg'
      }
    ];

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockStandardSymbols
        })
      } as Response);
    });

    it('should generate legend for known symbols', async () => {
      const legend = await generateChartLegend(['k', 'p'], 'knitting');

      expect(legend).toHaveLength(2);
      expect(legend[0]).toEqual({
        symbol_key: 'k',
        definition: 'Knit stitch',
        graphic_ref: '/assets/symbols/knit.svg'
      });
      expect(legend[1]).toEqual({
        symbol_key: 'p',
        definition: 'Purl stitch',
        graphic_ref: '/assets/symbols/purl.svg'
      });
    });

    it('should handle unknown symbols', async () => {
      const legend = await generateChartLegend(['k', 'unknown_symbol'], 'knitting');

      expect(legend).toHaveLength(2);
      expect(legend[0].symbol_key).toBe('k');
      expect(legend[1]).toEqual({
        symbol_key: 'unknown_symbol',
        definition: 'Unknown symbol: unknown_symbol',
        graphic_ref: ''
      });
    });

    it('should handle empty symbol list', async () => {
      const legend = await generateChartLegend([], 'knitting');

      expect(legend).toHaveLength(0);
    });
  });
}); 