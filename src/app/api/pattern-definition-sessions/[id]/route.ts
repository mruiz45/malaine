import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { UpdatePatternDefinitionSessionData } from '@/types/patternDefinition';

/**
 * GET /api/pattern-definition-sessions/[id]
 * Retrieve a specific pattern definition session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { id } = params;

    // Fetch session (without joins for now since other tables don't exist yet)
    const { data: session, error } = await supabase
      .from('pattern_definition_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching pattern definition session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/pattern-definition-sessions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pattern-definition-sessions/[id]
 * Update a specific pattern definition session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { id } = params;

    // Parse request body
    const body: UpdatePatternDefinitionSessionData = await request.json();

    // Prepare update data with timestamp
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    };

    // Update session
    const { data: updatedSession, error } = await supabase
      .from('pattern_definition_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error updating pattern definition session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSession
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/pattern-definition-sessions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pattern-definition-sessions/[id]
 * Delete a specific pattern definition session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    const { id } = params;

    // Delete session
    const { error } = await supabase
      .from('pattern_definition_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pattern definition session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/pattern-definition-sessions/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 