/**
 * Showcase Patterns API - List patterns (US_10.3)
 * Public endpoint for retrieving showcased patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ShowcasePatternsResponse, 
  ShowcaseFilters, 
  ShowcasePagination,
  ShowcasedPatternSummary 
} from '@/types/showcase';

/**
 * GET /api/showcase/patterns
 * Retrieves list of showcased patterns with pagination and filtering
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const offset = (page - 1) * limit;

    // Parse filter parameters
    const filters: ShowcaseFilters = {};
    
    const category = searchParams.get('category');
    if (category) {
      filters.category = category as any;
    }
    
    const difficulty_level = searchParams.get('difficulty_level');
    if (difficulty_level) {
      filters.difficulty_level = difficulty_level as any;
    }
    
    const search = searchParams.get('search');
    if (search && search.trim()) {
      filters.search = search.trim();
    }

    // Build query
    let query = supabaseServer
      .from('showcased_patterns')
      .select(`
        id,
        title,
        description,
        thumbnail_image_url,
        category,
        difficulty_level,
        is_published,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: patterns, error, count } = await query;

    if (error) {
      console.error('Error fetching showcased patterns:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch patterns'
      } as ShowcasePatternsResponse, { status: 500 });
    }

    if (!patterns) {
      return NextResponse.json({
        success: false,
        error: 'No patterns found'
      } as ShowcasePatternsResponse, { status: 404 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const response: ShowcasePatternsResponse = {
      success: true,
      data: {
        patterns: patterns as ShowcasedPatternSummary[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error in showcase patterns API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ShowcasePatternsResponse, { status: 500 });
  }
} 