'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { GaugeProfile } from '@/types/gauge';

interface GaugeProfileCardProps {
  /** The gauge profile to display */
  gaugeProfile: GaugeProfile;
  /** Called when edit button is clicked */
  onEdit: (gaugeProfile: GaugeProfile) => void;
  /** Called when delete button is clicked */
  onDelete: (gaugeProfile: GaugeProfile) => void;
  /** Whether actions are currently disabled (e.g., during loading) */
  disabled?: boolean;
}

/**
 * Card component for displaying a single gauge profile
 * Shows gauge measurements and provides edit/delete actions
 */
export default function GaugeProfileCard({ gaugeProfile, onEdit, onDelete, disabled = false }: GaugeProfileCardProps) {
  const { t } = useTranslation();

  const handleEdit = () => {
    if (!disabled) {
      onEdit(gaugeProfile);
    }
  };

  const handleDelete = () => {
    if (!disabled) {
      const confirmed = window.confirm(t('gauge.messages.confirm_delete'));
      if (confirmed) {
        onDelete(gaugeProfile);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header with name and actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
          {gaugeProfile.profile_name}
        </h3>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={handleEdit}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('gauge.edit')}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('gauge.delete')}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Gauge measurements */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('gauge.form.stitch_count')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {gaugeProfile.stitch_count}
          </div>
          <div className="text-xs text-gray-500">
            per {gaugeProfile.swatch_width}{gaugeProfile.measurement_unit} × {gaugeProfile.swatch_height}{gaugeProfile.measurement_unit}
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('gauge.form.row_count')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {gaugeProfile.row_count}
          </div>
          <div className="text-xs text-gray-500">
            per {gaugeProfile.swatch_width}{gaugeProfile.measurement_unit} × {gaugeProfile.swatch_height}{gaugeProfile.measurement_unit}
          </div>
        </div>
      </div>

      {/* Measurement unit badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {gaugeProfile.measurement_unit === 'cm' ? t('gauge.form.unit_cm') : t('gauge.form.unit_inch')}
        </span>
        <span className="text-xs text-gray-500">
          {t('gauge.form.measurement_unit')}
        </span>
      </div>

      {/* Notes (if any) */}
      {gaugeProfile.notes && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">{t('gauge.form.notes')}</div>
          <div className="text-sm text-gray-800 bg-gray-50 rounded-md p-2">
            {gaugeProfile.notes}
          </div>
        </div>
      )}

      {/* Footer with creation date */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
        Created: {formatDate(gaugeProfile.created_at)}
        {gaugeProfile.updated_at !== gaugeProfile.created_at && (
          <span className="ml-2">
            • Updated: {formatDate(gaugeProfile.updated_at)}
          </span>
        )}
      </div>
    </div>
  );
} 