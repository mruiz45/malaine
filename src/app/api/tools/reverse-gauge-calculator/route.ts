/**
 * API Route for Reverse Gauge Calculator Tool
 * Handles calculation requests for the reverse gauge calculator
 * Follows the established API pattern for the Malaine project
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  ReverseGaugeCalculationRequest,
  ReverseGaugeCalculationResponse
} from '@/types/reverseGaugeCalculator';
import {
  calculateReverseGauge,
  validateCalculationInput
} from '@/services/reverseGaugeCalculatorService';

/**
 * POST /api/tools/reverse-gauge-calculator
 * Calculates reverse gauge based on provided scenario and input data
 */
export async function POST(request: NextRequest): Promise<NextResponse<ReverseGaugeCalculationResponse>> {
  try {
    // Parse request body
    const body: ReverseGaugeCalculationRequest = await request.json();
    
    // Validate request structure
    if (!body.scenario || !body.input) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: scenario and input are required'
        },
        { status: 400 }
      );
    }

    // Validate input data
    const validationErrors = validateCalculationInput(body.scenario, body.input);
    
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed'
        },
        { status: 400 }
      );
    }

    // Perform calculation
    const result = calculateReverseGauge(body.scenario, body.input);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in reverse gauge calculator API:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unknown calculation scenario')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid calculation scenario provided'
          },
          { status: 400 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred during calculation'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/reverse-gauge-calculator
 * Returns information about the reverse gauge calculator tool
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    data: {
      tool_name: 'Reverse Gauge Calculator',
      description: 'Calculate required stitches/rows for target dimensions, resulting dimensions from stitch counts, or compare pattern gauge vs user gauge',
      scenarios: [
        {
          id: 'target_to_stitches',
          name: 'Target Dimension to Stitches/Rows',
          description: 'Calculate how many stitches or rows you need for a specific dimension with your gauge'
        },
        {
          id: 'stitches_to_dimension',
          name: 'Stitches/Rows to Dimension',
          description: 'Calculate the resulting dimension when using a specific number of stitches or rows with your gauge'
        },
        {
          id: 'gauge_comparison',
          name: 'Pattern vs User Gauge Comparison',
          description: 'Compare pattern gauge with your gauge and get adjustments needed'
        }
      ],
      supported_units: ['cm', 'inch']
    }
  });
} 