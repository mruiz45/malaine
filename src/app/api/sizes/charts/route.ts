/**
 * API Route: /api/sizes/charts
 * Returns standard size charts based on applied filters (PD_PH2_US004)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { StandardSizeChart, SizeChartSearchResult, AppliedSizeFilters } from '@/types/standardSizes';
import { GarmentType } from '@/types/pattern';

/**
 * GET /api/sizes/charts
 * Fetches standard size charts based on filters
 * Query params:
 * - garmentType?: GarmentType
 * - region?: SizeRegion
 * - ageCategory?: AgeCategory
 * - targetGroup?: TargetGroup
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: AppliedSizeFilters = {
      garment_type: searchParams.get('garmentType') as GarmentType,
      region: searchParams.get('region') as any,
      age_category: searchParams.get('ageCategory') as any,
      target_group: searchParams.get('targetGroup') as any,
    };

    // Build query for size charts
    let query = supabase
      .from('standard_size_charts')
      .select('*');

    // Apply filters
    if (filters.garment_type && filters.garment_type !== null) {
      query = query.contains('garment_types', [filters.garment_type]);
    }

    if (filters.region) {
      query = query.eq('region', filters.region);
    }

    if (filters.age_category) {
      query = query.eq('age_category', filters.age_category);
    }

    if (filters.target_group) {
      query = query.eq('target_group', filters.target_group);
    }

    // Order by chart name for consistent results
    query = query.order('chart_name');

    const { data: charts, error, count } = await query;

    if (error) {
      console.error('Error fetching size charts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch size charts' },
        { status: 500 }
      );
    }

    const result: SizeChartSearchResult = {
      charts: (charts || []) as StandardSizeChart[],
      total_count: count || charts?.length || 0
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in /api/sizes/charts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 