'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { EasePreference, EaseType, EaseCategory } from '@/types/ease';
import { getEasePreferences } from '@/services/easeService';
import { EASE_CATEGORIES } from '@/types/ease';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

interface EaseSelectorProps {
  /** Currently selected ease preference */
  selectedEasePreference?: EasePreference | null;
  /** Callback when an ease preference is selected */
  onEasePreferenceSelect: (easePreference: EasePreference | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to create a new ease preference */
  onCreateNew?: () => void;
  /** Allow quick selection from predefined categories */
  allowQuickSelection?: boolean;
  /** Quick ease selection */
  quickEase?: {
    type: EaseType;
    value_bust: number;
    unit?: string;
  } | null;
  /** Callback for quick ease selection */
  onQuickEaseChange?: (ease: { type: EaseType; value_bust: number; unit?: string } | null) => void;
}

/**
 * Component for selecting ease preferences or quick ease values in pattern definition
 * Integrates with existing ease service and components
 */
export default function EaseSelector({
  selectedEasePreference = null,
  onEasePreferenceSelect,
  disabled = false,
  className = '',
  onCreateNew,
  allowQuickSelection = true,
  quickEase = null,
  onQuickEaseChange
}: EaseSelectorProps) {
  const { t } = useTranslation();
  const [easePreferences, setEasePreferences] = useState<EasePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'preference' | 'quick'>('preference');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch ease preferences on mount
  useEffect(() => {
    const fetchEasePreferences = async () => {
      try {
        setLoading(true);
        setError(null);
        const preferences = await getEasePreferences();
        setEasePreferences(preferences);
      } catch (err) {
        console.error('Error fetching ease preferences:', err);
        setError(err instanceof Error ? err.message : t('ease.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchEasePreferences();
  }, [t]);

  // Set initial mode based on existing selection
  useEffect(() => {
    if (selectedEasePreference) {
      setInputMode('preference');
    } else if (quickEase) {
      setInputMode('quick');
    }
  }, [selectedEasePreference, quickEase]);

  const handleEasePreferenceSelect = (easePreference: EasePreference) => {
    onEasePreferenceSelect(easePreference);
    if (onQuickEaseChange) {
      onQuickEaseChange(null);
    }
    setSelectedCategory(null);
  };

  const handleClearSelection = () => {
    onEasePreferenceSelect(null);
    if (onQuickEaseChange) {
      onQuickEaseChange(null);
    }
    setSelectedCategory(null);
  };

  const handleModeChange = (mode: 'preference' | 'quick') => {
    setInputMode(mode);
    if (mode === 'preference') {
      if (onQuickEaseChange) {
        onQuickEaseChange(null);
      }
      setSelectedCategory(null);
    } else {
      onEasePreferenceSelect(null);
    }
  };

  const handleCategorySelect = (category: EaseCategory) => {
    setSelectedCategory(category.key);
    if (onQuickEaseChange && inputMode === 'quick') {
      onQuickEaseChange({
        type: category.ease_type,
        value_bust: category.values.bust_ease,
        unit: category.measurement_unit
      });
    }
  };

  const formatEaseValue = (value: number | undefined, type: EaseType, unit?: string) => {
    if (value === undefined) return 'N/A';
    const sign = value > 0 ? '+' : '';
    if (type === 'percentage') {
      return `${sign}${value}%`;
    } else {
      return `${sign}${value}${unit || 'cm'}`;
    }
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
            {t('ease.error_loading')}
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
            {t('ease.selectPreference', 'Select Ease')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('ease.selectDescription', 'Choose an ease preference or select a quick option')}
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
            {t('ease.createNew', 'Create New')}
          </button>
        )}
      </div>

      {/* Mode Selection */}
      {allowQuickSelection && (
        <div className="flex space-x-4 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={() => handleModeChange('preference')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              inputMode === 'preference'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            disabled={disabled}
          >
            {t('ease.usePreference', 'Use Ease Preference')}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('quick')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              inputMode === 'quick'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            disabled={disabled}
          >
            {t('ease.quickSelection', 'Quick Selection')}
          </button>
        </div>
      )}

      {/* Current Selection */}
      {(selectedEasePreference || quickEase) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-purple-900">
                {t('ease.currentSelection', 'Current Selection')}
              </h4>
              {selectedEasePreference ? (
                <div>
                  <p className="text-sm text-purple-700 mt-1">
                    {selectedEasePreference.preference_name}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Bust: {formatEaseValue(selectedEasePreference.bust_ease, selectedEasePreference.ease_type, selectedEasePreference.measurement_unit)}
                  </p>
                </div>
              ) : quickEase && (
                <div>
                  <p className="text-sm text-purple-700 mt-1">
                    Quick Ease Selection
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {formatEaseValue(quickEase.value_bust, quickEase.type, quickEase.unit)}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              disabled={disabled}
            >
              {t('common.clear', 'Clear')}
            </button>
          </div>
        </div>
      )}

      {/* Preference Selection Mode */}
      {inputMode === 'preference' && (
        <div>
          {easePreferences.length > 0 ? (
            <div className="space-y-3">
              {easePreferences.map((easePreference) => (
                <div
                  key={easePreference.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedEasePreference?.id === easePreference.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && handleEasePreferenceSelect(easePreference)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {easePreference.preference_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('ease.lastUpdated', 'Last updated')}: {' '}
                        {new Date(easePreference.updated_at).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Bust: {formatEaseValue(easePreference.bust_ease, easePreference.ease_type, easePreference.measurement_unit)}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Waist: {formatEaseValue(easePreference.waist_ease, easePreference.ease_type, easePreference.measurement_unit)}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Hip: {formatEaseValue(easePreference.hip_ease, easePreference.ease_type, easePreference.measurement_unit)}
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          Sleeve: {formatEaseValue(easePreference.sleeve_ease, easePreference.ease_type, easePreference.measurement_unit)}
                        </span>
                      </div>
                      {easePreference.notes && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-64">
                          {easePreference.notes}
                        </p>
                      )}
                    </div>
                    
                    {selectedEasePreference?.id === easePreference.id && (
                      <div className="flex-shrink-0 ml-3">
                        <CheckIcon className="h-5 w-5 text-purple-600" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t('ease.noPreferences', 'No ease preferences')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('ease.noPreferencesDescription', 'Create your first ease preference or use quick selection')}
              </p>
              {onCreateNew && (
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  disabled={disabled}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('ease.createNew', 'Create New')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Selection Mode */}
      {inputMode === 'quick' && allowQuickSelection && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {t('ease.quickSelection', 'Quick Ease Selection')}
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            {t('ease.quickSelectionDescription', 'Choose from common ease categories')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EASE_CATEGORIES.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => !disabled && handleCategorySelect(category)}
                disabled={disabled}
                className={`p-3 border rounded-lg text-left transition-colors duration-200 disabled:opacity-50 ${
                  selectedCategory === category.key
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <h5 className="font-medium text-gray-900 text-sm mb-1">{category.label}</h5>
                <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                <div className="text-xs text-gray-500">
                  Bust: {formatEaseValue(category.values.bust_ease, category.ease_type, category.measurement_unit)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 