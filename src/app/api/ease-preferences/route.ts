import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { CreateEasePreference, EasePreference } from '@/types/ease';

/**
 * GET /api/ease-preferences
 * Retrieves all ease preferences for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Fetch ease preferences for the authenticated user
    const { data: easePreferences, error } = await supabase
      .from('ease_preferences')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ease preferences:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch ease preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: easePreferences as EasePreference[]
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/ease-preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ease-preferences
 * Creates a new ease preference for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { supabase, user } = sessionResult;

    // Parse request body
    let body: CreateEasePreference;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.preference_name || body.preference_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Preference name is required' },
        { status: 400 }
      );
    }

    if (!body.ease_type || !['absolute', 'percentage'].includes(body.ease_type)) {
      return NextResponse.json(
        { success: false, error: 'Valid ease type is required (absolute or percentage)' },
        { status: 400 }
      );
    }

    // Validate measurement unit for absolute ease
    if (body.ease_type === 'absolute' && body.measurement_unit && !['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Valid measurement unit is required for absolute ease (cm or inch)' },
        { status: 400 }
      );
    }

    // Validate ease values
    const easeFields = ['bust_ease', 'waist_ease', 'hip_ease', 'sleeve_ease'] as const;
    for (const field of easeFields) {
      if (body[field] !== undefined && body[field] !== null) {
        if (typeof body[field] !== 'number' || isNaN(body[field]!)) {
          return NextResponse.json(
            { success: false, error: `${field} must be a valid number` },
            { status: 400 }
          );
        }
        // Validate range based on ease type
        if (body.ease_type === 'percentage') {
          if (body[field]! < -50 || body[field]! > 100) {
            return NextResponse.json(
              { success: false, error: `${field} percentage must be between -50% and 100%` },
              { status: 400 }
            );
          }
        } else {
          if (body[field]! < -50 || body[field]! > 100) {
            return NextResponse.json(
              { success: false, error: `${field} absolute value must be between -50 and 100` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Check if preference name already exists for this user
    const { data: existingPreference } = await supabase
      .from('ease_preferences')
      .select('id')
      .eq('user_id', user.id)
      .eq('preference_name', body.preference_name.trim())
      .single();

    if (existingPreference) {
      return NextResponse.json(
        { success: false, error: 'An ease preference with this name already exists' },
        { status: 409 }
      );
    }

    // Create the ease preference
    const { data: newPreference, error } = await supabase
      .from('ease_preferences')
      .insert({
        user_id: user.id,
        preference_name: body.preference_name.trim(),
        ease_type: body.ease_type,
        bust_ease: body.bust_ease || null,
        waist_ease: body.waist_ease || null,
        hip_ease: body.hip_ease || null,
        sleeve_ease: body.sleeve_ease || null,
        measurement_unit: body.measurement_unit || null,
        notes: body.notes?.trim() || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ease preference:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create ease preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newPreference as EasePreference
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/ease-preferences:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 