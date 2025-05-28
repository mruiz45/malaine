/**
 * Tests for Rectangular Piece Calculator (US_6.2)
 * Validates the core calculation logic for rectangular garment pieces
 */

import {
  calculateRectangularPiece,
  validateRectangularPieceInput,
  RectangularPieceInput,
} from '../rectangular-piece-calculator';
import { CalculationGaugeData, CalculationStitchPattern } from '@/types/pattern-calculation';

describe('Rectangular Piece Calculator (US_6.2)', () => {
  // Test data setup
  const standardGauge: CalculationGaugeData = {
    stitchesPer10cm: 22,
    rowsPer10cm: 30,
    unit: 'cm',
  };

  const standardStitchPattern: CalculationStitchPattern = {
    name: 'Stockinette',
    horizontalRepeat: 1,
    verticalRepeat: 1,
  };

  const ribStitchPattern: CalculationStitchPattern = {
    name: '2x2 Rib',
    horizontalRepeat: 4,
    verticalRepeat: 1,
  };

  describe('Core Calculation Logic', () => {
    // AC1: Given gauge: 22 sts/30 rows per 10cm, target component width: 50cm, target component length: 60cm, stitch repeat: 1
    // The engine correctly calculates approx. 110 cast-on stitches and 180 total rows.
    test('AC1: Basic rectangular calculation with no pattern repeat', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 50,
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'front_body_panel',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors).toHaveLength(0);
      expect(result.calculations.castOnStitches).toBe(110); // 50 * (22/10) = 110
      expect(result.calculations.totalRows).toBe(180); // 60 * (30/10) = 180
      expect(result.calculations.targetWidthUsed_cm).toBe(50);
      expect(result.calculations.targetLengthUsed_cm).toBe(60);
      expect(result.calculations.actualCalculatedWidth_cm).toBeCloseTo(50, 1);
      expect(result.calculations.actualCalculatedLength_cm).toBeCloseTo(60, 1);
    });

    // AC2: Given gauge: 20 sts/28 rows per 10cm, target component width: 42cm, stitch repeat: 4 (e.g., a 2x2 rib)
    // The engine calculates a cast-on stitch count that is a multiple of 4 and closest to the target width
    test('AC2: Calculation with 4-stitch pattern repeat', () => {
      const gauge20: CalculationGaugeData = {
        stitchesPer10cm: 20,
        rowsPer10cm: 28,
        unit: 'cm',
      };

      const input: RectangularPieceInput = {
        targetWidth_cm: 42,
        targetLength_cm: 50,
        gauge: gauge20,
        stitchPattern: ribStitchPattern,
        componentKey: 'front_body_panel',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors).toHaveLength(0);
      
      // Raw calculation: 42 * (20/10) = 84 stitches
      // 84 is divisible by 4, so should remain 84
      expect(result.calculations.castOnStitches).toBe(84);
      expect(result.calculations.castOnStitches % 4).toBe(0); // Must be multiple of 4
      expect(result.calculations.rawStitchCount).toBeCloseTo(84, 1);
      expect(result.calculations.patternRepeats).toBe(21); // 84 / 4 = 21 repeats
    });

    test('AC2b: Calculation with pattern repeat requiring adjustment', () => {
      const gauge20: CalculationGaugeData = {
        stitchesPer10cm: 20,
        rowsPer10cm: 28,
        unit: 'cm',
      };

      const input: RectangularPieceInput = {
        targetWidth_cm: 41, // This will give 82 stitches, needs adjustment to 80 or 84
        targetLength_cm: 50,
        gauge: gauge20,
        stitchPattern: ribStitchPattern,
        componentKey: 'front_body_panel',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors).toHaveLength(0);
      
      // Raw calculation: 41 * (20/10) = 82 stitches
      // Closest multiple of 4 is 80 or 84, should round to 84
      expect(result.calculations.castOnStitches).toBe(84);
      expect(result.calculations.castOnStitches % 4).toBe(0);
      expect(result.calculations.rawStitchCount).toBeCloseTo(82, 1);
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about adjustment
    });
  });

  describe('Output Data Structure', () => {
    // AC3: The output data structure contains all required fields
    test('AC3: Output contains all required fields', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 50,
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'front_body_panel',
      };

      const result = calculateRectangularPiece(input);

      // Check main structure
      expect(result).toHaveProperty('componentKey');
      expect(result).toHaveProperty('calculations');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');

      // Check calculations object
      expect(result.calculations).toHaveProperty('targetWidthUsed_cm');
      expect(result.calculations).toHaveProperty('targetLengthUsed_cm');
      expect(result.calculations).toHaveProperty('castOnStitches');
      expect(result.calculations).toHaveProperty('totalRows');
      expect(result.calculations).toHaveProperty('actualCalculatedWidth_cm');
      expect(result.calculations).toHaveProperty('actualCalculatedLength_cm');

      // Check types
      expect(typeof result.calculations.castOnStitches).toBe('number');
      expect(typeof result.calculations.totalRows).toBe('number');
      expect(typeof result.calculations.actualCalculatedWidth_cm).toBe('number');
      expect(typeof result.calculations.actualCalculatedLength_cm).toBe('number');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    // AC4: Edge cases (e.g., zero width/length) are handled gracefully
    test('AC4a: Zero width is handled gracefully', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 0,
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Target width must be greater than 0');
      expect(result.calculations.castOnStitches).toBe(0);
      expect(result.calculations.totalRows).toBe(0);
    });

    test('AC4b: Zero length is handled gracefully', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 50,
        targetLength_cm: 0,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Target length must be greater than 0');
      expect(result.calculations.castOnStitches).toBe(0);
      expect(result.calculations.totalRows).toBe(0);
    });

    test('AC4c: Invalid gauge is handled gracefully', () => {
      const invalidGauge: CalculationGaugeData = {
        stitchesPer10cm: 0,
        rowsPer10cm: 30,
        unit: 'cm',
      };

      const input: RectangularPieceInput = {
        targetWidth_cm: 50,
        targetLength_cm: 60,
        gauge: invalidGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Gauge stitches per 10cm must be greater than 0');
    });

    test('AC4d: Negative dimensions are handled gracefully', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: -10,
        targetLength_cm: -20,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Target width must be greater than 0');
      expect(result.errors).toContain('Target length must be greater than 0');
    });
  });

  describe('Warning Generation', () => {
    test('Warns for very large pieces', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 200, // Very wide
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Very wide piece'))).toBe(true);
    });

    test('Warns for very small pieces', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 5, // Very narrow
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Very narrow piece'))).toBe(true);
    });

    test('Warns for significant width adjustments due to pattern repeat', () => {
      const wideRepeatPattern: CalculationStitchPattern = {
        name: 'Wide Cable',
        horizontalRepeat: 12,
        verticalRepeat: 1,
      };

      const input: RectangularPieceInput = {
        targetWidth_cm: 50, // Will give 110 stitches, needs adjustment for 12-stitch repeat
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: wideRepeatPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Cast-on stitches adjusted'))).toBe(true);
    });
  });

  describe('Input Validation', () => {
    test('Validates required fields', () => {
      const invalidInput = {
        targetWidth_cm: 50,
        // Missing targetLength_cm
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const validation = validateRectangularPieceInput(invalidInput);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('targetLength_cm is required and must be a number');
    });

    test('Validates numeric types', () => {
      const invalidInput = {
        targetWidth_cm: 'not a number' as any,
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const validation = validateRectangularPieceInput(invalidInput);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('targetWidth_cm is required and must be a number');
    });

    test('Warns for unusually large dimensions', () => {
      const input = {
        targetWidth_cm: 250, // Very large
        targetLength_cm: 350, // Very large
        gauge: standardGauge,
        stitchPattern: standardStitchPattern,
        componentKey: 'test_component',
      };

      const validation = validateRectangularPieceInput(input);

      expect(validation.isValid).toBe(true);
      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings).toContain('targetWidth_cm is unusually large (>200cm)');
      expect(validation.warnings).toContain('targetLength_cm is unusually large (>300cm)');
    });
  });

  describe('Pattern Repeat Calculations', () => {
    test('Handles complex pattern repeats correctly', () => {
      const complexPattern: CalculationStitchPattern = {
        name: 'Complex Cable',
        horizontalRepeat: 16,
        verticalRepeat: 1,
      };

      const input: RectangularPieceInput = {
        targetWidth_cm: 50, // 110 stitches raw, should adjust to 112 (7 repeats)
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: complexPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.calculations.castOnStitches % 16).toBe(0); // Must be multiple of 16
      expect(result.calculations.patternRepeats).toBe(7); // 112 / 16 = 7
      expect(result.calculations.castOnStitches).toBe(112);
    });

    test('No adjustment needed when raw stitches already match repeat', () => {
      const input: RectangularPieceInput = {
        targetWidth_cm: 48, // 48 * (22/10) = 105.6 ≈ 106, closest multiple of 4 is 104 or 108
        targetLength_cm: 60,
        gauge: standardGauge,
        stitchPattern: ribStitchPattern,
        componentKey: 'test_component',
      };

      const result = calculateRectangularPiece(input);

      expect(result.calculations.castOnStitches % 4).toBe(0);
      // Should be either 104 or 108, both are valid
      expect([104, 108]).toContain(result.calculations.castOnStitches);
    });
  });
}); 