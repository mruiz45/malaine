/**
 * Pattern Viewer Assembly API Route (US_9.1)
 * Assembles complete pattern documents from calculation data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import {
  AssemblePatternRequest,
  AssemblePatternResponse
} from '@/types/assembled-pattern';
import {
  PatternCalculationRequest,
  PatternCalculationResponse
} from '@/types/pattern-calculation';
import { PatternAssemblerService } from '@/services/patternAssemblerService';

/**
 * POST /api/pattern-viewer/assemble
 * Assembles a complete pattern document from session data
 */
export async function POST(request: NextRequest): Promise<NextResponse<AssemblePatternResponse>> {
  try {
    // Authenticate user session
    const supabaseServer = await getSupabaseSessionAppRouter(request);
    if (!supabaseServer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let requestData: AssemblePatternRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    // Validate request structure
    if (!requestData.sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing sessionId'
        },
        { status: 400 }
      );
    }

    // Fetch craft_type from the pattern definition session
    let craftType: 'knitting' | 'crochet' = 'knitting'; // Default fallback
    try {
      const { data: sessionData, error: sessionError } = await supabaseServer.supabase
        .from('pattern_definition_sessions')
        .select('craft_type')
        .eq('id', requestData.sessionId)
        .single();

      if (sessionError) {
        console.error('Error fetching session craft_type:', sessionError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to fetch session data'
          },
          { status: 404 }
        );
      }

      if (sessionData?.craft_type) {
        craftType = sessionData.craft_type;
      }
    } catch (error) {
      console.error('Error querying session:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to access session data'
        },
        { status: 500 }
      );
    }

    // Get pattern calculation result by calling the existing endpoint internally
    const calculationResult = await getPatternCalculationResult(
      requestData.sessionId,
      supabaseServer,
      requestData.options
    );

    if (!calculationResult.success || !calculationResult.data) {
      return NextResponse.json(
        {
          success: false,
          error: calculationResult.error || 'Failed to calculate pattern'
        },
        { status: 500 }
      );
    }

    // Assemble the pattern using the Pattern Assembler Service
    const assemblerService = new PatternAssemblerService();
    const assembledPattern = assemblerService.assemblePattern(
      calculationResult.data,
      requestData.sessionId,
      craftType,
      {
        includeShapingSummaries: requestData.options?.includeShapingSummaries ?? true,
        includeYarnEstimates: requestData.options?.includeYarnEstimates ?? true,
        language: requestData.options?.language ?? 'en'
      }
    );

    // Return successful response
    return NextResponse.json({
      success: true,
      data: assembledPattern
    });

  } catch (error) {
    console.error('Pattern assembly error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error during pattern assembly'
      },
      { status: 500 }
    );
  }
}

/**
 * Internal helper to get pattern calculation result
 * Reuses the existing calculation logic
 */
async function getPatternCalculationResult(
  sessionId: string,
  sessionResult: { supabase: any; user: any },
  options?: {
    includeShapingSummaries?: boolean;
    includeYarnEstimates?: boolean;
    language?: 'en' | 'fr';
  }
): Promise<PatternCalculationResponse> {
  try {
    // Import the PatternCalculatorService to reuse calculation logic
    const { PatternCalculatorService } = await import('@/services/patternCalculatorService');
    const calculatorService = new PatternCalculatorService();

    // Fetch the complete session data
    const { data: sessionData, error: sessionError } = await sessionResult.supabase
      .from('pattern_definition_sessions')
      .select(`
        *,
        measurement_set:measurement_set_id(*),
        gauge_profile:gauge_profile_id(*),
        yarn_profile:yarn_profile_id(*),
        ease_preference:ease_preference_id(*),
        selected_stitch_pattern:selected_stitch_pattern_id(*),
        components:pattern_definition_components(*)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      return {
        success: false,
        error: 'Session not found or inaccessible'
      };
    }

    // Use the calculator service to get the calculation result
    const calculationResult = await calculatorService.calculatePatternFromSession(
      sessionData,
      {
        includeShaping: options?.includeShapingSummaries ?? true,
        includeYarnEstimate: options?.includeYarnEstimates ?? true,
        instructionFormat: 'text',
        validateInput: true
      }
    );

    return {
      success: true,
      data: calculationResult
    };

  } catch (error) {
    console.error('Error calculating pattern for assembly:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Pattern calculation failed'
    };
  }
} 