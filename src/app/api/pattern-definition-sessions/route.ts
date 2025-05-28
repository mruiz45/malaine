import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { CreatePatternDefinitionSessionData, PatternDefinitionSession } from '@/types/patternDefinition';

/**
 * GET /api/pattern-definition-sessions
 * Retrieve all pattern definition sessions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase } = sessionResult;

    // Fetch sessions (without joins for now since other tables don't exist yet)
    const { data: sessions, error } = await supabase
      .from('pattern_definition_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pattern definition sessions:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sessions || []
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/pattern-definition-sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pattern-definition-sessions
 * Create a new pattern definition session
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Parse request body
    const body: CreatePatternDefinitionSessionData = await request.json();

    // Validate required fields (minimal validation for creation)
    const sessionData = {
      user_id: user.id,
      session_name: body.session_name || `Pattern ${new Date().toLocaleDateString()}`,
      craft_type: body.craft_type || 'knitting', // Default to knitting if not specified
      status: body.status || 'draft'
    };

    // Insert new session
    const { data: newSession, error } = await supabase
      .from('pattern_definition_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('Error creating pattern definition session:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newSession
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/pattern-definition-sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 