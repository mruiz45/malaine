/**
 * Hammer Sleeve Calculator (US_12.3)
 * Core calculation logic for hammer sleeve construction where the sleeve cap extends horizontally to form part of the shoulder
 * Implements all functional requirements specified in US_12.3
 */

import {
  HammerSleeveInput,
  HammerSleeveResult,
  HammerSleeveCalculations,
  HammerSleeveShaping,
  BodyPanelHammerArmholeShaping,
  SleeveCapExtension,
  SleeveCapVerticalPart,
  HAMMER_SLEEVE_DEFAULTS
} from '@/types/hammer-sleeve-construction';

import {
  validateHammerSleeveInput,
  calculateShoulderExtensionWidth,
  calculateShoulderExtensionStitches,
  calculateVerticalPartStitches,
  calculateArmholeDepthRows,
  calculateShoulderStrapStitches,
  calculateBodyWidthAtChest,
  convertStitchesToCm,
  convertRowsToCm
} from './hammer-sleeve-helpers';

/**
 * Main function to calculate hammer sleeve pattern specifications
 * Implements FR1-FR4 from US_12.3
 * 
 * @param input - Hammer sleeve calculation input data
 * @returns Complete hammer sleeve calculation result
 */
export function calculateHammerSleeve(input: HammerSleeveInput): HammerSleeveResult {
  try {
    // Validate input data (implicit requirement for robust calculation)
    const validationResult = validateHammerSleeveInput(input);
    if (!validationResult.isValid) {
      return {
        success: false,
        error: 'Invalid input data',
        validationErrors: validationResult.errors,
        warnings: validationResult.warnings
      };
    }

    const warnings: string[] = [...validationResult.warnings];

    // FR2: Calculate hammer sleeve cap shaping
    const hammerSleeveShaping = calculateHammerSleeveShaping(input, warnings);

    // FR3: Calculate body panel armhole shaping
    const bodyPanelShaping = calculateBodyPanelShaping(input, warnings);

    // Validate geometric compatibility
    validateGeometricCompatibility(hammerSleeveShaping, bodyPanelShaping, warnings);

    // Calculate actual dimensions achieved for validation
    const actualDimensions = calculateActualDimensions(hammerSleeveShaping, bodyPanelShaping, input.gauge);

    // FR4: Build complete calculation result structure
    const calculations: HammerSleeveCalculations = {
      hammer_sleeve_shaping: hammerSleeveShaping,
      body_panel_hammer_armhole_shaping: bodyPanelShaping,
      calculation_metadata: {
        actual_shoulder_width_cm: actualDimensions.shoulderWidth,
        actual_upper_arm_width_cm: actualDimensions.upperArmWidth,
        actual_armhole_depth_cm: actualDimensions.armholeDepth,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };

    return {
      success: true,
      calculations,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    console.error('Error in hammer sleeve calculation:', error);
    return {
      success: false,
      error: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Calculate hammer sleeve cap shaping (FR2)
 * Calculates both the vertical part (along arm) and horizontal extension (forming shoulder)
 */
function calculateHammerSleeveShaping(input: HammerSleeveInput, warnings: string[]): HammerSleeveShaping {
  // Calculate shoulder extension (horizontal part forming shoulder)
  const shoulderExtensionWidth_cm = calculateShoulderExtensionWidth(
    input.totalShoulderWidth_cm, 
    input.necklineWidth_cm
  );
  
  const extensionWidthStitches = calculateShoulderExtensionStitches(
    shoulderExtensionWidth_cm, 
    input.gauge
  );

  // Extension length: default height or small amount for joining neckline
  const extensionLengthRows = HAMMER_SLEEVE_DEFAULTS.DEFAULT_EXTENSION_HEIGHT_ROWS;

  const sleeveCapExtension: SleeveCapExtension = {
    width_stitches: extensionWidthStitches,
    length_rows: extensionLengthRows,
    shaping_to_neck_details: [] // Rectangular for this US (future enhancement for shaped)
  };

  // Calculate vertical part (along the arm)
  const verticalPartWidthStitches = calculateVerticalPartStitches(
    input.upperArmWidth_cm, 
    input.gauge
  );
  
  const verticalPartHeightRows = calculateArmholeDepthRows(
    input.armholeDepth_cm, 
    input.gauge
  );

  const sleeveCapVerticalPart: SleeveCapVerticalPart = {
    width_stitches: verticalPartWidthStitches,
    height_rows: verticalPartHeightRows,
    shaping_from_arm_details: [] // Straight for this US (future enhancement for shaped)
  };

  return {
    sleeve_cap_extension: sleeveCapExtension,
    sleeve_cap_vertical_part: sleeveCapVerticalPart
  };
}

/**
 * Calculate body panel armhole shaping (FR3)
 * Calculates the cutout on front and back panels to accommodate the hammer sleeve
 */
function calculateBodyPanelShaping(input: HammerSleeveInput, warnings: string[]): BodyPanelHammerArmholeShaping {
  // Calculate shoulder strap width (next to neckline)
  const shoulderStrapStitches = calculateShoulderStrapStitches(
    input.necklineWidth_cm, 
    input.gauge
  );

  // Calculate armhole cutout width (corresponds to vertical part of sleeve cap)
  const armholeCutoutStitches = calculateVerticalPartStitches(
    input.upperArmWidth_cm, 
    input.gauge
  );

  // Calculate armhole depth in rows
  const armholeDepthRows = calculateArmholeDepthRows(
    input.armholeDepth_cm, 
    input.gauge
  );

  // Bind-off stitches = armhole cutout width (creates the rectangular cutout)
  const bindOffStitches = armholeCutoutStitches;

  // Total body width at chest level
  const bodyWidthStitches = calculateBodyWidthAtChest(
    shoulderStrapStitches, 
    armholeCutoutStitches
  );

  return {
    shoulder_strap_width_stitches: shoulderStrapStitches,
    armhole_cutout_width_stitches: armholeCutoutStitches,
    armhole_depth_rows: armholeDepthRows,
    bind_off_for_cutout_stitches: bindOffStitches,
    body_width_at_chest_stitches: bodyWidthStitches
  };
}

/**
 * Validate geometric compatibility between sleeve and body calculations
 * Ensures the sleeve cap vertical part fits into the body panel cutout
 */
function validateGeometricCompatibility(
  sleeveShaping: HammerSleeveShaping, 
  bodyShaping: BodyPanelHammerArmholeShaping, 
  warnings: string[]
): void {
  // Check that sleeve cap vertical part width matches body cutout width
  const sleeveVerticalWidth = sleeveShaping.sleeve_cap_vertical_part.width_stitches;
  const bodyCutoutWidth = bodyShaping.armhole_cutout_width_stitches;
  
  if (sleeveVerticalWidth !== bodyCutoutWidth) {
    warnings.push(
      `Geometric mismatch: sleeve vertical part (${sleeveVerticalWidth} sts) vs body cutout (${bodyCutoutWidth} sts)`
    );
  }

  // Check that sleeve cap vertical part height matches body cutout depth
  const sleeveVerticalHeight = sleeveShaping.sleeve_cap_vertical_part.height_rows;
  const bodyCutoutDepth = bodyShaping.armhole_depth_rows;
  
  if (sleeveVerticalHeight !== bodyCutoutDepth) {
    warnings.push(
      `Geometric mismatch: sleeve vertical part height (${sleeveVerticalHeight} rows) vs body cutout depth (${bodyCutoutDepth} rows)`
    );
  }
}

/**
 * Calculate actual dimensions achieved by the calculations
 * Used for validation and metadata
 */
function calculateActualDimensions(
  sleeveShaping: HammerSleeveShaping, 
  bodyShaping: BodyPanelHammerArmholeShaping, 
  gauge: any
): {
  shoulderWidth: number;
  upperArmWidth: number;
  armholeDepth: number;
} {
  // Calculate actual shoulder width
  const shoulderStrapWidth_cm = convertStitchesToCm(bodyShaping.shoulder_strap_width_stitches, gauge);
  const extensionWidth_cm = convertStitchesToCm(sleeveShaping.sleeve_cap_extension.width_stitches, gauge);
  const actualShoulderWidth = (shoulderStrapWidth_cm * 2) + (extensionWidth_cm * 2); // Both sides

  // Calculate actual upper arm width
  const actualUpperArmWidth = convertStitchesToCm(sleeveShaping.sleeve_cap_vertical_part.width_stitches, gauge);

  // Calculate actual armhole depth
  const actualArmholeDepth = convertRowsToCm(sleeveShaping.sleeve_cap_vertical_part.height_rows, gauge);

  return {
    shoulderWidth: actualShoulderWidth,
    upperArmWidth: actualUpperArmWidth,
    armholeDepth: actualArmholeDepth
  };
}

/**
 * Check if a component requires hammer sleeve calculation
 * Helper function for API integration
 * 
 * @param componentData - Component data from pattern calculation input
 * @returns Whether this component uses hammer sleeve construction
 */
export function componentRequiresHammerSleeveCalculation(componentData: any): boolean {
  return componentData?.attributes?.construction_method === 'hammer_sleeve';
}

/**
 * Extract hammer sleeve input from pattern calculation component data
 * Helper function to transform component data into hammer sleeve calculation input
 * Re-exports the function from helpers for convenience
 * 
 * @param componentData - Component data from pattern calculation input
 * @param gauge - Gauge information
 * @returns Hammer sleeve calculation input or null if not applicable
 */
export { extractHammerSleeveInputFromComponent } from './hammer-sleeve-helpers'; 