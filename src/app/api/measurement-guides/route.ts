import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { MeasurementGuide } from '@/types/measurements';

/**
 * GET /api/measurement-guides
 * Retrieves all measurement guides for authenticated users
 * US 3.1: Body Measurement Guide Tool
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;

    // Fetch all measurement guides
    const { data: guides, error } = await supabase
      .from('measurement_guides_content')
      .select('*')
      .order('measurement_key', { ascending: true });

    if (error) {
      console.error('Error fetching measurement guides:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch measurement guides' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: guides as MeasurementGuide[]
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/measurement-guides:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 