/**
 * Base Calculator Class (PD_PH6_US002)
 * Abstract base class for all pattern calculation modules
 */

import {
  BaseCalculator as IBaseCalculator,
  CalculationContext,
  CalculatorResult,
  ValidationResult
} from '@/types/core-pattern-calculation';

/**
 * Abstract base class for pattern calculators
 * Provides common functionality and enforces interface compliance
 */
export abstract class BaseCalculator implements IBaseCalculator {
  abstract readonly calculatorType: string;

  /**
   * Main calculation method - must be implemented by each calculator
   */
  abstract calculate(context: CalculationContext): Promise<CalculatorResult>;

  /**
   * Validate input for this calculator - can be overridden by subclasses
   */
  validateInput(context: CalculationContext): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingData: string[] = [];

    // Common validation
    if (!context.sessionId) {
      errors.push('Session ID is required');
    }

    if (!context.gauge) {
      errors.push('Gauge information is required');
    }

    if (!context.finishedMeasurements) {
      errors.push('Finished measurements are required');
    }

    if (!context.patternState) {
      errors.push('Pattern state is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingData
    };
  }

  /**
   * Get dependencies on other calculators - can be overridden by subclasses
   */
  getDependencies(): string[] {
    return [];
  }

  /**
   * Utility method to convert cm to stitches
   */
  protected cmToStitches(cm: number, stitchesPerCm: number): number {
    return Math.round(cm * stitchesPerCm);
  }

  /**
   * Utility method to convert cm to rows
   */
  protected cmToRows(cm: number, rowsPerCm: number): number {
    return Math.round(cm * rowsPerCm);
  }

  /**
   * Utility method to create a successful result
   */
  protected createSuccessResult(pieces: Record<string, any>, warnings?: string[]): CalculatorResult {
    return {
      success: true,
      pieces,
      warnings
    };
  }

  /**
   * Utility method to create an error result
   */
  protected createErrorResult(errors: string[], warnings?: string[]): CalculatorResult {
    return {
      success: false,
      pieces: {},
      errors,
      warnings
    };
  }

  /**
   * Utility method to round to precision
   */
  protected roundToPrecision(value: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) / factor;
  }
} 