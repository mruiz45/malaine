'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ChartBarIcon, UserIcon, AdjustmentsHorizontalIcon, SwatchIcon, Squares2X2Icon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
            <p className="text-gray-600 mb-6">
              {t('dashboard.content')}
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Link
                href="/gauge-profiles"
                className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-900">{t('gauge.title')}</h3>
                  <p className="text-sm text-blue-700">{t('gauge.subtitle')}</p>
                </div>
              </Link>
              
              <Link
                href="/measurements"
                className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <UserIcon className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h3 className="font-medium text-green-900">{t('measurements.title')}</h3>
                  <p className="text-sm text-green-700">{t('measurements.subtitle')}</p>
                </div>
              </Link>

              <Link
                href="/ease-preferences"
                className="flex items-center p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors duration-200"
              >
                <AdjustmentsHorizontalIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-purple-900">{t('ease.title')}</h3>
                  <p className="text-sm text-purple-700">{t('ease.subtitle')}</p>
                </div>
              </Link>

              <Link
                href="/yarn-profiles"
                className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors duration-200"
              >
                <SwatchIcon className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-orange-900">{t('yarn.title')}</h3>
                  <p className="text-sm text-orange-700">{t('yarn.subtitle')}</p>
                </div>
              </Link>

              <Link
                href="/stitch-patterns"
                className="flex items-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
              >
                <Squares2X2Icon className="h-8 w-8 text-indigo-600 mr-3" />
                <div>
                  <h3 className="font-medium text-indigo-900">{t('stitchPattern.title', 'Stitch Patterns')}</h3>
                  <p className="text-sm text-indigo-700">{t('stitchPattern.subtitle', 'Choose your stitch pattern')}</p>
                </div>
              </Link>

              <Link
                href="/pattern-definition"
                className="flex items-center p-4 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors duration-200"
              >
                <DocumentTextIcon className="h-8 w-8 text-teal-600 mr-3" />
                <div>
                  <h3 className="font-medium text-teal-900">{t('patternDefinition.title', 'Pattern Definition')}</h3>
                  <p className="text-sm text-teal-700">{t('patternDefinition.subtitle', 'Create your pattern')}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 