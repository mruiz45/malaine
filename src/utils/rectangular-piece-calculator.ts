/**
 * Rectangular Piece Calculator (US_6.2)
 * Core calculation logic for rectangular garment pieces
 */

import { CalculationGaugeData, CalculationStitchPattern } from '@/types/pattern-calculation';

/**
 * Input data for rectangular piece calculation
 */
export interface RectangularPieceInput {
  /** Target finished width in cm */
  targetWidth_cm: number;
  /** Target finished length in cm */
  targetLength_cm: number;
  /** Gauge information */
  gauge: CalculationGaugeData;
  /** Stitch pattern information */
  stitchPattern: CalculationStitchPattern;
  /** Component key for identification */
  componentKey: string;
}

/**
 * Detailed calculation result for a rectangular piece
 */
export interface RectangularPieceCalculation {
  /** Component identifier */
  componentKey: string;
  /** Calculation details */
  calculations: {
    /** Target width used in calculation */
    targetWidthUsed_cm: number;
    /** Target length used in calculation */
    targetLengthUsed_cm: number;
    /** Final cast-on stitch count */
    castOnStitches: number;
    /** Total row count */
    totalRows: number;
    /** Actual calculated width after adjustments */
    actualCalculatedWidth_cm: number;
    /** Actual calculated length after adjustments */
    actualCalculatedLength_cm: number;
    /** Raw stitch count before adjustments */
    rawStitchCount?: number;
    /** Number of pattern repeats */
    patternRepeats?: number;
  };
  /** Calculation errors */
  errors: string[];
  /** Calculation warnings */
  warnings: string[];
}

/**
 * Calculates stitch and row counts for a rectangular garment piece
 * Implements the core formulas from PDF Section 4.1
 * 
 * @param input - Rectangular piece input data
 * @returns Detailed calculation result
 */
export function calculateRectangularPiece(input: RectangularPieceInput): RectangularPieceCalculation {
  const { targetWidth_cm, targetLength_cm, gauge, stitchPattern, componentKey } = input;
  
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate input
  if (targetWidth_cm <= 0) {
    errors.push('Target width must be greater than 0');
  }
  if (targetLength_cm <= 0) {
    errors.push('Target length must be greater than 0');
  }
  if (gauge.stitchesPer10cm <= 0) {
    errors.push('Gauge stitches per 10cm must be greater than 0');
  }
  if (gauge.rowsPer10cm <= 0) {
    errors.push('Gauge rows per 10cm must be greater than 0');
  }

  // Return early if validation fails
  if (errors.length > 0) {
    return {
      componentKey,
      calculations: {
        targetWidthUsed_cm: targetWidth_cm,
        targetLengthUsed_cm: targetLength_cm,
        castOnStitches: 0,
        totalRows: 0,
        actualCalculatedWidth_cm: 0,
        actualCalculatedLength_cm: 0,
      },
      errors,
      warnings,
    };
  }

  // Core calculations (FR2, FR3)
  const rawStitchCount = targetWidth_cm * (gauge.stitchesPer10cm / 10);
  const rawRowCount = targetLength_cm * (gauge.rowsPer10cm / 10);

  // Adjust for stitch pattern repeat (FR4)
  const adjustedStitches = adjustForStitchRepeat(rawStitchCount, stitchPattern, warnings);
  
  // Round rows to nearest whole number
  const totalRows = Math.round(rawRowCount);

  // Calculate actual dimensions based on final stitch/row counts
  const actualWidth = (adjustedStitches.finalStitches / gauge.stitchesPer10cm) * 10;
  const actualLength = (totalRows / gauge.rowsPer10cm) * 10;

  // Add warnings for significant dimension changes
  const widthDifference = Math.abs(actualWidth - targetWidth_cm);
  const lengthDifference = Math.abs(actualLength - targetLength_cm);
  
  if (widthDifference > 1.0) {
    warnings.push(
      `Width adjusted from ${targetWidth_cm}cm to ${actualWidth.toFixed(1)}cm due to stitch pattern repeat`
    );
  }
  
  if (lengthDifference > 0.5) {
    warnings.push(
      `Length adjusted from ${targetLength_cm}cm to ${actualLength.toFixed(1)}cm due to row rounding`
    );
  }

  // Add warnings for unusual values
  if (adjustedStitches.finalStitches > 400) {
    warnings.push('Very wide piece - consider breaking into sections or double-check measurements');
  }
  if (adjustedStitches.finalStitches < 20) {
    warnings.push('Very narrow piece - double-check measurements');
  }
  if (totalRows > 1000) {
    warnings.push('Very long piece - consider breaking into sections or double-check measurements');
  }
  if (totalRows < 10) {
    warnings.push('Very short piece - double-check measurements');
  }

  return {
    componentKey,
    calculations: {
      targetWidthUsed_cm: targetWidth_cm,
      targetLengthUsed_cm: targetLength_cm,
      castOnStitches: adjustedStitches.finalStitches,
      totalRows,
      actualCalculatedWidth_cm: Number(actualWidth.toFixed(2)),
      actualCalculatedLength_cm: Number(actualLength.toFixed(2)),
      rawStitchCount: Number(rawStitchCount.toFixed(1)),
      patternRepeats: adjustedStitches.numRepeats,
    },
    errors,
    warnings,
  };
}

/**
 * Adjusts stitch count for pattern repeat requirements
 * 
 * @param rawStitchCount - Raw calculated stitch count
 * @param stitchPattern - Stitch pattern information
 * @param warnings - Array to add warnings to
 * @returns Adjusted stitch information
 */
function adjustForStitchRepeat(
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
      `to fit ${horizontalRepeat}-stitch ${stitchPattern.name || 'pattern'} repeat`
    );
  }

  return { finalStitches, numRepeats };
}

/**
 * Validates rectangular piece input data
 * 
 * @param input - Input data to validate
 * @returns Validation result
 */
export function validateRectangularPieceInput(input: Partial<RectangularPieceInput>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (typeof input.targetWidth_cm !== 'number') {
    errors.push('targetWidth_cm is required and must be a number');
  } else if (input.targetWidth_cm <= 0) {
    errors.push('targetWidth_cm must be greater than 0');
  } else if (input.targetWidth_cm > 200) {
    warnings.push('targetWidth_cm is unusually large (>200cm)');
  }

  if (typeof input.targetLength_cm !== 'number') {
    errors.push('targetLength_cm is required and must be a number');
  } else if (input.targetLength_cm <= 0) {
    errors.push('targetLength_cm must be greater than 0');
  } else if (input.targetLength_cm > 300) {
    warnings.push('targetLength_cm is unusually large (>300cm)');
  }

  if (!input.gauge) {
    errors.push('gauge is required');
  } else {
    if (typeof input.gauge.stitchesPer10cm !== 'number' || input.gauge.stitchesPer10cm <= 0) {
      errors.push('gauge.stitchesPer10cm must be a positive number');
    }
    if (typeof input.gauge.rowsPer10cm !== 'number' || input.gauge.rowsPer10cm <= 0) {
      errors.push('gauge.rowsPer10cm must be a positive number');
    }
  }

  if (!input.stitchPattern) {
    errors.push('stitchPattern is required');
  } else {
    if (typeof input.stitchPattern.horizontalRepeat !== 'number' || input.stitchPattern.horizontalRepeat < 1) {
      errors.push('stitchPattern.horizontalRepeat must be a positive integer');
    }
  }

  if (!input.componentKey || typeof input.componentKey !== 'string') {
    errors.push('componentKey is required and must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
} 