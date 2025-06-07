/**
 * Tests for Core Pattern Calculation Engine (PD_PH6_US002)
 */

import { PatternCalculationEngine } from '../core/PatternCalculationEngine';
import {
  CoreCalculationInput,
  CalculatedPatternDetails
} from '@/types/core-pattern-calculation';
import { InMemoryPatternDefinition } from '@/types/patternDefinitionInMemory';

describe('PatternCalculationEngine', () => {
  let engine: PatternCalculationEngine;

  beforeEach(() => {
    engine = new PatternCalculationEngine();
  });

  describe('Sweater Calculations', () => {
    it('should calculate a basic sweater pattern', async () => {
      const patternState: InMemoryPatternDefinition = {
        sessionId: 'test-session-1',
        sessionName: 'Test Sweater',
        craftType: 'knitting',
        garmentType: 'sweater',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: {
          source: 'manual',
          stitchCount: 20,
          rowCount: 28,
          unit: 'cm',
          isCompleted: true
        },
        measurements: {
          measurements: {
            bust: 90,
            length: 60,
            armLength: 55,
            upperArmCircumference: 30
          },
          unit: 'cm',
          isCompleted: true
        },
        ease: {
          type: 'positive',
          values: {
            bust: 5
          },
          unit: 'cm',
          isCompleted: true
        }
      };

      const input: CoreCalculationInput = {
        patternState,
        options: {
          includeDetailedShaping: true,
          includeYarnEstimation: true
        }
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      // Verify basic structure
      expect(result.patternInfo.sessionId).toBe('test-session-1');
      expect(result.patternInfo.garmentType).toBe('sweater');
      expect(result.pieces).toBeDefined();

      // Verify front body piece
      expect(result.pieces.frontBody).toBeDefined();
      expect(result.pieces.frontBody.castOnStitches).toBeGreaterThan(0);
      expect(result.pieces.frontBody.lengthInRows).toBeGreaterThan(0);

      // Verify back body piece
      expect(result.pieces.backBody).toBeDefined();
      expect(result.pieces.backBody.castOnStitches).toBeGreaterThan(0);

      // Verify sleeves
      expect(result.pieces.leftSleeve).toBeDefined();
      expect(result.pieces.rightSleeve).toBeDefined();

      // Verify no errors
      expect(result.errors).toBeUndefined();
    });

    it('should calculate correct stitch counts based on gauge', async () => {
      const patternState: InMemoryPatternDefinition = {
        sessionId: 'test-session-2',
        sessionName: 'Gauge Test',
        craftType: 'knitting',
        garmentType: 'sweater',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: {
          source: 'manual',
          stitchCount: 10, // 10 stitches per cm
          rowCount: 14,    // 14 rows per cm
          unit: 'cm',
          isCompleted: true
        },
        measurements: {
          measurements: {
            bust: 80 // 80cm bust
          },
          unit: 'cm',
          isCompleted: true
        },
        ease: {
          type: 'positive',
          values: {
            bust: 0 // No ease for exact calculation
          },
          unit: 'cm',
          isCompleted: true
        }
      };

      const input: CoreCalculationInput = {
        patternState
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      // Front body should be half of total circumference
      // 80cm / 2 = 40cm width
      // 40cm * 10 stitches/cm = 400 stitches
      expect(result.pieces.frontBody.castOnStitches).toBe(400);
      expect(result.pieces.backBody.castOnStitches).toBe(400);
    });
  });

  describe('Hat Calculations', () => {
    it('should calculate a basic hat pattern', async () => {
      const patternState: InMemoryPatternDefinition = {
        sessionId: 'test-hat-1',
        sessionName: 'Test Hat',
        craftType: 'knitting',
        garmentType: 'hat',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: {
          source: 'manual',
          stitchCount: 16,
          rowCount: 20,
          unit: 'cm',
          isCompleted: true
        },
        measurements: {
          measurements: {
            headCircumference: 56,
            hatHeight: 20
          },
          unit: 'cm',
          isCompleted: true
        }
      };

      const input: CoreCalculationInput = {
        patternState
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      // Verify hat piece
      expect(result.pieces.hat).toBeDefined();
      expect(result.pieces.hat.castOnStitches).toBe(896); // 56cm * 16 stitches/cm
      expect(result.pieces.hat.lengthInRows).toBe(400);   // 20cm * 20 rows/cm

      // Hat should have crown shaping
      expect(result.pieces.hat.shaping.length).toBeGreaterThan(0);
      expect(result.pieces.hat.finalStitchCount).toBe(0); // Closed at top
    });
  });

  describe('Validation', () => {
    it('should return errors for invalid input', async () => {
      const invalidPatternState: InMemoryPatternDefinition = {
        sessionId: 'test-invalid',
        sessionName: 'Invalid Pattern',
        craftType: 'knitting',
        garmentType: 'sweater',
        createdAt: new Date(),
        updatedAt: new Date()
        // Missing gauge and measurements
      };

      const input: CoreCalculationInput = {
        patternState: invalidPatternState
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should handle unsupported garment types', async () => {
      const patternState: InMemoryPatternDefinition = {
        sessionId: 'test-unsupported',
        sessionName: 'Unsupported',
        craftType: 'knitting',
        garmentType: 'unknown-type',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: {
          source: 'manual',
          stitchCount: 20,
          rowCount: 28,
          unit: 'cm',
          isCompleted: true
        },
        measurements: {
          measurements: { bust: 90 },
          unit: 'cm',
          isCompleted: true
        }
      };

      const input: CoreCalculationInput = {
        patternState
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      // Should either have no pieces or specific error handling
      expect(Object.keys(result.pieces)).toHaveLength(0);
    });
  });

  describe('Yarn Estimation', () => {
    it('should include yarn estimation when requested', async () => {
      const patternState: InMemoryPatternDefinition = {
        sessionId: 'test-yarn',
        sessionName: 'Yarn Test',
        craftType: 'knitting',
        garmentType: 'scarf',
        createdAt: new Date(),
        updatedAt: new Date(),
        gauge: {
          source: 'manual',
          stitchCount: 20,
          rowCount: 28,
          unit: 'cm',
          isCompleted: true
        },
        measurements: {
          measurements: {
            scarfLength: 150,
            scarfWidth: 20
          },
          unit: 'cm',
          isCompleted: true
        }
      };

      const input: CoreCalculationInput = {
        patternState,
        options: {
          includeYarnEstimation: true
        }
      };

      const result: CalculatedPatternDetails = await engine.calculate(input);

      expect(result.yarnEstimation).toBeDefined();
      expect(result.yarnEstimation!.totalLength_m).toBeGreaterThan(0);
      expect(result.yarnEstimation!.totalWeight_g).toBeGreaterThan(0);
    });
  });
}); 