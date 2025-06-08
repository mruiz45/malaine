import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import ProfileSection from '@/components/dashboard/ProfileSection';
import PreferencesSection from '@/components/dashboard/PreferencesSection';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }
  
  const userProfile = {
    email: user.email,
    id: user.id,
    role: profile?.role ?? 'user',
    language_preference: profile?.language_preference ?? 'en'
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileSection user={userProfile} />
        </div>
        <div className="md:col-span-2">
          <PreferencesSection user={userProfile} />
          <div className="mt-6 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Knitting Projects</h2>
            <p className="text-gray-600">This section is coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 