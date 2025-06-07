/**
 * Pattern State Validation API Route (PD_PH6_US002)
 * API endpoint for validating pattern state before calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { EngineInputValidator } from '@/engines/validators/EngineInputValidator';
import { CoreCalculationInput } from '@/types/core-pattern-calculation';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';

/**
 * POST /api/pattern-calculator/validate-pattern-state
 * Validate pattern state for calculation readiness
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const supabaseSession = await getSupabaseSessionAppRouter(request);
    if (!supabaseSession) {
      return NextResponse.json(
        { 
          isValid: false, 
          errors: ['Authentication required'], 
          warnings: [], 
          missingData: [] 
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { patternState } = body;

    if (!patternState) {
      return NextResponse.json({
        isValid: false,
        errors: ['Pattern state is required'],
        warnings: [],
        missingData: []
      });
    }

    // Create input for validation
    const input: CoreCalculationInput = {
      patternState,
      options: {}
    };

    // Validate using engine validator
    const validator = new EngineInputValidator();
    const validationResult = validator.validateInput(input);

    // Return validation result
    return NextResponse.json({
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
      missingData: validationResult.missingData
    });

  } catch (error) {
    console.error('Pattern state validation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Validation error';
    
    return NextResponse.json({
      isValid: false,
      errors: [errorMessage],
      warnings: [],
      missingData: []
    });
  }
} 