/**
 * Raglan Top-Down Calculator (US_12.1)
 * Core calculation logic for raglan sweaters knitted from the top down
 * Implements all functional requirements specified in US_12.1
 */

import {
  RaglanTopDownInput,
  RaglanTopDownResult,
  RaglanTopDownCalculations,
  RaglanInitialDistribution,
  RaglanShapingSchedule,
  RaglanSeparationData,
  RAGLAN_DEFAULTS
} from '@/types/raglan-construction';

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
} from './raglan-helpers';

/**
 * Main function to calculate raglan top-down pattern specifications
 * Implements FR1-FR8 from US_12.1
 * 
 * @param input - Raglan calculation input data
 * @returns Complete raglan calculation result
 */
export function calculateRaglanTopDown(input: RaglanTopDownInput): RaglanTopDownResult {
  try {
    // Validate input data (implicit requirement for robust calculation)
    const validationErrors = validateRaglanInput(input);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: 'Invalid input data',
        validationErrors
      };
    }

    const warnings: string[] = [];

    // FR2: Calculate the number total de mailles à monter pour l'encolure initiale
    const necklineCircumferenceWithEase = calculateNecklineCircumference(
      input.neckline.circumference_cm,
      input.ease?.neckline_cm
    );
    
    const necklineCastOnTotal = calculateNecklineStitches(
      necklineCircumferenceWithEase,
      input.gauge
    );

    // FR3: Répartir ces mailles initiales entre panneau avant, arrière, manches et lignes de raglan
    const initialDistribution = distributeNecklineStitches(
      necklineCastOnTotal,
      input.raglanLineStitches
    );

    // Verify distribution totals match
    if (initialDistribution.total_check !== necklineCastOnTotal) {
      warnings.push(`Stitch distribution discrepancy: ${initialDistribution.total_check} vs ${necklineCastOnTotal}`);
    }

    // FR4: Calculer le nombre total d'augmentations nécessaires pour chaque section
    const targetStitches = calculateTargetStitchesAtSeparation(input);
    const requiredIncreases = calculateRequiredIncreases(
      initialDistribution,
      targetStitches,
      input.raglanLineStitches
    );

    // FR5: Déterminer la fréquence des tours/rangs d'augmentation de raglan
    const raglanLineLength = calculateRaglanLineLength(input);
    const increaseFrequency = calculateIncreaseFrequency(
      requiredIncreases.totalIncreaseRounds,
      raglanLineLength
    );

    // Build raglan shaping schedule
    const raglanShaping: RaglanShapingSchedule = {
      raglan_line_length_rows_or_rounds: raglanLineLength,
      augmentation_frequency_description: `Increase 8 stitches every ${increaseFrequency}${increaseFrequency === 2 ? 'nd' : increaseFrequency === 3 ? 'rd' : 'th'} round/row.`,
      total_augmentation_rounds_or_rows: requiredIncreases.totalIncreaseRounds,
      total_increases_per_sleeve: requiredIncreases.sleeveIncreases,
      total_increases_per_body_panel: Math.floor(requiredIncreases.bodyIncreases / 2), // Split between front and back
      increase_frequency: increaseFrequency
    };

    // FR6: Calculer le nombre de mailles pour le corps et pour chaque manche au moment de la séparation
    const underarmCastOnStitches = calculateUnderarmStitches(input);
    
    // Calculate actual stitches at separation
    const bodyStitchesAtSeparation = (
      initialDistribution.front_stitches + 
      initialDistribution.back_stitches + 
      requiredIncreases.bodyIncreases +
      (input.raglanLineStitches * 2) // Add raglan stitches that get absorbed into body
    );
    
    const sleeveStitchesAtSeparation = (
      initialDistribution.sleeve_left_stitches + 
      requiredIncreases.sleeveIncreases +
      input.raglanLineStitches // Add raglan stitches that get absorbed into sleeve
    );

    const stitchesAtSeparation: RaglanSeparationData = {
      body_total_stitches: bodyStitchesAtSeparation,
      sleeve_each_stitches: sleeveStitchesAtSeparation,
      underarm_cast_on_stitches: underarmCastOnStitches
    };

    // Calculate actual dimensions achieved for validation
    const stitchesPerCm = input.gauge.stitchesPer10cm / 10;
    const actualNecklineCircumference = necklineCastOnTotal / stitchesPerCm;
    const actualBodyWidthAtSeparation = bodyStitchesAtSeparation / stitchesPerCm;
    const actualSleeveWidthAtSeparation = sleeveStitchesAtSeparation / stitchesPerCm;

    // Add warnings for significant deviations
    const necklineDeviation = Math.abs(actualNecklineCircumference - necklineCircumferenceWithEase);
    if (necklineDeviation > 1.0) {
      warnings.push(`Neckline size deviation: ${necklineDeviation.toFixed(1)}cm from target`);
    }

    const bodyDeviation = Math.abs(actualBodyWidthAtSeparation - (input.targetDimensions.bustCircumference_cm + (input.ease?.body_cm ?? RAGLAN_DEFAULTS.BODY_EASE_CM)));
    if (bodyDeviation > 2.0) {
      warnings.push(`Body width deviation: ${bodyDeviation.toFixed(1)}cm from target at separation`);
    }

    const sleeveDeviation = Math.abs(actualSleeveWidthAtSeparation - (input.targetDimensions.upperArmCircumference_cm + (input.ease?.sleeve_cm ?? RAGLAN_DEFAULTS.SLEEVE_EASE_CM)));
    if (sleeveDeviation > 1.5) {
      warnings.push(`Sleeve width deviation: ${sleeveDeviation.toFixed(1)}cm from target at separation`);
    }

    // FR8: La sortie doit être une structure de données détaillant le montage initial, 
    // la répartition, le planning des augmentations de raglan, et les comptes de mailles au moment de la séparation
    const calculations: RaglanTopDownCalculations = {
      neckline_cast_on_total: necklineCastOnTotal,
      initial_distribution: initialDistribution,
      raglan_shaping: raglanShaping,
      stitches_at_separation: stitchesAtSeparation,
      calculation_metadata: {
        actual_neckline_circumference_cm: actualNecklineCircumference,
        actual_body_width_at_separation_cm: actualBodyWidthAtSeparation,
        actual_sleeve_width_at_separation_cm: actualSleeveWidthAtSeparation,
        warnings: warnings.length > 0 ? warnings : undefined
      }
    };

    return {
      success: true,
      calculations,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    console.error('Error in raglan top-down calculation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown calculation error'
    };
  }
}

/**
 * Extract raglan input from pattern calculation component data
 * Helper function to transform component data into raglan calculation input
 * 
 * @param componentData - Component data from pattern calculation input
 * @param gauge - Gauge information
 * @returns Raglan calculation input or null if not applicable
 */
export function extractRaglanInputFromComponent(
  componentData: any,
  gauge: any
): RaglanTopDownInput | null {
  try {
    // Check if this is a raglan top-down component
    const constructionMethod = componentData.attributes?.construction_method;
    if (constructionMethod !== 'raglan_top_down') {
      return null;
    }

    // Extract required attributes
    const attributes = componentData.attributes || {};
    
    // Extract target dimensions
    const targetDimensions = {
      bustCircumference_cm: attributes.bust_circumference_cm || 100, // Default for M size
      bodyLength_cm: attributes.body_length_cm || 60,
      sleeveLength_cm: attributes.sleeve_length_cm || 60,
      upperArmCircumference_cm: attributes.upper_arm_circumference_cm || 35
    };

    // Extract neckline specifications
    const neckline = {
      depth_cm: attributes.neckline_depth_cm || 8,
      circumference_cm: attributes.neckline_circumference_cm || 36
    };

    // Extract raglan line stitches
    const raglanLineStitches = attributes.raglan_line_stitches || RAGLAN_DEFAULTS.RAGLAN_LINE_STITCHES;

    // Extract ease if provided
    const ease = attributes.ease ? {
      neckline_cm: attributes.ease.neckline_cm,
      body_cm: attributes.ease.body_cm,
      sleeve_cm: attributes.ease.sleeve_cm
    } : undefined;

    const raglanInput: RaglanTopDownInput = {
      targetDimensions,
      gauge,
      neckline,
      raglanLineStitches,
      ease,
      componentKey: componentData.componentKey || 'raglan_yoke'
    };

    return raglanInput;

  } catch (error) {
    console.error('Error extracting raglan input from component:', error);
    return null;
  }
}

/**
 * Check if a component requires raglan top-down calculations
 * 
 * @param componentData - Component data to check
 * @returns True if component requires raglan calculations
 */
export function componentRequiresRaglanCalculation(componentData: any): boolean {
  if (!componentData || !componentData.attributes) {
    return false;
  }

  const constructionMethod = componentData.attributes.construction_method;
  return constructionMethod === 'raglan_top_down';
} 