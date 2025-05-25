import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { UpdateEasePreference, EasePreference } from '@/types/ease';

/**
 * GET /api/ease-preferences/[id]
 * Retrieves a specific ease preference for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Fetch the specific ease preference
    const { data: easePreference, error } = await supabase
      .from('ease_preferences')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Ease preference not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching ease preference:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ease preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: easePreference as EasePreference
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/ease-preferences/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ease-preferences/[id]
 * Updates a specific ease preference for the authenticated user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Parse request body
    let body: UpdateEasePreference;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate preference name if provided
    if (body.preference_name !== undefined) {
      if (!body.preference_name || body.preference_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Preference name cannot be empty' },
          { status: 400 }
        );
      }
    }

    // Validate ease type if provided
    if (body.ease_type !== undefined && !['absolute', 'percentage'].includes(body.ease_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid ease type is required (absolute or percentage)' },
        { status: 400 }
      );
    }

    // Validate measurement unit if provided
    if (body.measurement_unit !== undefined && body.measurement_unit !== null && !['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Valid measurement unit is required (cm or inch)' },
        { status: 400 }
      );
    }

    // Validate ease values if provided
    const easeFields = ['bust_ease', 'waist_ease', 'hip_ease', 'sleeve_ease'] as const;
    for (const field of easeFields) {
      if (body[field] !== undefined && body[field] !== null) {
        if (typeof body[field] !== 'number' || isNaN(body[field]!)) {
          return NextResponse.json(
            { success: false, error: `${field} must be a valid number` },
            { status: 400 }
          );
        }
        // Validate range (we'll use general range since ease_type might not be in the update)
        if (body[field]! < -50 || body[field]! > 100) {
          return NextResponse.json(
            { success: false, error: `${field} must be between -50 and 100` },
            { status: 400 }
          );
        }
      }
    }

    // Check if preference name already exists for this user (if name is being updated)
    if (body.preference_name) {
      const { data: existingPreference } = await supabase
        .from('ease_preferences')
        .select('id')
        .eq('user_id', user.id)
        .eq('preference_name', body.preference_name.trim())
        .neq('id', id)
        .single();

      if (existingPreference) {
        return NextResponse.json(
          { success: false, error: 'An ease preference with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (body.preference_name !== undefined) updateData.preference_name = body.preference_name.trim();
    if (body.ease_type !== undefined) updateData.ease_type = body.ease_type;
    if (body.bust_ease !== undefined) updateData.bust_ease = body.bust_ease;
    if (body.waist_ease !== undefined) updateData.waist_ease = body.waist_ease;
    if (body.hip_ease !== undefined) updateData.hip_ease = body.hip_ease;
    if (body.sleeve_ease !== undefined) updateData.sleeve_ease = body.sleeve_ease;
    if (body.measurement_unit !== undefined) updateData.measurement_unit = body.measurement_unit;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    // Update the ease preference
    const { data: updatedPreference, error } = await supabase
      .from('ease_preferences')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Ease preference not found' },
          { status: 404 }
        );
      }
      console.error('Error updating ease preference:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update ease preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPreference as EasePreference
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/ease-preferences/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ease-preferences/[id]
 * Deletes a specific ease preference for the authenticated user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;
    const { id } = await params;

    // Delete the ease preference
    const { error } = await supabase
      .from('ease_preferences')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting ease preference:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete ease preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/ease-preferences/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 