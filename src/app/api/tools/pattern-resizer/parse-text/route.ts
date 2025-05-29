/**
 * Pattern Text Parser API Endpoint (US 10.2)
 * Handles parsing of structured pattern text via POST requests
 * Follows the established Next.js App Router pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  StructuredPatternText, 
  PatternTextParseApiResponse 
} from '@/types/pattern-resizer';
import { parseStructuredPatternText } from '@/utils/pattern-text-parser';

/**
 * POST /api/tools/pattern-resizer/parse-text
 * Parse structured pattern text to extract numerical values
 */
export async function POST(request: NextRequest): Promise<NextResponse<PatternTextParseApiResponse>> {
  try {
    // Parse request body
    const requestBody = await request.json();
    
    // Validate that we have the required input structure
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body'
        } as PatternTextParseApiResponse,
        { status: 400 }
      );
    }

    // Validate required fields
    const input = requestBody as StructuredPatternText;
    
    if (!input.text || typeof input.text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Text content is required'
        } as PatternTextParseApiResponse,
        { status: 400 }
      );
    }

    if (!input.template_key || typeof input.template_key !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Template key is required'
        } as PatternTextParseApiResponse,
        { status: 400 }
      );
    }

    if (!input.unit || (input.unit !== 'cm' && input.unit !== 'inch')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Valid unit (cm or inch) is required'
        } as PatternTextParseApiResponse,
        { status: 400 }
      );
    }

    // Perform the parsing
    const result = parseStructuredPatternText(input);

    // Return result
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: result
        } as PatternTextParseApiResponse,
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Parsing failed'
        } as PatternTextParseApiResponse,
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Pattern text parsing API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during text parsing'
      } as PatternTextParseApiResponse,
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