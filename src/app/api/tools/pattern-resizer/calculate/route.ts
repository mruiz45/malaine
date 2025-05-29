/**
 * Pattern Resizer API Endpoint (US 10.1)
 * Handles pattern resizing calculations via POST requests
 * Follows the established Next.js App Router pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { PatternResizerInput, PatternResizerApiResponse } from '@/types/pattern-resizer';
import { calculatePatternResize } from '@/utils/pattern-resizer-calculations';

/**
 * POST /api/tools/pattern-resizer/calculate
 * Calculate new pattern values based on input parameters
 */
export async function POST(request: NextRequest): Promise<NextResponse<PatternResizerApiResponse>> {
  try {
    // Parse request body
    const requestBody = await request.json();
    
    // Validate that we have the required input structure
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body'
        } as PatternResizerApiResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    const input = requestBody as PatternResizerInput;
    
    if (!input.template_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template key is required'
        } as PatternResizerApiResponse,
        { status: 400 }
      );
    }

    if (!input.original_gauge || !input.new_gauge) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both original and new gauge information are required'
        } as PatternResizerApiResponse,
        { status: 400 }
      );
    }

    if (!input.original_pattern_values || !input.new_dimension_values) {
      return NextResponse.json(
        {
          success: false,
          error: 'Both original pattern values and new dimension values are required'
        } as PatternResizerApiResponse,
        { status: 400 }
      );
    }

    // Perform the calculation
    const result = calculatePatternResize(input);

    // Return result
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: result
        } as PatternResizerApiResponse,
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Calculation failed'
        } as PatternResizerApiResponse,
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Pattern resizer calculation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during calculation'
      } as PatternResizerApiResponse,
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 