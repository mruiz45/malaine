/**
 * API Route: /api/sizes/filters
 * Returns available filter options for standard size selection (PD_PH2_US004)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { SizeChartFilters, SizeRegion, AgeCategory, TargetGroup } from '@/types/standardSizes';
import { GarmentType } from '@/types/pattern';

/**
 * GET /api/sizes/filters
 * Fetches available filter options based on optional garment type
 * Query params:
 * - garmentType?: GarmentType - Filter charts by garment type
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
    const garmentType = searchParams.get('garmentType') as GarmentType;

    // Build query for available filters
    let query = supabase
      .from('standard_size_charts')
      .select('region, age_category, target_group, garment_types');

    // Filter by garment type if provided
    if (garmentType && garmentType !== null) {
      query = query.contains('garment_types', [garmentType]);
    }

    const { data: charts, error } = await query;

    if (error) {
      console.error('Error fetching size chart filters:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch filter options' },
        { status: 500 }
      );
    }

    if (!charts) {
      return NextResponse.json(
        { success: false, error: 'No charts found' },
        { status: 404 }
      );
    }

    // Extract unique filter values with proper typing
    const regions = [...new Set(charts.map((chart: any) => chart.region as SizeRegion))];
    const ageCategories = [...new Set(charts.map((chart: any) => chart.age_category as AgeCategory))];
    const targetGroups = [...new Set(charts.map((chart: any) => chart.target_group as TargetGroup))];

    const filters: SizeChartFilters = {
      regions: regions.sort(),
      age_categories: ageCategories.sort(),
      target_groups: targetGroups.sort()
    };

    return NextResponse.json({
      success: true,
      data: filters
    });

  } catch (error) {
    console.error('Error in /api/sizes/filters:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 