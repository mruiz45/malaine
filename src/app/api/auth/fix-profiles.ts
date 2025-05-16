import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Create Supabase client with service role key for admin operations
    // Using service role to be able to query auth schema directly
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string
    );
    
    // Check if the user exists in auth.users
    const { data: existingUser, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (userError || !existingUser) {
      return NextResponse.json({ 
        error: 'User not found in auth.users', 
        details: userError?.message 
      }, { status: 404 });
    }
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_id', userId)
      .single();
      
    if (existingProfile) {
      return NextResponse.json({ 
        message: 'Profile already exists',
        profile_id: existingProfile.id
      });
    }
    
    // Create missing profile
    const { data: newProfile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{ auth_id: userId }])
      .select()
      .single();
      
    if (profileError) {
      return NextResponse.json({ 
        error: 'Failed to create user profile',
        details: profileError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: 'User profile created successfully',
      profile: newProfile
    });
  } catch (error) {
    console.error('Error fixing user profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 