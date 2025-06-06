import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { ColorScheme, SaveColorSchemeResponse } from '@/types/colorScheme';

/**
 * GET /api/pattern-definition-sessions/[id]/color-scheme
 * Get the saved color scheme for a pattern definition session (US_5.1)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase: supabaseServer, user } = sessionResult;

    // Get the session to verify ownership and extract color scheme
    const { data: session, error: sessionError } = await supabaseServer
      .from('pattern_definition_sessions')
      .select('parameter_snapshot, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user owns this session
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Extract color scheme from parameter_snapshot
    const colorScheme = session.parameter_snapshot?.color_scheme || null;

    const response: SaveColorSchemeResponse = {
      success: true,
      data: colorScheme
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/pattern-definition-sessions/[id]/color-scheme:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pattern-definition-sessions/[id]/color-scheme
 * Save a color scheme for a pattern definition session (US_5.1)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const colorScheme: ColorScheme = await request.json();

    // Basic validation
    if (!colorScheme.template_type || !colorScheme.selected_colors || colorScheme.selected_colors.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid color scheme data' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const sessionResult = await getSupabaseSessionAppRouter(request);
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase: supabaseServer, user } = sessionResult;

    // Get the current session to verify ownership and get current parameter_snapshot
    const { data: currentSession, error: sessionError } = await supabaseServer
      .from('pattern_definition_sessions')
      .select('parameter_snapshot, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user owns this session
    if (currentSession.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Add timestamps to color scheme
    const now = new Date().toISOString();
    const colorSchemeWithTimestamps: ColorScheme = {
      ...colorScheme,
      id: colorScheme.id || crypto.randomUUID(),
      created_at: colorScheme.created_at || now,
      updated_at: now
    };

    // Update parameter_snapshot with the color scheme
    const updatedParameterSnapshot = {
      ...currentSession.parameter_snapshot,
      color_scheme: colorSchemeWithTimestamps
    };

    // Update the session with the new color scheme
    const { data: updatedSession, error: updateError } = await supabaseServer
      .from('pattern_definition_sessions')
      .update({
        parameter_snapshot: updatedParameterSnapshot,
        updated_at: now
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating session with color scheme:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save color scheme' },
        { status: 500 }
      );
    }

    const response: SaveColorSchemeResponse = {
      success: true,
      data: colorSchemeWithTimestamps
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PUT /api/pattern-definition-sessions/[id]/color-scheme:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 