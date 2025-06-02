'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { GaugeProfile } from '@/types/gauge';
import { getGaugeProfiles } from '@/services/gaugeService';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

interface GaugeSelectorProps {
  /** Currently selected gauge profile */
  selectedGaugeProfile?: GaugeProfile | null;
  /** Callback when a gauge profile is selected */
  onGaugeProfileSelect: (gaugeProfile: GaugeProfile | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to create a new gauge profile */
  onCreateNew?: () => void;
  /** Allow manual gauge input instead of profile selection */
  allowManualInput?: boolean;
  /** Manual gauge values */
  manualGauge?: {
    stitch_count: number;
    row_count: number;
    unit: string;
  } | null;
  /** Callback for manual gauge input */
  onManualGaugeChange?: (gauge: { stitch_count: number; row_count: number; unit: string } | null) => void;
}

/**
 * Component for selecting gauge profiles or entering manual gauge in pattern definition
 * Integrates with existing gauge service and components
 */
export default function GaugeSelector({
  selectedGaugeProfile = null,
  onGaugeProfileSelect,
  disabled = false,
  className = '',
  onCreateNew,
  allowManualInput = true,
  manualGauge = null,
  onManualGaugeChange
}: GaugeSelectorProps) {
  const { t } = useTranslation();
  const [gaugeProfiles, setGaugeProfiles] = useState<GaugeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'profile' | 'manual'>('profile');
  const [manualValues, setManualValues] = useState({
    stitch_count: manualGauge?.stitch_count || 20,
    row_count: manualGauge?.row_count || 28,
    unit: manualGauge?.unit || '10cm'
  });

  // Fetch gauge profiles on mount
  useEffect(() => {
    const fetchGaugeProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        const profiles = await getGaugeProfiles();
        setGaugeProfiles(profiles);
      } catch (err) {
        console.error('Error fetching gauge profiles:', err);
        setError(err instanceof Error ? err.message : t('gauge.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchGaugeProfiles();
  }, [t]);

  // Set initial mode based on existing selection
  useEffect(() => {
    if (selectedGaugeProfile) {
      setInputMode('profile');
    } else if (manualGauge) {
      setInputMode('manual');
      setManualValues(manualGauge);
    }
  }, [selectedGaugeProfile, manualGauge]);

  const handleGaugeProfileSelect = (gaugeProfile: GaugeProfile) => {
    onGaugeProfileSelect(gaugeProfile);
    if (onManualGaugeChange) {
      onManualGaugeChange(null);
    }
  };

  const handleClearSelection = () => {
    onGaugeProfileSelect(null);
    if (onManualGaugeChange) {
      onManualGaugeChange(null);
    }
  };

  const handleModeChange = (mode: 'profile' | 'manual') => {
    setInputMode(mode);
    if (mode === 'profile') {
      if (onManualGaugeChange) {
        onManualGaugeChange(null);
      }
    } else {
      onGaugeProfileSelect(null);
      if (onManualGaugeChange) {
        onManualGaugeChange(manualValues);
      }
    }
  };

  const handleManualValueChange = (field: string, value: string | number) => {
    const newValues = { ...manualValues, [field]: value };
    setManualValues(newValues);
    if (onManualGaugeChange && inputMode === 'manual') {
      onManualGaugeChange(newValues);
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
            {t('gauge.error_loading')}
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
            {t('gauge.selectProfile', 'Select Gauge')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('gauge.selectDescription', 'Choose a gauge profile or enter gauge manually')}
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
            {t('gauge.createNew', 'Create New')}
          </button>
        )}
      </div>

      {/* Mode Selection */}
      {allowManualInput && (
        <div className="flex space-x-4 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={() => handleModeChange('profile')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              inputMode === 'profile'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            disabled={disabled}
          >
            {t('gauge.useProfile', 'Use Gauge Profile')}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('manual')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              inputMode === 'manual'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            disabled={disabled}
          >
            {t('gauge.enterManually', 'Enter Manually')}
          </button>
        </div>
      )}

      {/* Current Selection */}
      {(selectedGaugeProfile || manualGauge) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {t('gauge.currentSelection', 'Current Selection')}
              </h4>
              {selectedGaugeProfile ? (
                <div>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedGaugeProfile.profile_name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {selectedGaugeProfile.stitch_count} sts, {selectedGaugeProfile.row_count} rows per {selectedGaugeProfile.measurement_unit === 'cm' ? '10cm' : '4inch'}
                  </p>
                </div>
              ) : manualGauge && (
                <div>
                  <p className="text-sm text-blue-700 mt-1">
                    Manual Gauge
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {manualGauge.stitch_count} sts, {manualGauge.row_count} rows per {manualGauge.unit}
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled={disabled}
            >
              {t('common.clear', 'Clear')}
            </button>
          </div>
        </div>
      )}

      {/* Profile Selection Mode */}
      {inputMode === 'profile' && (
        <div>
          {gaugeProfiles.length > 0 ? (
            <div className="space-y-3">
              {gaugeProfiles.map((gaugeProfile) => (
                <div
                  key={gaugeProfile.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedGaugeProfile?.id === gaugeProfile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && handleGaugeProfileSelect(gaugeProfile)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {gaugeProfile.profile_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('gauge.lastUpdated', 'Last updated')}: {' '}
                        {new Date(gaugeProfile.updated_at).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {gaugeProfile.stitch_count} sts
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {gaugeProfile.row_count} rows
                        </span>
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          per {gaugeProfile.measurement_unit === 'cm' ? '10cm' : '4inch'}
                        </span>
                      </div>
                      {gaugeProfile.notes && (
                        <p className="text-xs text-gray-500 mt-1 truncate max-w-64">
                          {gaugeProfile.notes}
                        </p>
                      )}
                    </div>
                    
                    {selectedGaugeProfile?.id === gaugeProfile.id && (
                      <div className="flex-shrink-0 ml-3">
                        <CheckIcon className="h-5 w-5 text-blue-600" />
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
                {t('gauge.noProfiles', 'No gauge profiles')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('gauge.noProfilesDescription', 'Create your first gauge profile or enter gauge manually')}
              </p>
              {onCreateNew && (
                <button
                  type="button"
                  onClick={onCreateNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={disabled}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('gauge.createNew', 'Create New')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Input Mode */}
      {inputMode === 'manual' && allowManualInput && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            {t('gauge.manualInput', 'Manual Gauge Input')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gauge.stitchCount', 'Stitch Count')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={manualValues.stitch_count}
                onChange={(e) => handleManualValueChange('stitch_count', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gauge.rowCount', 'Row Count')}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={manualValues.row_count}
                onChange={(e) => handleManualValueChange('row_count', parseInt(e.target.value) || 0)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('gauge.unit', 'Unit')}
              </label>
              <select
                value={manualValues.unit}
                onChange={(e) => handleManualValueChange('unit', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                disabled={disabled}
              >
                <option value="10cm">10cm</option>
                <option value="4inch">4 inches</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('gauge.manualInputDescription', 'Enter the number of stitches and rows in the specified measurement unit')}
          </p>
        </div>
      )}
    </div>
  );
} 