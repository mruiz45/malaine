/**
 * Neckline Shaping Calculator (PD_PH6_US002)
 * Calculates neckline shaping for sweaters and cardigans
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
 * Calculator for neckline shaping
 */
export class NecklineShapingCalculator extends BaseCalculator {
  readonly calculatorType = 'neckline';

  /**
   * Calculate neckline shaping
   */
  async calculate(context: CalculationContext): Promise<CalculatorResult> {
    try {
      const pieces: Record<string, CalculatedPieceDetails> = {};
      const warnings: string[] = [];

      // Validate we have a sweater/cardigan type garment
      const garmentType = context.patternState.garmentType?.toLowerCase();
      if (!garmentType || !['sweater', 'cardigan'].includes(garmentType)) {
        return this.createErrorResult(['Neckline calculator only applies to sweaters and cardigans']);
      }

      // Check if neckline shaping is needed
      const necklineStyle = context.patternState.neckline?.style;
      if (!necklineStyle || necklineStyle === 'none') {
        return this.createSuccessResult({}, ['No neckline shaping required']);
      }

      // Calculate neckline shaping
      const necklineShaping = await this.calculateNecklineShaping(context);
      if (necklineShaping) {
        pieces.necklineShaping = necklineShaping;
      }

      return this.createSuccessResult(pieces, warnings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Neckline calculation error';
      return this.createErrorResult([errorMessage]);
    }
  }

  /**
   * Validate input specific to neckline calculations
   */
  validateInput(context: CalculationContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const missingData = [...baseValidation.missingData];

    // Check for neck circumference measurement
    if (!context.finishedMeasurements.neckCircumference) {
      missingData.push('neckCircumference measurement');
    }

    // Check for neckline information
    if (!context.patternState.neckline) {
      warnings.push('No neckline information specified - using default round neck');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Get dependencies - neckline depends on body calculations
   */
  getDependencies(): string[] {
    return ['body'];
  }

  /**
   * Calculate neckline shaping piece
   */
  private async calculateNecklineShaping(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements with defaults
    const neckCircumference = finishedMeasurements.neckCircumference || 36; // Default 36cm
    const shoulderWidth = finishedMeasurements.shoulderWidth || 40; // Default 40cm

    // Calculate neckline dimensions based on style
    const necklineStyle = context.patternState.neckline?.style || 'round';
    const { neckWidth, neckDepth } = this.calculateNecklineDimensions(
      necklineStyle,
      neckCircumference,
      shoulderWidth
    );

    // Calculate stitch counts
    const neckWidthStitches = this.cmToStitches(neckWidth, gauge.stitchesPerCm);
    const neckDepthRows = this.cmToRows(neckDepth, gauge.rowsPerCm);

    // Calculate shaping based on neckline style
    const shaping = this.calculateNecklineShapingInstructions(
      necklineStyle,
      neckWidthStitches,
      neckDepthRows,
      gauge
    );

    return {
      pieceKey: 'necklineShaping',
      displayName: `${necklineStyle.charAt(0).toUpperCase() + necklineStyle.slice(1)} Neckline`,
      castOnStitches: 0, // Neckline is shaped, not cast on
      lengthInRows: neckDepthRows,
      finalStitchCount: 0, // All stitches are bound off or decreased
      finishedDimensions: {
        width_cm: neckWidth,
        length_cm: neckDepth
      },
      shaping,
      constructionNotes: [
        'Neckline shaping is worked from the shoulder down',
        'Follow shaping instructions for selected neckline style',
        'Pick up stitches around neckline for collar or neckband'
      ]
    };
  }

  /**
   * Calculate neckline dimensions based on style
   */
  private calculateNecklineDimensions(
    style: string,
    neckCircumference: number,
    shoulderWidth: number
  ): { neckWidth: number; neckDepth: number } {
    switch (style.toLowerCase()) {
      case 'round':
        return {
          neckWidth: neckCircumference * 0.3, // 30% of neck circumference for width
          neckDepth: neckCircumference * 0.15 // 15% of neck circumference for depth
        };
      
      case 'v-neck':
        return {
          neckWidth: neckCircumference * 0.25, // Narrower than round
          neckDepth: neckCircumference * 0.25 // Deeper than round
        };
      
      case 'crew':
        return {
          neckWidth: neckCircumference * 0.28,
          neckDepth: neckCircumference * 0.12 // Shallower than round
        };
      
      case 'scoop':
        return {
          neckWidth: neckCircumference * 0.35, // Wider than round
          neckDepth: neckCircumference * 0.18
        };
      
      default: // Default to round
        return {
          neckWidth: neckCircumference * 0.3,
          neckDepth: neckCircumference * 0.15
        };
    }
  }

  /**
   * Calculate neckline shaping instructions
   */
  private calculateNecklineShapingInstructions(
    style: string,
    neckWidthStitches: number,
    neckDepthRows: number,
    gauge: { stitchesPerCm: number; rowsPerCm: number }
  ): ShapingInstruction[] {
    const shaping: ShapingInstruction[] = [];

    switch (style.toLowerCase()) {
      case 'round':
        // Round neckline: bind off center stitches, then decrease gradually
        const centerBindOff = Math.round(neckWidthStitches * 0.4); // 40% center
        const sideDecreases = Math.round((neckWidthStitches - centerBindOff) / 2);

        shaping.push({
          type: 'neckline',
          instruction: `Bind off center ${centerBindOff} sts`,
          startRow: 0,
          endRow: 0,
          stitchCountChange: -centerBindOff,
          notes: ['Bind off center stitches for round neckline']
        });

        if (sideDecreases > 0) {
          shaping.push({
            type: 'neckline',
            instruction: `Dec 1 st at neck edge every RS row ${sideDecreases} times`,
            startRow: 1,
            endRow: sideDecreases * 2,
            stitchCountChange: -sideDecreases * 2, // Both sides
            frequency: 2,
            repetitions: sideDecreases,
            notes: ['Shape sides of round neckline']
          });
        }
        break;

      case 'v-neck':
        // V-neck: gradual decreases from center
        const totalDecreases = Math.round(neckWidthStitches / 2);
        const decreaseFrequency = Math.max(2, Math.round(neckDepthRows / totalDecreases));

        shaping.push({
          type: 'neckline',
          instruction: `Dec 1 st at center every ${decreaseFrequency} rows ${totalDecreases} times`,
          startRow: 0,
          endRow: totalDecreases * decreaseFrequency,
          stitchCountChange: -neckWidthStitches,
          frequency: decreaseFrequency,
          repetitions: totalDecreases,
          notes: ['V-neck shaping from center outward']
        });
        break;

      default:
        // Default to round neckline shaping
        const defaultCenterBindOff = Math.round(neckWidthStitches * 0.4);
        shaping.push({
          type: 'neckline',
          instruction: `Bind off center ${defaultCenterBindOff} sts, then dec 1 st at neck edge every RS row`,
          startRow: 0,
          endRow: neckDepthRows,
          stitchCountChange: -neckWidthStitches,
          notes: ['Default neckline shaping']
        });
        break;
    }

    return shaping;
  }
} 