import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { MeasurementGuide } from '@/types/measurements';

/**
 * GET /api/measurement-guides/[measurementKey]
 * Retrieves a specific measurement guide by measurement key
 * US 3.1: Body Measurement Guide Tool
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ measurementKey: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { measurementKey } = await params;

    // Validate measurement key format
    if (!measurementKey || measurementKey.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid measurement key' },
        { status: 400 }
      );
    }

    // Fetch the specific measurement guide
    const { data: guide, error } = await supabase
      .from('measurement_guides_content')
      .select('*')
      .eq('measurement_key', measurementKey)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Measurement guide not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching measurement guide:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch measurement guide' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: guide as MeasurementGuide
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/measurement-guides/[measurementKey]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 