/**
 * Tests for InstructionGeneratorService (US 7.3)
 * Validates generation of detailed textual instructions with shaping
 */

import { InstructionGeneratorService } from '../instructionGeneratorService';
import { 
  InstructionGenerationContext, 
  InstructionGenerationConfig 
} from '@/types/instruction-generation';
import { ShapingSchedule, ShapingEvent } from '@/types/shaping';

describe('InstructionGeneratorService', () => {
  let service: InstructionGeneratorService;

  beforeEach(() => {
    service = new InstructionGeneratorService();
  });

  describe('generateDetailedInstructionsWithShaping', () => {
    test('AC1: Should generate correct instructions for sleeve decreasing from 60 to 40 sts over 60 rows', () => {
      // Mock shaping schedule for sleeve decrease: 60→40 sts, decrease 2 sts every 6th row, 10 times
      const shapingSchedule: ShapingSchedule = {
        shapingEvents: [
          {
            type: 'decrease',
            totalStitchesToChange: 20,
            stitchesPerEvent: 2,
            numShapingEvents: 10,
            instructionsTextSimple: 'Decrease 2 sts every 6th row, 10 times',
            detailedBreakdown: [
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 6, instruction: 'Decrease 2 sts' }
            ]
          }
        ],
        hasShaping: true,
        totalShapingRows: 60,
        metadata: {
          algorithm: 'even_distribution',
          calculatedAt: new Date().toISOString()
        }
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'sleeve',
        componentDisplayName: 'Sleeve',
        startingStitchCount: 60,
        finalStitchCount: 40,
        shapingSchedule,
        metadata: {
          stitchPatternName: 'Stockinette Stitch'
        }
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();
      expect(result.instructions!.length).toBeGreaterThan(0);

      // Check that instructions include cast-on
      const castOnInstruction = result.instructions!.find(inst => inst.type === 'cast_on');
      expect(castOnInstruction).toBeDefined();
      expect(castOnInstruction!.text).toContain('60 stitches');

      // Check that shaping rows are present
      const shapingRows = result.instructions!.filter(inst => inst.type === 'shaping_row');
      expect(shapingRows.length).toBe(10); // 10 decrease rows

      // Check stitch count progression
      const firstShapingRow = shapingRows[0];
      expect(firstShapingRow.stitchCount).toBe(58); // 60 - 2 = 58

      const lastShapingRow = shapingRows[shapingRows.length - 1];
      expect(lastShapingRow.stitchCount).toBe(40); // Final count

      // Check that plain segments are present
      const plainSegments = result.instructions!.filter(inst => inst.type === 'plain_segment');
      expect(plainSegments.length).toBeGreaterThan(0);
    });

    test('AC2: Should clearly distinguish between plain rows and shaping rows', () => {
      const shapingSchedule: ShapingSchedule = {
        shapingEvents: [
          {
            type: 'decrease',
            totalStitchesToChange: 4,
            stitchesPerEvent: 2,
            numShapingEvents: 2,
            instructionsTextSimple: 'Decrease 2 sts every 8th row, 2 times',
            detailedBreakdown: [
              { actionRowOffset: 8, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 8, instruction: 'Decrease 2 sts' }
            ]
          }
        ],
        hasShaping: true,
        totalShapingRows: 16
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'test_component',
        componentDisplayName: 'Test Component',
        startingStitchCount: 50,
        finalStitchCount: 46,
        shapingSchedule
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);

      // Check that shaping rows have clear indication
      const shapingRows = result.instructions!.filter(inst => inst.type === 'shaping_row');
      shapingRows.forEach(row => {
        expect(row.text.toLowerCase()).toMatch(/(decrease|increase) row/);
        expect(row.metadata?.shapingType).toBeDefined();
      });

      // Check that plain segments are clearly identified
      const plainSegments = result.instructions!.filter(inst => inst.type === 'plain_segment');
      plainSegments.forEach(segment => {
        expect(segment.text.toLowerCase()).toMatch(/(continue|work).*(plain|rows)/);
      });
    });

    test('AC3: Should include accurate stitch counts after shaping rows', () => {
      const shapingSchedule: ShapingSchedule = {
        shapingEvents: [
          {
            type: 'decrease',
            totalStitchesToChange: 6,
            stitchesPerEvent: 2,
            numShapingEvents: 3,
            instructionsTextSimple: 'Decrease 2 sts every 4th row, 3 times',
            detailedBreakdown: [
              { actionRowOffset: 4, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 4, instruction: 'Decrease 2 sts' },
              { actionRowOffset: 4, instruction: 'Decrease 2 sts' }
            ]
          }
        ],
        hasShaping: true,
        totalShapingRows: 12
      };

      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'test_component',
        componentDisplayName: 'Test Component',
        startingStitchCount: 30,
        finalStitchCount: 24,
        shapingSchedule
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);

      const shapingRows = result.instructions!.filter(inst => inst.type === 'shaping_row');
      
      // Verify stitch count progression
      expect(shapingRows[0].stitchCount).toBe(28); // 30 - 2 = 28
      expect(shapingRows[1].stitchCount).toBe(26); // 28 - 2 = 26
      expect(shapingRows[2].stitchCount).toBe(24); // 26 - 2 = 24

      // Verify that stitch counts are included in instruction text
      shapingRows.forEach(row => {
        expect(row.text).toMatch(/\(\d+ sts\)/);
      });
    });

    test('Should handle components without shaping', () => {
      const context: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'body_panel',
        componentDisplayName: 'Body Panel',
        startingStitchCount: 100,
        finalStitchCount: 100,
        shapingSchedule: undefined
      };

      const result = service.generateDetailedInstructionsWithShaping(context);

      expect(result.success).toBe(true);
      expect(result.instructions).toBeDefined();

      // Should have cast-on, plain work, and cast-off
      const castOn = result.instructions!.find(inst => inst.type === 'cast_on');
      const plainWork = result.instructions!.find(inst => inst.type === 'plain_segment');
      const castOff = result.instructions!.find(inst => inst.type === 'cast_off');

      expect(castOn).toBeDefined();
      expect(plainWork).toBeDefined();
      expect(castOff).toBeDefined();
    });

    test('Should generate different terminology for crochet vs knitting', () => {
      const shapingSchedule: ShapingSchedule = {
        shapingEvents: [
          {
            type: 'decrease',
            totalStitchesToChange: 2,
            stitchesPerEvent: 2,
            numShapingEvents: 1,
            instructionsTextSimple: 'Decrease 2 sts',
            detailedBreakdown: [
              { actionRowOffset: 1, instruction: 'Decrease 2 sts' }
            ]
          }
        ],
        hasShaping: true,
        totalShapingRows: 1
      };

      const knittingContext: InstructionGenerationContext = {
        craftType: 'knitting',
        componentKey: 'test',
        componentDisplayName: 'Test',
        startingStitchCount: 20,
        finalStitchCount: 18,
        shapingSchedule
      };

      const crochetContext: InstructionGenerationContext = {
        ...knittingContext,
        craftType: 'crochet'
      };

      const knittingResult = service.generateDetailedInstructionsWithShaping(knittingContext);
      const crochetResult = service.generateDetailedInstructionsWithShaping(crochetContext);

      expect(knittingResult.success).toBe(true);
      expect(crochetResult.success).toBe(true);

      // Check cast-on terminology differences
      const knittingCastOn = knittingResult.instructions!.find(inst => inst.type === 'cast_on');
      const crochetCastOn = crochetResult.instructions!.find(inst => inst.type === 'cast_on');

      expect(knittingCastOn!.text.toLowerCase()).toContain('cast on');
      expect(crochetCastOn!.text.toLowerCase()).toContain('chain');

      // Check shaping row terminology
      const knittingShaping = knittingResult.instructions!.find(inst => inst.type === 'shaping_row');
      const crochetShaping = crochetResult.instructions!.find(inst => inst.type === 'shaping_row');

      expect(knittingShaping!.text.toLowerCase()).toMatch(/k\d|knit|k2tog|ssk/);
      expect(crochetShaping!.text.toLowerCase()).toMatch(/sc|single crochet|sc2tog/);
    });
  });
}); 