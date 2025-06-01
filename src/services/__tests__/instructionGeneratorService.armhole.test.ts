/**
 * Tests for Armhole Instruction Generation in InstructionGeneratorService (US_11.4)
 * Validates generation of textual instructions for complex armhole and sleeve cap shaping
 */

import { InstructionGeneratorService } from '../instructionGeneratorService';
import { 
  InstructionGenerationContext, 
  InstructionGenerationConfig 
} from '@/types/instruction-generation';
import { 
  ArmholeShapingSchedule,
  ArmholeShapingAction,
  SleeveCapShapingSchedule
} from '@/types/armhole-shaping';

describe('InstructionGeneratorService - Armhole Instructions (US_11.4)', () => {
  let service: InstructionGeneratorService;

  beforeEach(() => {
    service = new InstructionGeneratorService();
  });

  describe('generateArmholeInstructions', () => {
    /**
     * AC1: For a rounded armhole requesting 22cm depth, with 3 stitches bound off at base,
     * the system calculates a sequence of progressive decreases for the rest of the curve on the body panel.
     */
    test('AC1: should generate rounded armhole instruction sequence correctly', () => {
      const roundedArmholeSchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: 3,
        shaping_details: [
          {
            action: 'decrease',
            stitches: 2,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS'
          },
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 5,
            side_of_fabric: 'RS',
            repeats: 4,
            every_x_rows: 2
          }
        ],
        total_rows_for_shaping: 24,
        final_stitches_at_shoulder_edge: 25
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 100,
        finalStitchCount: 86,
        armholeShapingSchedule: roundedArmholeSchedule
      };

      const result = service.generateArmholeInstructions(
        roundedArmholeSchedule,
        context
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);

      const instructions = result.instructions!;

      // Should have base bind-off instruction
      const baseBindOffInstruction = instructions.find(instr => 
        instr.type === 'armhole_base_bind_off'
      );
      expect(baseBindOffInstruction).toBeDefined();
      expect(baseBindOffInstruction!.text).toContain('Begin armhole shaping');
      expect(baseBindOffInstruction!.text).toContain('bind off 3 sts');

      // Should have shaping instructions
      const shapingInstructions = instructions.filter(instr => 
        instr.type === 'armhole_shaping'
      );
      expect(shapingInstructions.length).toBeGreaterThan(0);

      // Check for progressive decreases
      const decreaseInstruction = shapingInstructions.find(instr =>
        instr.text.includes('decrease') && instr.text.includes('2 sts')
      );
      expect(decreaseInstruction).toBeDefined();

      // Check for repeated decrease instruction
      const repeatInstruction = instructions.find(instr =>
        instr.text.includes('Repeat') && instr.text.includes('every 2 rows')
      );
      expect(repeatInstruction).toBeDefined();

      // Check summary
      expect(result.summary?.totalRows).toBe(24);
      expect(result.summary?.finalStitchCount).toBe(25);
    });

    /**
     * AC2: For a raglan requesting decreases "every 2 rows", 
     * the instructions are clear and precise with marker references.
     */
    test('AC2: should generate raglan instruction sequence correctly', () => {
      const raglanArmholeSchedule: ArmholeShapingSchedule = {
        type: 'raglan',
        base_bind_off_stitches: 6, // Small base bind-off for underarm ease
        shaping_details: [
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS',
            repeats: 20,
            every_x_rows: 2
          }
        ],
        total_rows_for_shaping: 42,
        final_stitches_at_shoulder_edge: 20
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 100,
        finalStitchCount: 52,
        armholeShapingSchedule: raglanArmholeSchedule
      };

      const result = service.generateArmholeInstructions(
        raglanArmholeSchedule,
        context
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;

      // Should have base bind-off for underarm ease
      const baseBindOffInstruction = instructions.find(instr => 
        instr.type === 'armhole_base_bind_off'
      );
      expect(baseBindOffInstruction).toBeDefined();
      expect(baseBindOffInstruction!.text).toContain('bind off 6 sts');

      // Should have raglan shaping instructions
      const raglanInstructions = instructions.filter(instr => 
        instr.type === 'armhole_raglan_shaping'
      );
      expect(raglanInstructions.length).toBeGreaterThan(0);

      // Check for raglan-specific terminology
      const raglanInstruction = raglanInstructions.find(instr =>
        instr.text.includes('Raglan') && instr.text.includes('raglan marker')
      );
      expect(raglanInstruction).toBeDefined();

      // Check for repeat instruction
      const repeatInstruction = instructions.find(instr =>
        instr.text.includes('Repeat') && instr.text.includes('every 2 rows')
      );
      expect(repeatInstruction).toBeDefined();

      // Check metadata
      const raglanMetadata = raglanInstructions.find(instr =>
        instr.metadata?.armhole?.raglan_marker_position === 'both_sides'
      );
      expect(raglanMetadata).toBeDefined();
    });

    /**
     * AC3: The terminology is correct for knitting/crochet.
     */
    test('AC3: should use correct terminology for knitting vs crochet', () => {
      const armholeSchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: 3,
        shaping_details: [
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS'
          }
        ],
        total_rows_for_shaping: 10,
        final_stitches_at_shoulder_edge: 20
      };

      // Test knitting terminology
      const knittingContext: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 76
      };

      const knittingResult = service.generateArmholeInstructions(
        armholeSchedule,
        knittingContext
      );

      expect(knittingResult.success).toBe(true);
      const knittingInstructions = knittingResult.instructions!;
      
      // Should use knitting terminology
      const baseInstruction = knittingInstructions.find(instr => 
        instr.type === 'armhole_base_bind_off'
      );
      expect(baseInstruction?.text).toContain('bind off');
      expect(baseInstruction?.text).toContain('knit');

      // Test crochet terminology
      const crochetContext: InstructionGenerationContext = {
        craftType: 'crochet',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 76
      };

      const crochetResult = service.generateArmholeInstructions(
        armholeSchedule,
        crochetContext
      );

      expect(crochetResult.success).toBe(true);
      const crochetInstructions = crochetResult.instructions!;
      
      // Should use crochet terminology
      const crochetBaseInstruction = crochetInstructions.find(instr => 
        instr.type === 'armhole_base_bind_off'
      );
      expect(crochetBaseInstruction?.text).toContain('fasten off');
      expect(crochetBaseInstruction?.text).toContain('single crochet');
    });
  });

  describe('generateSleeveCapInstructions', () => {
    test('should generate sleeve cap shaping instructions', () => {
      const sleeveCapSchedule: SleeveCapShapingSchedule = {
        type: 'rounded_set_in',
        initial_stitches: 40,
        cap_shaping_details: [
          // Initial increases to form the base of the cap
          {
            action: 'decrease', // Note: using decrease as that's what's supported
            stitches: 2,
            on_row_from_start_of_shaping: 1,
            side_of_fabric: 'RS'
          },
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS',
            repeats: 8,
            every_x_rows: 2
          }
        ],
        total_cap_rows: 20,
        final_cap_stitches: 16
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'sleeve',
        componentDisplayName: 'Sleeve',
        startingStitchCount: 40,
        finalStitchCount: 16
      };

      const result = service.generateSleeveCapInstructions(
        sleeveCapSchedule,
        context
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);

      const instructions = result.instructions!;

      // Should have sleeve cap shaping instructions
      const capInstructions = instructions.filter(instr => 
        instr.type === 'sleeve_cap_shaping'
      );
      expect(capInstructions.length).toBeGreaterThan(0);

      // Check for sleeve cap specific terminology
      const capInstruction = capInstructions.find(instr =>
        instr.text.includes('sleeve cap')
      );
      expect(capInstruction).toBeDefined();

      // Check summary
      expect(result.summary?.totalRows).toBe(20);
      expect(result.summary?.finalStitchCount).toBe(16);
    });
  });

  describe('Integration with main instruction generation', () => {
    test('should integrate armhole instructions into main instruction flow', () => {
      const armholeSchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: 3,
        shaping_details: [
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS',
            repeats: 2,
            every_x_rows: 2
          }
        ],
        total_rows_for_shaping: 8,
        final_stitches_at_shoulder_edge: 22
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 22,
        armholeShapingSchedule: armholeSchedule
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;

      // Should have cast-on instruction
      const castOnInstruction = instructions.find(instr => 
        instr.type === 'cast_on'
      );
      expect(castOnInstruction).toBeDefined();

      // Should have armhole instructions integrated
      const armholeInstructions = instructions.filter(instr => 
        instr.type === 'armhole_base_bind_off' || instr.type === 'armhole_shaping'
      );
      expect(armholeInstructions.length).toBeGreaterThan(0);

      // Step numbers should be sequential
      const stepNumbers = instructions.map(instr => instr.step);
      for (let i = 1; i < stepNumbers.length; i++) {
        expect(stepNumbers[i]).toBeGreaterThan(stepNumbers[i - 1]);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid armhole schedule gracefully', () => {
      const invalidSchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: -1, // Invalid negative value
        shaping_details: [],
        total_rows_for_shaping: 0,
        final_stitches_at_shoulder_edge: 0
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 80
      };

      const result = service.generateArmholeInstructions(
        invalidSchedule,
        context
      );

      // Should still succeed but with minimal instructions
      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
    });

    test('should handle empty shaping details', () => {
      const emptySchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: 0,
        shaping_details: [],
        total_rows_for_shaping: 0,
        final_stitches_at_shoulder_edge: 80
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 80
      };

      const result = service.generateArmholeInstructions(
        emptySchedule,
        context
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      // Should have no instructions if no shaping is needed
      expect(result.instructions!.length).toBe(0);
    });
  });

  describe('Multi-language Support', () => {
    test('should generate instructions in French', () => {
      const armholeSchedule: ArmholeShapingSchedule = {
        type: 'rounded_set_in',
        base_bind_off_stitches: 3,
        shaping_details: [
          {
            action: 'decrease',
            stitches: 1,
            on_row_from_start_of_shaping: 3,
            side_of_fabric: 'RS'
          }
        ],
        total_rows_for_shaping: 6,
        final_stitches_at_shoulder_edge: 22
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 80,
        finalStitchCount: 76
      };

      const frenchConfig: InstructionGenerationConfig = {
        includeStitchCounts: true,
        includeRowNumbers: true,
        useSpecificTechniques: false,
        language: 'fr',
        verbosity: 'standard'
      };

      const result = service.generateArmholeInstructions(
        armholeSchedule,
        context,
        frenchConfig
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      const instructions = result.instructions!;

      // Should use French terminology
      const baseInstruction = instructions.find(instr => 
        instr.type === 'armhole_base_bind_off'
      );
      expect(baseInstruction?.text).toContain('Rang');
      expect(baseInstruction?.text).toContain('Endroit');
      expect(baseInstruction?.text).toContain('rabattre');
      expect(baseInstruction?.text).toContain('emmanchures');

      const shapingInstruction = instructions.find(instr => 
        instr.type === 'armhole_shaping'
      );
      expect(shapingInstruction?.text).toContain('Diminution');
      expect(shapingInstruction?.text).toContain('diminuer');
    });
  });
}); 