'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatternCreation, PatternCreationProvider } from '@/lib/contexts/PatternCreationContext';
import GarmentPartConfigurator from '@/components/patterns/GarmentPartConfigurator';
import { getTranslatedGarmentName } from '@/lib/garmentTranslations';

function PartsPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, setSelectedGarmentType } = usePatternCreation();
  const [isClient, setIsClient] = useState(false);
  const [garmentType, setGarmentType] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Récupérer le type depuis l'URL
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && garmentType !== typeFromUrl) {
      setGarmentType(typeFromUrl);
      // Simuler un objet garment type minimal pour la suite
      const fakeGarmentType = {
        id: '1',
        type_key: typeFromUrl,
        category: 'clothing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        image_url: null,
        is_active: true,
        metadata: {}
      };
      setSelectedGarmentType(fakeGarmentType);
    }
  }, [searchParams, setSelectedGarmentType, garmentType]);

  // Redirection si aucun type de vêtement sélectionné
  useEffect(() => {
    if (isClient && !garmentType) {
      router.push('/dashboard/patterns/new');
    }
  }, [isClient, garmentType, router]);

  const handleContinue = () => {
    // Navigation vers l'étape suivante (measurements)
    router.push('/dashboard/patterns/new/measurements');
  };

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

  if (!garmentType) {
    return null; // Redirection en cours
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
                  <a
                    href="/dashboard/patterns/new"
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                  >
                    {t('pattern_creation_breadcrumb')}
                  </a>
                </div>
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
                    {t('pattern_creation_step_2')}
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('part_config_page_title')} - {state.selectedGarmentType ? getTranslatedGarmentName(state.selectedGarmentType, t) : garmentType}
            </h1>
            <p className="mt-2 text-gray-600">
              {t('part_config_page_subtitle')}
            </p>
          </div>
        </div>

        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className="flex items-center text-green-600">
              <div className="flex items-center justify-center w-8 h-8 border-2 border-green-600 rounded-full bg-green-600 text-white text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium">{t('pattern_creation_step_1')}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center text-blue-600">
              <div className="flex items-center justify-center w-8 h-8 border-2 border-blue-600 rounded-full bg-blue-600 text-white text-sm font-medium">
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
            {state.selectedGarmentType && (
              <GarmentPartConfigurator
                selectedType={state.selectedGarmentType}
                onContinue={handleContinue}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartsPageClient() {
  return (
    <PatternCreationProvider>
      <PartsPageContent />
    </PatternCreationProvider>
  );
} 