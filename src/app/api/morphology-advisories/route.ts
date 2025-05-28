/**
 * Morphology Advisories API Route
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 * 
 * Provides morphology advice based on selected characteristics
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import type { 
  MorphologyAdviceRequest, 
  MorphologyAdviceResponse,
  MorphologyCharacteristic,
  MorphologyAdvisory
} from '@/types/morphologyAdvisor';

/**
 * GET /api/morphology-advisories
 * Gets all available morphology advisories
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch all morphology advisories (public data, no auth required)
    const { data: advisories, error } = await supabaseServer
      .from('morphology_advisories')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching morphology advisories:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch morphology advisories'
        } as MorphologyAdviceResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: advisories || []
    } as MorphologyAdviceResponse);

  } catch (error: any) {
    console.error('Error in morphology advisories GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as MorphologyAdviceResponse,
      { status: 500 }
    );
  }
}

/**
 * POST /api/morphology-advisories
 * Gets morphology advice for selected characteristics
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: MorphologyAdviceRequest = await request.json();
    const { morphology_characteristics } = body;

    // Validate input
    if (!morphology_characteristics || !Array.isArray(morphology_characteristics) || morphology_characteristics.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide at least one morphology characteristic'
        } as MorphologyAdviceResponse,
        { status: 400 }
      );
    }

    // Fetch morphology advisories for selected characteristics (public data, no auth required)
    const { data: advisories, error } = await supabaseServer
      .from('morphology_advisories')
      .select('*')
      .in('morphology_key', morphology_characteristics)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching morphology advisories:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch morphology advisories'
        } as MorphologyAdviceResponse,
        { status: 500 }
      );
    }

    // Check if all requested characteristics were found
    const foundCharacteristics = advisories?.map((a: MorphologyAdvisory) => a.morphology_key) || [];
    const missingCharacteristics = morphology_characteristics.filter(
      char => !foundCharacteristics.includes(char)
    );

    if (missingCharacteristics.length > 0) {
      console.warn('Missing morphology characteristics:', missingCharacteristics);
    }

    return NextResponse.json({
      success: true,
      data: advisories || []
    } as MorphologyAdviceResponse);

  } catch (error: any) {
    console.error('Error in morphology advisories POST:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      } as MorphologyAdviceResponse,
      { status: 500 }
    );
  }
} 