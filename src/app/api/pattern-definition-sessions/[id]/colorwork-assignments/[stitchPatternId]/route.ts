/**
 * API Routes for Colorwork Assignments (US_12.7)
 * Manages color assignments between stitch pattern color keys and yarn profiles in pattern definition sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type {
  ColorAssignment,
  StitchPatternColorAssignments,
  UpdateColorworkAssignmentsRequest,
  ColorworkAssignmentsResponse,
  ColorworkAssignmentsSnapshot
} from '@/types/colorworkAssignments';
import { 
  extractColorworkAssignments,
  convertAssignmentsToSnapshot 
} from '@/services/colorworkAssignmentService';

/**
 * GET /api/pattern-definition-sessions/[id]/colorwork-assignments/[stitchPatternId]
 * Get colorwork assignments for a specific stitch pattern in a session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; stitchPatternId: string } }
) {
  try {
    const sessionId = params.id;
    const stitchPatternId = params.stitchPatternId;

    if (!sessionId || !stitchPatternId) {
      return NextResponse.json(
        { success: false, error: 'Session ID and stitch pattern ID are required' },
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

    // Get the session and verify ownership
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

    // Extract colorwork assignments for the specific stitch pattern
    const assignments = extractColorworkAssignments(session.parameter_snapshot, stitchPatternId);

    const response: ColorworkAssignmentsResponse = {
      success: true,
      data: {
        stitch_pattern_id: stitchPatternId,
        assignments,
        updated_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/pattern-definition-sessions/[id]/colorwork-assignments/[stitchPatternId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pattern-definition-sessions/[id]/colorwork-assignments/[stitchPatternId]
 * Update colorwork assignments for a specific stitch pattern in a session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stitchPatternId: string } }
) {
  try {
    const sessionId = params.id;
    const stitchPatternId = params.stitchPatternId;

    if (!sessionId || !stitchPatternId) {
      return NextResponse.json(
        { success: false, error: 'Session ID and stitch pattern ID are required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body: UpdateColorworkAssignmentsRequest = await request.json();

    // Validate request data
    if (!Array.isArray(body.assignments)) {
      return NextResponse.json(
        { success: false, error: 'Assignments must be an array' },
        { status: 400 }
      );
    }

    // Validate assignment objects
    for (const assignment of body.assignments) {
      if (!assignment.color_key || !assignment.yarn_profile_id) {
        return NextResponse.json(
          { success: false, error: 'Each assignment must have color_key and yarn_profile_id' },
          { status: 400 }
        );
      }
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

    // Get the current session and verify ownership
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

    // Verify yarn profiles exist and belong to user
    const yarnProfileIds = body.assignments.map(a => a.yarn_profile_id);
    if (yarnProfileIds.length > 0) {
      const { data: yarnProfiles, error: yarnError } = await supabaseServer
        .from('yarn_profiles')
        .select('id')
        .eq('user_id', user.id)
        .in('id', yarnProfileIds);

      if (yarnError) {
        console.error('Error checking yarn profiles:', yarnError);
        return NextResponse.json(
          { success: false, error: 'Failed to verify yarn profiles' },
          { status: 500 }
        );
      }

      const foundYarnProfileIds = yarnProfiles.map(yp => yp.id);
      const missingYarnProfiles = yarnProfileIds.filter(id => !foundYarnProfileIds.includes(id));
      
      if (missingYarnProfiles.length > 0) {
        return NextResponse.json(
          { success: false, error: `Yarn profiles not found: ${missingYarnProfiles.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Update parameter snapshot with new colorwork assignments
    const currentSnapshot = currentSession.parameter_snapshot || {};
    const currentColorworkAssignments = currentSnapshot.colorwork_assignments as ColorworkAssignmentsSnapshot || {};

    // Convert assignments to snapshot format
    const assignmentsSnapshot = convertAssignmentsToSnapshot(body.assignments);

    // Update colorwork assignments for this stitch pattern
    const updatedColorworkAssignments: ColorworkAssignmentsSnapshot = {
      ...currentColorworkAssignments,
      [stitchPatternId]: assignmentsSnapshot
    };

    // Update the session
    const now = new Date().toISOString();
    const updatedParameterSnapshot = {
      ...currentSnapshot,
      colorwork_assignments: updatedColorworkAssignments
    };

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
      console.error('Error updating session with colorwork assignments:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save colorwork assignments' },
        { status: 500 }
      );
    }

    const response: ColorworkAssignmentsResponse = {
      success: true,
      data: {
        stitch_pattern_id: stitchPatternId,
        assignments: body.assignments,
        updated_at: now
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in PUT /api/pattern-definition-sessions/[id]/colorwork-assignments/[stitchPatternId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 