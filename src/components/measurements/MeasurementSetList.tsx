'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { MeasurementSet } from '@/types/measurements';
import { getMeasurementSets, deleteMeasurementSet } from '@/services/measurementService';
import MeasurementSetCard from './MeasurementSetCard';

interface MeasurementSetListProps {
  onEdit?: (measurementSet: MeasurementSet) => void;
  onView?: (measurementSet: MeasurementSet) => void;
  onCreateNew?: () => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

/**
 * List component to display all measurement sets for the authenticated user
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */
export default function MeasurementSetList({
  onEdit,
  onView,
  onCreateNew,
  refreshTrigger = 0
}: MeasurementSetListProps) {
  const { t } = useTranslation();
  const [measurementSets, setMeasurementSets] = useState<MeasurementSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch measurement sets
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

  // Handle delete with confirmation
  const handleDelete = async (measurementSet: MeasurementSet) => {
    if (!confirm(t('measurements.confirm_delete', { name: measurementSet.set_name }))) {
      return;
    }

    try {
      setDeletingId(measurementSet.id);
      await deleteMeasurementSet(measurementSet.id);
      
      // Remove from local state
      setMeasurementSets(prev => prev.filter(set => set.id !== measurementSet.id));
    } catch (err) {
      console.error('Error deleting measurement set:', err);
      alert(err instanceof Error ? err.message : t('measurements.delete_error'));
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch data on mount and when refresh trigger changes
  useEffect(() => {
    fetchMeasurementSets();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t('measurements.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">{t('measurements.error_loading')}</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchMeasurementSets}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          {t('measurements.try_again')}
        </button>
      </div>
    );
  }

  if (measurementSets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('measurements.no_sets')}</h3>
        <p className="text-gray-600 mb-6">
          {t('measurements.no_sets_description')}
        </p>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('measurements.create_first')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('measurements.your_sets')}</h2>
          <p className="text-gray-600 mt-1">
            {measurementSets.length} {measurementSets.length === 1 ? t('measurements.measurement_count') : t('measurements.measurement_count_plural')}
          </p>
        </div>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('measurements.new_measurement_set')}
          </button>
        )}
      </div>

      {/* Grid of measurement set cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {measurementSets.map((measurementSet) => (
          <div key={measurementSet.id} className="relative">
            {deletingId === measurementSet.id && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                <span className="ml-2 text-red-600">{t('measurements.deleting')}</span>
              </div>
            )}
            <MeasurementSetCard
              measurementSet={measurementSet}
              onEdit={onEdit}
              onView={onView}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 