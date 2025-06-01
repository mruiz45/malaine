/**
 * Tests for Armhole Shaping Calculator (US_11.3)
 * Validates complex armhole shaping calculations for rounded set-in and raglan styles
 */

import { calculateArmholeShaping } from '../armhole-shaping-calculator';
import { ArmholeShapingInput } from '@/types/armhole-shaping';
import { CalculationGaugeData } from '@/types/pattern-calculation';

// Standard gauge for testing (similar to neckline tests)
const standardGauge: CalculationGaugeData = {
  stitchesPer10cm: 20,  // 2 stitches per cm
  rowsPer10cm: 28,      // 2.8 rows per cm  
  unit: 'cm',
  profileName: 'Test Gauge'
};

describe('Armhole Shaping Calculator', () => {
  
  describe('Input Validation', () => {
    it('should validate required input parameters', () => {
      const invalidInput: Partial<ArmholeShapingInput> = {
        // Missing required fields
      };

      const result = calculateArmholeShaping(invalidInput as ArmholeShapingInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should validate armhole type', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: {
          depth_cm: 22,
          width_cm: 12
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.type).toBe('rounded_set_in');
    });

    it('should warn about very deep armholes', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: {
          depth_cm: 40, // Very deep
          width_cm: 12
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Very deep armhole - please verify measurements');
    });

    it('should warn about very wide armholes', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: {
          depth_cm: 22,
          width_cm: 30 // Very wide
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Very wide armhole - please verify measurements');
    });
  });

  describe('Acceptance Criteria - US_11.3', () => {
    
    // AC1: For a rounded armhole requesting 22cm depth, with 3 stitches bound off at base,
    // the system calculates a sequence of progressive decreases for the rest of the curve on the body panel.
    it('AC1: should calculate rounded armhole shaping correctly', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 22,
          width_cm: 12,
          construction_details: {
            base_bind_off_preference: 'standard'
          }
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12, // 12cm per shoulder
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      expect(schedule.type).toBe('rounded_set_in');
      
      // Should have base bind-off (around 25% of 12cm width = 3cm = 6 stitches at gauge 2st/cm)
      expect(schedule.base_bind_off_stitches).toBeGreaterThan(0);
      expect(schedule.base_bind_off_stitches).toBeLessThanOrEqual(6);
      
      // Should have shaping details with decreases
      expect(schedule.shaping_details.length).toBeGreaterThan(0);
      
      // Check for progressive decreases
      const decreaseActions = schedule.shaping_details.filter(action => action.action === 'decrease');
      expect(decreaseActions.length).toBeGreaterThan(0);
      
      // Should have different decrease intervals (rapid and gradual)
      const intervals = decreaseActions.map(action => action.every_x_rows || 1);
      const hasVariedIntervals = new Set(intervals).size > 1;
      expect(hasVariedIntervals).toBe(true);
      
      // Check total rows for shaping corresponds to armhole depth
      // 22cm depth * 28 rows/10cm = ~62 rows
      expect(schedule.total_rows_for_shaping).toBeGreaterThanOrEqual(60);
      expect(schedule.total_rows_for_shaping).toBeLessThanOrEqual(65);
    });

    // AC2: For a raglan line of 25cm long that must reduce the body stitch width by 15 stitches each side,
    // the system calculates an appropriate decrease frequency (e.g., decrease 1st every X rows).
    it('AC2: should calculate raglan armhole shaping correctly', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'raglan',
        armholeParameters: { 
          depth_cm: 25,
          width_cm: 15, // 15 stitches each side to remove at 2st/cm = 7.5cm width each side
          raglan_line_length_cm: 25
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10, // 10cm per shoulder
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      expect(schedule.type).toBe('raglan');
      
      // Raglan should have small base bind-off for underarm ease
      expect(schedule.base_bind_off_stitches).toBeGreaterThanOrEqual(3);
      expect(schedule.base_bind_off_stitches).toBeLessThanOrEqual(6);
      
      // Should have raglan decrease actions
      const raglanActions = schedule.shaping_details.filter(action => action.action === 'decrease');
      expect(raglanActions.length).toBeGreaterThan(0);
      
      // Check for regular decrease frequency
      const mainRaglanAction = raglanActions[raglanActions.length - 1]; // Last action should be main raglan decreases
      expect(mainRaglanAction.every_x_rows).toBeGreaterThanOrEqual(2);
      expect(mainRaglanAction.every_x_rows).toBeLessThanOrEqual(4);
      expect(mainRaglanAction.repeats).toBeGreaterThan(1);
      
      // Check total rows for shaping corresponds to raglan line length
      // 25cm raglan line * 28 rows/10cm = 70 rows
      expect(schedule.total_rows_for_shaping).toBeGreaterThanOrEqual(68);
      expect(schedule.total_rows_for_shaping).toBeLessThanOrEqual(72);
    });

    // AC3: The output data structure (armhole_shaping_schedule) is correctly formatted.
    it('AC3: should produce correctly formatted output data structure', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 22,
          width_cm: 12
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      
      // Verify required fields
      expect(schedule.type).toBeDefined();
      expect(typeof schedule.base_bind_off_stitches).toBe('number');
      expect(Array.isArray(schedule.shaping_details)).toBe(true);
      expect(typeof schedule.total_rows_for_shaping).toBe('number');
      expect(typeof schedule.final_stitches_at_shoulder_edge).toBe('number');
      
      // Verify shaping details structure
      schedule.shaping_details.forEach(action => {
        expect(action.action).toMatch(/^(bind_off|decrease)$/);
        expect(typeof action.stitches).toBe('number');
        expect(typeof action.on_row_from_start_of_shaping).toBe('number');
        expect(action.side_of_fabric).toMatch(/^(RS|WS|both)$/);
        
        if (action.repeats !== undefined) {
          expect(typeof action.repeats).toBe('number');
        }
        if (action.every_x_rows !== undefined) {
          expect(typeof action.every_x_rows).toBe('number');
        }
      });
      
      // Verify metadata if present
      if (result.metadata) {
        expect(result.metadata.algorithm).toBeDefined();
        expect(result.metadata.calculatedAt).toBeDefined();
        expect(result.metadata.inputSummary).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle shallow armholes', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 15, // Shallow
          width_cm: 10
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      // Shallow armholes should have more aggressive shaping
      const decreaseActions = result.schedule!.shaping_details.filter(action => action.action === 'decrease');
      const hasFrequentDecreases = decreaseActions.some(action => 
        action.every_x_rows && action.every_x_rows <= 2
      );
      expect(hasFrequentDecreases).toBe(true);
    });

    it('should handle deep armholes', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 30, // Deep
          width_cm: 15
        },
        totalPanelWidthStitches: 120,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      // Deep armholes should have more gradual shaping
      const decreaseActions = result.schedule!.shaping_details.filter(action => action.action === 'decrease');
      const hasGradualDecreases = decreaseActions.some(action => 
        action.every_x_rows && action.every_x_rows >= 4
      );
      expect(hasGradualDecreases).toBe(true);
    });

    it('should handle raglan without explicit raglan line length', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'raglan',
        armholeParameters: { 
          depth_cm: 25,
          width_cm: 15
          // No explicit raglan_line_length_cm - should default to depth_cm
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      expect(result.schedule!.type).toBe('raglan');
    });

    it('should handle invalid armhole type', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'invalid_type' as any,
        armholeParameters: { 
          depth_cm: 22,
          width_cm: 12
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported armhole type');
    });
  });

  describe('Mathematical Accuracy', () => {
    it('should calculate stitch and row conversions accurately', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 20,
          width_cm: 10
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      
      // 20cm depth * 2.8 rows/cm = 56 rows
      expect(result.schedule!.total_rows_for_shaping).toBeCloseTo(56, 2);
      
      // 10cm shoulder * 2 st/cm = 20 stitches
      expect(result.schedule!.final_stitches_at_shoulder_edge).toBeCloseTo(20, 2);
    });

    it('should maintain stitch count consistency', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'rounded_set_in',
        armholeParameters: { 
          depth_cm: 22,
          width_cm: 12
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      
      const schedule = result.schedule!;
      
      // Calculate total stitches removed
      const totalStitchesRemoved = schedule.base_bind_off_stitches + 
        schedule.shaping_details.reduce((total, action) => {
          if (action.action === 'decrease') {
            return total + (action.stitches * (action.repeats || 1));
          }
          return total;
        }, 0);
      
      // Should be reasonable proportion of armhole width
      const expectedArmholeStitches = Math.round(12 * (standardGauge.stitchesPer10cm / 10)); // 24 stitches
      expect(totalStitchesRemoved).toBeGreaterThan(0);
      expect(totalStitchesRemoved).toBeLessThanOrEqual(expectedArmholeStitches + 5); // Allow some tolerance
    });
  });

  describe('Raglan-specific Tests', () => {
    it('should validate raglan line length', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'raglan',
        armholeParameters: { 
          depth_cm: 25,
          width_cm: 15,
          raglan_line_length_cm: 20 // Shorter than depth
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('Raglan line length should typically be at least equal to armhole depth');
    });

    it('should calculate raglan decrease frequency correctly', () => {
      const input: ArmholeShapingInput = {
        armholeType: 'raglan',
        armholeParameters: { 
          depth_cm: 20,
          width_cm: 12,
          raglan_line_length_cm: 20
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateArmholeShaping(input);

      expect(result.success).toBe(true);
      
      const raglanActions = result.schedule!.shaping_details.filter(action => action.action === 'decrease');
      expect(raglanActions.length).toBeGreaterThan(0);
      
      // Should have reasonable decrease frequency (every 2-4 rows is typical)
      const mainAction = raglanActions[raglanActions.length - 1];
      expect(mainAction.every_x_rows).toBeGreaterThanOrEqual(2);
      expect(mainAction.every_x_rows).toBeLessThanOrEqual(4);
    });
  });
}); 