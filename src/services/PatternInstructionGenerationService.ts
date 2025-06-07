/**
 * Pattern Instruction Generation Service (PD_PH6_US003)
 * Service layer for generating textual knitting/crochet instructions from calculated pattern details
 */

import {
  PatternInstructionGenerationInput,
  PatternInstructionGenerationOptions,
  PatternInstructionGenerationResult
} from '@/types/pattern-instruction-generation';
import { CalculatedPatternDetails } from '@/types/core-pattern-calculation';

/**
 * Service for orchestrating pattern instruction generation
 * Follows the established pattern: Page -> Service -> API -> Engine
 */
export class PatternInstructionGenerationService {
  private baseUrl = '/api/pattern-instruction-generation';

  /**
   * Generate textual instructions from calculated pattern details
   */
  async generateInstructionsFromCalculatedDetails(
    calculatedPatternDetails: CalculatedPatternDetails,
    options?: PatternInstructionGenerationOptions
  ): Promise<{
    success: boolean;
    result?: PatternInstructionGenerationResult;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculatedPatternDetails,
          options: options || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Pattern instruction generation failed');
      }

      return {
        success: true,
        result: result.data
      };
    } catch (error) {
      console.error('Error in pattern instruction generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown instruction generation error'
      };
    }
  }

  /**
   * Generate instructions with validation and error handling
   */
  async generateInstructionsWithValidation(
    calculatedPatternDetails: CalculatedPatternDetails,
    options?: PatternInstructionGenerationOptions
  ): Promise<{
    success: boolean;
    result?: PatternInstructionGenerationResult;
    error?: string;
    validationErrors?: string[];
  }> {
    try {
      // Client-side validation
      const validation = this.validateCalculatedPatternDetails(calculatedPatternDetails);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid calculated pattern details',
          validationErrors: validation.errors
        };
      }

      // Generate instructions
      const result = await this.generateInstructionsFromCalculatedDetails(
        calculatedPatternDetails,
        options
      );

      return result;
    } catch (error) {
      console.error('Error in pattern instruction generation with validation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during instruction generation'
      };
    }
  }

  /**
   * Generate instructions for a specific piece only
   */
  async generatePieceInstructions(
    calculatedPatternDetails: CalculatedPatternDetails,
    pieceKey: string,
    options?: PatternInstructionGenerationOptions
  ): Promise<{
    success: boolean;
    result?: PatternInstructionGenerationResult;
    error?: string;
  }> {
    try {
      // Create a filtered pattern details with only the requested piece
      if (!calculatedPatternDetails.pieces[pieceKey]) {
        throw new Error(`Piece "${pieceKey}" not found in calculated pattern details`);
      }

      const filteredPatternDetails: CalculatedPatternDetails = {
        ...calculatedPatternDetails,
        pieces: {
          [pieceKey]: calculatedPatternDetails.pieces[pieceKey]
        }
      };

      return await this.generateInstructionsFromCalculatedDetails(
        filteredPatternDetails,
        options
      );
    } catch (error) {
      console.error('Error in piece instruction generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during piece instruction generation'
      };
    }
  }

  /**
   * Get available instruction generation options with defaults
   */
  getDefaultOptions(craftType: 'knitting' | 'crochet'): PatternInstructionGenerationOptions {
    return {
      includeStitchCounts: true,
      includeRowNumbers: true,
      useStandardAbbreviations: true,
      language: 'en',
      detailLevel: 'standard',
      includeShapingDetails: true,
      includeConstructionNotes: true
    };
  }

  /**
   * Validate calculated pattern details before sending to API
   */
  private validateCalculatedPatternDetails(
    calculatedPatternDetails: CalculatedPatternDetails
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate pattern info
    if (!calculatedPatternDetails.patternInfo) {
      errors.push('Pattern info is required');
    } else {
      const { patternInfo } = calculatedPatternDetails;
      
      if (!patternInfo.craftType || !['knitting', 'crochet'].includes(patternInfo.craftType)) {
        errors.push('Valid craft type (knitting or crochet) is required');
      }
      
      if (!patternInfo.garmentType || patternInfo.garmentType.trim() === '') {
        errors.push('Garment type is required');
      }
      
      if (!patternInfo.sessionId || patternInfo.sessionId.trim() === '') {
        errors.push('Session ID is required');
      }
    }

    // Validate pieces
    if (!calculatedPatternDetails.pieces || Object.keys(calculatedPatternDetails.pieces).length === 0) {
      errors.push('At least one pattern piece is required');
    } else {
      for (const [pieceKey, pieceDetails] of Object.entries(calculatedPatternDetails.pieces)) {
        const pieceErrors = this.validatePieceDetails(pieceKey, pieceDetails);
        errors.push(...pieceErrors);
      }
    }

    // Check for errors in calculated pattern details
    if (calculatedPatternDetails.errors && calculatedPatternDetails.errors.length > 0) {
      errors.push('Calculated pattern contains errors that must be resolved before generating instructions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate individual piece details
   */
  private validatePieceDetails(
    pieceKey: string,
    pieceDetails: any
  ): string[] {
    const errors: string[] = [];
    const prefix = `Piece "${pieceKey}":`;

    if (!pieceDetails.displayName || pieceDetails.displayName.trim() === '') {
      errors.push(`${prefix} Display name is required`);
    }

    if (!pieceDetails.castOnStitches || pieceDetails.castOnStitches <= 0) {
      errors.push(`${prefix} Cast on stitches must be a positive number`);
    }

    if (!pieceDetails.lengthInRows || pieceDetails.lengthInRows <= 0) {
      errors.push(`${prefix} Length in rows must be a positive number`);
    }

    if (!pieceDetails.finalStitchCount || pieceDetails.finalStitchCount <= 0) {
      errors.push(`${prefix} Final stitch count must be a positive number`);
    }

    if (!pieceDetails.finishedDimensions) {
      errors.push(`${prefix} Finished dimensions are required`);
    } else {
      const { finishedDimensions } = pieceDetails;
      
      if (!finishedDimensions.width_cm || finishedDimensions.width_cm <= 0) {
        errors.push(`${prefix} Finished width must be a positive number`);
      }
      
      if (!finishedDimensions.length_cm || finishedDimensions.length_cm <= 0) {
        errors.push(`${prefix} Finished length must be a positive number`);
      }
    }

    return errors;
  }

  /**
   * Format validation errors for user display
   */
  formatValidationErrors(errors: string[]): string {
    if (errors.length === 0) {
      return '';
    }
    
    if (errors.length === 1) {
      return `Validation error: ${errors[0]}`;
    }
    
    return `Validation errors:\n${errors.map(error => `• ${error}`).join('\n')}`;
  }

  /**
   * Extract piece keys from calculated pattern details
   */
  getAvailablePieceKeys(calculatedPatternDetails: CalculatedPatternDetails): string[] {
    return Object.keys(calculatedPatternDetails.pieces || {});
  }

  /**
   * Get pattern summary for display
   */
  getPatternSummary(calculatedPatternDetails: CalculatedPatternDetails): {
    garmentType: string;
    craftType: string;
    pieceCount: number;
    pieceNames: string[];
    totalStitches: number;
    totalRows: number;
  } {
    const { patternInfo, pieces } = calculatedPatternDetails;
    
    const pieceNames = Object.values(pieces).map(piece => piece.displayName);
    const totalStitches = Object.values(pieces).reduce((sum, piece) => sum + piece.castOnStitches, 0);
    const totalRows = Object.values(pieces).reduce((sum, piece) => sum + piece.lengthInRows, 0);
    
    return {
      garmentType: patternInfo.garmentType,
      craftType: patternInfo.craftType,
      pieceCount: Object.keys(pieces).length,
      pieceNames,
      totalStitches,
      totalRows
    };
  }
} 