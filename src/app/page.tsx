'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
            {t('home.welcome_message')}
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            {t('home.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashboard */}
            <Link 
              href="/dashboard"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('navigation.dashboard')}</h3>
              <p className="text-gray-600">{t('dashboard.content')}</p>
            </Link>

            {/* Gauge Profiles */}
            <Link 
              href="/gauge-profiles"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('gauge.title')}</h3>
              <p className="text-gray-600">{t('gauge.subtitle')}</p>
            </Link>

            {/* Body Measurements */}
            <Link 
              href="/measurements"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('measurements.title')}</h3>
              <p className="text-gray-600">{t('measurements.subtitle')}</p>
            </Link>

            {/* Profile */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('home.profile.title')}</h3>
              <p className="text-gray-600">{t('home.profile.description')}</p>
              <p className="text-sm text-gray-500 mt-2">{t('home.profile.logged_in_as')}: {user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
