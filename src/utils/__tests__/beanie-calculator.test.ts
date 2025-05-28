/**
 * Tests for Beanie Calculator (US_7.1.1)
 * Validates implementation against acceptance criteria AC1-AC3
 */

import { calculateBeanie, validateBeanieCalculationInput, BeanieCalculationInput } from '../beanie-calculator';
import { generateBeanieInstructions, BeanieInstructionGenerationInput } from '../beanie-instruction-generator';
import { BeanieAttributes } from '@/types/accessories';
import { CalculationGaugeData, CalculationStitchPattern } from '@/types/pattern-calculation';

describe('Beanie Calculator (US_7.1.1)', () => {
  // Test data based on AC1 criteria
  const testGauge: CalculationGaugeData = {
    stitchesPer10cm: 20, // 2 stitches per cm
    rowsPer10cm: 28, // 2.8 rounds per cm
    unit: 'cm',
    profileName: 'Test Gauge'
  };

  const testStitchPattern: CalculationStitchPattern = {
    name: 'Stockinette',
    horizontalRepeat: 1,
    verticalRepeat: 1,
    patternType: 'stockinette'
  };

  const testBeanieAttributes: BeanieAttributes = {
    target_circumference_cm: 56, // AC1: 56cm head circumference
    body_height_cm: 20, // AC1: 20cm height
    crown_style: 'classic_tapered',
    brim_style: 'folded_ribbed_1x1',
    brim_depth_cm: 5, // AC1: 5cm brim depth
    work_style: 'in_the_round'
  };

  const testInput: BeanieCalculationInput = {
    beanieAttributes: testBeanieAttributes,
    gauge: testGauge,
    stitchPattern: testStitchPattern,
    componentKey: 'test_beanie'
  };

  describe('AC1: Calculation Validation', () => {
    it('should calculate reasonable stitch/round counts for given parameters', () => {
      const result = calculateBeanie(testInput);

      expect(result.errors).toHaveLength(0);
      expect(result.calculations.castOnStitches).toBeGreaterThan(0);
      expect(result.calculations.totalRounds).toBeGreaterThan(0);

      // Validate cast-on stitches are reasonable for 56cm circumference with negative ease
      // Expected: ~56cm - 5cm ease = 51cm * 2 stitches/cm = ~102 stitches
      expect(result.calculations.castOnStitches).toBeGreaterThan(90);
      expect(result.calculations.castOnStitches).toBeLessThan(120);

      // Validate total rounds are reasonable for 20cm height
      // Expected: ~20cm * 2.8 rounds/cm = ~56 rounds
      expect(result.calculations.totalRounds).toBeGreaterThan(45);
      expect(result.calculations.totalRounds).toBeLessThan(70);

      // Validate sections are present
      expect(result.sections).toHaveLength(3);
      expect(result.sections.map(s => s.sectionName)).toEqual(['brim', 'body', 'crown']);
    });

    it('should correctly account for working in the round', () => {
      const result = calculateBeanie(testInput);

      expect(result.errors).toHaveLength(0);
      
      // Verify negative ease is applied (working circumference < target circumference)
      expect(result.calculations.targetCircumferenceUsed_cm).toBeLessThan(testBeanieAttributes.target_circumference_cm);
      
      // Verify the ease is reasonable (2-5cm)
      const appliedEase = testBeanieAttributes.target_circumference_cm - result.calculations.targetCircumferenceUsed_cm;
      expect(appliedEase).toBeGreaterThanOrEqual(2);
      expect(appliedEase).toBeLessThanOrEqual(5);
    });

    it('should handle stitch pattern repeats correctly', () => {
      const patternWithRepeat: CalculationStitchPattern = {
        name: '2x2 Ribbing',
        horizontalRepeat: 4,
        verticalRepeat: 1,
        patternType: 'ribbing'
      };

      const inputWithPattern: BeanieCalculationInput = {
        ...testInput,
        stitchPattern: patternWithRepeat
      };

      const result = calculateBeanie(inputWithPattern);

      expect(result.errors).toHaveLength(0);
      
      // Cast-on stitches should be divisible by pattern repeat
      expect(result.calculations.castOnStitches % patternWithRepeat.horizontalRepeat).toBe(0);
      
      // Should have a warning about stitch adjustment if significant
      if (result.warnings && result.warnings.length > 0) {
        const adjustmentWarning = result.warnings.find(w => w.includes('adjusted'));
        if (adjustmentWarning) {
          expect(adjustmentWarning).toContain('4-stitch');
        }
      }
    });
  });

  describe('AC2: Basic Textual Instructions', () => {
    it('should generate instructions for all parts of the beanie', () => {
      const calculationResult = calculateBeanie(testInput);
      expect(calculationResult.errors).toHaveLength(0);

      const instructionInput: BeanieInstructionGenerationInput = {
        calculationResult,
        beanieAttributes: testBeanieAttributes,
        craftType: 'knitting',
        yarnName: 'Test Yarn',
        needleSize: '4.5mm'
      };

      const instructionResult = generateBeanieInstructions(instructionInput);

      expect(instructionResult.success).toBe(true);
      expect(instructionResult.instructions).toBeDefined();
      
      if (instructionResult.instructions) {
        const instructions = instructionResult.instructions;
        
        // Should have instructions for all sections
        const sections = instructions.map(i => i.section);
        expect(sections).toContain('setup'); // Cast-on
        expect(sections).toContain('brim');
        expect(sections).toContain('body');
        expect(sections).toContain('crown');
        expect(sections).toContain('finishing');

        // Cast-on instruction should mention working in the round
        const castOnInstruction = instructions.find(i => i.section === 'setup');
        expect(castOnInstruction?.text).toContain('in the round');
        expect(castOnInstruction?.text).toContain('marker');

        // Brim instruction should match brim style
        const brimInstruction = instructions.find(i => i.section === 'brim');
        expect(brimInstruction?.text).toContain('ribbing');

        // Crown instruction should mention decreases
        const crownInstructions = instructions.filter(i => i.section === 'crown');
        expect(crownInstructions.length).toBeGreaterThan(0);
        expect(crownInstructions.some(i => i.text.includes('decrease'))).toBe(true);

        // Finishing instruction should mention closing crown
        const finishingInstruction = instructions.find(i => i.section === 'finishing');
        expect(finishingInstruction?.text).toContain('crown');
        expect(finishingInstruction?.text).toContain('tight');
      }
    });

    it('should generate appropriate instructions for different craft types', () => {
      const calculationResult = calculateBeanie(testInput);
      
      // Test knitting instructions
      const knittingInstructionInput: BeanieInstructionGenerationInput = {
        calculationResult,
        beanieAttributes: testBeanieAttributes,
        craftType: 'knitting'
      };

      const knittingResult = generateBeanieInstructions(knittingInstructionInput);
      expect(knittingResult.success).toBe(true);
      
      if (knittingResult.instructions) {
        const castOnText = knittingResult.instructions.find(i => i.section === 'setup')?.text;
        expect(castOnText).toContain('circular needles');
        expect(castOnText).toContain('cast on');
      }

      // Test crochet instructions
      const crochetInstructionInput: BeanieInstructionGenerationInput = {
        calculationResult,
        beanieAttributes: testBeanieAttributes,
        craftType: 'crochet'
      };

      const crochetResult = generateBeanieInstructions(crochetInstructionInput);
      expect(crochetResult.success).toBe(true);
      
      if (crochetResult.instructions) {
        const castOnText = crochetResult.instructions.find(i => i.section === 'setup')?.text;
        expect(castOnText).toContain('hook');
        expect(castOnText).toContain('magic ring');
      }
    });
  });

  describe('AC3: Working in the Round Calculations', () => {
    it('should correctly calculate for circular construction', () => {
      const result = calculateBeanie(testInput);

      expect(result.errors).toHaveLength(0);
      
      // Verify that circumference-based calculations are used
      expect(result.calculations.targetCircumferenceUsed_cm).toBeDefined();
      expect(result.calculations.actualCalculatedCircumference_cm).toBeDefined();
      
      // Verify that the calculation accounts for working in the round
      // (no seam allowances, negative ease applied)
      expect(result.calculations.targetCircumferenceUsed_cm).toBeLessThan(testBeanieAttributes.target_circumference_cm);
      
      // Verify that stitch count is based on circumference, not width
      const expectedStitches = Math.round(result.calculations.targetCircumferenceUsed_cm * (testGauge.stitchesPer10cm / 10));
      expect(Math.abs(result.calculations.castOnStitches - expectedStitches)).toBeLessThanOrEqual(4); // Allow for pattern repeat adjustments
    });

    it('should validate that work_style is in_the_round', () => {
      const invalidAttributes: BeanieAttributes = {
        ...testBeanieAttributes,
        work_style: 'in_the_round' // This is correct, but let's test validation
      };

      const validationResult = validateBeanieCalculationInput({
        beanieAttributes: invalidAttributes,
        gauge: testGauge,
        stitchPattern: testStitchPattern,
        componentKey: 'test'
      });

      expect(validationResult.isValid).toBe(true);
    });
  });

  describe('Error Handling and Validation', () => {
    it('should handle invalid input gracefully', () => {
      const invalidInput: BeanieCalculationInput = {
        beanieAttributes: {
          ...testBeanieAttributes,
          target_circumference_cm: -10, // Invalid
          body_height_cm: 0 // Invalid
        },
        gauge: {
          ...testGauge,
          stitchesPer10cm: 0 // Invalid
        },
        stitchPattern: testStitchPattern,
        componentKey: 'test'
      };

      const result = calculateBeanie(invalidInput);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.calculations.castOnStitches).toBe(0);
      expect(result.calculations.totalRounds).toBe(0);
    });

    it('should provide helpful warnings for unusual measurements', () => {
      const unusualInput: BeanieCalculationInput = {
        beanieAttributes: {
          ...testBeanieAttributes,
          target_circumference_cm: 30, // Very small
          body_height_cm: 40 // Very tall
        },
        gauge: testGauge,
        stitchPattern: testStitchPattern,
        componentKey: 'test'
      };

      const result = calculateBeanie(unusualInput);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('small') || w.includes('tall'))).toBe(true);
    });
  });

  describe('Crown Decrease Algorithms', () => {
    it('should implement different crown styles correctly', () => {
      const crownStyles: Array<BeanieAttributes['crown_style']> = ['classic_tapered', 'slouchy', 'flat_top'];

      crownStyles.forEach(crownStyle => {
        const input: BeanieCalculationInput = {
          ...testInput,
          beanieAttributes: {
            ...testBeanieAttributes,
            crown_style: crownStyle
          }
        };

        const result = calculateBeanie(input);

        expect(result.errors).toHaveLength(0);
        
        const crownSection = result.sections.find(s => s.sectionName === 'crown');
        expect(crownSection).toBeDefined();
        expect(crownSection!.rounds).toBeGreaterThan(0);
        expect(crownSection!.stitches).toBeGreaterThan(0);
        expect(crownSection!.stitches).toBeLessThan(result.calculations.castOnStitches);
      });
    });

    it('should calculate reasonable decrease points', () => {
      const result = calculateBeanie(testInput);

      expect(result.calculations.crownDecreasePoints).toBeDefined();
      expect(result.calculations.crownDecreasePoints).toBeGreaterThanOrEqual(6);
      expect(result.calculations.crownDecreasePoints).toBeLessThanOrEqual(8);
    });
  });
}); 