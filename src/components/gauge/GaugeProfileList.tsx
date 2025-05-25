'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { GaugeProfile } from '@/types/gauge';
import GaugeProfileCard from './GaugeProfileCard';

interface GaugeProfileListProps {
  /** Array of gauge profiles to display */
  gaugeProfiles: GaugeProfile[];
  /** Called when create new profile button is clicked */
  onCreateNew: () => void;
  /** Called when edit button is clicked on a profile */
  onEdit: (gaugeProfile: GaugeProfile) => void;
  /** Called when delete button is clicked on a profile */
  onDelete: (gaugeProfile: GaugeProfile) => void;
  /** Whether the list is currently loading */
  isLoading?: boolean;
  /** Whether actions are currently disabled */
  disabled?: boolean;
}

/**
 * Component for displaying a list of gauge profiles
 * Shows profiles in a responsive grid with create new option
 */
export default function GaugeProfileList({ 
  gaugeProfiles, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  isLoading = false,
  disabled = false 
}: GaugeProfileListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('gauge.title')}</h1>
            <p className="text-gray-600 mt-2">{t('gauge.subtitle')}</p>
          </div>
          <button
            disabled
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 opacity-50 cursor-not-allowed"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('gauge.create_new')}
          </button>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 rounded-md p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-gray-100 rounded-md p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">{t('gauge.title')}</h1>
          <p className="text-gray-600 mt-2">{t('gauge.subtitle')}</p>
        </div>
        <button
          onClick={onCreateNew}
          disabled={disabled}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('gauge.create_new')}
        </button>
      </div>

      {/* Profiles grid or empty state */}
      {gaugeProfiles.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('gauge.no_profiles')}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {t('gauge.info.gauge_explanation')}
          </p>
          <button
            onClick={onCreateNew}
            disabled={disabled}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('gauge.create_new')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gaugeProfiles.map((gaugeProfile) => (
            <GaugeProfileCard
              key={gaugeProfile.id}
              gaugeProfile={gaugeProfile}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Info section */}
      {gaugeProfiles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            {t('gauge.info.what_is_gauge')}
          </h3>
          <p className="text-blue-700 mb-4">
            {t('gauge.info.gauge_explanation')}
          </p>
          <div className="text-blue-700">
            <p className="font-medium mb-2">{t('gauge.info.how_to_measure')}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {(t('gauge.info.measure_steps', { returnObjects: true }) as string[]).map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 