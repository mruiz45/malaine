import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { StitchPattern } from '@/types/stitchPattern';

/**
 * GET /api/stitch-patterns/[id]
 * Retrieves a specific stitch pattern by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid stitch pattern ID format' },
        { status: 400 }
      );
    }

    // Try to get session (optional for basic patterns)
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;

    // Fetch the specific stitch pattern
    const { data: stitchPattern, error } = await supabase
      .from('stitch_patterns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Stitch pattern not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching stitch pattern:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch stitch pattern' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stitchPattern as StitchPattern
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/stitch-patterns/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 