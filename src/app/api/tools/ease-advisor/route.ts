/**
 * Ease Advisor API Route
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 * 
 * Provides ease advice based on garment category, fit preference, and yarn weight
 */

import { NextRequest, NextResponse } from 'next/server';
import type { 
  EaseAdviceRequest, 
  EaseAdviceResponse
} from '@/types/easeAdvisor';
import { 
  getBestMatchingRule, 
  findMatchingRules,
  EASE_ADVICE_RULES 
} from '@/utils/easeAdviceRules';
import { validateEaseAdvisorData } from '@/services/easeAdvisorService';

/**
 * POST /api/tools/ease-advisor
 * Gets ease advice based on garment category, fit preference, and optional yarn weight
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: EaseAdviceRequest = await request.json();

    // Validate input data
    const validationErrors = validateEaseAdvisorData(body);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed: ' + Object.values(validationErrors).join(', ')
        } as EaseAdviceResponse,
        { status: 400 }
      );
    }

    const { garment_category, fit_preference, yarn_weight_category } = body;

    // Find the best matching rule
    let matchedRule = getBestMatchingRule(
      garment_category, 
      fit_preference, 
      yarn_weight_category
    );

    let fallbackUsed = false;

    // If no specific rule found with yarn weight, try without yarn weight
    if (!matchedRule && yarn_weight_category) {
      matchedRule = getBestMatchingRule(garment_category, fit_preference);
      fallbackUsed = true;
    }

    // If still no rule found, try to find a general rule for the garment category
    if (!matchedRule) {
      // Look for any rule with the same garment category and a generic fit preference
      const fallbackRules = findMatchingRules(garment_category, 'classic');
      if (fallbackRules.length > 0) {
        matchedRule = fallbackRules[0];
        fallbackUsed = true;
      }
    }

    // If no rule found at all, provide a generic response
    if (!matchedRule) {
      return NextResponse.json(
        {
          success: false,
          error: `No ease advice available for ${garment_category} with ${fit_preference} fit preference.`
        } as EaseAdviceResponse,
        { status: 404 }
      );
    }

    // Prepare the response
    const response: EaseAdviceResponse = {
      success: true,
      data: {
        advised_ease: matchedRule.advised_ease,
        explanation: matchedRule.explanation,
        display_unit: body.display_unit || 'cm',
        is_fallback: fallbackUsed
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in ease advisor API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing ease advice request'
      } as EaseAdviceResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/tools/ease-advisor
 * Returns configuration data for the ease advisor tool
 */
export async function GET() {
  try {
    // Import configuration data
    const { EASE_ADVISOR_CONFIG } = await import('@/utils/easeAdviceRules');

    return NextResponse.json({
      success: true,
      data: {
        config: EASE_ADVISOR_CONFIG,
        total_rules: EASE_ADVICE_RULES.length
      }
    });

  } catch (error) {
    console.error('Error getting ease advisor configuration:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load ease advisor configuration'
      },
      { status: 500 }
    );
  }
} 