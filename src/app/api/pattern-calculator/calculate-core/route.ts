/**
 * Core Pattern Calculation API Route (PD_PH6_US002)
 * API endpoint for the new core pattern calculation engine
 */

import { NextRequest, NextResponse } from 'next/server';
import { PatternCalculationEngine } from '@/engines/core/PatternCalculationEngine';
import {
  CoreCalculationInput,
  CalculatedPatternDetails
} from '@/types/core-pattern-calculation';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';

/**
 * POST /api/pattern-calculator/calculate-core
 * Calculate pattern using the core calculation engine
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const supabaseSession = await getSupabaseSessionAppRouter(request);
    if (!supabaseSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { patternState, options } = body;

    if (!patternState) {
      return NextResponse.json(
        { success: false, error: 'Pattern state is required' },
        { status: 400 }
      );
    }

    // Create calculation input
    const input: CoreCalculationInput = {
      patternState,
      options: options || {}
    };

    // Initialize and run calculation engine
    const engine = new PatternCalculationEngine();
    const result: CalculatedPatternDetails = await engine.calculate(input);

    // Check for calculation errors
    if (result.errors && result.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Calculation failed',
          details: result.errors,
          warnings: result.warnings
        },
        { status: 400 }
      );
    }

    // Return successful calculation
    return NextResponse.json({
      success: true,
      data: result,
      warnings: result.warnings || []
    });

  } catch (error) {
    console.error('Core pattern calculation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal calculation error';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pattern-calculator/calculate-core
 * Get calculation engine information
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        engineVersion: '1.0.0',
        supportedGarmentTypes: ['sweater', 'cardigan', 'hat', 'beanie', 'scarf', 'shawl'],
        features: [
          'Modular calculation architecture',
          'Interdependency resolution',
          'Detailed shaping instructions',
          'Yarn estimation',
          'Multiple garment types'
        ],
        schemaVersion: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Engine info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get engine information' },
      { status: 500 }
    );
  }
} 