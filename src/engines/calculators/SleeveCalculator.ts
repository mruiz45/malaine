/**
 * Sleeve Calculator (PD_PH6_US002)
 * Calculates sleeve pieces for sweaters and cardigans
 */

import {
  CalculationContext,
  CalculatorResult,
  ValidationResult,
  CalculatedPieceDetails,
  ShapingInstruction
} from '@/types/core-pattern-calculation';
import { BaseCalculator } from '../core/BaseCalculator';

/**
 * Calculator for sleeve pieces
 */
export class SleeveCalculator extends BaseCalculator {
  readonly calculatorType = 'sleeve';

  /**
   * Calculate sleeve pieces
   */
  async calculate(context: CalculationContext): Promise<CalculatorResult> {
    try {
      const pieces: Record<string, CalculatedPieceDetails> = {};
      const warnings: string[] = [];

      // Validate we have a sweater/cardigan type garment
      const garmentType = context.patternState.garmentType?.toLowerCase();
      if (!garmentType || !['sweater', 'cardigan'].includes(garmentType)) {
        return this.createErrorResult(['Sleeve calculator only applies to sweaters and cardigans']);
      }

      // Check if sleeves are required
      const sleeveStyle = context.patternState.sleeves?.style;
      if (!sleeveStyle || sleeveStyle === 'sleeveless') {
        return this.createSuccessResult({}, ['No sleeves required for this garment']);
      }

      // Calculate left sleeve
      const leftSleeve = await this.calculateSleeve(context, 'left');
      if (leftSleeve) {
        pieces.leftSleeve = leftSleeve;
      }

      // Calculate right sleeve (typically identical to left)
      const rightSleeve = await this.calculateSleeve(context, 'right');
      if (rightSleeve) {
        pieces.rightSleeve = rightSleeve;
      }

      return this.createSuccessResult(pieces, warnings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sleeve calculation error';
      return this.createErrorResult([errorMessage]);
    }
  }

  /**
   * Validate input specific to sleeve calculations
   */
  validateInput(context: CalculationContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const missingData = [...baseValidation.missingData];

    // Check for required measurements
    const requiredMeasurements = ['armLength', 'upperArmCircumference'];
    requiredMeasurements.forEach(measurement => {
      if (!context.finishedMeasurements[measurement]) {
        missingData.push(`${measurement} measurement`);
      }
    });

    // Check for sleeve information
    if (!context.patternState.sleeves) {
      warnings.push('No sleeve information specified - using default construction');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Get dependencies - sleeves depend on body calculations for armhole compatibility
   */
  getDependencies(): string[] {
    return ['body'];
  }

  /**
   * Calculate individual sleeve piece
   */
  private async calculateSleeve(
    context: CalculationContext, 
    side: 'left' | 'right'
  ): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements with defaults
    const armLength = finishedMeasurements.armLength || 60; // Default 60cm
    const upperArmCircumference = finishedMeasurements.upperArmCircumference || 30; // Default 30cm
    const wristCircumference = finishedMeasurements.wristCircumference || 20; // Default 20cm

    // Calculate basic dimensions
    const sleeveLength = this.calculateSleeveLength(context, armLength);
    const upperArmWidth = upperArmCircumference;
    const wristWidth = wristCircumference;

    // Calculate stitch counts
    const upperArmStitches = this.cmToStitches(upperArmWidth, gauge.stitchesPerCm);
    const wristStitches = this.cmToStitches(wristWidth, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(sleeveLength, gauge.rowsPerCm);

    // Calculate shaping
    const shaping = this.calculateSleeveShaping(
      wristStitches,
      upperArmStitches,
      lengthInRows,
      gauge
    );

    // Calculate final stitch count (should be upper arm stitches)
    const finalStitchCount = upperArmStitches;

    return {
      pieceKey: `${side}Sleeve`,
      displayName: `${side.charAt(0).toUpperCase() + side.slice(1)} Sleeve`,
      castOnStitches: wristStitches,
      lengthInRows,
      finalStitchCount,
      finishedDimensions: {
        width_cm: upperArmWidth,
        length_cm: sleeveLength
      },
      shaping,
      stitchCountsAtRows: this.calculateStitchCountsAtRows(wristStitches, shaping),
      constructionNotes: [
        'Cast on stitches at cuff',
        'Work sleeve shaping as indicated',
        'End with sleeve cap shaping'
      ]
    };
  }

  /**
   * Calculate sleeve length based on style
   */
  private calculateSleeveLength(context: CalculationContext, armLength: number): number {
    const sleeveStyle = context.patternState.sleeves;
    
    if (sleeveStyle?.length) {
      switch (sleeveStyle.length) {
        case 'short':
          return armLength * 0.3; // 30% of arm length
        case 'three-quarter':
          return armLength * 0.75; // 75% of arm length
        case 'long':
          return armLength * 0.95; // 95% of arm length
        case 'custom':
          return sleeveStyle.customLength || armLength;
        default:
          return armLength * 0.95; // Default to long
      }
    }
    
    return armLength * 0.95; // Default to long sleeve
  }

  /**
   * Calculate sleeve shaping instructions
   */
  private calculateSleeveShaping(
    wristStitches: number,
    upperArmStitches: number,
    lengthInRows: number,
    gauge: { stitchesPerCm: number; rowsPerCm: number }
  ): ShapingInstruction[] {
    const shaping: ShapingInstruction[] = [];

    // Calculate sleeve increases
    const stitchIncrease = upperArmStitches - wristStitches;
    if (stitchIncrease > 0) {
      // Calculate shaping from cuff to underarm
      const shapingLength = Math.round(lengthInRows * 0.8); // Use 80% of length for shaping
      const increasesNeeded = Math.round(stitchIncrease / 2); // Increases are done on both sides
      const frequency = Math.max(4, Math.round(shapingLength / increasesNeeded));

      shaping.push({
        type: 'sleeveShaping',
        instruction: `Inc 1 st each end every ${frequency} rows, ${increasesNeeded} times`,
        startRow: 10, // Start after cuff ribbing
        endRow: 10 + (increasesNeeded * frequency),
        stitchCountChange: stitchIncrease,
        frequency,
        repetitions: increasesNeeded,
        notes: ['Increase for sleeve taper']
      });
    }

    // Add sleeve cap shaping
    const sleeveCapStartRow = Math.round(lengthInRows * 0.85);
    const sleeveCapStitches = Math.round(upperArmStitches * 0.3); // 30% of stitches for cap

    shaping.push({
      type: 'sleeveCap',
      instruction: `Bind off ${Math.round(sleeveCapStitches/6)} sts at beg of next 2 rows, then dec 1 st each end every RS row ${Math.round(sleeveCapStitches/3)} times`,
      startRow: sleeveCapStartRow,
      endRow: lengthInRows,
      stitchCountChange: -sleeveCapStitches,
      notes: ['Basic sleeve cap shaping for set-in sleeve']
    });

    return shaping;
  }

  /**
   * Calculate stitch counts at key rows
   */
  private calculateStitchCountsAtRows(
    castOnStitches: number,
    shaping: ShapingInstruction[]
  ): Record<number, number> {
    const stitchCounts: Record<number, number> = {};
    let currentStitches = castOnStitches;

    // Add cast on count
    stitchCounts[0] = castOnStitches;

    // Track changes through shaping
    shaping.forEach(shape => {
      stitchCounts[shape.startRow] = currentStitches;
      currentStitches += shape.stitchCountChange;
      stitchCounts[shape.endRow] = currentStitches;
    });

    return stitchCounts;
  }
} 