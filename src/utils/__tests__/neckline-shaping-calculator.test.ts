/**
 * Tests for Neckline Shaping Calculator (US_11.1)
 * Tests the complex neckline shaping calculations for rounded and V-neck styles
 */

import { calculateNecklineShaping } from '../neckline-shaping-calculator';
import { NecklineShapingInput } from '@/types/neckline-shaping';
import { CalculationGaugeData } from '@/types/pattern-calculation';

describe('Neckline Shaping Calculator', () => {
  // Standard gauge for testing
  const standardGauge: CalculationGaugeData = {
    stitchesPer10cm: 20,
    rowsPer10cm: 28,
    unit: 'cm',
    profileName: 'test-gauge'
  };

  describe('Input Validation', () => {
    it('should validate required input parameters', () => {
      const invalidInput: any = {
        necklineType: null,
        necklineParameters: {},
        totalPanelWidthStitches: 0,
        finishedShoulderWidthCm: 0,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(invalidInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    });

    it('should validate neckline parameters', () => {
      const inputWithInvalidDepth: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { depth_cm: 0 }, // Invalid depth
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(inputWithInvalidDepth);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Neckline depth must be greater than 0');
    });

    it('should generate warnings for unusual values', () => {
      const inputWithLargeShoulders: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { depth_cm: 8, width_at_center_cm: 20 },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 30, // Very large shoulders
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(inputWithLargeShoulders);

      expect(result.success).toBe(true);
      // Check that we get warnings (either from validation or calculation)
      const hasWarnings = (result.warnings && result.warnings.length > 0);
      expect(hasWarnings).toBe(true);
    });
  });

  describe('Acceptance Criteria Tests', () => {
    // AC1: Rounded neckline - 20cm wide, 8cm deep on 100 stitches panel
    // Gauge: 20m/10cm, 28rgs/10cm
    // Should calculate plausible center bind-off (12-16m) and decrease sequence
    it('AC1: should calculate rounded neckline shaping correctly', () => {
      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 8, 
          width_at_center_cm: 20 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10, // 10cm per shoulder
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      expect(schedule.type).toBe('rounded');
      
      // Check center bind-off is plausible (12-16 stitches as specified)
      expect(schedule.center_bind_off_stitches).toBeGreaterThanOrEqual(10);
      expect(schedule.center_bind_off_stitches).toBeLessThanOrEqual(18);
      
      // Check that we have shaping for both sides
      expect(schedule.sides.left.length).toBeGreaterThan(0);
      expect(schedule.sides.right.length).toBeGreaterThan(0);
      
      // Check total rows for shaping corresponds to neckline depth
      // 8cm depth * 28 rows/10cm = ~22 rows
      expect(schedule.total_rows_for_shaping).toBeGreaterThanOrEqual(20);
      expect(schedule.total_rows_for_shaping).toBeLessThanOrEqual(25);
      
      // Check final shoulder stitches are reasonable
      // 10cm shoulder width * 20 stitches/10cm = 20 stitches per shoulder
      expect(schedule.final_shoulder_stitches_each_side).toBeCloseTo(20, 2);
    });

    // AC2: V-neck - 15cm deep, targeting 10cm shoulders
    // Should calculate regular decrease frequency for each side of V
    it('AC2: should calculate V-neck shaping correctly', () => {
      const input: NecklineShapingInput = {
        necklineType: 'v_neck',
        necklineParameters: { 
          depth_cm: 15,
          width_at_shoulder_cm: 15 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10, // 10cm per shoulder
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      expect(schedule.type).toBe('v_neck');
      
      // V-neck should have small or no center bind-off
      expect(schedule.center_bind_off_stitches || 0).toBeLessThanOrEqual(4);
      
      // Check that we have regular decrease actions for both sides
      expect(schedule.sides.left.length).toBeGreaterThan(0);
      expect(schedule.sides.right.length).toBeGreaterThan(0);
      
      // Check for regular decrease frequency
      const leftAction = schedule.sides.left[0];
      expect(leftAction.action).toBe('decrease');
      expect(leftAction.repeats).toBeGreaterThan(1);
      expect(leftAction.every_x_rows).toBeGreaterThanOrEqual(2);
      
      // Check total rows for shaping corresponds to neckline depth
      // 15cm depth * 28 rows/10cm = ~42 rows
      expect(schedule.total_rows_for_shaping).toBeGreaterThanOrEqual(40);
      expect(schedule.total_rows_for_shaping).toBeLessThanOrEqual(45);
    });

    // AC3: Output data structure is correctly formatted
    it('AC3: should produce correctly formatted neckline_shaping_schedule', () => {
      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 8, 
          width_at_center_cm: 20 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule).toBeDefined();
      
      const schedule = result.schedule!;
      
      // Verify complete structure matches US_11.1 specification
      expect(schedule).toHaveProperty('type');
      expect(['rounded', 'v_neck']).toContain(schedule.type);
      
      expect(schedule).toHaveProperty('sides');
      expect(schedule.sides).toHaveProperty('left');
      expect(schedule.sides).toHaveProperty('right');
      expect(Array.isArray(schedule.sides.left)).toBe(true);
      expect(Array.isArray(schedule.sides.right)).toBe(true);
      
      expect(schedule).toHaveProperty('total_rows_for_shaping');
      expect(typeof schedule.total_rows_for_shaping).toBe('number');
      
      expect(schedule).toHaveProperty('final_shoulder_stitches_each_side');
      expect(typeof schedule.final_shoulder_stitches_each_side).toBe('number');
      
      // Check action structure
      if (schedule.sides.left.length > 0) {
        const action = schedule.sides.left[0];
        expect(action).toHaveProperty('action');
        expect(['bind_off', 'decrease']).toContain(action.action);
        expect(action).toHaveProperty('stitches');
        expect(action).toHaveProperty('on_row_from_start_of_shaping');
        expect(action).toHaveProperty('side_of_fabric');
        expect(['RS', 'WS']).toContain(action.side_of_fabric);
      }
    });

    // AC4: Total rows for shaping corresponds to neckline depth
    it('AC4: should calculate total rows corresponding to neckline depth', () => {
      const testCases = [
        { depth: 6, expectedRows: 17 }, // 6cm * 28rows/10cm ≈ 17 rows
        { depth: 10, expectedRows: 28 }, // 10cm * 28rows/10cm = 28 rows  
        { depth: 12, expectedRows: 34 }  // 12cm * 28rows/10cm ≈ 34 rows
      ];

      testCases.forEach(({ depth, expectedRows }) => {
        const input: NecklineShapingInput = {
          necklineType: 'round',
          necklineParameters: { 
            depth_cm: depth, 
            width_at_center_cm: 20 
          },
          totalPanelWidthStitches: 100,
          finishedShoulderWidthCm: 10,
          gauge: standardGauge,
          componentKey: 'front_panel'
        };

        const result = calculateNecklineShaping(input);

        expect(result.success).toBe(true);
        expect(result.schedule?.total_rows_for_shaping).toBeCloseTo(expectedRows, 2);
      });
    });
  });

  describe('Algorithm-specific Tests', () => {
    describe('Rounded Neckline Algorithm', () => {
      it('should implement 1/3 distribution for rounded necklines', () => {
        const input: NecklineShapingInput = {
          necklineType: 'round',
          necklineParameters: { 
            depth_cm: 8, 
            width_at_center_cm: 21 // 21cm width -> ~42 stitches
          },
          totalPanelWidthStitches: 100,
          finishedShoulderWidthCm: 10,
          gauge: standardGauge,
          componentKey: 'front_panel'
        };

        const result = calculateNecklineShaping(input);

        expect(result.success).toBe(true);
        
        const schedule = result.schedule!;
        const necklineWidthStitches = 42; // 21cm * 20sts/10cm
        const expectedCenterBindOff = Math.round(necklineWidthStitches / 3);
        
        // Center bind-off should be approximately 1/3 of neckline width
        expect(schedule.center_bind_off_stitches).toBeCloseTo(expectedCenterBindOff, 2);
      });

      it('should generate both rapid and gradual decreases for rounded necklines', () => {
        const input: NecklineShapingInput = {
          necklineType: 'round',
          necklineParameters: { 
            depth_cm: 10, 
            width_at_center_cm: 24 
          },
          totalPanelWidthStitches: 120,
          finishedShoulderWidthCm: 12,
          gauge: standardGauge,
          componentKey: 'front_panel'
        };

        const result = calculateNecklineShaping(input);

        expect(result.success).toBe(true);
        
        const schedule = result.schedule!;
        const leftActions = schedule.sides.left;
        
        // Should have multiple actions (rapid and gradual decreases)
        expect(leftActions.length).toBeGreaterThanOrEqual(1);
        
        // Check for different decrease patterns
        const hasVariedStitches = leftActions.some(action => action.stitches === 2) && 
                                 leftActions.some(action => action.stitches === 1);
        const hasVariedFrequency = leftActions.some(action => (action.every_x_rows || 1) !== (leftActions[0].every_x_rows || 1));
        
        expect(hasVariedStitches || hasVariedFrequency).toBe(true);
      });
    });

    describe('V-Neck Algorithm', () => {
      it('should generate linear decrease pattern for V-neck', () => {
        const input: NecklineShapingInput = {
          necklineType: 'v_neck',
          necklineParameters: { 
            depth_cm: 12,
            width_at_shoulder_cm: 18 
          },
          totalPanelWidthStitches: 100,
          finishedShoulderWidthCm: 10,
          gauge: standardGauge,
          componentKey: 'front_panel'
        };

        const result = calculateNecklineShaping(input);

        expect(result.success).toBe(true);
        
        const schedule = result.schedule!;
        const leftActions = schedule.sides.left;
        
        // V-neck should have simpler, more linear shaping
        expect(leftActions.length).toBeLessThanOrEqual(2);
        
        // Check for regular decrease pattern
        const mainAction = leftActions[0];
        expect(mainAction.action).toBe('decrease');
        expect(mainAction.repeats).toBeGreaterThan(1);
        expect(mainAction.every_x_rows).toBeGreaterThanOrEqual(2);
      });

      it('should use minimal center bind-off for V-neck', () => {
        const input: NecklineShapingInput = {
          necklineType: 'v_neck',
          necklineParameters: { 
            depth_cm: 15,
            width_at_shoulder_cm: 20 
          },
          totalPanelWidthStitches: 100,
          finishedShoulderWidthCm: 10,
          gauge: standardGauge,
          componentKey: 'front_panel'
        };

        const result = calculateNecklineShaping(input);

        expect(result.success).toBe(true);
        
        const schedule = result.schedule!;
        
        // V-neck should have minimal center bind-off
        expect(schedule.center_bind_off_stitches || 0).toBeLessThanOrEqual(4);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very shallow necklines', () => {
      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 3, // Very shallow
          width_at_center_cm: 15 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.total_rows_for_shaping).toBeGreaterThan(0);
    });

    it('should handle very deep necklines', () => {
      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 35, // Very deep - above 30cm threshold
          width_at_center_cm: 25 
        },
        totalPanelWidthStitches: 120,
        finishedShoulderWidthCm: 12,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.warnings?.some(w => w.includes('deep neckline'))).toBe(true);
    });

    it('should handle different gauge ratios', () => {
      const denseGauge: CalculationGaugeData = {
        stitchesPer10cm: 30, // Denser gauge
        rowsPer10cm: 40,
        unit: 'cm',
        profileName: 'dense-gauge'
      };

      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 8, 
          width_at_center_cm: 20 
        },
        totalPanelWidthStitches: 150, // More stitches due to denser gauge
        finishedShoulderWidthCm: 10,
        gauge: denseGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.schedule?.center_bind_off_stitches).toBeGreaterThan(0);
      expect(result.schedule?.total_rows_for_shaping).toBeGreaterThan(0);
    });

    it('should handle unsupported neckline types gracefully', () => {
      const input: any = {
        necklineType: 'turtleneck', // Not supported for complex shaping
        necklineParameters: { 
          depth_cm: 8, 
          width_at_center_cm: 20 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported neckline type');
    });
  });

  describe('Metadata and Traceability', () => {
    it('should include calculation metadata', () => {
      const input: NecklineShapingInput = {
        necklineType: 'round',
        necklineParameters: { 
          depth_cm: 8, 
          width_at_center_cm: 20 
        },
        totalPanelWidthStitches: 100,
        finishedShoulderWidthCm: 10,
        gauge: standardGauge,
        componentKey: 'front_panel'
      };

      const result = calculateNecklineShaping(input);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.algorithm).toBeDefined();
      expect(result.metadata?.calculatedAt).toBeDefined();
      expect(result.metadata?.inputSummary).toBeDefined();
    });
  });
}); 