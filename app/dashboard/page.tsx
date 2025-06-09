import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import ProfileSection from '@/components/dashboard/ProfileSection';
import PreferencesSection from '@/components/dashboard/PreferencesSection';
import PatternCreationCTA from '@/components/dashboard/PatternCreationCTA';

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
            <h2 className="text-xl font-semibold mb-4">Mes Patrons de Tricot</h2>
            
            {/* Section Création */}
            <div className="mb-6">
              <PatternCreationCTA />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Section Mes Patrons */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Mes patrons sauvegardés</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-2">Aucun patron créé pour le moment</p>
                <p className="text-sm text-gray-400">
                  Commencez par créer votre premier patron personnalisé !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 