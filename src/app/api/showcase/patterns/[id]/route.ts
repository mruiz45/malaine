/**
 * Showcase Pattern Detail API (US_10.3)
 * Public endpoint for retrieving a specific showcased pattern with full data
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { ShowcasedPatternResponse, ShowcasedPattern } from '@/types/showcase';

/**
 * GET /api/showcase/patterns/[id]
 * Retrieves a specific showcased pattern with complete pattern data
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Pattern ID is required'
      } as ShowcasedPatternResponse, { status: 400 });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid pattern ID format'
      } as ShowcasedPatternResponse, { status: 400 });
    }

    const { data: pattern, error } = await supabaseServer
      .from('showcased_patterns')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json({
          success: false,
          error: 'Pattern not found or not published'
        } as ShowcasedPatternResponse, { status: 404 });
      }

      console.error('Error fetching showcased pattern:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch pattern'
      } as ShowcasedPatternResponse, { status: 500 });
    }

    if (!pattern) {
      return NextResponse.json({
        success: false,
        error: 'Pattern not found'
      } as ShowcasedPatternResponse, { status: 404 });
    }

    // Validate that full_pattern_data exists and is valid
    if (!pattern.full_pattern_data) {
      console.error('Pattern missing full_pattern_data:', id);
      return NextResponse.json({
        success: false,
        error: 'Pattern data is incomplete'
      } as ShowcasedPatternResponse, { status: 500 });
    }

    const response: ShowcasedPatternResponse = {
      success: true,
      data: pattern as ShowcasedPattern
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in showcase pattern detail API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ShowcasedPatternResponse, { status: 500 });
  }
} 