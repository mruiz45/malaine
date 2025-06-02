'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { MeasurementSet } from '@/types/measurements';
import { getMeasurementSets } from '@/services/measurementService';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';

interface MeasurementSelectorProps {
  /** Currently selected measurement set */
  selectedMeasurementSet?: MeasurementSet | null;
  /** Callback when a measurement set is selected */
  onMeasurementSetSelect: (measurementSet: MeasurementSet | null) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback to create a new measurement set */
  onCreateNew?: () => void;
}

/**
 * Component for selecting measurement sets in pattern definition
 * Integrates with existing measurement service and components
 */
export default function MeasurementSelector({
  selectedMeasurementSet = null,
  onMeasurementSetSelect,
  disabled = false,
  className = '',
  onCreateNew
}: MeasurementSelectorProps) {
  const { t } = useTranslation();
  const [measurementSets, setMeasurementSets] = useState<MeasurementSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch measurement sets on mount
  useEffect(() => {
    const fetchMeasurementSets = async () => {
      try {
        setLoading(true);
        setError(null);
        const sets = await getMeasurementSets();
        setMeasurementSets(sets);
      } catch (err) {
        console.error('Error fetching measurement sets:', err);
        setError(err instanceof Error ? err.message : t('measurements.error_loading'));
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurementSets();
  }, [t]);

  const handleMeasurementSetSelect = (measurementSet: MeasurementSet) => {
    onMeasurementSetSelect(measurementSet);
  };

  const handleClearSelection = () => {
    onMeasurementSetSelect(null);
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
            {t('measurements.error_loading')}
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
            {t('measurements.selectSet', 'Select Measurement Set')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('measurements.selectDescription', 'Choose the measurement set for pattern calculations')}
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
            {t('measurements.createNew', 'Create New')}
          </button>
        )}
      </div>

      {/* Current Selection */}
      {selectedMeasurementSet && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                {t('measurements.currentSelection', 'Current Selection')}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedMeasurementSet.set_name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {selectedMeasurementSet.measurement_unit === 'cm' ? 'Centimeters' : 'Inches'}
              </p>
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

      {/* Measurement Sets List */}
      {measurementSets.length > 0 ? (
        <div className="space-y-3">
          {measurementSets.map((measurementSet) => (
            <div
              key={measurementSet.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedMeasurementSet?.id === measurementSet.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && handleMeasurementSetSelect(measurementSet)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {measurementSet.set_name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('measurements.lastUpdated', 'Last updated')}: {' '}
                    {new Date(measurementSet.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>
                      {measurementSet.measurement_unit === 'cm' ? 'Centimeters' : 'Inches'}
                    </span>
                    {measurementSet.notes && (
                      <span className="truncate max-w-32">
                        {measurementSet.notes}
                      </span>
                    )}
                  </div>
                </div>
                
                {selectedMeasurementSet?.id === measurementSet.id && (
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
            {t('measurements.noSets', 'No measurement sets')}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {t('measurements.noSetsDescription', 'Create your first measurement set to continue')}
          </p>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={disabled}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('measurements.createFirst', 'Create First Measurement Set')}
            </button>
          )}
        </div>
      )}
    </div>
  );
} 