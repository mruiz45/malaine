/**
 * Tests for Reverse Gauge Calculator Service
 * Validates all acceptance criteria from US_2.1
 */

import {
  calculateReverseGauge,
  validateCalculationInput
} from '../reverseGaugeCalculatorService';
import type {
  GaugeInfo,
  ScenarioAInput,
  ScenarioBInput,
  ScenarioCInput,
  ScenarioAResult,
  ScenarioBResult,
  ScenarioCResult
} from '@/types/reverseGaugeCalculator';

describe('Reverse Gauge Calculator Service', () => {
  // Test data based on acceptance criteria
  const userGauge: GaugeInfo = {
    stitches: 22,
    rows: 30,
    unit_dimension: 10,
    unit: 'cm'
  };

  const patternGauge: GaugeInfo = {
    stitches: 20,
    rows: 28,
    unit_dimension: 10,
    unit: 'cm'
  };

  describe('Scenario A: Target Dimension to Stitches/Rows', () => {
    test('AC1: 22 sts/10cm gauge, 50cm target width should calculate 110 stitches', () => {
      const input: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 50,
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      expect(result.scenario).toBe('target_to_stitches');
      expect(result.required_count).toBe(110);
      expect(result.target_dimension).toBe(50);
      expect(result.dimension_unit).toBe('cm');
      expect(result.calculate_for).toBe('stitches');
    });

    test('Should calculate rows correctly', () => {
      const input: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 20,
        dimension_unit: 'cm',
        calculate_for: 'rows'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      // 30 rows / 10cm = 3 rows/cm
      // 20cm * 3 rows/cm = 60 rows
      expect(result.required_count).toBe(60);
      expect(result.calculate_for).toBe('rows');
    });

    test('Should handle unit conversion (inches to cm)', () => {
      const input: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 4, // 4 inches = ~10.16 cm
        dimension_unit: 'inch',
        calculate_for: 'stitches'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      // 22 sts / 10cm = 2.2 sts/cm
      // 10.16cm * 2.2 sts/cm = 22.35 sts ≈ 22 sts
      expect(result.required_count).toBe(22);
    });
  });

  describe('Scenario B: Stitches/Rows to Dimension', () => {
    test('AC2: 22 sts/10cm gauge, 88 stitches should calculate 40cm width', () => {
      const input: ScenarioBInput = {
        user_gauge: userGauge,
        stitch_or_row_count: 88,
        calculate_for: 'dimension_width'
      };

      const result = calculateReverseGauge('stitches_to_dimension', input) as ScenarioBResult;

      expect(result.scenario).toBe('stitches_to_dimension');
      expect(result.resulting_dimension).toBe(40);
      expect(result.dimension_unit).toBe('cm');
      expect(result.stitch_or_row_count).toBe(88);
      expect(result.calculate_for).toBe('dimension_width');
    });

    test('Should calculate height from rows correctly', () => {
      const input: ScenarioBInput = {
        user_gauge: userGauge,
        stitch_or_row_count: 90,
        calculate_for: 'dimension_height'
      };

      const result = calculateReverseGauge('stitches_to_dimension', input) as ScenarioBResult;

      // 30 rows / 10cm = 3 rows/cm
      // 90 rows / 3 rows/cm = 30cm
      expect(result.resulting_dimension).toBe(30);
      expect(result.calculate_for).toBe('dimension_height');
    });
  });

  describe('Scenario C: Gauge Comparison', () => {
    test('AC3: Pattern gauge 20 sts/10cm, pattern 100 sts, user gauge 22 sts/10cm', () => {
      const input: ScenarioCInput = {
        pattern_gauge: patternGauge,
        pattern_stitch_row_count: 100,
        user_gauge: userGauge,
        calculate_for_component: 'width'
      };

      const result = calculateReverseGauge('gauge_comparison', input) as ScenarioCResult;

      expect(result.scenario).toBe('gauge_comparison');
      
      // Original dimension: 100 sts / (20 sts/10cm) = 100 / 2 = 50cm
      expect(result.original_dimension).toBe(50);
      
      // Dimension with user gauge: 100 sts / (22 sts/10cm) = 100 / 2.2 ≈ 45.45cm
      expect(result.dimension_with_user_gauge).toBeCloseTo(45.45, 2);
      
      // Adjusted stitches for original dimension: 50cm * (22 sts/10cm) = 50 * 2.2 = 110 sts
      expect(result.adjusted_count_for_original_dimension).toBe(110);
      
      expect(result.pattern_count).toBe(100);
      expect(result.calculate_for_component).toBe('width');
    });

    test('Should handle height calculations correctly', () => {
      const input: ScenarioCInput = {
        pattern_gauge: patternGauge,
        pattern_stitch_row_count: 140, // 140 rows
        user_gauge: userGauge,
        calculate_for_component: 'height'
      };

      const result = calculateReverseGauge('gauge_comparison', input) as ScenarioCResult;

      // Original dimension: 140 rows / (28 rows/10cm) = 140 / 2.8 = 50cm
      expect(result.original_dimension).toBe(50);
      
      // Dimension with user gauge: 140 rows / (30 rows/10cm) = 140 / 3 ≈ 46.67cm
      expect(result.dimension_with_user_gauge).toBeCloseTo(46.67, 2);
      
      // Adjusted rows for original dimension: 50cm * (30 rows/10cm) = 50 * 3 = 150 rows
      expect(result.adjusted_count_for_original_dimension).toBe(150);
    });

    test('Should handle matching gauges', () => {
      const input: ScenarioCInput = {
        pattern_gauge: userGauge, // Same as user gauge
        pattern_stitch_row_count: 100,
        user_gauge: userGauge,
        calculate_for_component: 'width'
      };

      const result = calculateReverseGauge('gauge_comparison', input) as ScenarioCResult;

      // When gauges match, dimensions should be the same
      expect(result.original_dimension).toBe(result.dimension_with_user_gauge);
      expect(result.adjusted_count_for_original_dimension).toBe(100);
    });
  });

  describe('Input Validation', () => {
    test('Should validate required fields for Scenario A', () => {
      const invalidInput: ScenarioAInput = {
        user_gauge: {
          stitches: 0, // Invalid
          rows: 30,
          unit_dimension: 10,
          unit: 'cm'
        },
        target_dimension: 0, // Invalid
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const errors = validateCalculationInput('target_to_stitches', invalidInput);

      expect(errors.user_gauge?.stitches).toBeDefined();
      expect(errors.target_dimension).toBeDefined();
    });

    test('Should validate required fields for Scenario B', () => {
      const invalidInput: ScenarioBInput = {
        user_gauge: {
          stitches: 22,
          rows: 0, // Invalid
          unit_dimension: 10,
          unit: 'cm'
        },
        stitch_or_row_count: 0, // Invalid
        calculate_for: 'dimension_width'
      };

      const errors = validateCalculationInput('stitches_to_dimension', invalidInput);

      expect(errors.user_gauge?.rows).toBeDefined();
      expect(errors.stitch_or_row_count).toBeDefined();
    });

    test('Should validate required fields for Scenario C', () => {
      const invalidInput: ScenarioCInput = {
        pattern_gauge: {
          stitches: 20,
          rows: 28,
          unit_dimension: 0, // Invalid
          unit: 'cm'
        },
        pattern_stitch_row_count: 0, // Invalid
        user_gauge: userGauge,
        calculate_for_component: 'width'
      };

      const errors = validateCalculationInput('gauge_comparison', invalidInput);

      expect(errors.pattern_gauge?.unit_dimension).toBeDefined();
      expect(errors.pattern_stitch_row_count).toBeDefined();
    });

    test('Should pass validation for valid inputs', () => {
      const validInput: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 50,
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const errors = validateCalculationInput('target_to_stitches', validInput);

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    test('Should handle very small dimensions', () => {
      const input: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 0.5,
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      // 0.5cm * (22 sts/10cm) = 0.5 * 2.2 = 1.1 sts ≈ 1 st
      expect(result.required_count).toBe(1);
    });

    test('Should handle large dimensions', () => {
      const input: ScenarioAInput = {
        user_gauge: userGauge,
        target_dimension: 200,
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      // 200cm * (22 sts/10cm) = 200 * 2.2 = 440 sts
      expect(result.required_count).toBe(440);
    });

    test('Should handle decimal gauge values', () => {
      const decimalGauge: GaugeInfo = {
        stitches: 22.5,
        rows: 30.5,
        unit_dimension: 10,
        unit: 'cm'
      };

      const input: ScenarioAInput = {
        user_gauge: decimalGauge,
        target_dimension: 10,
        dimension_unit: 'cm',
        calculate_for: 'stitches'
      };

      const result = calculateReverseGauge('target_to_stitches', input) as ScenarioAResult;

      // 10cm * (22.5 sts/10cm) = 10 * 2.25 = 22.5 sts ≈ 23 sts
      expect(result.required_count).toBe(23);
    });
  });
}); 