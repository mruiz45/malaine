import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import type { CreateMeasurementSet, MeasurementSet } from '@/types/measurements';

/**
 * GET /api/measurement-sets
 * Retrieves all measurement sets for the authenticated user
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

    // Fetch measurement sets for the authenticated user
    const { data: measurementSets, error } = await supabase
      .from('measurement_sets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching measurement sets:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch measurement sets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: measurementSets as MeasurementSet[]
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/measurement-sets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/measurement-sets
 * Creates a new measurement set for the authenticated user
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
    const body: CreateMeasurementSet = await request.json();

    // Validate required fields
    if (!body.set_name || !body.measurement_unit) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: set_name, measurement_unit' },
        { status: 400 }
      );
    }

    // Validate measurement unit
    if (!['cm', 'inch'].includes(body.measurement_unit)) {
      return NextResponse.json(
        { success: false, error: 'Measurement unit must be either "cm" or "inch"' },
        { status: 400 }
      );
    }

    // Validate set name length
    if (body.set_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Set name cannot be empty' },
        { status: 400 }
      );
    }

    if (body.set_name.trim().length > 255) {
      return NextResponse.json(
        { success: false, error: 'Set name must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Validate measurement values (must be positive if provided)
    const measurementFields = [
      'chest_circumference', 'waist_circumference', 'hip_circumference',
      'shoulder_width', 'arm_length', 'inseam_length', 'torso_length',
      'head_circumference', 'neck_circumference', 'wrist_circumference',
      'ankle_circumference', 'foot_length'
    ];

    for (const field of measurementFields) {
      const value = body[field as keyof CreateMeasurementSet] as number;
      if (value !== undefined && value !== null) {
        if (typeof value !== 'number' || value <= 0) {
          return NextResponse.json(
            { success: false, error: `${field} must be a positive number` },
            { status: 400 }
          );
        }
        // Reasonable upper limit for measurements (in cm or inches)
        if (value > 999.99) {
          return NextResponse.json(
            { success: false, error: `${field} must be less than 1000` },
            { status: 400 }
          );
        }
      }
    }

    // Validate custom measurements if provided
    if (body.custom_measurements) {
      for (const [key, value] of Object.entries(body.custom_measurements)) {
        if (typeof value !== 'number' || value <= 0) {
          return NextResponse.json(
            { success: false, error: `Custom measurement "${key}" must be a positive number` },
            { status: 400 }
          );
        }
        if (value > 999.99) {
          return NextResponse.json(
            { success: false, error: `Custom measurement "${key}" must be less than 1000` },
            { status: 400 }
          );
        }
      }
    }

    // Check if set name already exists for this user
    const { data: existingSet } = await supabase
      .from('measurement_sets')
      .select('id')
      .eq('user_id', user.id)
      .eq('set_name', body.set_name.trim())
      .single();

    if (existingSet) {
      return NextResponse.json(
        { success: false, error: 'A measurement set with this name already exists' },
        { status: 409 }
      );
    }

    // Create the measurement set
    const { data: newMeasurementSet, error } = await supabase
      .from('measurement_sets')
      .insert({
        user_id: user.id,
        set_name: body.set_name.trim(),
        measurement_unit: body.measurement_unit,
        chest_circumference: body.chest_circumference || null,
        waist_circumference: body.waist_circumference || null,
        hip_circumference: body.hip_circumference || null,
        shoulder_width: body.shoulder_width || null,
        arm_length: body.arm_length || null,
        inseam_length: body.inseam_length || null,
        torso_length: body.torso_length || null,
        head_circumference: body.head_circumference || null,
        neck_circumference: body.neck_circumference || null,
        wrist_circumference: body.wrist_circumference || null,
        ankle_circumference: body.ankle_circumference || null,
        foot_length: body.foot_length || null,
        custom_measurements: body.custom_measurements || null,
        notes: body.notes || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating measurement set:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create measurement set' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newMeasurementSet as MeasurementSet
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/measurement-sets:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 