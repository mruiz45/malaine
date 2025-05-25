'use client';

import { useEffect } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
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
          <p className="mt-4 text-gray-600">Loading...</p>
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
            Welcome to Malaine
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Your knitting and crochet assistant
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashboard */}
            <Link 
              href="/dashboard"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600">Access your main dashboard</p>
            </Link>

            {/* Gauge Profiles */}
            <Link 
              href="/gauge-profiles"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gauge Profiles</h3>
              <p className="text-gray-600">Manage your knitting gauge measurements</p>
            </Link>

            {/* Body Measurements */}
            <Link 
              href="/measurements"
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Body Measurements</h3>
              <p className="text-gray-600">Manage your body measurements for pattern sizing</p>
            </Link>

            {/* Profile */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile</h3>
              <p className="text-gray-600">Manage your account settings</p>
              <p className="text-sm text-gray-500 mt-2">Logged in as: {user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
