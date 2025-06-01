/**
 * Hammer Sleeve Calculator Tests (US_12.3)
 * Tests for hammer sleeve calculations where the sleeve cap extends horizontally to form part of the shoulder
 * Covers Acceptance Criteria AC1-AC4 from US_12.3
 */

import { 
  calculateHammerSleeve,
  componentRequiresHammerSleeveCalculation,
  extractHammerSleeveInputFromComponent
} from '../hammer-sleeve-calculator';
import {
  validateHammerSleeveInput,
  calculateShoulderExtensionWidth,
  calculateShoulderExtensionStitches,
  calculateVerticalPartStitches,
  calculateArmholeDepthRows,
  calculateShoulderStrapStitches,
  calculateBodyWidthAtChest
} from '../hammer-sleeve-helpers';
import { HammerSleeveInput } from '@/types/hammer-sleeve-construction';
import { CalculationGaugeData } from '@/types/pattern-calculation';

describe('Hammer Sleeve Calculator (US_12.3)', () => {
  // Test data setup
  const standardGauge: CalculationGaugeData = {
    stitchesPer10cm: 20,
    rowsPer10cm: 30,
    unit: 'cm',
    profileName: 'Standard DK'
  };

  const standardHammerSleeveInput: HammerSleeveInput = {
    totalShoulderWidth_cm: 45,
    upperArmWidth_cm: 30,
    armholeDepth_cm: 20,
    necklineWidth_cm: 25,
    gauge: standardGauge,
    componentKey: 'hammer_sleeve_sweater'
  };

  describe('Core Calculation Logic', () => {
    // AC1: For given shoulder width, neckline width, and upper arm width, 
    // the system calculates consistent widths for sleeve shoulder extension and body shoulder strap
    test('AC1: Calculates consistent widths for sleeve shoulder extension and body shoulder strap', () => {
      const result = calculateHammerSleeve(standardHammerSleeveInput);

      expect(result.success).toBe(true);
      expect(result.calculations).toBeDefined();

      const calculations = result.calculations!;
      
      // Calculate expected shoulder extension width: (45 - 25) / 2 = 10cm = 20 stitches
      const expectedExtensionWidth_cm = (45 - 25) / 2;
      const expectedExtensionStitches = Math.round(expectedExtensionWidth_cm * (20 / 10)); // 20 sts
      
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_extension.width_stitches).toBe(expectedExtensionStitches);
      
      // Calculate expected shoulder strap width: 25/2 = 12.5cm = 25 stitches
      const expectedStrapStitches = Math.round((25 / 2) * (20 / 10)); // 25 sts
      expect(calculations.body_panel_hammer_armhole_shaping.shoulder_strap_width_stitches).toBe(expectedStrapStitches);
    });

    // AC2: The number of stitches to bind off on the body to form the base of the armhole cutout is correctly calculated
    test('AC2: Correctly calculates bind-off stitches for armhole cutout', () => {
      const result = calculateHammerSleeve(standardHammerSleeveInput);

      expect(result.success).toBe(true);
      const calculations = result.calculations!;
      
      // Expected bind-off stitches should equal upper arm width in stitches
      const expectedUpperArmStitches = Math.round(30 * (20 / 10)); // 60 sts
      expect(calculations.body_panel_hammer_armhole_shaping.bind_off_for_cutout_stitches).toBe(expectedUpperArmStitches);
      
      // Should match the armhole cutout width
      expect(calculations.body_panel_hammer_armhole_shaping.bind_off_for_cutout_stitches)
        .toBe(calculations.body_panel_hammer_armhole_shaping.armhole_cutout_width_stitches);
    });

    // AC3: The height of the sleeve cap vertical part and the depth of the body armhole cutout are equal 
    // and correspond to the desired armhole depth
    test('AC3: Sleeve cap vertical height matches body cutout depth and desired armhole depth', () => {
      const result = calculateHammerSleeve(standardHammerSleeveInput);

      expect(result.success).toBe(true);
      const calculations = result.calculations!;
      
      // Both heights should be equal
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_vertical_part.height_rows)
        .toBe(calculations.body_panel_hammer_armhole_shaping.armhole_depth_rows);
      
      // Both should correspond to desired armhole depth in rows
      const expectedArmholeRows = Math.round(20 * (30 / 10)); // 60 rows
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_vertical_part.height_rows).toBe(expectedArmholeRows);
      expect(calculations.body_panel_hammer_armhole_shaping.armhole_depth_rows).toBe(expectedArmholeRows);
    });

    // AC4: The output data structure correctly details the calculated dimensions for each part
    test('AC4: Output structure contains all required calculated dimensions', () => {
      const result = calculateHammerSleeve(standardHammerSleeveInput);

      expect(result.success).toBe(true);
      expect(result.calculations).toBeDefined();

      const calculations = result.calculations!;
      
      // Verify sleeve cap extension structure
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_extension).toMatchObject({
        width_stitches: expect.any(Number),
        length_rows: expect.any(Number),
        shaping_to_neck_details: expect.any(Array)
      });
      
      // Verify sleeve cap vertical part structure  
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_vertical_part).toMatchObject({
        width_stitches: expect.any(Number),
        height_rows: expect.any(Number),
        shaping_from_arm_details: expect.any(Array)
      });
      
      // Verify body panel shaping structure
      expect(calculations.body_panel_hammer_armhole_shaping).toMatchObject({
        shoulder_strap_width_stitches: expect.any(Number),
        armhole_cutout_width_stitches: expect.any(Number),
        armhole_depth_rows: expect.any(Number),
        bind_off_for_cutout_stitches: expect.any(Number),
        body_width_at_chest_stitches: expect.any(Number)
      });
      
      // All stitch counts should be positive integers
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_extension.width_stitches).toBeGreaterThan(0);
      expect(calculations.hammer_sleeve_shaping.sleeve_cap_vertical_part.width_stitches).toBeGreaterThan(0);
      expect(calculations.body_panel_hammer_armhole_shaping.shoulder_strap_width_stitches).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    test('calculates shoulder extension width correctly', () => {
      const width = calculateShoulderExtensionWidth(45, 25);
      expect(width).toBe(10); // (45 - 25) / 2
    });

    test('converts shoulder extension width to stitches correctly', () => {
      const stitches = calculateShoulderExtensionStitches(10, standardGauge);
      expect(stitches).toBe(20); // 10cm * 2 stitches/cm
    });

    test('calculates vertical part stitches correctly', () => {
      const stitches = calculateVerticalPartStitches(30, standardGauge);
      expect(stitches).toBe(60); // 30cm * 2 stitches/cm
    });

    test('calculates armhole depth in rows correctly', () => {
      const rows = calculateArmholeDepthRows(20, standardGauge);
      expect(rows).toBe(60); // 20cm * 3 rows/cm
    });
  });

  describe('Component Detection', () => {
    test('correctly identifies hammer sleeve components', () => {
      const componentData = {
        attributes: {
          construction_method: 'hammer_sleeve'
        }
      };
      
      expect(componentRequiresHammerSleeveCalculation(componentData)).toBe(true);
    });

    test('correctly rejects non-hammer sleeve components', () => {
      const componentData = {
        attributes: {
          construction_method: 'raglan_top_down'
        }
      };
      
      expect(componentRequiresHammerSleeveCalculation(componentData)).toBe(false);
    });
  });
}); 