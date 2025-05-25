import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { CreateYarnProfile, YarnProfile } from '@/types/yarn';

/**
 * GET /api/yarn-profiles
 * Retrieves all yarn profiles for the authenticated user
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

    // Fetch yarn profiles for the authenticated user
    const { data: yarnProfiles, error } = await supabase
      .from('yarn_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching yarn profiles:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch yarn profiles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: yarnProfiles as YarnProfile[]
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/yarn-profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/yarn-profiles
 * Creates a new yarn profile for the authenticated user
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
    const body: CreateYarnProfile = await request.json();

    // Validate required fields
    if (!body.yarn_name || body.yarn_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Yarn name is required' },
        { status: 400 }
      );
    }

    // Validate yarn name length
    if (body.yarn_name.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: 'Yarn name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate brand name length if provided
    if (body.brand_name && body.brand_name.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: 'Brand name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate numeric values if provided
    if (body.skein_yardage !== undefined && body.skein_yardage <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein yardage must be a positive number' },
        { status: 400 }
      );
    }

    if (body.skein_meterage !== undefined && body.skein_meterage <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein meterage must be a positive number' },
        { status: 400 }
      );
    }

    if (body.skein_weight_grams !== undefined && body.skein_weight_grams <= 0) {
      return NextResponse.json(
        { success: false, error: 'Skein weight must be a positive number' },
        { status: 400 }
      );
    }

    // Validate color hex code format if provided
    if (body.color_hex_code && !/^#[0-9A-Fa-f]{6}$/.test(body.color_hex_code)) {
      return NextResponse.json(
        { success: false, error: 'Color hex code must be in format #RRGGBB' },
        { status: 400 }
      );
    }

    // Validate fiber content if provided
    if (body.fiber_content) {
      const totalPercentage = body.fiber_content.reduce((sum, fiber) => sum + fiber.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return NextResponse.json(
          { success: false, error: 'Fiber content percentages must sum to 100%' },
          { status: 400 }
        );
      }

      for (const fiber of body.fiber_content) {
        if (!fiber.fiber || fiber.fiber.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: 'Fiber name cannot be empty' },
            { status: 400 }
          );
        }
        if (fiber.percentage <= 0 || fiber.percentage > 100) {
          return NextResponse.json(
            { success: false, error: 'Fiber percentage must be between 0 and 100' },
            { status: 400 }
          );
        }
      }
    }

    // Check if yarn profile with same name already exists for this user
    const { data: existingProfile } = await supabase
      .from('yarn_profiles')
      .select('id')
      .eq('user_id', user.id)
      .eq('yarn_name', body.yarn_name.trim())
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'A yarn profile with this name already exists' },
        { status: 409 }
      );
    }

    // Create the yarn profile
    const { data: newProfile, error } = await supabase
      .from('yarn_profiles')
      .insert({
        user_id: user.id,
        yarn_name: body.yarn_name.trim(),
        brand_name: body.brand_name?.trim() || null,
        fiber_content: body.fiber_content || null,
        yarn_weight_category: body.yarn_weight_category || null,
        skein_yardage: body.skein_yardage || null,
        skein_meterage: body.skein_meterage || null,
        skein_weight_grams: body.skein_weight_grams || null,
        color_name: body.color_name?.trim() || null,
        color_hex_code: body.color_hex_code || null,
        dye_lot: body.dye_lot?.trim() || null,
        purchase_link: body.purchase_link?.trim() || null,
        ravelry_id: body.ravelry_id?.trim() || null,
        notes: body.notes?.trim() || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating yarn profile:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create yarn profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newProfile as YarnProfile
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/yarn-profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 