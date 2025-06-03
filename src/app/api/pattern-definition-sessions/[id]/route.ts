import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { UpdatePatternDefinitionSessionData } from '@/types/patternDefinition';

/**
 * GET /api/pattern-definition-sessions/[id]
 * Retrieve a specific pattern definition session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🏁 [API] GET pattern-definition-sessions called for id:', id);
  
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      console.log('🏁 [API] Unauthorized - no session result');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;
    console.log('🏁 [API] Authenticated, fetching session from database...');

    // Fetch session (without joins for now since other tables don't exist yet)
    const { data: session, error } = await supabase
      .from('pattern_definition_sessions')
      .select('*')
      .eq('id', id)
      .single();

    console.log('🏁 [API] Database query result:', {
      hasData: !!session,
      error: error?.message,
      sessionId: session?.id,
      parameterSnapshot: session?.parameter_snapshot
    });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('🏁 [API] Session not found in database');
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('🏁 [API] Database error fetching session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    console.log('🏁 [API] GET completed successfully');
    return NextResponse.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('🏁 [API] Unexpected error in GET:', error);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔄 [API] PUT pattern-definition-sessions called for id:', id);
  
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      console.log('🔄 [API] Unauthorized - no session result');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;

    // Parse request body
    const body: UpdatePatternDefinitionSessionData = await request.json();
    console.log('🔄 [API] Request body received:', body);

    // Prepare update data with timestamp
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    };
    console.log('🔄 [API] Prepared update data:', updateData);

    console.log('🔄 [API] Executing database update...');
    // Update session
    const { data: updatedSession, error } = await supabase
      .from('pattern_definition_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    console.log('🔄 [API] Database update result:', {
      hasData: !!updatedSession,
      error: error?.message,
      updatedSessionId: updatedSession?.id,
      parameterSnapshot: updatedSession?.parameter_snapshot
    });

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('🔄 [API] Session not found for update');
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('🔄 [API] Database error updating session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update session' },
        { status: 500 }
      );
    }

    console.log('🔄 [API] PUT completed successfully');
    return NextResponse.json({
      success: true,
      data: updatedSession
    });

  } catch (error) {
    console.error('🔄 [API] Unexpected error in PUT:', error);
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
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;

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