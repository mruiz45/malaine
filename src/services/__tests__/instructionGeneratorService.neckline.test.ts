/**
 * Tests for Neckline Instruction Generation (US_11.2)
 * Validates generation of textual instructions for complex neckline shaping
 */

import { InstructionGeneratorService } from '../instructionGeneratorService';
import { 
  InstructionGenerationContext, 
  InstructionGenerationConfig 
} from '@/types/instruction-generation';
import { 
  NecklineShapingSchedule,
  NecklineShapingAction 
} from '@/types/neckline-shaping';

describe('InstructionGeneratorService - Neckline Instructions (US_11.2)', () => {
  let service: InstructionGeneratorService;

  beforeEach(() => {
    service = new InstructionGeneratorService();
  });

  describe('generateNecklineInstructions', () => {
    /**
     * AC1: For a rounded neckline schedule (bind off 10st center, then each side: 
     * bind off 3st, then 2st, then 1st x 2 times every 2 rows), 
     * the generated textual instructions precisely reflect this sequence, 
     * including work side (RS/WS).
     */
    test('AC1: Should generate correct instructions for rounded neckline shaping', () => {
      // Mock rounded neckline schedule as specified in AC1
      const roundedNecklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 10,
        sides: {
          left: [
            {
              action: 'bind_off',
              stitches: 3,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            },
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 3,
              side_of_fabric: 'WS'
            },
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 5,
              side_of_fabric: 'RS',
              repeats: 2,
              every_x_rows: 2
            }
          ],
          right: [
            {
              action: 'bind_off',
              stitches: 3,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            },
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 3,
              side_of_fabric: 'WS'
            },
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 5,
              side_of_fabric: 'RS',
              repeats: 2,
              every_x_rows: 2
            }
          ]
        },
        total_rows_for_shaping: 10,
        final_shoulder_stitches_each_side: 15
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 60, // 25 + 10 + 25
        finalStitchCount: 30, // 15 each side
        necklineShapingSchedule: roundedNecklineSchedule
      };

      const result = service.generateNecklineInstructions(
        roundedNecklineSchedule,
        context
      );

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);

      // Check center bind-off instruction
      const centerInstruction = result.instructions!.find(inst => 
        inst.type === 'neckline_center_divide'
      );
      expect(centerInstruction).toBeDefined();
      expect(centerInstruction!.text).toContain('10');
      expect(centerInstruction!.text).toContain('bind off');
      expect(centerInstruction!.text).toContain('center');

      // Check side shaping instructions
      const shapingInstructions = result.instructions!.filter(inst => 
        inst.type === 'neckline_shaping'
      );
      expect(shapingInstructions.length).toBeGreaterThan(0);

      // Verify bind off instructions exist
      const bindOffInstructions = shapingInstructions.filter(inst =>
        inst.text.toLowerCase().includes('bind off')
      );
      expect(bindOffInstructions.length).toBeGreaterThan(0);

      // Verify decrease instructions exist
      const decreaseInstructions = shapingInstructions.filter(inst =>
        inst.text.toLowerCase().includes('decrease')
      );
      expect(decreaseInstructions.length).toBeGreaterThan(0);

      // Verify WS/RS side indication
      const wsInstructions = shapingInstructions.filter(inst =>
        inst.text.includes('WS')
      );
      expect(wsInstructions.length).toBeGreaterThan(0);

      const rsInstructions = shapingInstructions.filter(inst =>
        inst.text.includes('RS')
      );
      expect(rsInstructions.length).toBeGreaterThan(0);
    });

    /**
     * AC2: Instructions use standard and clear terminology for knitting 
     * (or crochet, depending on craft_type).
     */
    test('AC2: Should use standard knitting terminology for knitting patterns', () => {
      const simpleNecklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 8,
        sides: {
          left: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ],
          right: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ]
        },
        total_rows_for_shaping: 4,
        final_shoulder_stitches_each_side: 12
      };

      const knittingContext: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 40,
        finalStitchCount: 24,
        necklineShapingSchedule: simpleNecklineSchedule
      };

      const result = service.generateNecklineInstructions(
        simpleNecklineSchedule,
        knittingContext
      );

      expect(result.success).toBe(true);
      
      // Check for standard knitting terminology
      const allInstructionText = result.instructions!
        .map(inst => inst.text)
        .join(' ');

      expect(allInstructionText).toMatch(/bind off|knit|sts|RS|WS/);
      expect(allInstructionText).not.toMatch(/crochet|single crochet|fasten off/);
    });

    test('AC2: Should use standard crochet terminology for crochet patterns', () => {
      const simpleNecklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 6,
        sides: {
          left: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'RS'
            }
          ],
          right: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'RS'
            }
          ]
        },
        total_rows_for_shaping: 2,
        final_shoulder_stitches_each_side: 10
      };

      const crochetContext: InstructionGenerationContext = {
        craftType: 'crochet',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 32,
        finalStitchCount: 20,
        necklineShapingSchedule: simpleNecklineSchedule
      };

      const result = service.generateNecklineInstructions(
        simpleNecklineSchedule,
        crochetContext
      );

      expect(result.success).toBe(true);
      
      // Check for standard crochet terminology
      const allInstructionText = result.instructions!
        .map(inst => inst.text)
        .join(' ');

      expect(allInstructionText).toMatch(/fasten off|decrease|sts/);
      expect(allInstructionText).not.toMatch(/bind off|knit/);
    });

    /**
     * AC3: The number of remaining stitches is correctly indicated 
     * after key decrease steps.
     */
    test('AC3: Should correctly indicate remaining stitches after decrease steps', () => {
      const necklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 6,
        sides: {
          left: [
            {
              action: 'bind_off',
              stitches: 3,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            },
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
              side_of_fabric: 'RS'
            }
          ],
          right: [
            {
              action: 'bind_off',
              stitches: 3,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            },
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
              side_of_fabric: 'RS'
            }
          ]
        },
        total_rows_for_shaping: 6,
        final_shoulder_stitches_each_side: 12
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 42, // 18 + 6 + 18
        finalStitchCount: 24, // 12 each side
        necklineShapingSchedule: necklineSchedule
      };

      const config: InstructionGenerationConfig = {
        includeStitchCounts: true,
        includeRowNumbers: true,
        useSpecificTechniques: false,
        language: 'en',
        verbosity: 'standard'
      };

      const result = service.generateNecklineInstructions(
        necklineSchedule,
        context,
        config
      );

      expect(result.success).toBe(true);

      // Find shaping instructions and verify stitch count progression
      const shapingInstructions = result.instructions!.filter(inst => 
        inst.type === 'neckline_shaping' && inst.stitchCount !== undefined
      );

      expect(shapingInstructions.length).toBeGreaterThan(0);

      // Verify that stitch counts are included in instruction text
      shapingInstructions.forEach(instruction => {
        expect(instruction.text).toMatch(/\(\d+ sts/);
        expect(instruction.stitchCount).toBeDefined();
        expect(instruction.stitchCount!).toBeGreaterThan(0);
      });

      // Check specific stitch count progression for left side
      const leftSideInstructions = shapingInstructions.filter(inst =>
        inst.metadata?.neckline?.for_side === 'left_front'
      );

      if (leftSideInstructions.length >= 3) {
        // After first bind off: 18 - 3 = 15
        expect(leftSideInstructions[0].stitchCount).toBe(15);
        // After first decrease: 15 - 2 = 13
        expect(leftSideInstructions[1].stitchCount).toBe(13);
        // After second decrease: 13 - 1 = 12
        expect(leftSideInstructions[2].stitchCount).toBe(12);
      }
    });

    /**
     * AC4: Instructions for right side and left side are distinct and correct.
     */
    test('AC4: Should generate distinct and correct instructions for left and right sides', () => {
      const asymmetricNecklineSchedule: NecklineShapingSchedule = {
        type: 'v_neck',
        center_bind_off_stitches: 2, // Minimal for V-neck
        sides: {
          left: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 2,
              side_of_fabric: 'RS',
              repeats: 3,
              every_x_rows: 2
            }
          ],
          right: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 2,
              side_of_fabric: 'RS',
              repeats: 3,
              every_x_rows: 2
            }
          ]
        },
        total_rows_for_shaping: 8,
        final_shoulder_stitches_each_side: 16
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 40, // 19 + 2 + 19
        finalStitchCount: 32, // 16 each side
        necklineShapingSchedule: asymmetricNecklineSchedule
      };

      const config: InstructionGenerationConfig = {
        includeStitchCounts: true,
        includeRowNumbers: true,
        useSpecificTechniques: true, // Use k2tog and ssk
        language: 'en',
        verbosity: 'standard'
      };

      const result = service.generateNecklineInstructions(
        asymmetricNecklineSchedule,
        context,
        config
      );

      expect(result.success).toBe(true);

      // Separate left and right side instructions
      const leftSideInstructions = result.instructions!.filter(inst =>
        inst.metadata?.neckline?.for_side === 'left_front'
      );

      const rightSideInstructions = result.instructions!.filter(inst =>
        inst.metadata?.neckline?.for_side === 'right_front'
      );

      expect(leftSideInstructions.length).toBeGreaterThan(0);
      expect(rightSideInstructions.length).toBeGreaterThan(0);

      // Verify that instructions are distinct for each side
      expect(leftSideInstructions.length).toEqual(rightSideInstructions.length);

      // With specific techniques enabled, check for different decrease methods
      const leftSideText = leftSideInstructions.map(inst => inst.text).join(' ');
      const rightSideText = rightSideInstructions.map(inst => inst.text).join(' ');

      if (config.useSpecificTechniques) {
        // Left side should use ssk (left-leaning decrease)
        expect(leftSideText).toMatch(/ssk/);
        // Right side should use k2tog (right-leaning decrease)
        expect(rightSideText).toMatch(/k2tog/);
      }

      // Verify metadata indicates correct sides
      leftSideInstructions.forEach(instruction => {
        expect(instruction.metadata?.neckline?.for_side).toBe('left_front');
      });

      rightSideInstructions.forEach(instruction => {
        expect(instruction.metadata?.neckline?.for_side).toBe('right_front');
      });
    });

    test('Should handle V-neck neckline with minimal center bind-off', () => {
      const vNeckSchedule: NecklineShapingSchedule = {
        type: 'v_neck',
        center_bind_off_stitches: 2,
        sides: {
          left: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 2,
              side_of_fabric: 'RS',
              repeats: 5,
              every_x_rows: 4
            }
          ],
          right: [
            {
              action: 'decrease',
              stitches: 1,
              on_row_from_start_of_shaping: 2,
              side_of_fabric: 'RS',
              repeats: 5,
              every_x_rows: 4
            }
          ]
        },
        total_rows_for_shaping: 20,
        final_shoulder_stitches_each_side: 18
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 48, // 23 + 2 + 23
        finalStitchCount: 36, // 18 each side
        necklineShapingSchedule: vNeckSchedule
      };

      const result = service.generateNecklineInstructions(vNeckSchedule, context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      // Should have center bind-off instruction
      const centerInstruction = result.instructions!.find(inst => 
        inst.type === 'neckline_center_divide'
      );
      expect(centerInstruction).toBeDefined();
      expect(centerInstruction!.text).toContain('2');

      // Should have decrease instructions for both sides
      const decreaseInstructions = result.instructions!.filter(inst =>
        inst.type === 'neckline_shaping' && inst.text.toLowerCase().includes('decrease')
      );
      expect(decreaseInstructions.length).toBeGreaterThan(0);
    });

    test('Should handle French language instructions', () => {
      const necklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 8,
        sides: {
          left: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ],
          right: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ]
        },
        total_rows_for_shaping: 4,
        final_shoulder_stitches_each_side: 12
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'devant',
        componentDisplayName: 'Devant',
        startingStitchCount: 40,
        finalStitchCount: 24,
        necklineShapingSchedule: necklineSchedule
      };

      const frenchConfig: InstructionGenerationConfig = {
        includeStitchCounts: true,
        includeRowNumbers: true,
        useSpecificTechniques: false,
        language: 'fr',
        verbosity: 'standard'
      };

      const result = service.generateNecklineInstructions(
        necklineSchedule,
        context,
        frenchConfig
      );

      expect(result.success).toBe(true);

      const allInstructionText = result.instructions!
        .map(inst => inst.text)
        .join(' ');

      // Check for French terminology
      expect(allInstructionText).toMatch(/rabattre|mailles|Rang|Endroit|Envers/);
      expect(allInstructionText).not.toMatch(/bind off|stitches|Row|RS|WS/);
    });

    test('Should fail gracefully with invalid neckline schedule', () => {
      const invalidSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 100, // Invalid: more than total stitches
        sides: {
          left: [],
          right: []
        },
        total_rows_for_shaping: 0,
        final_shoulder_stitches_each_side: 0
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 40,
        finalStitchCount: 0,
        necklineShapingSchedule: invalidSchedule
      };

      const result = service.generateNecklineInstructions(invalidSchedule, context);

      // Should still succeed but generate appropriate instructions
      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
    });
  });

  describe('Integration with generateDetailedInstructionsWithShaping', () => {
    test('Should integrate neckline instructions when necklineShapingSchedule is present', () => {
      const necklineSchedule: NecklineShapingSchedule = {
        type: 'rounded',
        center_bind_off_stitches: 6,
        sides: {
          left: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ],
          right: [
            {
              action: 'bind_off',
              stitches: 2,
              on_row_from_start_of_shaping: 1,
              side_of_fabric: 'WS'
            }
          ]
        },
        total_rows_for_shaping: 4,
        final_shoulder_stitches_each_side: 12
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'front_panel',
        componentDisplayName: 'Front Panel',
        startingStitchCount: 32,
        finalStitchCount: 24,
        necklineShapingSchedule: necklineSchedule
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      // Should have cast-on
      const castOnInstruction = result.instructions!.find(inst => 
        inst.type === 'cast_on'
      );
      expect(castOnInstruction).toBeDefined();

      // Should have neckline instructions
      const necklineInstructions = result.instructions!.filter(inst =>
        inst.type.startsWith('neckline_')
      );
      expect(necklineInstructions.length).toBeGreaterThan(0);

      // Step numbers should be continuous
      result.instructions!.forEach((instruction, index) => {
        expect(instruction.step).toBe(index + 1);
      });
    });
  });
}); 