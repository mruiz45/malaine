/**
 * Tests for Stitch Chart Generator Service (US_11.5 & US_12.7)
 * Tests chart generation, validation, colorwork features, and utility functions
 */

import {
  generateStitchChart,
  validateChartDefinition,
  hasNoStitchCells,
  generateChartLegend,
  buildChartFromInstructions,
  extractSymbolKeys,
  generateColorLegend,
  hasColorwork,
  extractColorKeys
} from '../stitchChartGeneratorService';
import { getStitchPattern } from '../stitchPatternService';
import type { 
  StitchPattern,
  CraftType 
} from '@/types/stitchPattern';
import type {
  ChartSymbolsDefinition,
  ChartGridCell,
  StandardStitchSymbol,
  ColorDefinition
} from '@/types/stitchChart';
import type { 
  ColorAssignment 
} from '@/types/colorworkAssignments';
import type { YarnProfile } from '@/types/yarn';

// Mock the stitchPatternService
jest.mock('../stitchPatternService');
const mockedGetStitchPattern = getStitchPattern as jest.MockedFunction<typeof getStitchPattern>;

// Mock colorwork assignment service
jest.mock('../colorworkAssignmentService', () => ({
  resolveColorInformation: jest.fn(),
  validateColorworkAssignments: jest.fn()
}));

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
      mockedGetStitchPattern.mockResolvedValue(mockStitchPattern);

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
      mockedGetStitchPattern.mockResolvedValue(null as any);

      await expect(generateStitchChart('non-existent-pattern'))
        .rejects.toThrow('Stitch pattern with ID non-existent-pattern not found');
    });

    it('should throw error when pattern has no chart symbols', async () => {
      const patternWithoutChart = { ...mockStitchPattern, chart_symbols: undefined };
      mockedGetStitchPattern.mockResolvedValue(patternWithoutChart);

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
      mockedGetStitchPattern.mockResolvedValue(largePattern);

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
      mockedGetStitchPattern.mockResolvedValue(invalidPattern);

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

  describe('Colorwork functionality (US_12.7)', () => {
    const mockColorworkPattern: StitchPattern = {
      id: 'colorwork-test-pattern',
      stitch_name: 'Simple Fair Isle',
      craft_type: 'knitting',
      is_basic: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      chart_symbols: {
        width: 4,
        height: 2,
        palette: [
          { key: 'MC', name: 'Main Color', default_hex: '#000080' },
          { key: 'CC1', name: 'Contrast Color 1', default_hex: '#FFFDD0' }
        ],
        grid: [
          [
            { symbol_key: 'k', color_key: 'MC' },
            { symbol_key: 'k', color_key: 'CC1' },
            { symbol_key: 'k', color_key: 'CC1' },
            { symbol_key: 'k', color_key: 'MC' }
          ],
          [
            { symbol_key: 'k', color_key: 'CC1' },
            { symbol_key: 'k', color_key: 'MC' },
            { symbol_key: 'k', color_key: 'MC' },
            { symbol_key: 'k', color_key: 'CC1' }
          ]
        ],
        legend: [
          { symbol_key: 'k', definition: 'Knit on RS, purl on WS', graphic_ref: '/assets/symbols/knit.svg' }
        ],
        reading_direction_rs: 'right_to_left',
        reading_direction_ws: 'left_to_right',
        default_craft_type: 'knitting'
      }
    };

    const mockYarnProfiles: YarnProfile[] = [
      {
        id: 'yarn-1',
        user_id: 'user-1',
        yarn_name: 'Navy Wool',
        color_name: 'Navy Blue',
        color_hex_code: '#001122',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'yarn-2',
        user_id: 'user-1',
        yarn_name: 'Cream Wool',
        color_name: 'Natural Cream',
        color_hex_code: '#F5F5DC',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const mockColorAssignments: ColorAssignment[] = [
      { color_key: 'MC', yarn_profile_id: 'yarn-1' },
      { color_key: 'CC1', yarn_profile_id: 'yarn-2' }
    ];

    test('should detect colorwork patterns correctly', () => {
      expect(hasColorwork(mockColorworkPattern.chart_symbols!)).toBe(true);
      
      // Non-colorwork pattern
      const nonColorworkSymbols: ChartSymbolsDefinition = {
        width: 2,
        height: 2,
        grid: [
          [{ symbol_key: 'k' }, { symbol_key: 'p' }],
          [{ symbol_key: 'p' }, { symbol_key: 'k' }]
        ],
        legend: [
          { symbol_key: 'k', definition: 'Knit', graphic_ref: '/assets/symbols/knit.svg' }
        ],
        reading_direction_rs: 'right_to_left',
        reading_direction_ws: 'left_to_right'
      };
      expect(hasColorwork(nonColorworkSymbols)).toBe(false);
    });

    test('should extract color keys from grid', () => {
      const colorKeys = extractColorKeys(mockColorworkPattern.chart_symbols!.grid);
      expect(colorKeys).toEqual(expect.arrayContaining(['MC', 'CC1']));
      expect(colorKeys).toHaveLength(2);
    });

    test('should generate color legend with yarn assignments', async () => {
      const { resolveColorInformation, validateColorworkAssignments } = require('../colorworkAssignmentService');
      
      resolveColorInformation.mockResolvedValue([
        {
          color_key: 'MC',
          color_name: 'Main Color',
          hex_code: '#001122',
          source: 'yarn_profile',
          yarn_profile: {
            id: 'yarn-1',
            yarn_name: 'Navy Wool',
            color_name: 'Navy Blue'
          }
        },
        {
          color_key: 'CC1',
          color_name: 'Contrast Color 1',
          hex_code: '#F5F5DC',
          source: 'yarn_profile',
          yarn_profile: {
            id: 'yarn-2',
            yarn_name: 'Cream Wool',
            color_name: 'Natural Cream'
          }
        }
      ]);

      validateColorworkAssignments.mockReturnValue({ isValid: true, errors: [] });

      const colorLegend = await generateColorLegend(
        mockColorworkPattern.chart_symbols!.palette!,
        mockColorAssignments,
        mockYarnProfiles
      );

      expect(colorLegend).toHaveLength(2);
      expect(colorLegend[0]).toEqual({
        color_key: 'MC',
        name: 'Main Color',
        hex_code: '#001122',
        yarn_info: {
          yarn_profile_id: 'yarn-1',
          yarn_name: 'Navy Wool',
          color_name: 'Navy Blue'
        }
      });
    });

    test('should generate colorwork chart with color legend', async () => {
      mockedGetStitchPattern.mockResolvedValue(mockColorworkPattern);
      
      const { resolveColorInformation, validateColorworkAssignments } = require('../colorworkAssignmentService');
      
      resolveColorInformation.mockResolvedValue([
        {
          color_key: 'MC',
          color_name: 'Main Color',
          hex_code: '#001122',
          source: 'yarn_profile',
          yarn_profile: {
            id: 'yarn-1',
            yarn_name: 'Navy Wool',
            color_name: 'Navy Blue'
          }
        },
        {
          color_key: 'CC1',
          color_name: 'Contrast Color 1',
          hex_code: '#F5F5DC',
          source: 'yarn_profile',
          yarn_profile: {
            id: 'yarn-2',
            yarn_name: 'Cream Wool',
            color_name: 'Natural Cream'
          }
        }
      ]);

      validateColorworkAssignments.mockReturnValue({ isValid: true, errors: [] });

      const chartData = await generateStitchChart(
        'colorwork-test-pattern',
        { validate_symbols: false },
        mockColorAssignments,
        mockYarnProfiles
      );

      expect(chartData.metadata.has_colorwork).toBe(true);
      expect(chartData.color_legend).toBeDefined();
      expect(chartData.color_legend).toHaveLength(2);
      expect(chartData.grid[0][0].color_key).toBe('MC');
      expect(chartData.grid[0][1].color_key).toBe('CC1');
    });

    test('should handle colorwork pattern without assignments', async () => {
      mockedGetStitchPattern.mockResolvedValue(mockColorworkPattern);
      
      const { resolveColorInformation, validateColorworkAssignments } = require('../colorworkAssignmentService');
      
      resolveColorInformation.mockResolvedValue([
        {
          color_key: 'MC',
          color_name: 'Main Color',
          hex_code: '#000080',
          source: 'default_palette'
        },
        {
          color_key: 'CC1',
          color_name: 'Contrast Color 1',
          hex_code: '#FFFDD0',
          source: 'default_palette'
        }
      ]);

      validateColorworkAssignments.mockReturnValue({ isValid: true, errors: [] });

      const chartData = await generateStitchChart(
        'colorwork-test-pattern',
        { validate_symbols: false },
        [], // No assignments
        []  // No yarn profiles
      );

      expect(chartData.metadata.has_colorwork).toBe(true);
      expect(chartData.color_legend).toBeDefined();
      expect(chartData.color_legend![0].hex_code).toBe('#000080'); // Default color
      expect(chartData.color_legend![0].yarn_info).toBeUndefined();
    });

    test('should maintain backward compatibility with non-colorwork patterns', async () => {
      const nonColorworkPattern: StitchPattern = {
        id: 'ribbing-2x2',
        stitch_name: '2x2 Ribbing',
        craft_type: 'knitting',
        is_basic: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        chart_symbols: {
          width: 4,
          height: 2,
          grid: [
            [{ symbol_key: 'k' }, { symbol_key: 'k' }, { symbol_key: 'p' }, { symbol_key: 'p' }],
            [{ symbol_key: 'p' }, { symbol_key: 'p' }, { symbol_key: 'k' }, { symbol_key: 'k' }]
          ],
          legend: [
            { symbol_key: 'k', definition: 'Knit on RS, purl on WS', graphic_ref: '/assets/symbols/knit.svg' },
            { symbol_key: 'p', definition: 'Purl on RS, knit on WS', graphic_ref: '/assets/symbols/purl.svg' }
          ],
          reading_direction_rs: 'right_to_left',
          reading_direction_ws: 'left_to_right',
          default_craft_type: 'knitting'
        }
      };

      mockedGetStitchPattern.mockResolvedValue(nonColorworkPattern);

      const chartData = await generateStitchChart(
        'ribbing-2x2',
        { validate_symbols: false }
      );

      expect(chartData.metadata.has_colorwork).toBe(false);
      expect(chartData.color_legend).toBeUndefined();
      expect(chartData.grid[0][0].color_key).toBeUndefined();
    });
  });
}); 