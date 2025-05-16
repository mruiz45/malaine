'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/utils/AuthContext';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <p className="mb-4">
              {t('dashboard.welcome')} {user?.email}!
            </p>
            <p className="text-gray-600 mb-4">
              {t('dashboard.content')}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 