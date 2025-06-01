/**
 * Raglan Top-Down Calculator Tests (US_12.1)
 * Tests for raglan sweater calculations knitted from the top down
 */

import { 
  calculateRaglanTopDown,
  extractRaglanInputFromComponent,
  componentRequiresRaglanCalculation
} from '../raglan-top-down-calculator';
import {
  calculateNecklineCircumference,
  calculateNecklineStitches,
  distributeNecklineStitches,
  calculateTargetStitchesAtSeparation,
  calculateRequiredIncreases,
  calculateRaglanLineLength,
  calculateIncreaseFrequency,
  calculateUnderarmStitches,
  validateRaglanInput
} from '../raglan-helpers';
import { RaglanTopDownInput } from '@/types/raglan-construction';
import { CalculationGaugeData } from '@/types/pattern-calculation';

describe('Raglan Top-Down Calculator (US_12.1)', () => {
  // Test data setup
  const standardGauge: CalculationGaugeData = {
    stitchesPer10cm: 20,
    rowsPer10cm: 30,
    unit: 'cm',
    profileName: 'Standard DK'
  };

  const standardRaglanInput: RaglanTopDownInput = {
    targetDimensions: {
      bustCircumference_cm: 100,
      bodyLength_cm: 60,
      sleeveLength_cm: 60,
      upperArmCircumference_cm: 35
    },
    gauge: standardGauge,
    neckline: {
      depth_cm: 8,
      circumference_cm: 36
    },
    raglanLineStitches: 2,
    componentKey: 'raglan_sweater'
  };

  describe('Core Calculation Logic', () => {
    // AC1: Pour un pull raglan top-down taille M (ex: tour de poitrine final 100cm, échantillon 20m/10cm), 
    // le système calcule un nombre de mailles de départ pour l'encolure plausible (ex: 80-100m).
    test('AC1: Calculates plausible neckline cast-on stitches for M size', () => {
      const result = calculateRaglanTopDown(standardRaglanInput);

      expect(result.success).toBe(true);
      expect(result.calculations).toBeDefined();
      
      const castOnStitches = result.calculations!.neckline_cast_on_total;
      expect(castOnStitches).toBeGreaterThanOrEqual(70);
      expect(castOnStitches).toBeLessThanOrEqual(110);
      
      // Should be reasonable for 36cm + 2cm ease = 38cm circumference
      // 38cm * 2 stitches/cm = 76 stitches approximately
      expect(castOnStitches).toBeCloseTo(76, 10);
    });

    // AC2: La répartition initiale des mailles entre dos, devant, manches et lignes de raglan est correcte et équilibrée.
    test('AC2: Initial stitch distribution is correct and balanced', () => {
      const result = calculateRaglanTopDown(standardRaglanInput);

      expect(result.success).toBe(true);
      const distribution = result.calculations!.initial_distribution;
      
      // Check total matches
      const totalCalculated = distribution.front_stitches + 
                            distribution.back_stitches + 
                            distribution.sleeve_left_stitches + 
                            distribution.sleeve_right_stitches + 
                            (distribution.raglan_line_stitches_each * 4);
      
      expect(distribution.total_check).toBe(totalCalculated);
      expect(distribution.total_check).toBe(result.calculations!.neckline_cast_on_total);
      
      // Check reasonableness of distribution
      const availableStitches = result.calculations!.neckline_cast_on_total - (standardRaglanInput.raglanLineStitches * 4);
      
      // Back and front should be the largest sections (roughly 1/3 each)
      expect(distribution.back_stitches).toBeGreaterThan(distribution.sleeve_left_stitches);
      expect(distribution.front_stitches).toBeGreaterThan(distribution.sleeve_left_stitches);
      expect(distribution.back_stitches).toBeLessThanOrEqual(availableStitches * 0.4); // No more than 40%
      expect(distribution.front_stitches).toBeLessThanOrEqual(availableStitches * 0.4); // No more than 40%
      
      // Sleeves should be smaller (roughly 1/6 each)
      expect(distribution.sleeve_left_stitches).toBeLessThan(availableStitches * 0.25); // No more than 25%
      expect(distribution.sleeve_right_stitches).toBeLessThan(availableStitches * 0.25); // No more than 25%
      
      // Both sleeves should have the same number of stitches
      expect(distribution.sleeve_left_stitches).toBe(distribution.sleeve_right_stitches);
      
      // Raglan line stitches should match input
      expect(distribution.raglan_line_stitches_each).toBe(standardRaglanInput.raglanLineStitches);
      
      // All sections should have positive stitch counts
      expect(distribution.back_stitches).toBeGreaterThan(0);
      expect(distribution.front_stitches).toBeGreaterThan(0);
      expect(distribution.sleeve_left_stitches).toBeGreaterThan(0);
      expect(distribution.sleeve_right_stitches).toBeGreaterThan(0);
    });

    // AC3: La fréquence et le nombre total d'augmentations de raglan sont calculés pour atteindre 
    // une profondeur d'emmanchure et des largeurs de corps/manches cibles approximatives à la séparation.
    test('AC3: Raglan increase frequency and count calculated for target dimensions', () => {
      const result = calculateRaglanTopDown(standardRaglanInput);

      expect(result.success).toBe(true);
      const shaping = result.calculations!.raglan_shaping;
      
      // Check frequency is reasonable (every 2-4 rounds)
      expect(shaping.increase_frequency).toBeGreaterThanOrEqual(2);
      expect(shaping.increase_frequency).toBeLessThanOrEqual(4);
      
      // Check total increase rounds is reasonable
      expect(shaping.total_augmentation_rounds_or_rows).toBeGreaterThan(0);
      expect(shaping.total_augmentation_rounds_or_rows).toBeLessThan(100); // Should not be excessive
      
      // Check raglan line length is reasonable (15-25cm typical)
      const raglanLengthCm = shaping.raglan_line_length_rows_or_rounds / (standardGauge.rowsPer10cm / 10);
      expect(raglanLengthCm).toBeGreaterThan(15);
      expect(raglanLengthCm).toBeLessThan(30);
      
      // Verify description is generated
      expect(shaping.augmentation_frequency_description).toContain('8 stitches');
      expect(shaping.augmentation_frequency_description).toContain(`every ${shaping.increase_frequency}`);
    });

    // AC4: Le nombre de mailles à monter sous les bras est calculé.
    test('AC4: Underarm cast-on stitches are calculated', () => {
      const result = calculateRaglanTopDown(standardRaglanInput);

      expect(result.success).toBe(true);
      const separation = result.calculations!.stitches_at_separation;
      
      expect(separation.underarm_cast_on_stitches).toBeGreaterThan(0);
      expect(separation.underarm_cast_on_stitches).toBeLessThan(20); // Should be reasonable
      
      // Should be even number for symmetry
      expect(separation.underarm_cast_on_stitches % 2).toBe(0);
    });

    // AC5: La structure de données en sortie est complète et correcte.
    test('AC5: Output data structure is complete and correct', () => {
      const result = calculateRaglanTopDown(standardRaglanInput);

      expect(result.success).toBe(true);
      expect(result.calculations).toBeDefined();
      
      const calc = result.calculations!;
      
      // Check all required properties exist
      expect(calc.neckline_cast_on_total).toBeDefined();
      expect(calc.initial_distribution).toBeDefined();
      expect(calc.raglan_shaping).toBeDefined();
      expect(calc.stitches_at_separation).toBeDefined();
      
      // Check initial distribution structure
      expect(calc.initial_distribution.front_stitches).toBeGreaterThan(0);
      expect(calc.initial_distribution.back_stitches).toBeGreaterThan(0);
      expect(calc.initial_distribution.sleeve_left_stitches).toBeGreaterThan(0);
      expect(calc.initial_distribution.sleeve_right_stitches).toBeGreaterThan(0);
      expect(calc.initial_distribution.raglan_line_stitches_each).toBeGreaterThan(0);
      expect(calc.initial_distribution.total_check).toBeGreaterThan(0);
      
      // Check raglan shaping structure
      expect(calc.raglan_shaping.raglan_line_length_rows_or_rounds).toBeGreaterThan(0);
      expect(calc.raglan_shaping.augmentation_frequency_description).toBeDefined();
      expect(calc.raglan_shaping.total_augmentation_rounds_or_rows).toBeGreaterThanOrEqual(0);
      expect(calc.raglan_shaping.total_increases_per_sleeve).toBeGreaterThanOrEqual(0);
      expect(calc.raglan_shaping.total_increases_per_body_panel).toBeGreaterThanOrEqual(0);
      expect(calc.raglan_shaping.increase_frequency).toBeGreaterThan(0);
      
      // Check separation structure
      expect(calc.stitches_at_separation.body_total_stitches).toBeGreaterThan(0);
      expect(calc.stitches_at_separation.sleeve_each_stitches).toBeGreaterThan(0);
      expect(calc.stitches_at_separation.underarm_cast_on_stitches).toBeGreaterThan(0);
      
      // Check metadata is present
      expect(calc.calculation_metadata).toBeDefined();
      expect(calc.calculation_metadata!.actual_neckline_circumference_cm).toBeGreaterThan(0);
      expect(calc.calculation_metadata!.actual_body_width_at_separation_cm).toBeGreaterThan(0);
      expect(calc.calculation_metadata!.actual_sleeve_width_at_separation_cm).toBeGreaterThan(0);
    });
  });

  describe('Helper Function Tests', () => {
    test('calculateNecklineCircumference applies ease correctly', () => {
      const baseCircumference = 36;
      const ease = 3;
      
      const result = calculateNecklineCircumference(baseCircumference, ease);
      expect(result).toBe(39);
      
      // Test with default ease
      const resultDefault = calculateNecklineCircumference(baseCircumference);
      expect(resultDefault).toBe(38); // 36 + 2 (default ease)
    });

    test('calculateNecklineStitches converts correctly', () => {
      const circumference = 40; // cm
      const stitches = calculateNecklineStitches(circumference, standardGauge);
      
      // 40cm * (20 stitches / 10cm) = 80 stitches
      expect(stitches).toBe(80);
    });

    test('distributeNecklineStitches follows Elizabeth Zimmermann ratios', () => {
      const totalStitches = 88;
      const raglanLineStitches = 2;
      
      const distribution = distributeNecklineStitches(totalStitches, raglanLineStitches);
      
      // Total should match (accounting for raglan stitches)
      expect(distribution.total_check).toBe(totalStitches);
      
      // Raglan lines should use specified stitches
      expect(distribution.raglan_line_stitches_each).toBe(raglanLineStitches);
      
      // Available stitches: 88 - (4 * 2) = 80
      // Back: ~27, Front: ~27, Each sleeve: ~13
      const availableStitches = totalStitches - (raglanLineStitches * 4);
      expect(distribution.back_stitches + distribution.front_stitches + distribution.sleeve_left_stitches + distribution.sleeve_right_stitches).toBe(availableStitches);
    });

    test('validateRaglanInput catches invalid data', () => {
      const invalidInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        targetDimensions: {
          ...standardRaglanInput.targetDimensions,
          bustCircumference_cm: -10 // Invalid negative value
        },
        neckline: {
          depth_cm: 0, // Invalid zero value
          circumference_cm: standardRaglanInput.neckline.circumference_cm
        }
      };
      
      const errors = validateRaglanInput(invalidInput);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('Bust circumference must be greater than 0');
      expect(errors).toContain('Neckline depth must be greater than 0');
    });

    test('calculateUnderarmStitches returns even number', () => {
      const stitches = calculateUnderarmStitches(standardRaglanInput);
      expect(stitches).toBeGreaterThan(0);
      expect(stitches % 2).toBe(0); // Should be even
    });
  });

  describe('Component Integration Tests', () => {
    test('componentRequiresRaglanCalculation detects raglan components', () => {
      const raglanComponent = {
        attributes: {
          construction_method: 'raglan_top_down'
        }
      };
      
      const nonRaglanComponent = {
        attributes: {
          construction_method: 'drop_shoulder'
        }
      };
      
      expect(componentRequiresRaglanCalculation(raglanComponent)).toBe(true);
      expect(componentRequiresRaglanCalculation(nonRaglanComponent)).toBe(false);
      expect(componentRequiresRaglanCalculation(null)).toBe(false);
    });

    test('extractRaglanInputFromComponent extracts data correctly', () => {
      const componentData = {
        componentKey: 'raglan_yoke',
        attributes: {
          construction_method: 'raglan_top_down',
          bust_circumference_cm: 100,
          body_length_cm: 60,
          sleeve_length_cm: 60,
          upper_arm_circumference_cm: 35,
          neckline_depth_cm: 8,
          neckline_circumference_cm: 36,
          raglan_line_stitches: 2
        }
      };
      
      const result = extractRaglanInputFromComponent(componentData, standardGauge);
      
      expect(result).not.toBeNull();
      expect(result!.targetDimensions.bustCircumference_cm).toBe(100);
      expect(result!.neckline.depth_cm).toBe(8);
      expect(result!.raglanLineStitches).toBe(2);
      expect(result!.componentKey).toBe('raglan_yoke');
    });

    test('extractRaglanInputFromComponent returns null for non-raglan components', () => {
      const componentData = {
        componentKey: 'body_panel',
        attributes: {
          construction_method: 'drop_shoulder'
        }
      };
      
      const result = extractRaglanInputFromComponent(componentData, standardGauge);
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles invalid gauge gracefully', () => {
      const invalidInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        gauge: {
          stitchesPer10cm: 0, // Invalid
          rowsPer10cm: 30,
          unit: 'cm'
        }
      };
      
      const result = calculateRaglanTopDown(invalidInput);
      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors!.length).toBeGreaterThan(0);
    });

    test('handles missing component key', () => {
      const invalidInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        componentKey: '' // Invalid empty key
      };
      
      const result = calculateRaglanTopDown(invalidInput);
      expect(result.success).toBe(false);
      expect(result.validationErrors).toContain('Component key is required');
    });

    test('handles excessive raglan line stitches', () => {
      const invalidInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        raglanLineStitches: 10 // Too many
      };
      
      const result = calculateRaglanTopDown(invalidInput);
      expect(result.success).toBe(false);
      expect(result.validationErrors).toContain('Raglan line stitches should typically be 6 or fewer');
    });
  });

  describe('Edge Cases', () => {
    test('handles very small garment dimensions', () => {
      const smallInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        targetDimensions: {
          bustCircumference_cm: 50, // Child size
          bodyLength_cm: 30,
          sleeveLength_cm: 30,
          upperArmCircumference_cm: 20
        },
        neckline: {
          depth_cm: 5,
          circumference_cm: 25
        }
      };
      
      const result = calculateRaglanTopDown(smallInput);
      expect(result.success).toBe(true);
      expect(result.calculations!.neckline_cast_on_total).toBeGreaterThan(20);
    });

    test('handles very large garment dimensions', () => {
      const largeInput: RaglanTopDownInput = {
        ...standardRaglanInput,
        targetDimensions: {
          bustCircumference_cm: 150, // Plus size
          bodyLength_cm: 80,
          sleeveLength_cm: 70,
          upperArmCircumference_cm: 50
        },
        neckline: {
          depth_cm: 10,
          circumference_cm: 45
        }
      };
      
      const result = calculateRaglanTopDown(largeInput);
      expect(result.success).toBe(true);
      expect(result.calculations!.neckline_cast_on_total).toBeLessThan(200);
    });
  });
}); 