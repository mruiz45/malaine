'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PatternCreationWizard from './PatternCreationWizard';
import { Database } from '@/lib/database.types';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface NewPatternClientProps {
  initialGarmentTypes: GarmentType[];
}

export default function NewPatternClient({ initialGarmentTypes }: NewPatternClientProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <div className="h-4 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-80 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-16 bg-gray-200 rounded mb-8 animate-pulse"></div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* En-tête avec breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a
                  href="/dashboard"
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  {t('dashboard_title')}
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="w-3 h-3 text-gray-400 mx-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {t('pattern_creation_breadcrumb')}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('pattern_creation_title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('pattern_creation_subtitle')}
            </p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-8 h-8 border-2 border-blue-600 rounded-full bg-blue-600 text-white text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium">{t('pattern_creation_step_1')}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium">{t('pattern_creation_step_2')}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center text-gray-400">
              <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm font-medium">{t('pattern_creation_step_3')}</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <PatternCreationWizard initialGarmentTypes={initialGarmentTypes} />
          </div>
        </div>
      </div>
    </div>
  );
} 