/**
 * Pattern Instruction Generation API (PD_PH6_US003)
 * Generates textual knitting/crochet instructions from calculated pattern details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { PatternInstructionEngine } from '@/engines/instruction/PatternInstructionEngine';
import { 
  PatternInstructionGenerationInput,
  PatternInstructionGenerationOptions,
  PatternInstructionGenerationResult 
} from '@/types/pattern-instruction-generation';
import { CalculatedPatternDetails } from '@/types/core-pattern-calculation';

/**
 * POST /api/pattern-instruction-generation/generate
 * Generate textual instructions from calculated pattern details
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const session = await getSupabaseSessionAppRouter(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { calculatedPatternDetails, options } = body as {
      calculatedPatternDetails: CalculatedPatternDetails;
      options?: PatternInstructionGenerationOptions;
    };

    // Step 3: Validate input
    const validation = validateInput(calculatedPatternDetails, options);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data', 
          validationErrors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Step 4: Initialize instruction engine
    const instructionEngine = new PatternInstructionEngine();

    // Step 5: Generate instructions
    const input: PatternInstructionGenerationInput = {
      calculatedPatternDetails,
      options: options || {}
    };

    const result = await instructionEngine.generateInstructions(input);

    // Step 6: Return response
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Instruction generation failed',
          details: result.errors
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in pattern instruction generation API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during instruction generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate API input
 */
function validateInput(
  calculatedPatternDetails: any,
  options?: any
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate calculatedPatternDetails
  if (!calculatedPatternDetails) {
    errors.push('calculatedPatternDetails is required');
    return { isValid: false, errors };
  }

  // Validate pattern info
  if (!calculatedPatternDetails.patternInfo) {
    errors.push('patternInfo is required in calculatedPatternDetails');
  } else {
    const { patternInfo } = calculatedPatternDetails;
    
    if (!patternInfo.craftType || !['knitting', 'crochet'].includes(patternInfo.craftType)) {
      errors.push('Valid craftType (knitting or crochet) is required in patternInfo');
    }
    
    if (!patternInfo.garmentType || typeof patternInfo.garmentType !== 'string' || patternInfo.garmentType.trim() === '') {
      errors.push('garmentType is required in patternInfo');
    }
    
    if (!patternInfo.sessionId || typeof patternInfo.sessionId !== 'string' || patternInfo.sessionId.trim() === '') {
      errors.push('sessionId is required in patternInfo');
    }
    
    if (!patternInfo.calculatedAt || typeof patternInfo.calculatedAt !== 'string') {
      errors.push('calculatedAt is required in patternInfo');
    }
    
    if (!patternInfo.schemaVersion || typeof patternInfo.schemaVersion !== 'string') {
      errors.push('schemaVersion is required in patternInfo');
    }
  }

  // Validate pieces
  if (!calculatedPatternDetails.pieces || typeof calculatedPatternDetails.pieces !== 'object') {
    errors.push('pieces object is required in calculatedPatternDetails');
  } else {
    const pieces = calculatedPatternDetails.pieces;
    const pieceKeys = Object.keys(pieces);
    
    if (pieceKeys.length === 0) {
      errors.push('At least one piece is required in calculatedPatternDetails.pieces');
    }
    
    // Validate each piece
    for (const [pieceKey, pieceDetails] of Object.entries(pieces)) {
      const pieceErrors = validatePieceDetails(pieceKey, pieceDetails as any);
      errors.push(...pieceErrors);
    }
  }

  // Validate options if provided
  if (options) {
    const optionsErrors = validateOptions(options);
    errors.push(...optionsErrors);
  }

  // Check for existing errors in the calculated pattern
  if (calculatedPatternDetails.errors && Array.isArray(calculatedPatternDetails.errors) && calculatedPatternDetails.errors.length > 0) {
    errors.push('calculatedPatternDetails contains errors that must be resolved before generating instructions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate individual piece details
 */
function validatePieceDetails(pieceKey: string, pieceDetails: any): string[] {
  const errors: string[] = [];
  const prefix = `Piece "${pieceKey}":`;

  if (!pieceDetails || typeof pieceDetails !== 'object') {
    errors.push(`${prefix} piece details must be an object`);
    return errors;
  }

  // Required string fields
  if (!pieceDetails.pieceKey || typeof pieceDetails.pieceKey !== 'string') {
    errors.push(`${prefix} pieceKey is required and must be a string`);
  }
  
  if (!pieceDetails.displayName || typeof pieceDetails.displayName !== 'string' || pieceDetails.displayName.trim() === '') {
    errors.push(`${prefix} displayName is required and must be a non-empty string`);
  }

  // Required numeric fields
  if (!pieceDetails.castOnStitches || typeof pieceDetails.castOnStitches !== 'number' || pieceDetails.castOnStitches <= 0) {
    errors.push(`${prefix} castOnStitches must be a positive number`);
  }
  
  if (!pieceDetails.lengthInRows || typeof pieceDetails.lengthInRows !== 'number' || pieceDetails.lengthInRows <= 0) {
    errors.push(`${prefix} lengthInRows must be a positive number`);
  }
  
  if (!pieceDetails.finalStitchCount || typeof pieceDetails.finalStitchCount !== 'number' || pieceDetails.finalStitchCount <= 0) {
    errors.push(`${prefix} finalStitchCount must be a positive number`);
  }

  // Validate finished dimensions
  if (!pieceDetails.finishedDimensions || typeof pieceDetails.finishedDimensions !== 'object') {
    errors.push(`${prefix} finishedDimensions is required and must be an object`);
  } else {
    const { finishedDimensions } = pieceDetails;
    
    if (!finishedDimensions.width_cm || typeof finishedDimensions.width_cm !== 'number' || finishedDimensions.width_cm <= 0) {
      errors.push(`${prefix} finishedDimensions.width_cm must be a positive number`);
    }
    
    if (!finishedDimensions.length_cm || typeof finishedDimensions.length_cm !== 'number' || finishedDimensions.length_cm <= 0) {
      errors.push(`${prefix} finishedDimensions.length_cm must be a positive number`);
    }
  }

  // Validate shaping array if present
  if (pieceDetails.shaping && !Array.isArray(pieceDetails.shaping)) {
    errors.push(`${prefix} shaping must be an array if provided`);
  }

  // Validate construction notes if present
  if (pieceDetails.constructionNotes && !Array.isArray(pieceDetails.constructionNotes)) {
    errors.push(`${prefix} constructionNotes must be an array if provided`);
  }

  return errors;
}

/**
 * Validate options
 */
function validateOptions(options: any): string[] {
  const errors: string[] = [];

  if (typeof options !== 'object') {
    errors.push('options must be an object if provided');
    return errors;
  }

  // Validate boolean options
  const booleanOptions = [
    'includeStitchCounts',
    'includeRowNumbers', 
    'useStandardAbbreviations',
    'includeShapingDetails',
    'includeConstructionNotes'
  ];

  for (const option of booleanOptions) {
    if (options[option] !== undefined && typeof options[option] !== 'boolean') {
      errors.push(`options.${option} must be a boolean if provided`);
    }
  }

  // Validate string options
  if (options.language !== undefined && (!['en', 'fr'].includes(options.language))) {
    errors.push('options.language must be "en" or "fr" if provided');
  }

  if (options.detailLevel !== undefined && (!['minimal', 'standard', 'detailed'].includes(options.detailLevel))) {
    errors.push('options.detailLevel must be "minimal", "standard", or "detailed" if provided');
  }

  return errors;
}

/**
 * OPTIONS handler for CORS (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 