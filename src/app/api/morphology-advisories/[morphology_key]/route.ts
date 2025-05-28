/**
 * Single Morphology Advisory API Route
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 * 
 * Provides a specific morphology advisory by key
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import type { 
  MorphologyAdvisoryResponse,
  MorphologyCharacteristic
} from '@/types/morphologyAdvisor';

/**
 * GET /api/morphology-advisories/[morphology_key]
 * Gets a specific morphology advisory by key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { morphology_key: string } }
) {
  try {
    const { morphology_key } = params;

    // Validate morphology key
    if (!morphology_key) {
      return NextResponse.json(
        {
          success: false,
          error: 'Morphology key is required'
        } as MorphologyAdvisoryResponse,
        { status: 400 }
      );
    }

    // Fetch the specific morphology advisory (public data, no auth required)
    const { data: advisory, error } = await supabaseServer
      .from('morphology_advisories')
      .select('*')
      .eq('morphology_key', morphology_key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          {
            success: false,
            error: 'Morphology advisory not found'
          } as MorphologyAdvisoryResponse,
          { status: 404 }
        );
      }

      console.error('Error fetching morphology advisory:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch morphology advisory'
        } as MorphologyAdvisoryResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: advisory
    } as MorphologyAdvisoryResponse);

  } catch (error: any) {
    console.error('Error in morphology advisory GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as MorphologyAdvisoryResponse,
      { status: 500 }
    );
  }
} 