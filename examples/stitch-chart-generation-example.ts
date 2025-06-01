/**
 * Example: Stitch Chart Generation (US_11.5 & US_12.7)
 * Demonstrates how to use the StitchChartGeneratorService
 * to generate chart data structures from stitch patterns
 * including colorwork patterns with yarn assignments
 */

import {
  generateStitchChart,
  validateChartDefinition,
  generateChartLegend,
  buildChartFromInstructions,
  extractSymbolKeys,
  generateColorLegend,
  hasColorwork,
  extractColorKeys
} from '../src/services/stitchChartGeneratorService';
import {
  getColorworkAssignments,
  updateColorworkAssignments,
  resolveColorInformation
} from '../src/services/colorworkAssignmentService';
import type { StitchPattern } from '../src/types/stitchPattern';
import type { 
  ChartSymbolsDefinition,
  StitchChartData 
} from '../src/types/stitchChart';
import type { 
  ColorAssignment 
} from '../src/types/colorworkAssignments';
import type { YarnProfile } from '../src/types/yarn';

/**
 * Example 1: Generate chart from a stitch pattern with predefined chart symbols (US_11.5)
 */
async function generateBasicRibbingChart() {
  console.log('=== Example 1: Basic Ribbing Chart Generation ===');
  
  try {
    // Assuming we have a stitch pattern ID for 2x2 ribbing
    const stitchPatternId = 'ribbing-2x2-knitting';
    
    // Generate the chart data
    const chartData: StitchChartData = await generateStitchChart(stitchPatternId, {
      validate_symbols: true,
      include_row_numbers: true,
      include_stitch_numbers: true
    });
    
    console.log('Generated Chart Data:');
    console.log('- Pattern ID:', chartData.stitch_pattern_id);
    console.log('- Dimensions:', `${chartData.dimensions.width}w x ${chartData.dimensions.height}h`);
    console.log('- Grid:', chartData.grid);
    console.log('- Legend symbols:', chartData.legend.map(l => l.symbol_key).join(', '));
    console.log('- Reading directions:', chartData.reading_directions);
    console.log('- Has no-stitch cells:', chartData.metadata.has_no_stitch_cells);
    console.log('- Has colorwork:', chartData.metadata.has_colorwork);
    
    return chartData;
  } catch (error) {
    console.error('Error generating ribbing chart:', error);
  }
}

/**
 * Example 2: Generate colorwork chart with yarn assignments (US_12.7)
 */
async function generateColorworkChartWithAssignments() {
  console.log('=== Example 2: Colorwork Chart with Yarn Assignments ===');
  
  try {
    // Assuming we have a Fair Isle pattern with colorwork
    const stitchPatternId = 'fair-isle-diamond-pattern';
    const sessionId = 'pattern-session-123';
    
    // Mock yarn profiles with colors
    const yarnProfiles: YarnProfile[] = [
      {
        id: 'yarn-navy-123',
        user_id: 'user-456',
        yarn_name: 'Cascade 220 Wool',
        color_name: 'Navy Blue',
        color_hex_code: '#1e3a8a',
        brand_name: 'Cascade Yarns',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'yarn-cream-456',
        user_id: 'user-456',
        yarn_name: 'Cascade 220 Wool',
        color_name: 'Natural Cream',
        color_hex_code: '#f9fafb',
        brand_name: 'Cascade Yarns',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    // Color assignments mapping pattern colors to yarns
    const colorAssignments: ColorAssignment[] = [
      { color_key: 'MC', yarn_profile_id: 'yarn-navy-123' },
      { color_key: 'CC1', yarn_profile_id: 'yarn-cream-456' }
    ];

    // Save color assignments to the session
    await updateColorworkAssignments(sessionId, stitchPatternId, colorAssignments);
    console.log('Color assignments saved to session');

    // Generate the chart with color assignments
    const chartData: StitchChartData = await generateStitchChart(
      stitchPatternId,
      {
        validate_symbols: true,
        include_row_numbers: true,
        include_stitch_numbers: true
      },
      colorAssignments,
      yarnProfiles
    );
    
    console.log('Generated Colorwork Chart Data:');
    console.log('- Pattern ID:', chartData.stitch_pattern_id);
    console.log('- Dimensions:', `${chartData.dimensions.width}w x ${chartData.dimensions.height}h`);
    console.log('- Has colorwork:', chartData.metadata.has_colorwork);
    
    if (chartData.color_legend) {
      console.log('- Color Legend:');
      chartData.color_legend.forEach(color => {
        console.log(`  ${color.color_key} (${color.name}): ${color.hex_code}`);
        if (color.yarn_info) {
          console.log(`    Yarn: ${color.yarn_info.yarn_name} - ${color.yarn_info.color_name}`);
        }
      });
    }
    
    // Show a few grid cells with color information
    console.log('- Sample grid cells with colors:');
    for (let row = 0; row < Math.min(2, chartData.grid.length); row++) {
      for (let col = 0; col < Math.min(4, chartData.grid[row].length); col++) {
        const cell = chartData.grid[row][col];
        console.log(`  [${row},${col}]: ${cell.symbol_key}${cell.color_key ? ` (${cell.color_key})` : ''}`);
      }
    }
    
    return chartData;
  } catch (error) {
    console.error('Error generating colorwork chart:', error);
  }
}

/**
 * Example 3: Generate color legend separately (US_12.7)
 */
async function generateColorLegendExample() {
  console.log('=== Example 3: Generate Color Legend ===');
  
  try {
    // Mock pattern color palette
    const colorPalette = [
      { key: 'MC', name: 'Main Color', default_hex: '#000080' },
      { key: 'CC1', name: 'Contrast Color 1', default_hex: '#ffffff' },
      { key: 'CC2', name: 'Contrast Color 2', default_hex: '#ff0000' }
    ];

    // Mock yarn profiles
    const yarnProfiles: YarnProfile[] = [
      {
        id: 'yarn-1',
        user_id: 'user-1',
        yarn_name: 'Deep Navy Merino',
        color_name: 'Midnight',
        color_hex_code: '#0f172a',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'yarn-2',
        user_id: 'user-1',
        yarn_name: 'Pure White Cotton',
        color_name: 'Snow White',
        color_hex_code: '#ffffff',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
      // Note: CC2 intentionally not assigned to show default behavior
    ];

    // Color assignments (CC2 not assigned)
    const colorAssignments: ColorAssignment[] = [
      { color_key: 'MC', yarn_profile_id: 'yarn-1' },
      { color_key: 'CC1', yarn_profile_id: 'yarn-2' }
    ];

    // Generate color legend
    const colorLegend = await generateColorLegend(
      colorPalette,
      colorAssignments,
      yarnProfiles
    );

    console.log('Generated Color Legend:');
    colorLegend.forEach(entry => {
      console.log(`- ${entry.color_key} (${entry.name}):`);
      console.log(`  Color: ${entry.hex_code}`);
      if (entry.yarn_info) {
        console.log(`  Assigned Yarn: ${entry.yarn_info.yarn_name} - ${entry.yarn_info.color_name}`);
      } else {
        console.log('  Using default pattern color (no yarn assigned)');
      }
    });

    return colorLegend;
  } catch (error) {
    console.error('Error generating color legend:', error);
  }
}

/**
 * Example 4: Detect and extract colorwork information (US_12.7)
 */
async function analyzeColorworkPattern() {
  console.log('=== Example 4: Analyze Colorwork Pattern ===');
  
  try {
    // Mock chart symbols with colorwork
    const colorworkChartSymbols: ChartSymbolsDefinition = {
      width: 6,
      height: 3,
      palette: [
        { key: 'A', name: 'Color A', default_hex: '#ff6b6b' },
        { key: 'B', name: 'Color B', default_hex: '#4ecdc4' },
        { key: 'C', name: 'Color C', default_hex: '#ffe66d' }
      ],
      grid: [
        [
          { symbol_key: 'k', color_key: 'A' },
          { symbol_key: 'k', color_key: 'B' },
          { symbol_key: 'k', color_key: 'C' },
          { symbol_key: 'k', color_key: 'C' },
          { symbol_key: 'k', color_key: 'B' },
          { symbol_key: 'k', color_key: 'A' }
        ],
        [
          { symbol_key: 'k', color_key: 'B' },
          { symbol_key: 'k', color_key: 'A' },
          { symbol_key: 'k', color_key: 'B' },
          { symbol_key: 'k', color_key: 'B' },
          { symbol_key: 'k', color_key: 'A' },
          { symbol_key: 'k', color_key: 'B' }
        ],
        [
          { symbol_key: 'k', color_key: 'C' },
          { symbol_key: 'k', color_key: 'C' },
          { symbol_key: 'k', color_key: 'A' },
          { symbol_key: 'k', color_key: 'A' },
          { symbol_key: 'k', color_key: 'C' },
          { symbol_key: 'k', color_key: 'C' }
        ]
      ],
      legend: [
        { symbol_key: 'k', definition: 'Knit', graphic_ref: '/assets/symbols/knit.svg' }
      ],
      reading_direction_rs: 'right_to_left',
      reading_direction_ws: 'left_to_right',
      default_craft_type: 'knitting'
    };

    // Analyze colorwork
    const isColorwork = hasColorwork(colorworkChartSymbols);
    console.log('Is colorwork pattern:', isColorwork);

    if (isColorwork) {
      const colorKeys = extractColorKeys(colorworkChartSymbols.grid);
      console.log('Color keys used in pattern:', colorKeys);
      console.log('Pattern palette:', colorworkChartSymbols.palette);
      
      // Show color distribution in the pattern
      const colorUsage = colorKeys.reduce((acc, colorKey) => {
        let count = 0;
        colorworkChartSymbols.grid.forEach(row => {
          row.forEach(cell => {
            if (cell.color_key === colorKey) count++;
          });
        });
        acc[colorKey] = count;
        return acc;
      }, {} as Record<string, number>);
      
      console.log('Color usage count:', colorUsage);
    }

  } catch (error) {
    console.error('Error analyzing colorwork pattern:', error);
  }
}

/**
 * Example 5: Working with colorwork assignments in sessions (US_12.7)
 */
async function manageColorworkAssignments() {
  console.log('=== Example 5: Manage Colorwork Assignments ===');
  
  try {
    const sessionId = 'pattern-session-789';
    const stitchPatternId = 'intarsia-flower-pattern';

    // Get current assignments (might be empty initially)
    let currentAssignments = await getColorworkAssignments(sessionId, stitchPatternId);
    console.log('Current assignments:', currentAssignments);

    // Update assignments
    const newAssignments: ColorAssignment[] = [
      { color_key: 'Background', yarn_profile_id: 'yarn-white-123' },
      { color_key: 'Flower', yarn_profile_id: 'yarn-pink-456' },
      { color_key: 'Leaves', yarn_profile_id: 'yarn-green-789' }
    ];

    const updatedData = await updateColorworkAssignments(sessionId, stitchPatternId, newAssignments);
    console.log('Updated assignments:', updatedData);

    // Retrieve assignments again to verify
    currentAssignments = await getColorworkAssignments(sessionId, stitchPatternId);
    console.log('Verified assignments:', currentAssignments);

  } catch (error) {
    console.error('Error managing colorwork assignments:', error);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('Stitch Chart Generation Examples (US_11.5 & US_12.7)\n');
  
  await generateBasicRibbingChart();
  console.log('\n');
  
  await generateColorworkChartWithAssignments();
  console.log('\n');
  
  await generateColorLegendExample();
  console.log('\n');
  
  await analyzeColorworkPattern();
  console.log('\n');
  
  await manageColorworkAssignments();
  console.log('\nAll examples completed!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}

export {
  generateBasicRibbingChart,
  generateColorworkChartWithAssignments,
  generateColorLegendExample,
  analyzeColorworkPattern,
  manageColorworkAssignments,
  runAllExamples
}; 