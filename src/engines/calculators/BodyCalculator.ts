/**
 * Body Calculator (PD_PH6_US002)
 * Calculates body pieces for sweaters and cardigans
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
 * Calculator for body pieces (front, back, and optionally sides)
 */
export class BodyCalculator extends BaseCalculator {
  readonly calculatorType = 'body';

  /**
   * Calculate body pieces
   */
  async calculate(context: CalculationContext): Promise<CalculatorResult> {
    try {
      const pieces: Record<string, CalculatedPieceDetails> = {};
      const warnings: string[] = [];

      // Validate we have a sweater/cardigan type garment
      const garmentType = context.patternState.garmentType?.toLowerCase();
      if (!garmentType || !['sweater', 'cardigan'].includes(garmentType)) {
        return this.createErrorResult(['Body calculator only applies to sweaters and cardigans']);
      }

      // Calculate front body
      const frontBody = await this.calculateFrontBody(context);
      if (frontBody) {
        pieces.frontBody = frontBody;
      }

      // Calculate back body
      const backBody = await this.calculateBackBody(context);
      if (backBody) {
        pieces.backBody = backBody;
      }

      // Add warnings for interdependencies
      if (context.patternState.bodyStructure?.parameters?.armholeRequiresRecalculation) {
        warnings.push('Armhole calculations may need adjustment based on sleeve type');
      }

      return this.createSuccessResult(pieces, warnings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Body calculation error';
      return this.createErrorResult([errorMessage]);
    }
  }

  /**
   * Validate input specific to body calculations
   */
  validateInput(context: CalculationContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const missingData = [...baseValidation.missingData];

    // Check for required measurements
    const requiredMeasurements = ['bust', 'length', 'waist'];
    requiredMeasurements.forEach(measurement => {
      if (!context.finishedMeasurements[measurement]) {
        missingData.push(`${measurement} measurement`);
      }
    });

    // Check for body structure information
    if (!context.patternState.bodyStructure) {
      warnings.push('No body structure specified - using default construction');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Calculate front body piece
   */
  private async calculateFrontBody(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements
    const bustCircumference = finishedMeasurements.bust || 90; // Default 90cm
    const bodyLength = finishedMeasurements.length || 60; // Default 60cm
    const waistCircumference = finishedMeasurements.waist || bustCircumference;

    // Calculate basic dimensions
    const frontWidth = bustCircumference / 2; // Front is half of total circumference
    const castOnStitches = this.cmToStitches(frontWidth, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(bodyLength, gauge.rowsPerCm);

    // Calculate shaping
    const shaping = this.calculateBodyShaping(
      castOnStitches,
      lengthInRows,
      bustCircumference,
      waistCircumference,
      gauge
    );

    // Calculate final stitch count after shaping
    const finalStitchCount = this.calculateFinalStitchCount(castOnStitches, shaping);

    return {
      pieceKey: 'frontBody',
      displayName: 'Front Body',
      castOnStitches,
      lengthInRows,
      finalStitchCount,
      finishedDimensions: {
        width_cm: frontWidth,
        length_cm: bodyLength
      },
      shaping,
      stitchCountsAtRows: this.calculateStitchCountsAtRows(castOnStitches, shaping),
      constructionNotes: [
        'Cast on stitches at hem',
        'Work body shaping as indicated',
        'End with armhole shaping'
      ]
    };
  }

  /**
   * Calculate back body piece
   */
  private async calculateBackBody(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements
    const bustCircumference = finishedMeasurements.bust || 90;
    const bodyLength = finishedMeasurements.length || 60;
    const waistCircumference = finishedMeasurements.waist || bustCircumference;

    // Back is typically same as front for basic sweaters
    const backWidth = bustCircumference / 2;
    const castOnStitches = this.cmToStitches(backWidth, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(bodyLength, gauge.rowsPerCm);

    // Calculate shaping (same as front for basic construction)
    const shaping = this.calculateBodyShaping(
      castOnStitches,
      lengthInRows,
      bustCircumference,
      waistCircumference,
      gauge
    );

    const finalStitchCount = this.calculateFinalStitchCount(castOnStitches, shaping);

    return {
      pieceKey: 'backBody',
      displayName: 'Back Body',
      castOnStitches,
      lengthInRows,
      finalStitchCount,
      finishedDimensions: {
        width_cm: backWidth,
        length_cm: bodyLength
      },
      shaping,
      stitchCountsAtRows: this.calculateStitchCountsAtRows(castOnStitches, shaping),
      constructionNotes: [
        'Cast on stitches at hem',
        'Work body shaping as indicated',
        'End with armhole shaping'
      ]
    };
  }

  /**
   * Calculate body shaping instructions
   */
  private calculateBodyShaping(
    castOnStitches: number,
    lengthInRows: number,
    bustCircumference: number,
    waistCircumference: number,
    gauge: { stitchesPerCm: number; rowsPerCm: number }
  ): ShapingInstruction[] {
    const shaping: ShapingInstruction[] = [];

    // Only add waist shaping if there's a significant difference
    const waistDifference = bustCircumference - waistCircumference;
    if (Math.abs(waistDifference) > 2) { // More than 2cm difference
      const stitchDifference = Math.round(waistDifference * gauge.stitchesPerCm / 2); // Divide by 2 for front piece
      
      if (waistDifference > 0) { // Waist is smaller - need decreases
        const waistStartRow = Math.round(lengthInRows * 0.25); // Start shaping at 25% of length
        const waistEndRow = Math.round(lengthInRows * 0.75); // End shaping at 75% of length
        const shapingRows = waistEndRow - waistStartRow;
        const frequency = Math.max(4, Math.round(shapingRows / Math.abs(stitchDifference)));

        shaping.push({
          type: 'waistDecrease',
          instruction: `Dec 1 st each end every ${frequency} rows, ${Math.abs(stitchDifference)} times`,
          startRow: waistStartRow,
          endRow: waistEndRow,
          stitchCountChange: -Math.abs(stitchDifference) * 2, // Both ends
          frequency,
          repetitions: Math.abs(stitchDifference),
          notes: ['Decrease for waist shaping']
        });
      }
    }

    // Add armhole shaping (basic)
    const armholeStartRow = Math.round(lengthInRows * 0.75);
    const armholeStitches = Math.round(castOnStitches * 0.1); // 10% of stitches for armhole

    shaping.push({
      type: 'armhole',
      instruction: `Bind off ${Math.round(armholeStitches/4)} sts at beg of next 2 rows, then dec 1 st each end every RS row ${Math.round(armholeStitches/4)} times`,
      startRow: armholeStartRow,
      endRow: lengthInRows,
      stitchCountChange: -armholeStitches,
      notes: ['Basic armhole shaping']
    });

    return shaping;
  }

  /**
   * Calculate final stitch count after all shaping
   */
  private calculateFinalStitchCount(castOnStitches: number, shaping: ShapingInstruction[]): number {
    return shaping.reduce((count, shape) => count + shape.stitchCountChange, castOnStitches);
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