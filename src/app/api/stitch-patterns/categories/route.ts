import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { 
  StitchPatternCategorySummary, 
  CraftType, 
  StitchPatternCategory,
  DifficultyLevel
} from '@/types/stitchPattern';

/**
 * GET /api/stitch-patterns/categories
 * Retrieves stitch pattern categories with counts and difficulty levels (US_8.1)
 * Public endpoint for browsing the stitch library
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const craftType = searchParams.get('craftType') as CraftType || undefined;

    // Try to get session (optional for category browsing)
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    const supabase = sessionResult?.supabase;
    
    // If no session, we could create anonymous client for public browsing
    // For now, require authentication
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Build base query for category aggregation
    let query = supabase
      .from('stitch_patterns')
      .select('category, difficulty_level, craft_type, id, stitch_name, swatch_image_url, description');

    // Apply craft type filter if provided
    if (craftType) {
      query = query.eq('craft_type', craftType);
    }

    // Only include patterns that have categories assigned
    query = query.not('category', 'is', null);

    const { data: patterns, error } = await query;

    if (error) {
      console.error('Error fetching stitch pattern categories:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stitch pattern categories' },
        { status: 500 }
      );
    }

    if (!patterns) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Group patterns by category and aggregate data
    const categoryMap = new Map<StitchPatternCategory, {
      count: number;
      difficulty_levels: Set<DifficultyLevel>;
      sample_patterns: any[];
    }>();

    patterns.forEach(pattern => {
      const category = pattern.category as StitchPatternCategory;
      if (!category) return;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          count: 0,
          difficulty_levels: new Set(),
          sample_patterns: []
        });
      }

      const categoryData = categoryMap.get(category)!;
      categoryData.count++;
      
      if (pattern.difficulty_level) {
        categoryData.difficulty_levels.add(pattern.difficulty_level as DifficultyLevel);
      }

      // Keep up to 3 sample patterns per category for preview
      if (categoryData.sample_patterns.length < 3) {
        categoryData.sample_patterns.push({
          id: pattern.id,
          stitch_name: pattern.stitch_name,
          swatch_image_url: pattern.swatch_image_url,
          description: pattern.description,
          craft_type: pattern.craft_type
        });
      }
    });

    // Convert map to array of category summaries
    const categorySummaries: StitchPatternCategorySummary[] = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        count: data.count,
        difficulty_levels: Array.from(data.difficulty_levels).sort(),
        sample_patterns: data.sample_patterns
      })
    );

    // Sort categories by name for consistent ordering
    categorySummaries.sort((a, b) => a.category.localeCompare(b.category));

    return NextResponse.json({
      success: true,
      data: categorySummaries
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/stitch-patterns/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 