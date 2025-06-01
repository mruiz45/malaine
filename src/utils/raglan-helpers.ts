/**
 * Raglan Helper Functions (US_12.1)
 * Utility functions for raglan top-down calculations
 */

import { 
  RaglanTopDownInput, 
  RaglanInitialDistribution, 
  STANDARD_RAGLAN_DISTRIBUTION,
  RAGLAN_DEFAULTS 
} from '@/types/raglan-construction';
import { CalculationGaugeData } from '@/types/pattern-calculation';

/**
 * Calculate the neckline circumference including ease
 * @param baseCircumference - Base neckline circumference in cm
 * @param ease - Additional ease in cm (optional)
 * @returns Neckline circumference with ease in cm
 */
export function calculateNecklineCircumference(
  baseCircumference: number, 
  ease?: number
): number {
  const easeToApply = ease ?? RAGLAN_DEFAULTS.NECKLINE_EASE_CM;
  return baseCircumference + easeToApply;
}

/**
 * Convert neckline circumference to stitches based on gauge
 * @param circumference_cm - Neckline circumference in cm
 * @param gauge - Gauge information
 * @returns Number of stitches needed for neckline
 */
export function calculateNecklineStitches(
  circumference_cm: number,
  gauge: CalculationGaugeData
): number {
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  return Math.round(circumference_cm * stitchesPerCm);
}

/**
 * Distribute neckline stitches between panels and raglan lines
 * Uses the Elizabeth Zimmermann method (1/3 back, 1/3 front, 1/6 each sleeve)
 * @param totalStitches - Total stitches for neckline
 * @param raglanLineStitches - Stitches per raglan line
 * @returns Distribution of stitches
 */
export function distributeNecklineStitches(
  totalStitches: number, 
  raglanLineStitches: number
): RaglanInitialDistribution {
  // Reserve stitches for 4 raglan lines
  const totalRaglanStitches = raglanLineStitches * 4;
  const availableStitches = totalStitches - totalRaglanStitches;
  
  // Distribute remaining stitches using standard ratios
  const backStitches = Math.round(availableStitches * STANDARD_RAGLAN_DISTRIBUTION.BACK_RATIO);
  const frontStitches = Math.round(availableStitches * STANDARD_RAGLAN_DISTRIBUTION.FRONT_RATIO);
  const sleeveStitches = Math.round(availableStitches * STANDARD_RAGLAN_DISTRIBUTION.SLEEVE_RATIO);
  
  // Adjust for rounding discrepancies
  const distributedStitches = backStitches + frontStitches + (sleeveStitches * 2);
  const adjustment = availableStitches - distributedStitches;
  
  // Add adjustment to back panel (most forgiving place)
  const adjustedBackStitches = backStitches + adjustment;
  
  const distribution: RaglanInitialDistribution = {
    front_stitches: frontStitches,
    back_stitches: adjustedBackStitches,
    sleeve_left_stitches: sleeveStitches,
    sleeve_right_stitches: sleeveStitches,
    raglan_line_stitches_each: raglanLineStitches,
    total_check: frontStitches + adjustedBackStitches + (sleeveStitches * 2) + totalRaglanStitches
  };
  
  return distribution;
}

/**
 * Calculate the target stitches needed for each section at separation
 * @param input - Raglan calculation input
 * @returns Target stitch counts for body and sleeves
 */
export function calculateTargetStitchesAtSeparation(input: RaglanTopDownInput): {
  bodyTargetStitches: number;
  sleeveTargetStitches: number;
} {
  const { targetDimensions, gauge, ease } = input;
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  
  // Calculate body target (bust circumference + ease)
  const bodyEase = ease?.body_cm ?? RAGLAN_DEFAULTS.BODY_EASE_CM;
  const bodyTargetStitches = Math.round((targetDimensions.bustCircumference_cm + bodyEase) * stitchesPerCm);
  
  // Calculate sleeve target (upper arm + ease)
  const sleeveEase = ease?.sleeve_cm ?? RAGLAN_DEFAULTS.SLEEVE_EASE_CM;
  const sleeveTargetStitches = Math.round((targetDimensions.upperArmCircumference_cm + sleeveEase) * stitchesPerCm);
  
  return { bodyTargetStitches, sleeveTargetStitches };
}

/**
 * Calculate total increases needed for each section
 * @param initialDistribution - Initial stitch distribution
 * @param targetStitches - Target stitches at separation
 * @param raglanLineStitches - Stitches in each raglan line
 * @returns Required increases for each section
 */
export function calculateRequiredIncreases(
  initialDistribution: RaglanInitialDistribution,
  targetStitches: { bodyTargetStitches: number; sleeveTargetStitches: number },
  raglanLineStitches: number
): {
  bodyIncreases: number;
  sleeveIncreases: number;
  totalIncreaseRounds: number;
} {
  // Calculate current body stitches (front + back)
  const currentBodyStitches = initialDistribution.front_stitches + initialDistribution.back_stitches;
  
  // Calculate increases needed for body (distributed between front and back)
  const bodyIncreases = Math.max(0, targetStitches.bodyTargetStitches - currentBodyStitches);
  
  // Calculate increases needed for each sleeve
  const currentSleeveStitches = initialDistribution.sleeve_left_stitches;
  const sleeveIncreases = Math.max(0, targetStitches.sleeveTargetStitches - currentSleeveStitches);
  
  // In raglan construction, each increase round adds 8 stitches total:
  // 1 stitch on each side of each of the 4 raglan lines
  // Body panels get 1 stitch each (front and back) = 2 stitches
  // Sleeves get 1 stitch each = 2 stitches
  // Total = 4 stitches for panels, but we need to consider the limiting factor
  
  // The number of increase rounds is limited by whichever section needs the most increases
  const bodyIncreaseRounds = Math.ceil(bodyIncreases / 2); // 2 stitches per round for body (1 front, 1 back)
  const sleeveIncreaseRounds = Math.ceil(sleeveIncreases / 1); // 1 stitch per round per sleeve
  
  const totalIncreaseRounds = Math.max(bodyIncreaseRounds, sleeveIncreaseRounds);
  
  return {
    bodyIncreases,
    sleeveIncreases,
    totalIncreaseRounds
  };
}

/**
 * Calculate raglan line length in rows/rounds
 * @param input - Raglan calculation input
 * @returns Raglan line length in rows/rounds
 */
export function calculateRaglanLineLength(input: RaglanTopDownInput): number {
  const { gauge, neckline } = input;
  const rowsPerCm = gauge.rowsPer10cm / 10;
  
  // Raglan line length is typically the depth from neckline to underarm
  // This is roughly the neckline depth plus some additional length to reach underarm
  // For top-down construction, this is approximately 15-20cm for adult sizes
  const estimatedRaglanLength = neckline.depth_cm + 12; // Add ~12cm to reach underarm from neckline
  
  return Math.round(estimatedRaglanLength * rowsPerCm);
}

/**
 * Calculate increase frequency for raglan shaping
 * @param totalIncreaseRounds - Total rounds where increases occur
 * @param raglanLineLength - Total length of raglan line in rounds
 * @returns Frequency of increases (every nth round)
 */
export function calculateIncreaseFrequency(
  totalIncreaseRounds: number,
  raglanLineLength: number
): number {
  if (totalIncreaseRounds === 0) {
    return RAGLAN_DEFAULTS.STANDARD_INCREASE_FREQUENCY;
  }
  
  // Calculate how often we need to increase
  const frequency = Math.floor(raglanLineLength / totalIncreaseRounds);
  
  // Ensure frequency is at least 2 (increase every 2nd round minimum)
  // and at most 4 (for practical knitting)
  return Math.max(2, Math.min(4, frequency));
}

/**
 * Calculate underarm cast-on stitches
 * @param input - Raglan calculation input
 * @returns Number of stitches to cast on under each arm
 */
export function calculateUnderarmStitches(input: RaglanTopDownInput): number {
  const { gauge } = input;
  const stitchesPerCm = gauge.stitchesPer10cm / 10;
  
  // Standard underarm ease is about 2-3 cm worth of stitches
  const underarmEase_cm = 2.5;
  const underarmStitches = Math.round(underarmEase_cm * stitchesPerCm);
  
  // Ensure even number for symmetrical construction
  return underarmStitches % 2 === 0 ? underarmStitches : underarmStitches + 1;
}

/**
 * Validate raglan input data
 * @param input - Raglan calculation input
 * @returns Validation errors array
 */
export function validateRaglanInput(input: RaglanTopDownInput): string[] {
  const errors: string[] = [];
  
  // Validate target dimensions
  if (input.targetDimensions.bustCircumference_cm <= 0) {
    errors.push('Bust circumference must be greater than 0');
  }
  if (input.targetDimensions.bodyLength_cm <= 0) {
    errors.push('Body length must be greater than 0');
  }
  if (input.targetDimensions.sleeveLength_cm <= 0) {
    errors.push('Sleeve length must be greater than 0');
  }
  if (input.targetDimensions.upperArmCircumference_cm <= 0) {
    errors.push('Upper arm circumference must be greater than 0');
  }
  
  // Validate gauge
  if (input.gauge.stitchesPer10cm <= 0) {
    errors.push('Gauge stitches per 10cm must be greater than 0');
  }
  if (input.gauge.rowsPer10cm <= 0) {
    errors.push('Gauge rows per 10cm must be greater than 0');
  }
  
  // Validate neckline
  if (input.neckline.depth_cm <= 0) {
    errors.push('Neckline depth must be greater than 0');
  }
  if (input.neckline.circumference_cm <= 0) {
    errors.push('Neckline circumference must be greater than 0');
  }
  
  // Validate raglan line stitches
  if (input.raglanLineStitches <= 0) {
    errors.push('Raglan line stitches must be greater than 0');
  }
  if (input.raglanLineStitches > 6) {
    errors.push('Raglan line stitches should typically be 6 or fewer');
  }
  
  // Validate component key
  if (!input.componentKey || input.componentKey.trim() === '') {
    errors.push('Component key is required');
  }
  
  return errors;
} 