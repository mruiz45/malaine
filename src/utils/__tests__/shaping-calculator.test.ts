/**
 * Tests for Shaping Calculator (US 7.2)
 * Tests the basic shaping calculations for increases/decreases in garment components
 */

import { calculateShaping } from '../shaping-calculator';
import { ShapingCalculationInput } from '@/types/shaping';

describe('Shaping Calculator', () => {
  describe('Basic Functionality', () => {
    it('should handle no shaping required (same start and target)', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 50,
        targetStitchCount: 50,
        totalRowsForShaping: 60,
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.hasShaping).toBe(false);
      expect(result.schedule?.shapingEvents).toHaveLength(0);
      expect(result.schedule?.totalShapingRows).toBe(0);
    });

    it('should validate input parameters', () => {
      const invalidInput: ShapingCalculationInput = {
        startingStitchCount: 0, // Invalid: should be positive
        targetStitchCount: 40,
        totalRowsForShaping: -10, // Invalid: should be positive
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 0, // Invalid: should be positive
        unit: 'cm'
      };

      const result = calculateShaping(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should detect insufficient rows for required shaping', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 50, // Need 20 stitches increase
        totalRowsForShaping: 5, // Only 5 rows available
        stitchesPerShapingEvent: 2, // Need 10 shaping events = 10 rows minimum
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not enough rows for shaping');
    });
  });

  describe('Acceptance Criteria Tests', () => {
    // AC1: Decrease from 60 sts to 40 sts (20 sts total dec) over 60 rows, 
    // decreasing 2 sts per dec row: Needs 10 dec rows. 
    // Calculation should be "Decrease every 6th row, 10 times."
    it('AC1: should calculate decrease from 60 to 40 stitches over 60 rows', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 60,
        targetStitchCount: 40,
        totalRowsForShaping: 60,
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.hasShaping).toBe(true);
      expect(result.schedule?.shapingEvents).toHaveLength(1);
      
      const shapingEvent = result.schedule!.shapingEvents[0];
      expect(shapingEvent.type).toBe('decrease');
      expect(shapingEvent.totalStitchesToChange).toBe(20);
      expect(shapingEvent.stitchesPerEvent).toBe(2);
      expect(shapingEvent.numShapingEvents).toBe(10);
      expect(shapingEvent.instructionsTextSimple).toBe('Decrease 2 stitches every 6th row, 10 times.');
    });

    // AC2: Increase from 30 sts to 50 sts (20 sts total inc) over 55 rows, 
    // increasing 2 sts per inc row: Needs 10 inc rows. 
    // Calculation should be "Increase every 5th row 5 times, then every 6th row 5 times"
    it('AC2: should calculate increase from 30 to 50 stitches over 55 rows with mixed intervals', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 50,
        totalRowsForShaping: 55,
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.hasShaping).toBe(true);
      expect(result.schedule?.shapingEvents).toHaveLength(1);
      
      const shapingEvent = result.schedule!.shapingEvents[0];
      expect(shapingEvent.type).toBe('increase');
      expect(shapingEvent.totalStitchesToChange).toBe(20);
      expect(shapingEvent.stitchesPerEvent).toBe(2);
      expect(shapingEvent.numShapingEvents).toBe(10);
      
      // Should have mixed intervals: 5 events with 6-row intervals, 5 events with 5-row intervals
      expect(shapingEvent.instructionsTextSimple).toBe('Increase 2 stitches every 5th row 5 times, then every 6th row 5 times.');
    });

    // AC3: The output data structure correctly describes the shaping schedule
    it('AC3: should output correct data structure for shaping schedule', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 40,
        targetStitchCount: 50,
        totalRowsForShaping: 30,
        stitchesPerShapingEvent: 1,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      
      // Check schedule structure
      expect(schedule).toHaveProperty('shapingEvents');
      expect(schedule).toHaveProperty('hasShaping');
      expect(schedule).toHaveProperty('totalShapingRows');
      expect(schedule).toHaveProperty('metadata');
      
      // Check shaping event structure
      const event = schedule.shapingEvents[0];
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('totalStitchesToChange');
      expect(event).toHaveProperty('stitchesPerEvent');
      expect(event).toHaveProperty('numShapingEvents');
      expect(event).toHaveProperty('instructionsTextSimple');
      expect(event).toHaveProperty('detailedBreakdown');
      
      // Check detailed breakdown structure
      expect(Array.isArray(event.detailedBreakdown)).toBe(true);
      if (event.detailedBreakdown.length > 0) {
        const detail = event.detailedBreakdown[0];
        expect(detail).toHaveProperty('actionRowOffset');
        expect(detail).toHaveProperty('instruction');
      }
    });

    // AC4: Handles cases with no shaping required
    it('AC4: should handle cases with no shaping required', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 45,
        targetStitchCount: 45, // Same as starting count
        totalRowsForShaping: 50,
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.hasShaping).toBe(false);
      expect(result.schedule?.shapingEvents).toHaveLength(0);
      expect(result.schedule?.totalShapingRows).toBe(0);
      expect(result.schedule?.metadata?.algorithm).toBe('no-shaping');
    });
  });

  describe('Detailed Breakdown Generation', () => {
    it('should generate detailed breakdown with correct row offsets', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 40,
        targetStitchCount: 46, // 6 stitch increase
        totalRowsForShaping: 18, // 18 rows total
        stitchesPerShapingEvent: 2, // 2 stitches per event = 3 events needed
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      
      const event = result.schedule!.shapingEvents[0];
      expect(event.numShapingEvents).toBe(3);
      expect(event.detailedBreakdown.length).toBeGreaterThan(0);
      
      // Verify the breakdown contains proper instructions
      const breakdown = event.detailedBreakdown;
      const hasPlainRows = breakdown.some(detail => detail.instruction.includes('plain'));
      const hasShapingRows = breakdown.some(detail => detail.instruction.includes('Increase Row'));
      
      expect(hasPlainRows || hasShapingRows).toBe(true);
    });

    it('should generate correct shaping instructions for different stitch counts', () => {
      // Test 1 stitch per event
      const input1: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 35,
        totalRowsForShaping: 25,
        stitchesPerShapingEvent: 1,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result1 = calculateShaping(input1);
      expect(result1.success).toBe(true);
      
      const breakdown1 = result1.schedule!.shapingEvents[0].detailedBreakdown;
      const shapingInstruction1 = breakdown1.find(detail => detail.instruction.includes('Increase Row'));
      expect(shapingInstruction1?.instruction).toContain('Inc 1 st at beg of row');

      // Test 2 stitches per event
      const input2: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 36,
        totalRowsForShaping: 18,
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result2 = calculateShaping(input2);
      expect(result2.success).toBe(true);
      
      const breakdown2 = result2.schedule!.shapingEvents[0].detailedBreakdown;
      const shapingInstruction2 = breakdown2.find(detail => detail.instruction.includes('Increase Row'));
      expect(shapingInstruction2?.instruction).toContain('Inc 1 st at beg of row, work to last st, inc 1 st');
    });
  });

  describe('Distribution Algorithm', () => {
    it('should distribute shaping evenly when possible', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 40, // 10 stitch increase
        totalRowsForShaping: 50, // 50 rows total
        stitchesPerShapingEvent: 2, // 5 events needed
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      
      const event = result.schedule!.shapingEvents[0];
      expect(event.numShapingEvents).toBe(5);
      // 50 rows / 5 events = 10 rows interval
      expect(event.instructionsTextSimple).toBe('Increase 2 stitches every 10th row, 5 times.');
    });

    it('should handle uneven distribution correctly', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 30,
        targetStitchCount: 38, // 8 stitch increase
        totalRowsForShaping: 25, // 25 rows total
        stitchesPerShapingEvent: 2, // 4 events needed
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      
      const event = result.schedule!.shapingEvents[0];
      expect(event.numShapingEvents).toBe(4);
      // 25 rows / 4 events = base 6, remainder 1
      // So 3 events with 6-row intervals, 1 event with 7-row interval
      expect(event.instructionsTextSimple).toContain('every 6th row');
      expect(event.instructionsTextSimple).toContain('every 7th row');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small shaping requirements', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 20,
        targetStitchCount: 22, // Only 2 stitch increase
        totalRowsForShaping: 10,
        stitchesPerShapingEvent: 2, // 1 event needed
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.shapingEvents[0].numShapingEvents).toBe(1);
    });

    it('should handle large shaping requirements', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 50,
        targetStitchCount: 100, // 50 stitch increase
        totalRowsForShaping: 200,
        stitchesPerShapingEvent: 2, // 25 events needed
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.shapingEvents[0].numShapingEvents).toBe(25);
      expect(result.schedule?.shapingEvents[0].totalStitchesToChange).toBe(50);
    });

    it('should generate warnings for unusual values', () => {
      const input: ShapingCalculationInput = {
        startingStitchCount: 20,
        targetStitchCount: 50, // Very large change relative to starting count
        totalRowsForShaping: 600, // Very large number of rows
        stitchesPerShapingEvent: 2,
        rowsPerUnit: 10,
        unit: 'cm'
      };

      const result = calculateShaping(input);

      expect(result.success).toBe(true);
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });
}); 