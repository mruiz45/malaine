import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { supabaseServer } from '@/lib/supabaseServer';
import type { 
  StitchPattern, 
  StitchPatternFilters, 
  CraftType, 
  StitchPatternCategory, 
  DifficultyLevel 
} from '@/types/stitchPattern';

/**
 * GET /api/stitch-patterns
 * Retrieves stitch patterns with optional filtering
 * Enhanced for US_8.1 with category, craft type, difficulty, and keyword filtering
 * Public endpoint for basic stitch patterns, authenticated for all patterns
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with US_8.1 enhancements
    const filters: StitchPatternFilters = {
      basicOnly: searchParams.get('basicOnly') === 'true',
      craftType: searchParams.get('craftType') as CraftType || undefined,
      category: searchParams.get('category') as StitchPatternCategory || undefined,
      difficultyLevel: searchParams.get('difficultyLevel') as DifficultyLevel || undefined,
      search: searchParams.get('search') || undefined,
      keywords: searchParams.get('keywords')?.split(',').filter(k => k.trim()) || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    let supabase;
    
    // If requesting basic patterns only, use anonymous client to avoid authentication rate limits
    if (filters.basicOnly) {
      supabase = supabaseServer; // Use anonymous client for basic patterns
    } else {
      // Try to get session for non-basic patterns
      const sessionResult = await getSupabaseSessionAppRouter(request);
      
      // If no session and not requesting basic only, return unauthorized
      if (!sessionResult) {
        return NextResponse.json(
          { success: false, error: 'Authentication required for non-basic patterns' },
          { status: 401 }
        );
      }
      
      supabase = sessionResult.supabase;
    }

    // Build query
    let query = supabase
      .from('stitch_patterns')
      .select('*');

    // Apply filters
    if (filters.basicOnly) {
      query = query.eq('is_basic', true);
    }

    if (filters.craftType) {
      query = query.eq('craft_type', filters.craftType);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel);
    }

    if (filters.search) {
      // Search in both name and description, and keywords array
      query = query.or(
        `stitch_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,search_keywords.cs.{${filters.search}}`
      );
    }

    if (filters.keywords && filters.keywords.length > 0) {
      // Search using the keywords array - any of the provided keywords should match
      const keywordConditions = filters.keywords.map(keyword => 
        `search_keywords.cs.{${keyword.toLowerCase()}}`
      ).join(',');
      query = query.or(keywordConditions);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    }

    // Order by category first, then name for better browsing (US_8.1)
    query = query.order('category', { ascending: true, nullsFirst: false })
                  .order('stitch_name', { ascending: true });

    const { data: stitchPatterns, error, count } = await query;

    if (error) {
      console.error('Error fetching stitch patterns:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stitch patterns' },
        { status: 500 }
      );
    }

    // Get total count for pagination (if needed)
    let totalCount = stitchPatterns?.length || 0;
    if (filters.limit || filters.offset) {
      // Get total count with same filters but no pagination
      let countQuery = supabase
        .from('stitch_patterns')
        .select('*', { count: 'exact', head: true });

      // Apply same filters for count
      if (filters.basicOnly) {
        countQuery = countQuery.eq('is_basic', true);
      }
      if (filters.craftType) {
        countQuery = countQuery.eq('craft_type', filters.craftType);
      }
      if (filters.category) {
        countQuery = countQuery.eq('category', filters.category);
      }
      if (filters.difficultyLevel) {
        countQuery = countQuery.eq('difficulty_level', filters.difficultyLevel);
      }
      if (filters.search) {
        countQuery = countQuery.or(
          `stitch_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,search_keywords.cs.{${filters.search}}`
        );
      }
      if (filters.keywords && filters.keywords.length > 0) {
        const keywordConditions = filters.keywords.map(keyword => 
          `search_keywords.cs.{${keyword.toLowerCase()}}`
        ).join(',');
        countQuery = countQuery.or(keywordConditions);
      }

      const { count: totalCountResult } = await countQuery;
      totalCount = totalCountResult || 0;
    }

    return NextResponse.json({
      success: true,
      data: stitchPatterns as StitchPattern[],
      count: stitchPatterns?.length || 0,
      totalCount: totalCount
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/stitch-patterns:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 