'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { YarnProfile } from '@/types/yarn';
import { getYarnProfiles } from '@/services/yarnProfileService';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

interface YarnSelectorProps {
  /** Currently selected yarn profile */
  selectedYarnProfile?: YarnProfile | null;
  /** Callback when a yarn profile is selected */
  onYarnProfileSelect: (yarnProfile: YarnProfile | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to create a new yarn profile */
  onCreateNew?: () => void;
}

/**
 * Component for selecting yarn profiles in pattern definition
 * Integrates with existing yarn service and components
 */
export default function YarnSelector({
  selectedYarnProfile = null,
  onYarnProfileSelect,
  disabled = false,
  className = '',
  onCreateNew
}: YarnSelectorProps) {
  const { t } = useTranslation();
  const [yarnProfiles, setYarnProfiles] = useState<YarnProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch yarn profiles on mount
  useEffect(() => {
    const fetchYarnProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const profiles = await getYarnProfiles();
        setYarnProfiles(profiles);
      } catch (err) {
        console.error('Error fetching yarn profiles:', err);
        setError(err instanceof Error ? err.message : t('yarn.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchYarnProfiles();
  }, [t]);

  const handleYarnProfileSelect = (yarnProfile: YarnProfile) => {
    onYarnProfileSelect(yarnProfile);
  };

  const handleClearSelection = () => {
    onYarnProfileSelect(null);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">
            {t('yarn.error_loading')}
          </h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('yarn.selectProfile', 'Select Yarn Profile')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('yarn.selectDescription', 'Choose the yarn profile for this pattern')}
          </p>
        </div>
        
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={disabled}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('yarn.createNew', 'Create New')}
          </button>
        )}
      </div>

      {/* Current Selection */}
      {selectedYarnProfile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-900">
                {t('yarn.currentSelection', 'Current Selection')}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {selectedYarnProfile.yarn_name}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-green-600">
                {selectedYarnProfile.brand_name && (
                  <span>{selectedYarnProfile.brand_name}</span>
                )}
                {selectedYarnProfile.yarn_weight_category && (
                  <span>Weight: {selectedYarnProfile.yarn_weight_category}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
              disabled={disabled}
            >
              {t('common.clear', 'Clear')}
            </button>
          </div>
        </div>
      )}

      {/* Yarn Profiles List */}
      {yarnProfiles.length > 0 ? (
        <div className="space-y-3">
          {yarnProfiles.map((yarnProfile) => (
            <div
              key={yarnProfile.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedYarnProfile?.id === yarnProfile.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && handleYarnProfileSelect(yarnProfile)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {yarnProfile.yarn_name}
                  </h4>
                  {yarnProfile.brand_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      {yarnProfile.brand_name}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    {yarnProfile.yarn_weight_category && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {yarnProfile.yarn_weight_category}
                      </span>
                    )}
                    {yarnProfile.skein_yardage && (
                      <span>
                        {yarnProfile.skein_yardage} yards/skein
                      </span>
                    )}
                  </div>
                  {yarnProfile.fiber_content && yarnProfile.fiber_content.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {yarnProfile.fiber_content.map(fiber => `${fiber.percentage}% ${fiber.fiber}`).join(', ')}
                    </p>
                  )}
                </div>
                
                {selectedYarnProfile?.id === yarnProfile.id && (
                  <div className="flex-shrink-0 ml-3">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {t('yarn.noProfiles', 'No yarn profiles')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('yarn.noProfilesDescription', 'Create your first yarn profile to continue')}
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              disabled={disabled}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('yarn.createFirst', 'Create First Yarn Profile')}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 