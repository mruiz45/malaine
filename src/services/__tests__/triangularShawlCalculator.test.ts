/**
 * Triangular Shawl Calculator Tests (US_12.5)
 * Tests for the triangular shawl calculation engine
 */

import { calculateTriangularShawl } from '@/utils/triangular-shawl-calculator';
import {
  TriangularShawlCalculationInput,
  TriangularShawlCalculations,
  TriangularShawlConstructionMethod
} from '@/types/triangular-shawl';
import {
  componentRequiresTriangularShawlCalculation,
  extractTriangularShawlInputFromComponent,
  validateTriangularShawlComponent,
  createDefaultTriangularShawlComponent,
  estimateTriangularShawlComplexity
} from '@/utils/triangular-shawl-helpers';

describe('TriangularShawlCalculator', () => {
  // Common test data
  const standardGauge = {
    stitches_per_10cm: 20,
    rows_per_10cm: 28
  };

  const standardDimensions = {
    wingspan: 150, // cm
    depth: 75      // cm
  };

  describe('calculateTriangularShawl', () => {
    
    // AC1: Top-down center-out calculation test
    describe('top-down center-out construction', () => {
      it('should calculate correct stitch count and row count for standard dimensions', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: standardDimensions.wingspan,
          target_depth_cm: standardDimensions.depth,
          gauge_stitches_per_10cm: standardGauge.stitches_per_10cm,
          gauge_rows_per_10cm: standardGauge.rows_per_10cm,
          construction_method: 'top_down_center_out',
          work_style: 'flat'
        };

        const result = calculateTriangularShawl(input);

        expect(result.construction_method).toBe('top_down_center_out');
        expect(result.setup.cast_on_stitches).toBe(3);
        expect(result.final_stitch_count).toBeGreaterThan(result.setup.cast_on_stitches);
        expect(result.total_rows_knit).toBeGreaterThan(0);
        
        // Should have phase 1 increases
        expect(result.shaping_schedule.phase_1_increases).toBeDefined();
        expect(result.shaping_schedule.phase_1_increases!.stitches_per_event).toBe(4);
        expect(result.shaping_schedule.phase_1_increases!.shaping_frequency).toBe(2);
        
        // Should not have phase 2 decreases for top-down
        expect(result.shaping_schedule.phase_2_decreases).toBeUndefined();
      });

      it('should calculate approximately correct dimensions for 150cm x 75cm shawl', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 150,
          target_depth_cm: 75,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out'
        };

        const result = calculateTriangularShawl(input);

        // Check actual dimensions are within reasonable range (±15% for wingspan, ±10% for depth)
        expect(result.calculated_dimensions.actual_wingspan_cm).toBeGreaterThan(150 * 0.85);
        expect(result.calculated_dimensions.actual_wingspan_cm).toBeLessThan(150 * 1.15);
        expect(result.calculated_dimensions.actual_depth_cm).toBeGreaterThan(75 * 0.9);
        expect(result.calculated_dimensions.actual_depth_cm).toBeLessThan(75 * 1.1);
      });

      it('should provide setup notes for top-down construction', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 100,
          target_depth_cm: 50,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out'
        };

        const result = calculateTriangularShawl(input);

        expect(result.setup.setup_notes).toContain('Cast on 3 stitches');
        expect(result.setup.setup_notes).toContain('markers');
      });
    });

    // AC2: Side-to-side calculation test  
    describe('side-to-side construction', () => {
      it('should calculate increases and decreases phases correctly', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: standardDimensions.wingspan,
          target_depth_cm: standardDimensions.depth,
          gauge_stitches_per_10cm: standardGauge.stitches_per_10cm,
          gauge_rows_per_10cm: standardGauge.rows_per_10cm,
          construction_method: 'side_to_side',
          work_style: 'flat'
        };

        const result = calculateTriangularShawl(input);

        expect(result.construction_method).toBe('side_to_side');
        expect(result.setup.cast_on_stitches).toBe(4);
        
        // Should have both phases for side-to-side
        expect(result.shaping_schedule.phase_1_increases).toBeDefined();
        expect(result.shaping_schedule.phase_2_decreases).toBeDefined();
        
        // Both phases should have same number of events for symmetry
        expect(result.shaping_schedule.phase_1_increases!.total_shaping_rows)
          .toBe(result.shaping_schedule.phase_2_decreases!.total_shaping_rows);
          
        // Should return to starting stitch count
        expect(result.final_stitch_count).toBe(result.setup.cast_on_stitches);
      });

      it('should calculate correct phase descriptions', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 120,
          target_depth_cm: 60,
          gauge_stitches_per_10cm: 18,
          gauge_rows_per_10cm: 24,
          construction_method: 'side_to_side'
        };

        const result = calculateTriangularShawl(input);

        expect(result.shaping_schedule.phase_1_increases!.description)
          .toContain('Increase 1 stitch on one edge');
        expect(result.shaping_schedule.phase_2_decreases!.description)
          .toContain('Decrease 1 stitch on same edge');
      });
    });

    // AC3: Bottom-up calculation test
    describe('bottom-up construction', () => {
      it('should calculate high initial cast-on and decrease frequency', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: standardDimensions.wingspan,
          target_depth_cm: standardDimensions.depth,
          gauge_stitches_per_10cm: standardGauge.stitches_per_10cm,
          gauge_rows_per_10cm: standardGauge.rows_per_10cm,
          construction_method: 'bottom_up',
          work_style: 'flat'
        };

        const result = calculateTriangularShawl(input);

        expect(result.construction_method).toBe('bottom_up');
        
        // Should have high initial cast-on for full wingspan
        expect(result.setup.cast_on_stitches).toBeGreaterThan(250); // Approx 150cm * 2 sts/cm
        
        // Should only have phase 2 decreases for bottom-up
        expect(result.shaping_schedule.phase_1_increases).toBeUndefined();
        expect(result.shaping_schedule.phase_2_decreases).toBeDefined();
        expect(result.shaping_schedule.phase_2_decreases!.stitches_per_event).toBe(2);
        
        // Should end with small number of stitches
        expect(result.final_stitch_count).toBe(3);
      });

      it('should calculate wingspan accurately for bottom-up', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 120,
          target_depth_cm: 50,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 26,
          construction_method: 'bottom_up'
        };

        const result = calculateTriangularShawl(input);

        // Wingspan should be very accurate for bottom-up (within 5%)
        expect(result.calculated_dimensions.actual_wingspan_cm).toBeGreaterThan(120 * 0.95);
        expect(result.calculated_dimensions.actual_wingspan_cm).toBeLessThan(120 * 1.05);
      });
    });

    // Input validation tests
    describe('input validation', () => {
      it('should throw error for invalid wingspan', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 0,
          target_depth_cm: 75,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out'
        };

        expect(() => calculateTriangularShawl(input)).toThrow('Target wingspan must be greater than 0');
      });

      it('should throw error for invalid depth', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 150,
          target_depth_cm: -10,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out'
        };

        expect(() => calculateTriangularShawl(input)).toThrow('Target depth must be greater than 0');
      });

      it('should throw error for invalid gauge', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 150,
          target_depth_cm: 75,
          gauge_stitches_per_10cm: 0,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out'
        };

        expect(() => calculateTriangularShawl(input)).toThrow('Gauge stitches per 10cm must be greater than 0');
      });
    });

    // Border stitches handling
    describe('border stitches', () => {
      it('should handle border stitches in calculation', () => {
        const input: TriangularShawlCalculationInput = {
          target_wingspan_cm: 100,
          target_depth_cm: 50,
          gauge_stitches_per_10cm: 20,
          gauge_rows_per_10cm: 28,
          construction_method: 'top_down_center_out',
          border_stitches_each_side: 5
        };

        const result = calculateTriangularShawl(input);

        expect(result.inputs.border_stitches_each_side).toBe(5);
      });
    });
  });

  describe('Helper Functions', () => {
    
    describe('componentRequiresTriangularShawlCalculation', () => {
      it('should return true for triangular shawl components', () => {
        const component = createDefaultTriangularShawlComponent(150, 75);
        
        expect(componentRequiresTriangularShawlCalculation(component)).toBe(true);
      });

      it('should return false for non-triangular shawl components', () => {
        const component = {
          componentKey: 'sleeve',
          displayName: 'Sleeve',
          attributes: {
            type: 'sleeve',
            targetWidth: 30,
            targetLength: 60
          }
        };
        
        expect(componentRequiresTriangularShawlCalculation(component)).toBe(false);
      });
    });

    describe('validateTriangularShawlComponent', () => {
      it('should return no errors for valid component', () => {
        const component = createDefaultTriangularShawlComponent(150, 75);
        
        const errors = validateTriangularShawlComponent(component);
        
        expect(errors).toHaveLength(0);
      });

      it('should return errors for invalid wingspan', () => {
        const component = createDefaultTriangularShawlComponent(-10, 75);
        
        const errors = validateTriangularShawlComponent(component);
        
        expect(errors).toContain('target_wingspan_cm must be a positive number');
      });

      it('should return errors for missing construction method', () => {
        const component = {
          componentKey: 'triangular_shawl_body',
          displayName: 'Triangular Shawl',
          attributes: {
            type: 'triangular_shawl',
            target_wingspan_cm: 150,
            target_depth_cm: 75,
            work_style: 'flat'
            // missing construction_method
          }
        };
        
        const errors = validateTriangularShawlComponent(component);
        
        expect(errors).toContain('construction_method is required');
      });
    });

    describe('estimateTriangularShawlComplexity', () => {
      it('should estimate low complexity for small shawl', () => {
        const attributes = {
          type: 'triangular_shawl' as const,
          target_wingspan_cm: 80,
          target_depth_cm: 40,
          construction_method: 'top_down_center_out' as TriangularShawlConstructionMethod,
          work_style: 'flat' as const
        };
        
        const estimation = estimateTriangularShawlComplexity(attributes);
        
        expect(estimation.complexity).toBe('low');
        expect(estimation.estimatedStitches).toBeGreaterThan(0);
      });

      it('should estimate high complexity for large shawl', () => {
        const attributes = {
          type: 'triangular_shawl' as const,
          target_wingspan_cm: 220,
          target_depth_cm: 110,
          construction_method: 'bottom_up' as TriangularShawlConstructionMethod,
          work_style: 'flat' as const
        };
        
        const estimation = estimateTriangularShawlComplexity(attributes);
        
        expect(estimation.complexity).toBe('high');
        expect(estimation.factors).toContain('Large dimensions');
        expect(estimation.factors).toContain('Bottom-up construction (high initial stitch count)');
      });
    });
  });
}); 