/**
 * Raglan Instruction Generator Tests (US_12.2)
 * Tests for raglan top-down instruction generation
 * Covers Acceptance Criteria AC1-AC5 from US_12.2
 */

import { generateRaglanTopDownInstructions } from '../raglan-instruction-generator';
import {
  RaglanInstructionContext,
  RaglanInstructionGenerationResult,
  DEFAULT_RAGLAN_INCREASE_METHODS
} from '@/types/raglan-instruction';
import { RaglanTopDownCalculations } from '@/types/raglan-construction';
import { InstructionGenerationConfig } from '@/types/instruction-generation';

describe('Raglan Instruction Generator (US_12.2)', () => {
  // Test data setup - Sample raglan calculations from US_12.1
  const sampleRaglanCalculations: RaglanTopDownCalculations = {
    neckline_cast_on_total: 96,
    initial_distribution: {
      front_stitches: 30,
      back_stitches: 30,
      sleeve_left_stitches: 12,
      sleeve_right_stitches: 12,
      raglan_line_stitches_each: 2,
      total_check: 96
    },
    raglan_shaping: {
      raglan_line_length_rows_or_rounds: 56,
      augmentation_frequency_description: "Increase 8 stitches every 2nd round.",
      total_augmentation_rounds_or_rows: 28,
      total_increases_per_sleeve: 28,
      total_increases_per_body_panel: 28,
      increase_frequency: 2
    },
    stitches_at_separation: {
      body_total_stitches: 172,
      sleeve_each_stitches: 40,
      underarm_cast_on_stitches: 6
    },
    calculation_metadata: {
      actual_neckline_circumference_cm: 38.4,
      actual_body_width_at_separation_cm: 86.0,
      actual_sleeve_width_at_separation_cm: 20.0
    }
  };

  const defaultConfig: InstructionGenerationConfig = {
    includeStitchCounts: true,
    includeRowNumbers: true,
    useSpecificTechniques: true,
    language: 'en',
    verbosity: 'standard'
  };

  const createTestContext = (
    craftType: 'knitting' | 'crochet' = 'knitting',
    config: Partial<InstructionGenerationConfig> = {}
  ): RaglanInstructionContext => ({
    craftType,
    raglanCalculations: sampleRaglanCalculations,
    componentKey: 'test_raglan_sweater',
    componentDisplayName: 'Test Raglan Sweater',
    config: { ...defaultConfig, ...config }
  });

  describe('FR1: Input Processing', () => {
    it('should accept raglan_top_down_calculations structure as input', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      expect(result.allInstructions).toBeDefined();
    });

    it('should handle missing optional fields gracefully', () => {
      const contextWithoutIncreaseMethod = createTestContext();
      delete contextWithoutIncreaseMethod.increaseMethod;
      
      const result = generateRaglanTopDownInstructions(contextWithoutIncreaseMethod);
      
      expect(result.success).toBe(true);
      // Should use default increase method for knitting
      expect(result.allInstructions?.[2]?.text).toContain('M1L');
    });
  });

  describe('FR2: Cast-On Instructions (AC1)', () => {
    it('should generate correct cast-on instructions with stitch count', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      expect(result.allInstructions).toBeDefined();
      
      const castOnInstruction = result.allInstructions![0];
      expect(castOnInstruction.type).toBe('raglan_cast_on');
      expect(castOnInstruction.text).toContain('96');
      expect(castOnInstruction.text).toContain('Cast on');
      expect(castOnInstruction.stitchCount).toBe(96);
    });

    it('should use craft-specific terminology for cast-on', () => {
      const knittingContext = createTestContext('knitting');
      const crochetContext = createTestContext('crochet');
      
      const knittingResult = generateRaglanTopDownInstructions(knittingContext);
      const crochetResult = generateRaglanTopDownInstructions(crochetContext);
      
      expect(knittingResult.allInstructions![0].text).toContain('Cast on');
      expect(crochetResult.allInstructions![0].text).toContain('Chain');
    });
  });

  describe('FR3: Marker Placement Instructions (AC1)', () => {
    it('should generate marker placement with correct stitch distribution', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      
      const markerInstruction = result.allInstructions![1];
      expect(markerInstruction.type).toBe('raglan_marker_placement');
      expect(markerInstruction.text).toContain('30 for back');
      expect(markerInstruction.text).toContain('30 for front');
      expect(markerInstruction.text).toContain('12 for left sleeve');
      expect(markerInstruction.text).toContain('12 for right sleeve');
      expect(markerInstruction.text).toContain('2 for raglan line');
      expect(markerInstruction.stitchCount).toBe(96);
    });

    it('should include round number and setup indication', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const markerInstruction = result.allInstructions![1];
      expect(markerInstruction.roundNumber).toBe(1);
      expect(markerInstruction.raglanMetadata.roundType).toBe('setup');
    });

    it('should store section stitches metadata correctly', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const markerInstruction = result.allInstructions![1];
      expect(markerInstruction.raglanMetadata.sectionStitches).toEqual({
        back: 30,
        front: 30,
        leftSleeve: 12,
        rightSleeve: 12,
        raglanLines: 8
      });
    });
  });

  describe('FR4-FR6: Increase and Plain Rounds (AC2, AC3)', () => {
    it('should generate correct increase round instructions', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      
      // Find first increase round (should be round 2)
      const increaseInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_increase_round'
      );
      
      expect(increaseInstruction).toBeDefined();
      expect(increaseInstruction!.text).toContain('Increase Round');
      expect(increaseInstruction!.text).toContain('M1L'); // Default knitting increase method
      expect(increaseInstruction!.text).toContain('M1R');
      expect(increaseInstruction!.raglanMetadata.stitchesIncreased).toBe(8);
    });

    it('should calculate correct stitch counts after increases', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const increaseInstructions = result.allInstructions!.filter(
        instr => instr.type === 'raglan_increase_round'
      );
      
      // First increase round should go from 96 to 104 stitches
      expect(increaseInstructions[0].stitchCount).toBe(104);
      
      // Each subsequent increase should add 8 stitches
      for (let i = 1; i < increaseInstructions.length; i++) {
        expect(increaseInstructions[i].stitchCount).toBe(
          increaseInstructions[i - 1].stitchCount + 8
        );
      }
    });

    it('should generate plain rounds between increases with correct frequency', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const plainInstructions = result.allInstructions!.filter(
        instr => instr.type === 'raglan_plain_round'
      );
      
      // With frequency 2, there should be plain rounds between increases
      expect(plainInstructions.length).toBeGreaterThan(0);
      
      // Check that plain round instructions are correct
      const plainInstruction = plainInstructions[0];
      expect(plainInstruction.text).toContain('Knit all stitches');
      expect(plainInstruction.raglanMetadata.roundType).toBe('plain');
    });

    it('should continue until total increase rounds are reached', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const increaseInstructions = result.allInstructions!.filter(
        instr => instr.type === 'raglan_increase_round'
      );
      
      // Should have exactly 28 increase rounds as specified in calculations
      expect(increaseInstructions.length).toBe(28);
      expect(result.summary?.increaseRounds).toBe(28);
    });

    it('should use different increase methods when specified', () => {
      const contextWithYO = createTestContext();
      contextWithYO.increaseMethod = 'YO';
      
      const result = generateRaglanTopDownInstructions(contextWithYO);
      
      const increaseInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_increase_round'
      );
      
      expect(increaseInstruction!.text).toContain('yarn over');
    });
  });

  describe('FR7-FR8: Separation Instructions (AC4, AC5)', () => {
    it('should generate sleeve separation instructions with correct stitch counts', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      
      const separationInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_separation'
      );
      
      expect(separationInstruction).toBeDefined();
      expect(separationInstruction!.text).toContain('40 left sleeve stitches'); // sleeve_each_stitches
      expect(separationInstruction!.text).toContain('40 right sleeve stitches'); 
      expect(separationInstruction!.text).toContain('6 stitches for underarm'); // underarm_cast_on_stitches
      expect(separationInstruction!.text).toContain('172 sts total for body'); // body_total_stitches
    });

    it('should calculate final body stitch count including underarm cast-on', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const separationInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_separation'
      );
      
      // Body stitches (172) + underarm cast-on (6 * 2) = 184
      expect(separationInstruction!.stitchCount).toBe(184);
      expect(result.summary?.finalStitchCount).toBe(184);
    });

    it('should include underarm cast-on metadata', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const separationInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_separation'
      );
      
      expect(separationInstruction!.raglanMetadata.underarmCastOn).toBe(6);
      expect(separationInstruction!.raglanMetadata.roundType).toBe('separation');
    });
  });

  describe('Language Support', () => {
    it('should generate French instructions when language is set to fr', () => {
      const frenchContext = createTestContext('knitting', { language: 'fr' });
      const result = generateRaglanTopDownInstructions(frenchContext);
      
      expect(result.success).toBe(true);
      
      const castOnInstruction = result.allInstructions![0];
      expect(castOnInstruction.text).toContain('Monter');
      expect(castOnInstruction.text).toContain('mailles');
      
      const markerInstruction = result.allInstructions![1];
      expect(markerInstruction.text).toContain('pour le dos');
      expect(markerInstruction.text).toContain('manche');
    });
  });

  describe('Crochet Support', () => {
    it('should generate crochet-specific instructions', () => {
      const crochetContext = createTestContext('crochet');
      const result = generateRaglanTopDownInstructions(crochetContext);
      
      expect(result.success).toBe(true);
      
      const castOnInstruction = result.allInstructions![0];
      expect(castOnInstruction.text).toContain('Chain');
      
      const increaseInstruction = result.allInstructions!.find(
        instr => instr.type === 'raglan_increase_round'
      );
      expect(increaseInstruction!.text).toContain('Single crochet');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing calculations gracefully', () => {
      const contextWithoutCalcs = createTestContext();
      // @ts-ignore - Intentionally passing incomplete data for error testing
      contextWithoutCalcs.raglanCalculations = {};
      
      const result = generateRaglanTopDownInstructions(contextWithoutCalcs);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return detailed error messages for invalid input', () => {
      const contextWithInvalidCalcs = createTestContext();
      // @ts-ignore - Intentionally passing invalid data
      contextWithInvalidCalcs.raglanCalculations.neckline_cast_on_total = -1;
      
      const result = generateRaglanTopDownInstructions(contextWithInvalidCalcs);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete instruction sequence (AC1-AC5)', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.success).toBe(true);
      expect(result.allInstructions).toBeDefined();
      expect(result.summary).toBeDefined();
      
      // Verify sequence integrity
      const instructions = result.allInstructions!;
      
      // Should start with cast-on
      expect(instructions[0].type).toBe('raglan_cast_on');
      
      // Should have marker placement as second instruction
      expect(instructions[1].type).toBe('raglan_marker_placement');
      
      // Should have increase and plain rounds
      const hasIncreaseRounds = instructions.some(instr => instr.type === 'raglan_increase_round');
      const hasPlainRounds = instructions.some(instr => instr.type === 'raglan_plain_round');
      expect(hasIncreaseRounds).toBe(true);
      expect(hasPlainRounds).toBe(true);
      
      // Should end with separation
      expect(instructions[instructions.length - 1].type).toBe('raglan_separation');
    });

    it('should maintain correct step numbering throughout', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const instructions = result.allInstructions!;
      
      // Verify step numbers are sequential
      for (let i = 0; i < instructions.length; i++) {
        expect(instructions[i].step).toBe(i + 1);
      }
    });

    it('should maintain stitch count accuracy throughout construction', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const instructions = result.allInstructions!;
      
      // Cast-on should be 96 stitches
      expect(instructions[0].stitchCount).toBe(96);
      
      // Find all increase rounds and verify 8-stitch increments
      const increaseInstructions = instructions.filter(
        instr => instr.type === 'raglan_increase_round'
      );
      
      let expectedStitches = 96;
      for (const increaseInstr of increaseInstructions) {
        expectedStitches += 8;
        expect(increaseInstr.stitchCount).toBe(expectedStitches);
      }
    });

    it('should generate appropriate round numbers for circular knitting', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      const instructions = result.allInstructions!;
      
      // Marker placement should be round 1
      const markerInstruction = instructions.find(instr => instr.type === 'raglan_marker_placement');
      expect(markerInstruction!.roundNumber).toBe(1);
      
      // Round numbers should be sequential and logical
      const instructionsWithRounds = instructions.filter(instr => instr.roundNumber);
      for (let i = 1; i < instructionsWithRounds.length; i++) {
        expect(instructionsWithRounds[i].roundNumber!).toBeGreaterThan(
          instructionsWithRounds[i - 1].roundNumber!
        );
      }
    });
  });

  describe('Summary Information', () => {
    it('should provide accurate summary statistics', () => {
      const context = createTestContext();
      const result = generateRaglanTopDownInstructions(context);
      
      expect(result.summary).toBeDefined();
      expect(result.summary!.totalInstructions).toBeGreaterThan(0);
      expect(result.summary!.totalRounds).toBe(56); // raglan_line_length_rows_or_rounds
      expect(result.summary!.increaseRounds).toBe(28); // total_augmentation_rounds_or_rows
      expect(result.summary!.plainRounds).toBe(28); // totalRounds - increaseRounds
      expect(result.summary!.finalStitchCount).toBe(184); // body + underarm cast-on
    });
  });
}); 