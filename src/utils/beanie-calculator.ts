/**
 * Beanie Calculator (US_7.1.1)
 * Core calculation logic for beanie/hat garment pieces
 * Implements calculations for working in the round with brim, body, and crown sections
 */

import { CalculationGaugeData, CalculationStitchPattern } from '@/types/pattern-calculation';
import { BeanieAttributes } from '@/types/accessories';

/**
 * Input data for beanie calculation
 */
export interface BeanieCalculationInput {
  /** Beanie attributes from pattern definition */
  beanieAttributes: BeanieAttributes;
  /** Gauge information */
  gauge: CalculationGaugeData;
  /** Stitch pattern information */
  stitchPattern: CalculationStitchPattern;
  /** Component key for identification */
  componentKey: string;
}

/**
 * Calculation details for a specific beanie section
 */
export interface BeanieSectionCalculation {
  /** Section name */
  sectionName: 'brim' | 'body' | 'crown';
  /** Number of stitches for this section */
  stitches: number;
  /** Number of rounds for this section */
  rounds: number;
  /** Actual calculated dimension */
  actualDimension_cm: number;
  /** Target dimension used */
  targetDimension_cm: number;
}

/**
 * Detailed calculation result for a beanie
 */
export interface BeanieCalculationResult {
  /** Component identifier */
  componentKey: string;
  /** Overall calculation summary */
  calculations: {
    /** Target circumference used (with negative ease applied) */
    targetCircumferenceUsed_cm: number;
    /** Target height used */
    targetHeightUsed_cm: number;
    /** Final cast-on stitch count for brim */
    castOnStitches: number;
    /** Total rounds for entire beanie */
    totalRounds: number;
    /** Actual calculated circumference */
    actualCalculatedCircumference_cm: number;
    /** Actual calculated height */
    actualCalculatedHeight_cm: number;
    /** Raw stitch count before adjustments */
    rawStitchCount?: number;
    /** Number of pattern repeats */
    patternRepeats?: number;
    /** Number of decrease points for crown */
    crownDecreasePoints?: number;
  };
  /** Detailed calculations by section */
  sections: BeanieSectionCalculation[];
  /** Calculation errors */
  errors: string[];
  /** Calculation warnings */
  warnings: string[];
}

/**
 * Crown decrease configuration
 */
interface CrownDecreaseConfig {
  /** Number of decrease points (sections) */
  decreasePoints: number;
  /** Rounds between decrease rounds */
  roundsBetweenDecreases: number;
  /** Final stitch count to stop decreasing */
  finalStitchCount: number;
}

/**
 * Gets crown decrease configuration based on crown style
 */
function getCrownDecreaseConfig(crownStyle: string): CrownDecreaseConfig {
  switch (crownStyle) {
    case 'classic_tapered':
      return {
        decreasePoints: 8,
        roundsBetweenDecreases: 2, // Decrease every other round
        finalStitchCount: 8
      };
    case 'slouchy':
      return {
        decreasePoints: 6,
        roundsBetweenDecreases: 3, // Decrease every 3rd round for more gradual shaping
        finalStitchCount: 6
      };
    case 'flat_top':
      return {
        decreasePoints: 8,
        roundsBetweenDecreases: 1, // Decrease every round for sharper shaping
        finalStitchCount: 8
      };
    default:
      return {
        decreasePoints: 8,
        roundsBetweenDecreases: 2,
        finalStitchCount: 8
      };
  }
}

/**
 * Calculates negative ease for beanie circumference
 * Beanies typically need 2-5cm of negative ease for proper fit
 */
function calculateBeanieEase(targetCircumference_cm: number): number {
  // Standard negative ease: 8-10% of head circumference, minimum 2cm, maximum 5cm
  const easePercentage = 0.09; // 9%
  const calculatedEase = targetCircumference_cm * easePercentage;
  
  // Clamp between 2cm and 5cm
  return Math.max(2, Math.min(5, calculatedEase));
}

/**
 * Calculates stitch and round counts for a beanie
 * Implements FR2-FR5 from US 7.1.1
 * 
 * @param input - Beanie calculation input data
 * @returns Detailed calculation result
 */
export function calculateBeanie(input: BeanieCalculationInput): BeanieCalculationResult {
  const { beanieAttributes, gauge, stitchPattern, componentKey } = input;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const sections: BeanieSectionCalculation[] = [];

  // Validate input (FR1)
  if (beanieAttributes.target_circumference_cm <= 0) {
    errors.push('Target circumference must be greater than 0');
  }
  if (beanieAttributes.body_height_cm <= 0) {
    errors.push('Body height must be greater than 0');
  }
  if (gauge.stitchesPer10cm <= 0) {
    errors.push('Gauge stitches per 10cm must be greater than 0');
  }
  if (gauge.rowsPer10cm <= 0) {
    errors.push('Gauge rounds per 10cm must be greater than 0');
  }

  // Return early if validation fails
  if (errors.length > 0) {
    return {
      componentKey,
      calculations: {
        targetCircumferenceUsed_cm: beanieAttributes.target_circumference_cm,
        targetHeightUsed_cm: beanieAttributes.body_height_cm,
        castOnStitches: 0,
        totalRounds: 0,
        actualCalculatedCircumference_cm: 0,
        actualCalculatedHeight_cm: 0,
      },
      sections,
      errors,
      warnings,
    };
  }

  // FR2: Calculate cast-on stitches for brim with negative ease
  const negativeEase_cm = calculateBeanieEase(beanieAttributes.target_circumference_cm);
  const targetBrimCircumference_cm = beanieAttributes.target_circumference_cm - negativeEase_cm;
  
  const rawStitchCount = targetBrimCircumference_cm * (gauge.stitchesPer10cm / 10);
  
  // Adjust for stitch pattern repeat and working in the round
  const adjustedStitches = adjustForStitchRepeatInRound(rawStitchCount, stitchPattern, warnings);
  const castOnStitches = adjustedStitches.finalStitches;

  // Calculate actual circumference after adjustments
  const actualCircumference = (castOnStitches / gauge.stitchesPer10cm) * 10;

  // FR3: Calculate rounds for brim
  const brimDepth_cm = beanieAttributes.brim_depth_cm || 5; // Default 5cm if not specified
  const brimRounds = Math.round(brimDepth_cm * (gauge.rowsPer10cm / 10));
  
  sections.push({
    sectionName: 'brim',
    stitches: castOnStitches,
    rounds: brimRounds,
    actualDimension_cm: Number(((brimRounds / gauge.rowsPer10cm) * 10).toFixed(2)),
    targetDimension_cm: brimDepth_cm
  });

  // FR4: Calculate rounds for main body
  const crownDecreaseConfig = getCrownDecreaseConfig(beanieAttributes.crown_style);
  
  // Estimate crown height (typically 1/3 of total height for classic tapered)
  const estimatedCrownHeight_cm = beanieAttributes.body_height_cm * 0.33;
  const bodyHeight_cm = beanieAttributes.body_height_cm - brimDepth_cm - estimatedCrownHeight_cm;
  const bodyRounds = Math.max(0, Math.round(bodyHeight_cm * (gauge.rowsPer10cm / 10)));
  
  sections.push({
    sectionName: 'body',
    stitches: castOnStitches,
    rounds: bodyRounds,
    actualDimension_cm: Number(((bodyRounds / gauge.rowsPer10cm) * 10).toFixed(2)),
    targetDimension_cm: bodyHeight_cm
  });

  // FR5: Calculate crown decrease rounds
  const stitchesPerSection = Math.floor(castOnStitches / crownDecreaseConfig.decreasePoints);
  const decreaseRoundsNeeded = Math.ceil(
    (castOnStitches - crownDecreaseConfig.finalStitchCount) / crownDecreaseConfig.decreasePoints
  );
  
  // Total crown rounds = decrease rounds + plain rounds between decreases
  const plainRoundsBetween = Math.max(0, decreaseRoundsNeeded - 1) * (crownDecreaseConfig.roundsBetweenDecreases - 1);
  const crownRounds = decreaseRoundsNeeded + plainRoundsBetween;
  
  sections.push({
    sectionName: 'crown',
    stitches: crownDecreaseConfig.finalStitchCount,
    rounds: crownRounds,
    actualDimension_cm: Number(((crownRounds / gauge.rowsPer10cm) * 10).toFixed(2)),
    targetDimension_cm: estimatedCrownHeight_cm
  });

  // Calculate totals
  const totalRounds = brimRounds + bodyRounds + crownRounds;
  const actualHeight = sections.reduce((sum, section) => sum + section.actualDimension_cm, 0);

  // Add warnings for significant adjustments
  const circumferenceDifference = Math.abs(actualCircumference - targetBrimCircumference_cm);
  if (circumferenceDifference > 1.0) {
    warnings.push(
      `Circumference adjusted from ${targetBrimCircumference_cm.toFixed(1)}cm to ${actualCircumference.toFixed(1)}cm due to stitch pattern repeat`
    );
  }

  const heightDifference = Math.abs(actualHeight - beanieAttributes.body_height_cm);
  if (heightDifference > 1.0) {
    warnings.push(
      `Height adjusted from ${beanieAttributes.body_height_cm}cm to ${actualHeight.toFixed(1)}cm due to round calculations`
    );
  }

  // Add informational warning about negative ease
  warnings.push(
    `Applied ${negativeEase_cm.toFixed(1)}cm negative ease for proper beanie fit (${targetBrimCircumference_cm.toFixed(1)}cm working circumference)`
  );

  // Add warnings for unusual values
  if (castOnStitches > 200) {
    warnings.push('Very large beanie - double-check head circumference measurement');
  }
  if (castOnStitches < 60) {
    warnings.push('Very small beanie - double-check head circumference measurement');
  }
  if (totalRounds > 150) {
    warnings.push('Very tall beanie - double-check height measurement');
  }

  return {
    componentKey,
    calculations: {
      targetCircumferenceUsed_cm: targetBrimCircumference_cm,
      targetHeightUsed_cm: beanieAttributes.body_height_cm,
      castOnStitches,
      totalRounds,
      actualCalculatedCircumference_cm: Number(actualCircumference.toFixed(2)),
      actualCalculatedHeight_cm: Number(actualHeight.toFixed(2)),
      rawStitchCount: Number(rawStitchCount.toFixed(1)),
      patternRepeats: adjustedStitches.numRepeats,
      crownDecreasePoints: crownDecreaseConfig.decreasePoints,
    },
    sections,
    errors,
    warnings,
  };
}

/**
 * Adjusts stitch count for pattern repeat requirements when working in the round
 * Similar to rectangular piece but ensures even distribution for circular knitting
 * 
 * @param rawStitchCount - Raw calculated stitch count
 * @param stitchPattern - Stitch pattern information
 * @param warnings - Array to add warnings to
 * @returns Adjusted stitch information
 */
function adjustForStitchRepeatInRound(
  rawStitchCount: number,
  stitchPattern: CalculationStitchPattern,
  warnings: string[]
): { finalStitches: number; numRepeats: number } {
  const horizontalRepeat = stitchPattern.horizontalRepeat || 1;
  
  // If no repeat or repeat is 1, just round to nearest whole stitch
  if (horizontalRepeat <= 1) {
    return {
      finalStitches: Math.round(rawStitchCount),
      numRepeats: Math.round(rawStitchCount),
    };
  }

  // Calculate number of complete repeats
  const numRepeats = Math.round(rawStitchCount / horizontalRepeat);
  const finalStitches = numRepeats * horizontalRepeat;

  // Add warning if adjustment is significant
  const stitchDifference = Math.abs(finalStitches - rawStitchCount);
  if (stitchDifference >= 1) {
    warnings.push(
      `Cast-on stitches adjusted from ${Math.round(rawStitchCount)} to ${finalStitches} ` +
      `to fit ${horizontalRepeat}-stitch ${stitchPattern.name || 'pattern'} repeat when working in the round`
    );
  }

  return { finalStitches, numRepeats };
}

/**
 * Validates beanie calculation input data
 * 
 * @param input - Partial beanie input to validate
 * @returns Validation result with errors and warnings
 */
export function validateBeanieCalculationInput(input: Partial<BeanieCalculationInput>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate beanie attributes
  if (!input.beanieAttributes) {
    errors.push('Beanie attributes are required');
  } else {
    if (!input.beanieAttributes.target_circumference_cm || input.beanieAttributes.target_circumference_cm <= 0) {
      errors.push('Target circumference must be a positive number');
    }
    if (!input.beanieAttributes.body_height_cm || input.beanieAttributes.body_height_cm <= 0) {
      errors.push('Body height must be a positive number');
    }
    if (!input.beanieAttributes.crown_style) {
      errors.push('Crown style is required');
    }
    if (!input.beanieAttributes.brim_style) {
      errors.push('Brim style is required');
    }
    if (!input.beanieAttributes.work_style || input.beanieAttributes.work_style !== 'in_the_round') {
      errors.push('Beanie must be worked in the round');
    }

    // Validate reasonable measurements
    if (input.beanieAttributes.target_circumference_cm && 
        (input.beanieAttributes.target_circumference_cm < 40 || input.beanieAttributes.target_circumference_cm > 70)) {
      warnings.push('Unusual head circumference - typical range is 40-70cm');
    }
    if (input.beanieAttributes.body_height_cm && 
        (input.beanieAttributes.body_height_cm < 15 || input.beanieAttributes.body_height_cm > 35)) {
      warnings.push('Unusual beanie height - typical range is 15-35cm');
    }
  }

  // Validate gauge
  if (!input.gauge) {
    errors.push('Gauge information is required');
  } else {
    if (!input.gauge.stitchesPer10cm || input.gauge.stitchesPer10cm <= 0) {
      errors.push('Gauge stitches per 10cm must be a positive number');
    }
    if (!input.gauge.rowsPer10cm || input.gauge.rowsPer10cm <= 0) {
      errors.push('Gauge rounds per 10cm must be a positive number');
    }
  }

  // Validate stitch pattern
  if (!input.stitchPattern) {
    errors.push('Stitch pattern information is required');
  } else {
    if (!input.stitchPattern.name) {
      warnings.push('Stitch pattern name not provided');
    }
  }

  // Validate component key
  if (!input.componentKey) {
    errors.push('Component key is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
} 