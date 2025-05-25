import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { StitchPattern, StitchPatternFilters } from '@/types/stitchPattern';

/**
 * GET /api/stitch-patterns
 * Retrieves stitch patterns with optional filtering
 * Public endpoint for basic stitch patterns, authenticated for all patterns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: StitchPatternFilters = {
      basicOnly: searchParams.get('basicOnly') === 'true',
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    // Try to get session (optional for basic patterns)
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    // If no session and not requesting basic only, return unauthorized
    if (!sessionResult && !filters.basicOnly) {
      return NextResponse.json(
        { success: false, error: 'Authentication required for non-basic patterns' },
        { status: 401 }
      );
    }

    const supabase = sessionResult?.supabase;
    
    // If no session, create anonymous client for basic patterns only
    if (!supabase) {
      // For now, return error as we need proper anonymous client setup
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('stitch_patterns')
      .select('*');

    // Apply filters
    if (filters.basicOnly) {
      query = query.eq('is_basic', true);
    }

    if (filters.search) {
      query = query.ilike('stitch_name', `%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    // Order by name
    query = query.order('stitch_name', { ascending: true });

    const { data: stitchPatterns, error, count } = await query;

    if (error) {
      console.error('Error fetching stitch patterns:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stitch patterns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stitchPatterns as StitchPattern[],
      count: count || stitchPatterns?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/stitch-patterns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 