/**
 * API Route: /api/sizes/charts/[chartId]/sizes
 * Returns standard sizes for a specific size chart (PD_PH2_US004)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { StandardSize, SizeSearchResult } from '@/types/standardSizes';

interface RouteParams {
  params: {
    chartId: string;
  };
}

/**
 * GET /api/sizes/charts/[chartId]/sizes
 * Fetches all standard sizes for a specific chart
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
    const { chartId } = params;

    if (!chartId) {
      return NextResponse.json(
        { success: false, error: 'Chart ID is required' },
        { status: 400 }
      );
    }

    // First get the chart details
    const { data: chart, error: chartError } = await supabase
      .from('standard_size_charts')
      .select('*')
      .eq('size_chart_id', chartId)
      .single();

    if (chartError) {
      console.error('Error fetching size chart:', chartError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch size chart' },
        { status: 500 }
      );
    }

    if (!chart) {
      return NextResponse.json(
        { success: false, error: 'Size chart not found' },
        { status: 404 }
      );
    }

    // Get all sizes for this chart
    const { data: sizes, error: sizesError, count } = await supabase
      .from('standard_sizes')
      .select('*')
      .eq('size_chart_id', chartId)
      .order('sort_order');

    if (sizesError) {
      console.error('Error fetching standard sizes:', sizesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch standard sizes' },
        { status: 500 }
      );
    }

    const result: SizeSearchResult = {
      sizes: (sizes || []) as StandardSize[],
      chart: chart as any,
      total_count: count || sizes?.length || 0
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in /api/sizes/charts/[chartId]/sizes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 