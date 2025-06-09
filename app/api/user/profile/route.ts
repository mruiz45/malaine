import { NextResponse } from 'next/server';
import { getSupabaseSessionApi } from '@/lib/getSupabaseSession';

export async function PATCH(request: Request) {
  try {
    const { language_preference } = await request.json();

    // Get authenticated session (MANDATORY pattern per malaine-rules.mdc)
    const sessionInfo = await getSupabaseSessionApi(request);
    if (!sessionInfo) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { supabase, user } = sessionInfo;

  if (!language_preference) {
    return new NextResponse(
      JSON.stringify({ error: "Missing 'language_preference' parameter" }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ language_preference })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.json(data);
  } catch (error) {
    console.error('Error in user profile API:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 