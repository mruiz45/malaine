/**
 * Tests for Instruction Generator (US 6.3)
 * Validates generation of basic textual instructions for rectangular garment pieces
 */

import {
  generateBasicInstructions,
  extractInstructionInput,
  InstructionGenerationInput,
  InstructionGenerationResult
} from '../instruction-generator';

describe('Instruction Generator (US 6.3)', () => {
  
  describe('generateBasicInstructions', () => {
    
    // AC1: Knitting instructions test
    it('should generate correct knitting instructions for basic rectangular piece', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 110,
        totalRows: 180,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting',
        yarnName: 'Worsted Weight Wool'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions).toHaveLength(3);
      
      // Verify instruction content
      expect(result.instructions![0]).toEqual({
        step: 1,
        text: 'Using your main needles and Worsted Weight Wool, cast on 110 stitches.'
      });
      
      expect(result.instructions![1]).toEqual({
        step: 2,
        text: 'Work in Stockinette Stitch for 180 rows.'
      });
      
      expect(result.instructions![2]).toEqual({
        step: 3,
        text: 'Bind off all stitches loosely.'
      });
    });

    // AC2: Crochet instructions test
    it('should generate correct crochet instructions for basic rectangular piece', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 84,
        totalRows: 100,
        stitchPatternName: 'Single Crochet',
        craftType: 'crochet'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions).toHaveLength(3);
      
      // Verify crochet-specific terminology
      expect(result.instructions![0]).toEqual({
        step: 1,
        text: 'Using your hook, chain 85 stitches. Row 1: Work 84 single crochet starting in 2nd chain from hook, resulting in 84 stitches.'
      });
      
      expect(result.instructions![1]).toEqual({
        step: 2,
        text: 'Continue working in Single Crochet for 99 more rows (100 rows total).'
      });
      
      expect(result.instructions![2]).toEqual({
        step: 3,
        text: 'Fasten off and weave in ends.'
      });
    });

    // AC3: Data structure validation
    it('should return correctly structured instruction data', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 50,
        totalRows: 60,
        stitchPatternName: 'Garter Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('instructions');
      expect(result.success).toBe(true);
      
      // Validate instruction structure
      result.instructions!.forEach((instruction, index) => {
        expect(instruction).toHaveProperty('step');
        expect(instruction).toHaveProperty('text');
        expect(instruction.step).toBe(index + 1);
        expect(typeof instruction.text).toBe('string');
        expect(instruction.text.length).toBeGreaterThan(0);
      });
    });

    // Test knitting without yarn name
    it('should generate knitting instructions without yarn name', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 75,
        totalRows: 120,
        stitchPatternName: 'Ribbing 2x2',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.instructions![0].text).toBe('Using your main needles, cast on 75 stitches.');
    });

    // Test crochet with single row
    it('should handle crochet with single row correctly', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 30,
        totalRows: 1,
        stitchPatternName: 'Single Crochet',
        craftType: 'crochet'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.instructions).toHaveLength(3);
      expect(result.instructions![1].text).toBe('Foundation row complete. You now have 1 row total.');
    });

    // Test warning generation for very wide pieces
    it('should generate warnings for very wide pieces', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 450, // Very wide
        totalRows: 100,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('This piece requires 450 stitches, which is quite wide. Double-check your calculations.');
    });

    // Test warning generation for very narrow pieces
    it('should generate warnings for very narrow pieces', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 15, // Very narrow
        totalRows: 50,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('This piece only requires 15 stitches, which is quite narrow. Verify this is correct.');
    });

    // Test warning generation for very long pieces
    it('should generate warnings for very long pieces', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 100,
        totalRows: 1200, // Very long
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('This piece requires 1200 rows, which will take considerable time to complete.');
    });

    // Test warning generation for very short pieces
    it('should generate warnings for very short pieces', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 50,
        totalRows: 5, // Very short
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('This piece only requires 5 rows, which is quite short. Verify this is correct.');
    });
  });

  describe('Input Validation', () => {
    
    it('should reject invalid cast on stitches', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 0,
        totalRows: 100,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Cast on stitches must be a positive number');
    });

    it('should reject invalid total rows', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 100,
        totalRows: -5,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Total rows must be a positive number');
    });

    it('should reject empty stitch pattern name', () => {
      const input: InstructionGenerationInput = {
        castOnStitches: 100,
        totalRows: 150,
        stitchPatternName: '',
        craftType: 'knitting'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Stitch pattern name is required');
    });

    it('should reject invalid craft type', () => {
      const input: any = {
        castOnStitches: 100,
        totalRows: 150,
        stitchPatternName: 'Stockinette Stitch',
        craftType: 'invalid'
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Craft type must be either "knitting" or "crochet"');
    });
  });

  describe('extractInstructionInput', () => {
    
    it('should extract valid instruction input from detailed calculations', () => {
      const detailedCalculations = {
        castOnStitches: 110,
        totalRows: 180,
        targetWidthUsed_cm: 50,
        targetLengthUsed_cm: 60
      };

      const result = extractInstructionInput(
        detailedCalculations,
        'Stockinette Stitch',
        'knitting',
        'Test Yarn'
      );

      expect(result).not.toBeNull();
      expect(result!.castOnStitches).toBe(110);
      expect(result!.totalRows).toBe(180);
      expect(result!.stitchPatternName).toBe('Stockinette Stitch');
      expect(result!.craftType).toBe('knitting');
      expect(result!.yarnName).toBe('Test Yarn');
    });

    it('should return null for incomplete detailed calculations', () => {
      const detailedCalculations = {
        castOnStitches: 110,
        // Missing totalRows
        targetWidthUsed_cm: 50
      };

      const result = extractInstructionInput(
        detailedCalculations,
        'Stockinette Stitch',
        'knitting'
      );

      expect(result).toBeNull();
    });

    it('should handle missing yarn name gracefully', () => {
      const detailedCalculations = {
        castOnStitches: 84,
        totalRows: 100
      };

      const result = extractInstructionInput(
        detailedCalculations,
        'Single Crochet',
        'crochet'
      );

      expect(result).not.toBeNull();
      expect(result!.yarnName).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    
    it('should handle unexpected errors gracefully', () => {
      // Test with malformed input that might cause runtime errors
      const input: any = {
        castOnStitches: null,
        totalRows: undefined,
        stitchPatternName: null,
        craftType: null
      };

      const result = generateBasicInstructions(input);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
}); 