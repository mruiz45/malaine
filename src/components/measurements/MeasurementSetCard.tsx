'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MeasurementSet } from '@/types/measurements';
import { formatMeasurement } from '@/services/measurementService';

interface MeasurementSetCardProps {
  measurementSet: MeasurementSet;
  onEdit?: (measurementSet: MeasurementSet) => void;
  onDelete?: (measurementSet: MeasurementSet) => void;
  onView?: (measurementSet: MeasurementSet) => void;
}

/**
 * Card component to display a measurement set in a list
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */
export default function MeasurementSetCard({
  measurementSet,
  onEdit,
  onDelete,
  onView
}: MeasurementSetCardProps) {
  const { t } = useTranslation();
  // Count how many measurements are filled
  const filledMeasurements = [
    measurementSet.chest_circumference,
    measurementSet.waist_circumference,
    measurementSet.hip_circumference,
    measurementSet.shoulder_width,
    measurementSet.arm_length,
    measurementSet.inseam_length,
    measurementSet.torso_length,
    measurementSet.head_circumference,
    measurementSet.neck_circumference,
    measurementSet.wrist_circumference,
    measurementSet.ankle_circumference,
    measurementSet.foot_length
  ].filter(value => value !== null && value !== undefined).length;

  const customMeasurementsCount = measurementSet.custom_measurements 
    ? Object.keys(measurementSet.custom_measurements).length 
    : 0;

  const totalMeasurements = filledMeasurements + customMeasurementsCount;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {measurementSet.set_name}
          </h3>
          <p className="text-sm text-gray-500">
            {t('measurements.form.measurement_unit')}: {measurementSet.measurement_unit === 'cm' ? t('measurements.view.unit_cm') : t('measurements.view.unit_inch')}
          </p>
        </div>
        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(measurementSet)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('measurements.view_button')}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(measurementSet)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              {t('measurements.edit_button')}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(measurementSet)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {t('measurements.delete')}
            </button>
          )}
        </div>
      </div>

      {/* Measurements Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {totalMeasurements} {totalMeasurements === 1 ? t('measurements.measurements_recorded') : t('measurements.measurements_recorded_plural')}
        </p>
        
        {/* Show a few key measurements if available */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {measurementSet.chest_circumference && (
            <div>
              <span className="text-gray-500">{t('measurements.fields.chest')}:</span>{' '}
              <span className="font-medium">
                {formatMeasurement(measurementSet.chest_circumference, measurementSet.measurement_unit)}
              </span>
            </div>
          )}
          {measurementSet.waist_circumference && (
            <div>
              <span className="text-gray-500">{t('measurements.fields.waist')}:</span>{' '}
              <span className="font-medium">
                {formatMeasurement(measurementSet.waist_circumference, measurementSet.measurement_unit)}
              </span>
            </div>
          )}
          {measurementSet.hip_circumference && (
            <div>
              <span className="text-gray-500">{t('measurements.fields.hips')}:</span>{' '}
              <span className="font-medium">
                {formatMeasurement(measurementSet.hip_circumference, measurementSet.measurement_unit)}
              </span>
            </div>
          )}
          {measurementSet.arm_length && (
            <div>
              <span className="text-gray-500">{t('measurements.fields.arm')}:</span>{' '}
              <span className="font-medium">
                {formatMeasurement(measurementSet.arm_length, measurementSet.measurement_unit)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes preview */}
      {measurementSet.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {measurementSet.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-400 border-t pt-3">
        <span>{t('measurements.view.created')}: {formatDate(measurementSet.created_at)}</span>
        {measurementSet.updated_at !== measurementSet.created_at && (
          <span>{t('measurements.view.updated')}: {formatDate(measurementSet.updated_at)}</span>
        )}
      </div>
    </div>
  );
} 