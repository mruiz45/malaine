/**
 * Example: Stitch Chart Generation (US_11.5)
 * Demonstrates how to use the StitchChartGeneratorService
 * to generate chart data structures from stitch patterns
 */

import {
  generateStitchChart,
  validateChartDefinition,
  generateChartLegend,
  buildChartFromInstructions,
  extractSymbolKeys
} from '../src/services/stitchChartGeneratorService';
import type { StitchPattern } from '../src/types/stitchPattern';
import type { 
  ChartSymbolsDefinition,
  StitchChartData 
} from '../src/types/stitchChart';

/**
 * Example 1: Generate chart from a stitch pattern with predefined chart symbols
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
    
    return chartData;
  } catch (error) {
    console.error('Error generating ribbing chart:', error);
  }
}

/**
 * Example 2: Validate a chart definition before generation
 */
async function validateLaceChart() {
  console.log('\n=== Example 2: Lace Chart Validation ===');
  
  // Example lace chart definition with no-stitch cells
  const laceChartDefinition: ChartSymbolsDefinition = {
    width: 6,
    height: 4,
    grid: [
      [
        { symbol_key: 'k' },
        { symbol_key: 'yo' },
        { symbol_key: 'k2tog' },
        { symbol_key: 'k' },
        { symbol_key: 'k' },
        { symbol_key: 'k' }
      ],
      [
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'p' }
      ],
      [
        { symbol_key: 'k' },
        { symbol_key: 'k' },
        { symbol_key: 'yo' },
        { symbol_key: 'ssk' },
        { symbol_key: 'k' },
        { symbol_key: 'k' }
      ],
      [
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'p' },
        { symbol_key: 'no_stitch', is_no_stitch: true },
        { symbol_key: 'p' },
        { symbol_key: 'p' }
      ]
    ],
    legend: [
      { symbol_key: 'k', definition: 'Knit on RS, purl on WS', graphic_ref: '/assets/symbols/knit.svg' },
      { symbol_key: 'p', definition: 'Purl on RS, knit on WS', graphic_ref: '/assets/symbols/purl.svg' },
      { symbol_key: 'yo', definition: 'Yarn over', graphic_ref: '/assets/symbols/yarn_over.svg' },
      { symbol_key: 'k2tog', definition: 'Knit 2 together', graphic_ref: '/assets/symbols/k2tog.svg' },
      { symbol_key: 'ssk', definition: 'Slip, slip, knit', graphic_ref: '/assets/symbols/ssk.svg' },
      { symbol_key: 'no_stitch', definition: 'No stitch', graphic_ref: '/assets/symbols/no_stitch.svg' }
    ],
    reading_direction_rs: 'right_to_left',
    reading_direction_ws: 'left_to_right',
    default_craft_type: 'knitting'
  };
  
  try {
    const validation = await validateChartDefinition(laceChartDefinition, 'knitting');
    
    console.log('Validation Result:');
    console.log('- Is valid:', validation.is_valid);
    console.log('- Errors:', validation.errors.length > 0 ? validation.errors : 'None');
    console.log('- Warnings:', validation.warnings.length > 0 ? validation.warnings : 'None');
    console.log('- Missing symbols:', validation.missing_symbols.length > 0 ? validation.missing_symbols : 'None');
    
    if (validation.is_valid) {
      // Extract symbol keys used in the chart
      const usedSymbols = extractSymbolKeys(laceChartDefinition.grid);
      console.log('- Symbols used:', usedSymbols.join(', '));
    }
    
    return validation;
  } catch (error) {
    console.error('Error validating lace chart:', error);
  }
}

/**
 * Example 3: Generate chart legend for specific symbols
 */
async function generateCableLegend() {
  console.log('\n=== Example 3: Cable Chart Legend Generation ===');
  
  try {
    const cableSymbols = ['k', 'p', 'c4f', 'c4b', 'c6f'];
    
    const legend = await generateChartLegend(cableSymbols, 'knitting');
    
    console.log('Generated Legend:');
    legend.forEach(item => {
      console.log(`- ${item.symbol_key}: ${item.definition} (${item.graphic_ref})`);
    });
    
    return legend;
  } catch (error) {
    console.error('Error generating cable legend:', error);
  }
}

/**
 * Example 4: Build chart from written instructions (basic conversion)
 */
function buildChartFromInstructionsExample() {
  console.log('\n=== Example 4: Build Chart from Instructions ===');
  
  // Example stitch pattern with written instructions
  const pattern: StitchPattern = {
    id: 'example-seed-stitch',
    stitch_name: 'Seed Stitch',
    craft_type: 'knitting',
    is_basic: true,
    stitch_repeat_width: 2,
    stitch_repeat_height: 2,
    instructions_written: {
      craft_type: 'knitting',
      rows: [
        { row_num: 1, instruction: 'K1, P1' },
        { row_num: 2, instruction: 'P1, K1' }
      ]
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };
  
  try {
    const chartDefinition = buildChartFromInstructions(pattern);
    
    if (chartDefinition) {
      console.log('Built Chart Definition:');
      console.log('- Dimensions:', `${chartDefinition.width}w x ${chartDefinition.height}h`);
      console.log('- Grid:', chartDefinition.grid);
      console.log('- Legend:', chartDefinition.legend.map(l => `${l.symbol_key}: ${l.definition}`));
      console.log('- Reading directions:', `RS: ${chartDefinition.reading_direction_rs}, WS: ${chartDefinition.reading_direction_ws}`);
    } else {
      console.log('Could not build chart from instructions (insufficient data)');
    }
    
    return chartDefinition;
  } catch (error) {
    console.error('Error building chart from instructions:', error);
  }
}

/**
 * Example 5: Handle chart with maximum dimensions
 */
async function generateChartWithLimits() {
  console.log('\n=== Example 5: Chart Generation with Dimension Limits ===');
  
  try {
    const stitchPatternId = 'large-cable-pattern';
    
    // Try to generate with restrictive limits
    const chartData = await generateStitchChart(stitchPatternId, {
      max_dimensions: { width: 20, height: 20 },
      validate_symbols: true
    });
    
    console.log('Generated chart within limits:');
    console.log('- Dimensions:', `${chartData.dimensions.width}w x ${chartData.dimensions.height}h`);
    console.log('- Chart ID:', chartData.id);
    
    return chartData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('Expected error for oversized chart:', errorMessage);
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('🧶 Stitch Chart Generation Examples (US_11.5) 🧶\n');
  
  await generateBasicRibbingChart();
  await validateLaceChart();
  await generateCableLegend();
  buildChartFromInstructionsExample();
  await generateChartWithLimits();
  
  console.log('\n✅ All examples completed!');
  console.log('\nNext steps:');
  console.log('- The generated chart data structures are ready for rendering (US_11.6)');
  console.log('- Chart data can be integrated into pattern assembly (US_9.1)');
  console.log('- Charts will be included in PDF export (US_9.2)');
}

// Export for potential use in tests or other modules
export {
  generateBasicRibbingChart,
  validateLaceChart,
  generateCableLegend,
  buildChartFromInstructionsExample,
  generateChartWithLimits,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
} 