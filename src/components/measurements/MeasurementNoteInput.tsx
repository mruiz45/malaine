'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { MeasurementNoteInputProps } from '@/types/measurements';

/**
 * MeasurementNoteInput Component
 * 
 * Provides an input field for users to add specific notes to individual
 * measurements (e.g., "taken over light t-shirt", "measured after lunch").
 * 
 * US 3.1: Body Measurement Guide Tool
 * 
 * @param measurementKey - The key of the measurement this note is for
 * @param value - Current note value
 * @param onChange - Callback function when note value changes
 * @param placeholder - Optional placeholder text
 * @param className - Optional additional CSS classes
 */
export default function MeasurementNoteInput({
  measurementKey,
  value = '',
  onChange,
  placeholder,
  className = ''
}: MeasurementNoteInputProps) {
  const { t } = useTranslation();

  // Generate default placeholder if none provided
  const defaultPlaceholder = t(
    'measurements.note.placeholder', 
    'Add a note about this measurement...'
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`mt-1 ${className}`}>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder || defaultPlaceholder}
        rows={2}
        className="
          block w-full px-3 py-1.5 text-sm
          border border-gray-300 rounded-md
          placeholder-gray-400 resize-y
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
        "
        maxLength={200} // Reasonable limit for individual notes
        aria-label={`Note for ${measurementKey.replace('_', ' ')} measurement`}
      />
      {value && value.length > 180 && (
        <p className="mt-1 text-xs text-amber-600">
          {t('measurements.note.length_warning', 'Note is getting long')} ({value.length}/200)
        </p>
      )}
    </div>
  );
} 