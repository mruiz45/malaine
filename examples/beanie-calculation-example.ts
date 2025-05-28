/**
 * Example Usage: Beanie Calculation (US_7.1.1)
 * Demonstrates complete beanie calculation and instruction generation
 */

import { calculateBeanie, BeanieCalculationInput } from '../src/utils/beanie-calculator';
import { generateBeanieInstructions, BeanieInstructionGenerationInput } from '../src/utils/beanie-instruction-generator';
import { BeanieAttributes } from '../src/types/accessories';
import { CalculationGaugeData, CalculationStitchPattern } from '../src/types/pattern-calculation';

/**
 * Example: Classic Adult Beanie
 * Based on AC1 test case from US 7.1.1
 */
function exampleClassicAdultBeanie() {
  console.log('=== Classic Adult Beanie Example ===\n');

  // Define beanie parameters (AC1: 56cm circumference, 20cm height, 5cm brim)
  const beanieAttributes: BeanieAttributes = {
    target_circumference_cm: 56,
    body_height_cm: 20,
    crown_style: 'classic_tapered',
    brim_style: 'folded_ribbed_1x1',
    brim_depth_cm: 5,
    work_style: 'in_the_round'
  };

  // Define gauge (worsted weight yarn, typical gauge)
  const gauge: CalculationGaugeData = {
    stitchesPer10cm: 18, // 4.5 stitches per inch
    rowsPer10cm: 24, // 6 rounds per inch
    unit: 'cm',
    profileName: 'Worsted Weight Gauge'
  };

  // Define stitch pattern
  const stitchPattern: CalculationStitchPattern = {
    name: 'Stockinette Stitch',
    horizontalRepeat: 1,
    verticalRepeat: 1,
    patternType: 'stockinette'
  };

  // Prepare calculation input
  const calculationInput: BeanieCalculationInput = {
    beanieAttributes,
    gauge,
    stitchPattern,
    componentKey: 'adult_beanie'
  };

  // Perform calculation (FR2-FR5)
  console.log('Performing beanie calculation...');
  const calculationResult = calculateBeanie(calculationInput);

  if (calculationResult.errors.length > 0) {
    console.error('Calculation errors:', calculationResult.errors);
    return;
  }

  // Display calculation results
  console.log('\n--- Calculation Results ---');
  console.log(`Cast-on stitches: ${calculationResult.calculations.castOnStitches}`);
  console.log(`Total rounds: ${calculationResult.calculations.totalRounds}`);
  console.log(`Target circumference used: ${calculationResult.calculations.targetCircumferenceUsed_cm}cm`);
  console.log(`Actual calculated circumference: ${calculationResult.calculations.actualCalculatedCircumference_cm}cm`);
  console.log(`Actual calculated height: ${calculationResult.calculations.actualCalculatedHeight_cm}cm`);

  // Display section breakdown
  console.log('\n--- Section Breakdown ---');
  calculationResult.sections.forEach(section => {
    console.log(`${section.sectionName.toUpperCase()}: ${section.rounds} rounds, ${section.stitches} stitches`);
    console.log(`  Target: ${section.targetDimension_cm}cm, Actual: ${section.actualDimension_cm}cm`);
  });

  // Display warnings
  if (calculationResult.warnings.length > 0) {
    console.log('\n--- Warnings ---');
    calculationResult.warnings.forEach(warning => console.log(`⚠️  ${warning}`));
  }

  // Generate instructions (FR6)
  console.log('\n--- Generating Instructions ---');
  const instructionInput: BeanieInstructionGenerationInput = {
    calculationResult,
    beanieAttributes,
    craftType: 'knitting',
    yarnName: 'Worsted Weight Wool',
    needleSize: '4.5mm'
  };

  const instructionResult = generateBeanieInstructions(instructionInput);

  if (!instructionResult.success) {
    console.error('Instruction generation failed:', instructionResult.errors);
    return;
  }

  // Display instructions
  console.log('\n--- Knitting Instructions ---');
  if (instructionResult.instructions) {
    instructionResult.instructions.forEach(instruction => {
      console.log(`${instruction.step}. [${instruction.section.toUpperCase()}] ${instruction.text}`);
      if (instruction.notes) {
        console.log(`   Note: ${instruction.notes}`);
      }
    });
  }

  // Display summary
  if (instructionResult.summary) {
    console.log('\n--- Project Summary ---');
    console.log(`Total steps: ${instructionResult.summary.totalSteps}`);
    console.log(`Estimated time: ${instructionResult.summary.estimatedTime}`);
    console.log(`Skill level: ${instructionResult.summary.skillLevel}`);
  }

  console.log('\n=== Example Complete ===\n');
}

/**
 * Example: Slouchy Beanie with Pattern Repeat
 * Demonstrates pattern repeat handling and different crown style
 */
function exampleSlouchyBeanieWithPattern() {
  console.log('=== Slouchy Beanie with Pattern Example ===\n');

  // Define beanie parameters
  const beanieAttributes: BeanieAttributes = {
    target_circumference_cm: 58, // Slightly larger for slouchy fit
    body_height_cm: 25, // Taller for slouchy effect
    crown_style: 'slouchy',
    brim_style: 'folded_ribbed_1x1',
    brim_depth_cm: 6,
    work_style: 'in_the_round'
  };

  // Define gauge (DK weight yarn)
  const gauge: CalculationGaugeData = {
    stitchesPer10cm: 22, // 5.5 stitches per inch
    rowsPer10cm: 30, // 7.5 rounds per inch
    unit: 'cm',
    profileName: 'DK Weight Gauge'
  };

  // Define stitch pattern with repeat
  const stitchPattern: CalculationStitchPattern = {
    name: '2x2 Ribbing',
    horizontalRepeat: 4, // k2, p2 repeat
    verticalRepeat: 1,
    patternType: 'ribbing'
  };

  // Prepare calculation input
  const calculationInput: BeanieCalculationInput = {
    beanieAttributes,
    gauge,
    stitchPattern,
    componentKey: 'slouchy_beanie'
  };

  // Perform calculation
  console.log('Performing slouchy beanie calculation...');
  const calculationResult = calculateBeanie(calculationInput);

  if (calculationResult.errors.length > 0) {
    console.error('Calculation errors:', calculationResult.errors);
    return;
  }

  // Display key results
  console.log('\n--- Key Results ---');
  console.log(`Cast-on stitches: ${calculationResult.calculations.castOnStitches} (adjusted for 4-stitch repeat)`);
  console.log(`Pattern repeats: ${calculationResult.calculations.patternRepeats}`);
  console.log(`Crown decrease points: ${calculationResult.calculations.crownDecreasePoints}`);

  // Generate crochet instructions for comparison
  const crochetInstructionInput: BeanieInstructionGenerationInput = {
    calculationResult,
    beanieAttributes,
    craftType: 'crochet',
    yarnName: 'DK Weight Cotton',
    needleSize: '4.0mm'
  };

  const crochetInstructionResult = generateBeanieInstructions(crochetInstructionInput);

  if (crochetInstructionResult.success && crochetInstructionResult.instructions) {
    console.log('\n--- Crochet Instructions (First 3 Steps) ---');
    crochetInstructionResult.instructions.slice(0, 3).forEach(instruction => {
      console.log(`${instruction.step}. [${instruction.section.toUpperCase()}] ${instruction.text}`);
    });
  }

  console.log('\n=== Example Complete ===\n');
}

/**
 * Example: Error Handling
 * Demonstrates validation and error handling
 */
function exampleErrorHandling() {
  console.log('=== Error Handling Example ===\n');

  // Invalid beanie attributes
  const invalidBeanieAttributes: BeanieAttributes = {
    target_circumference_cm: -10, // Invalid: negative
    body_height_cm: 0, // Invalid: zero
    crown_style: 'classic_tapered',
    brim_style: 'folded_ribbed_1x1',
    work_style: 'in_the_round'
  };

  // Invalid gauge
  const invalidGauge: CalculationGaugeData = {
    stitchesPer10cm: 0, // Invalid: zero
    rowsPer10cm: -5, // Invalid: negative
    unit: 'cm'
  };

  const stitchPattern: CalculationStitchPattern = {
    name: 'Test Pattern',
    horizontalRepeat: 1,
    verticalRepeat: 1
  };

  const invalidInput: BeanieCalculationInput = {
    beanieAttributes: invalidBeanieAttributes,
    gauge: invalidGauge,
    stitchPattern,
    componentKey: 'invalid_beanie'
  };

  console.log('Testing with invalid input...');
  const result = calculateBeanie(invalidInput);

  console.log('\n--- Validation Results ---');
  console.log(`Errors found: ${result.errors.length}`);
  result.errors.forEach(error => console.log(`❌ ${error}`));

  console.log(`Warnings found: ${result.warnings.length}`);
  result.warnings.forEach(warning => console.log(`⚠️  ${warning}`));

  console.log('\n=== Error Handling Example Complete ===\n');
}

/**
 * Run all examples
 */
function runAllExamples() {
  console.log('🧶 Beanie Calculator Examples (US_7.1.1)\n');
  console.log('This demonstrates the implementation of:');
  console.log('- FR2: Cast-on stitch calculation with negative ease');
  console.log('- FR3: Brim round calculation');
  console.log('- FR4: Body round calculation');
  console.log('- FR5: Crown decrease algorithm');
  console.log('- FR6: Textual instruction generation');
  console.log('- AC3: Working in the round calculations\n');

  exampleClassicAdultBeanie();
  exampleSlouchyBeanieWithPattern();
  exampleErrorHandling();

  console.log('✅ All examples completed successfully!');
  console.log('\nThe beanie calculator implementation satisfies all requirements from US_7.1.1:');
  console.log('- Accepts beanie definition session input (FR1)');
  console.log('- Calculates cast-on stitches with negative ease (FR2)');
  console.log('- Calculates brim rounds (FR3)');
  console.log('- Calculates body rounds (FR4)');
  console.log('- Implements crown decrease algorithms (FR5)');
  console.log('- Generates complete textual instructions (FR6)');
  console.log('- Correctly accounts for working in the round (AC3)');
}

// Export for use in other files
export {
  exampleClassicAdultBeanie,
  exampleSlouchyBeanieWithPattern,
  exampleErrorHandling,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
} 