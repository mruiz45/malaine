/**
 * Accessory Calculator (PD_PH6_US002)
 * Calculates accessory pieces for hats, scarves, shawls
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
 * Calculator for accessory pieces
 */
export class AccessoryCalculator extends BaseCalculator {
  readonly calculatorType = 'accessory';

  /**
   * Calculate accessory pieces
   */
  async calculate(context: CalculationContext): Promise<CalculatorResult> {
    try {
      const pieces: Record<string, CalculatedPieceDetails> = {};
      const warnings: string[] = [];

      // Validate we have an accessory type garment
      const garmentType = context.patternState.garmentType?.toLowerCase();
      if (!garmentType || !['hat', 'beanie', 'scarf', 'shawl'].includes(garmentType)) {
        return this.createErrorResult(['Accessory calculator only applies to hats, beanies, scarves, and shawls']);
      }

      // Calculate based on accessory type
      switch (garmentType) {
        case 'hat':
        case 'beanie':
          const hat = await this.calculateHat(context);
          if (hat) pieces.hat = hat;
          break;
        
        case 'scarf':
          const scarf = await this.calculateScarf(context);
          if (scarf) pieces.scarf = scarf;
          break;
        
        case 'shawl':
          const shawl = await this.calculateShawl(context);
          if (shawl) pieces.shawl = shawl;
          break;
      }

      return this.createSuccessResult(pieces, warnings);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Accessory calculation error';
      return this.createErrorResult([errorMessage]);
    }
  }

  /**
   * Validate input specific to accessory calculations
   */
  validateInput(context: CalculationContext): ValidationResult {
    const baseValidation = super.validateInput(context);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];
    const missingData = [...baseValidation.missingData];

    const garmentType = context.patternState.garmentType?.toLowerCase();

    // Check for type-specific measurements
    switch (garmentType) {
      case 'hat':
      case 'beanie':
        if (!context.finishedMeasurements.headCircumference) {
          missingData.push('headCircumference measurement');
        }
        break;
      
      case 'scarf':
        if (!context.finishedMeasurements.scarfLength) {
          warnings.push('No scarf length specified - using default');
        }
        break;
      
      case 'shawl':
        if (!context.finishedMeasurements.shawlWidth) {
          warnings.push('No shawl width specified - using default');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Calculate hat/beanie piece
   */
  private async calculateHat(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements with defaults
    const headCircumference = finishedMeasurements.headCircumference || 56; // Default 56cm
    const hatHeight = finishedMeasurements.hatHeight || 20; // Default 20cm

    // Calculate basic dimensions
    const castOnStitches = this.cmToStitches(headCircumference, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(hatHeight, gauge.rowsPerCm);

    // Calculate crown shaping
    const shaping = this.calculateHatShaping(castOnStitches, lengthInRows);

    return {
      pieceKey: 'hat',
      displayName: 'Hat',
      castOnStitches,
      lengthInRows,
      finalStitchCount: 0, // Closed at top
      finishedDimensions: {
        width_cm: headCircumference,
        length_cm: hatHeight,
        circumference_cm: headCircumference
      },
      shaping,
      stitchCountsAtRows: this.calculateStitchCountsAtRows(castOnStitches, shaping),
      constructionNotes: [
        'Cast on stitches for brim',
        'Work in the round',
        'Shape crown as indicated'
      ]
    };
  }

  /**
   * Calculate scarf piece
   */
  private async calculateScarf(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements with defaults
    const scarfLength = finishedMeasurements.scarfLength || 150; // Default 150cm
    const scarfWidth = finishedMeasurements.scarfWidth || 20; // Default 20cm

    // Calculate basic dimensions
    const castOnStitches = this.cmToStitches(scarfWidth, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(scarfLength, gauge.rowsPerCm);

    // No shaping needed for basic scarf
    const shaping: ShapingInstruction[] = [];

    return {
      pieceKey: 'scarf',
      displayName: 'Scarf',
      castOnStitches,
      lengthInRows,
      finalStitchCount: castOnStitches,
      finishedDimensions: {
        width_cm: scarfWidth,
        length_cm: scarfLength
      },
      shaping,
      constructionNotes: [
        'Cast on stitches for scarf width',
        'Work in chosen stitch pattern',
        'Bind off when desired length is reached'
      ]
    };
  }

  /**
   * Calculate shawl piece
   */
  private async calculateShawl(context: CalculationContext): Promise<CalculatedPieceDetails> {
    const { gauge, finishedMeasurements } = context;
    
    // Get measurements with defaults
    const shawlWidth = finishedMeasurements.shawlWidth || 120; // Default 120cm
    const shawlLength = finishedMeasurements.shawlLength || 60; // Default 60cm

    // For triangular shawl - start small and increase
    const startingStitches = 3; // Typical triangular shawl start
    const finalStitches = this.cmToStitches(shawlWidth, gauge.stitchesPerCm);
    const lengthInRows = this.cmToRows(shawlLength, gauge.rowsPerCm);

    // Calculate triangular shaping
    const shaping = this.calculateShawlShaping(startingStitches, finalStitches, lengthInRows);

    return {
      pieceKey: 'shawl',
      displayName: 'Triangular Shawl',
      castOnStitches: startingStitches,
      lengthInRows,
      finalStitchCount: finalStitches,
      finishedDimensions: {
        width_cm: shawlWidth,
        length_cm: shawlLength
      },
      shaping,
      stitchCountsAtRows: this.calculateStitchCountsAtRows(startingStitches, shaping),
      constructionNotes: [
        'Cast on 3 stitches',
        'Increase as indicated to create triangular shape',
        'Add lace pattern if desired'
      ]
    };
  }

  /**
   * Calculate hat crown shaping
   */
  private calculateHatShaping(castOnStitches: number, lengthInRows: number): ShapingInstruction[] {
    const shaping: ShapingInstruction[] = [];

    // Crown shaping starts at about 80% of total height
    const crownStartRow = Math.round(lengthInRows * 0.8);
    const crownRows = lengthInRows - crownStartRow;
    
    // Divide stitches into 6-8 sections for crown decreases
    const sections = 6;
    const decreasesPerRound = sections;
    const totalDecreases = castOnStitches - sections; // Leave a few stitches at top
    const decreaseRounds = Math.round(totalDecreases / decreasesPerRound);

    shaping.push({
      type: 'custom',
      instruction: `Dec ${decreasesPerRound} sts evenly every round, ${decreaseRounds} times`,
      startRow: crownStartRow,
      endRow: lengthInRows,
      stitchCountChange: -totalDecreases,
      frequency: 1,
      repetitions: decreaseRounds,
      notes: ['Crown shaping for hat']
    });

    return shaping;
  }

  /**
   * Calculate triangular shawl shaping
   */
  private calculateShawlShaping(
    startingStitches: number,
    finalStitches: number,
    lengthInRows: number
  ): ShapingInstruction[] {
    const shaping: ShapingInstruction[] = [];

    const totalIncrease = finalStitches - startingStitches;
    const increasesPerRow = 2; // Typical for triangular shawl (one each side)
    const increaseFrequency = Math.max(2, Math.round(lengthInRows / (totalIncrease / increasesPerRow)));

    shaping.push({
      type: 'custom',
      instruction: `Inc 1 st each end every ${increaseFrequency} rows`,
      startRow: 1,
      endRow: lengthInRows,
      stitchCountChange: totalIncrease,
      frequency: increaseFrequency,
      repetitions: Math.round(totalIncrease / increasesPerRow),
      notes: ['Triangular shaping increases']
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