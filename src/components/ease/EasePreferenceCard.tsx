'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { EasePreference } from '@/types/ease';

interface EasePreferenceCardProps {
  /** The ease preference to display */
  easePreference: EasePreference;
  /** Called when edit button is clicked */
  onEdit: (easePreference: EasePreference) => void;
  /** Called when delete button is clicked */
  onDelete: (easePreference: EasePreference) => void;
  /** Whether actions are currently disabled */
  disabled?: boolean;
}

/**
 * Card component for displaying a single ease preference
 * Shows ease values and provides edit/delete actions
 */
export default function EasePreferenceCard({ 
  easePreference, 
  onEdit, 
  onDelete, 
  disabled = false 
}: EasePreferenceCardProps) {
  const { t } = useTranslation();

  const handleEdit = () => {
    if (!disabled) {
      onEdit(easePreference);
    }
  };

  const handleDelete = () => {
    if (!disabled) {
      const confirmed = window.confirm(t('ease.messages.confirm_delete'));
      if (confirmed) {
        onDelete(easePreference);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format ease value for display
  const formatEaseValue = (value: number | null | undefined, easeType: string, unit?: string) => {
    if (value === null || value === undefined) return '-';
    
    if (easeType === 'percentage') {
      return `${value > 0 ? '+' : ''}${value}%`;
    } else {
      return `${value > 0 ? '+' : ''}${value}${unit || 'cm'}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header with name and actions */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
          {easePreference.preference_name}
        </h3>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={handleEdit}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('ease.edit')}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('ease.delete')}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ease type badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {easePreference.ease_type === 'percentage' ? t('ease.form.type_percentage') : t('ease.form.type_absolute')}
        </span>
        {easePreference.measurement_unit && (
          <span className="text-xs text-gray-500">
            {easePreference.measurement_unit === 'cm' ? t('ease.form.unit_cm') : t('ease.form.unit_inch')}
          </span>
        )}
      </div>

      {/* Ease values grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('ease.form.bust_ease')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatEaseValue(easePreference.bust_ease, easePreference.ease_type, easePreference.measurement_unit)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('ease.form.waist_ease')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatEaseValue(easePreference.waist_ease, easePreference.ease_type, easePreference.measurement_unit)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('ease.form.hip_ease')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatEaseValue(easePreference.hip_ease, easePreference.ease_type, easePreference.measurement_unit)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <div className="text-sm text-gray-600 mb-1">{t('ease.form.sleeve_ease')}</div>
          <div className="text-lg font-semibold text-gray-900">
            {formatEaseValue(easePreference.sleeve_ease, easePreference.ease_type, easePreference.measurement_unit)}
          </div>
        </div>
      </div>

      {/* Notes (if any) */}
      {easePreference.notes && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">{t('ease.form.notes')}</div>
          <div className="text-sm text-gray-800 bg-gray-50 rounded-md p-2">
            {easePreference.notes}
          </div>
        </div>
      )}

      {/* Footer with creation date */}
      <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
        {t('ease.created_on', { date: formatDate(easePreference.created_at) })}
      </div>
    </div>
  );
} 