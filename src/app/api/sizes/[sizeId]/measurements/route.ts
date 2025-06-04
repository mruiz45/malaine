/**
 * API Route: /api/sizes/[sizeId]/measurements
 * Returns detailed measurements for a specific standard size (PD_PH2_US004)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { StandardSize, StandardSizeMeasurements, mapStandardSizeToMeasurements } from '@/types/standardSizes';

interface RouteParams {
  params: {
    sizeId: string;
  };
}

/**
 * GET /api/sizes/[sizeId]/measurements
 * Fetches detailed measurements for a specific standard size
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { sizeId } = params;

    if (!sizeId) {
      return NextResponse.json(
        { success: false, error: 'Size ID is required' },
        { status: 400 }
      );
    }

    // Fetch the standard size with all measurements
    const { data: size, error } = await supabase
      .from('standard_sizes')
      .select(`
        *,
        standard_size_charts!inner (
          chart_name,
          region,
          age_category,
          target_group,
          garment_types
        )
      `)
      .eq('standard_size_id', sizeId)
      .single();

    if (error) {
      console.error('Error fetching standard size:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch standard size' },
        { status: 500 }
      );
    }

    if (!size) {
      return NextResponse.json(
        { success: false, error: 'Standard size not found' },
        { status: 404 }
      );
    }

    // Map the database measurements to the pattern measurements format
    const measurements: StandardSizeMeasurements = mapStandardSizeToMeasurements(size as StandardSize);

    return NextResponse.json({
      success: true,
      data: {
        size: size as StandardSize,
        measurements
      }
    });

  } catch (error) {
    console.error('Error in /api/sizes/[sizeId]/measurements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 