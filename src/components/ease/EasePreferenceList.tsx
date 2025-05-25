'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { EasePreference } from '@/types/ease';
import EasePreferenceCard from './EasePreferenceCard';

interface EasePreferenceListProps {
  /** Array of ease preferences to display */
  easePreferences: EasePreference[];
  /** Called when create new preference button is clicked */
  onCreateNew: () => void;
  /** Called when edit button is clicked on a preference */
  onEdit: (easePreference: EasePreference) => void;
  /** Called when delete button is clicked on a preference */
  onDelete: (easePreference: EasePreference) => void;
  /** Whether the list is currently loading */
  isLoading?: boolean;
  /** Whether actions are currently disabled */
  disabled?: boolean;
}

/**
 * List component for displaying ease preferences
 * Shows all user's ease preferences with create, edit, and delete actions
 */
export default function EasePreferenceList({ 
  easePreferences, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  isLoading = false,
  disabled = false 
}: EasePreferenceListProps) {
  const { t } = useTranslation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('ease.title')}</h1>
            <p className="text-gray-600 mt-2">{t('ease.subtitle')}</p>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('ease.title')}</h1>
          <p className="text-gray-600 mt-2">{t('ease.subtitle')}</p>
        </div>
        <button
          onClick={onCreateNew}
          disabled={disabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('ease.create_new')}
        </button>
      </div>

      {/* Preferences grid or empty state */}
      {easePreferences.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="h-full w-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('ease.no_preferences')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {t('ease.info.ease_explanation')}
          </p>
          <button
            onClick={onCreateNew}
            disabled={disabled}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('ease.create_new')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {easePreferences.map((easePreference) => (
            <EasePreferenceCard
              key={easePreference.id}
              easePreference={easePreference}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Info section */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          {t('ease.info.what_is_ease')}
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>{t('ease.info.ease_explanation')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t('ease.info.negative_ease_desc')}</li>
            <li>{t('ease.info.zero_ease_desc')}</li>
            <li>{t('ease.info.positive_ease_desc')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 