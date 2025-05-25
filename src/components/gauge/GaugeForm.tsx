'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { GaugeProfile, CreateGaugeProfile, UpdateGaugeProfile, MeasurementUnit } from '@/types/gauge';
import { validateGaugeProfileData } from '@/services/gaugeService';

interface GaugeFormProps {
  /** Existing gauge profile for editing (undefined for creating new) */
  gaugeProfile?: GaugeProfile;
  /** Called when form is submitted successfully */
  onSubmit: (data: CreateGaugeProfile | UpdateGaugeProfile) => Promise<void>;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
}

/**
 * Form component for creating and editing gauge profiles
 * Supports both create and edit modes based on whether gaugeProfile prop is provided
 */
export default function GaugeForm({ gaugeProfile, onSubmit, onCancel, isSubmitting = false }: GaugeFormProps) {
  const { t } = useTranslation();
  const isEditing = !!gaugeProfile;

  // Form state
  const [formData, setFormData] = useState({
    profile_name: gaugeProfile?.profile_name || '',
    stitch_count: gaugeProfile?.stitch_count || 0,
    row_count: gaugeProfile?.row_count || 0,
    measurement_unit: (gaugeProfile?.measurement_unit || 'cm') as MeasurementUnit,
    swatch_width: gaugeProfile?.swatch_width || 10,
    swatch_height: gaugeProfile?.swatch_height || 10,
    notes: gaugeProfile?.notes || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update swatch dimensions when measurement unit changes
  useEffect(() => {
    if (!isEditing) {
      const defaultSize = formData.measurement_unit === 'cm' ? 10 : 4;
      setFormData(prev => ({
        ...prev,
        swatch_width: defaultSize,
        swatch_height: defaultSize
      }));
    }
  }, [formData.measurement_unit, isEditing]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateGaugeProfileData(formData);
    
    // Additional validation for required fields in create mode
    if (!isEditing) {
      if (!formData.profile_name.trim()) {
        validationErrors.profile_name = t('gauge.validation.profile_name_required');
      }
      if (!formData.stitch_count || formData.stitch_count <= 0) {
        validationErrors.stitch_count = t('gauge.validation.stitch_count_positive');
      }
      if (!formData.row_count || formData.row_count <= 0) {
        validationErrors.row_count = t('gauge.validation.row_count_positive');
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done by parent component
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? t('gauge.edit') : t('gauge.create_new')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Name */}
        <div>
          <label htmlFor="profile_name" className="block text-sm font-medium text-gray-700 mb-2">
            {t('gauge.form.profile_name')} *
          </label>
          <input
            type="text"
            id="profile_name"
            value={formData.profile_name}
            onChange={(e) => handleInputChange('profile_name', e.target.value)}
            placeholder={t('gauge.form.profile_name_placeholder')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.profile_name ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.profile_name && (
            <p className="mt-1 text-sm text-red-600">{errors.profile_name}</p>
          )}
        </div>

        {/* Measurement Unit */}
        <div>
          <label htmlFor="measurement_unit" className="block text-sm font-medium text-gray-700 mb-2">
            {t('gauge.form.measurement_unit')} *
          </label>
          <select
            id="measurement_unit"
            value={formData.measurement_unit}
            onChange={(e) => handleInputChange('measurement_unit', e.target.value as MeasurementUnit)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.measurement_unit ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="cm">{t('gauge.form.unit_cm')}</option>
            <option value="inch">{t('gauge.form.unit_inch')}</option>
          </select>
          {errors.measurement_unit && (
            <p className="mt-1 text-sm text-red-600">{errors.measurement_unit}</p>
          )}
        </div>

        {/* Swatch Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="swatch_width" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gauge.form.swatch_width')} ({formData.measurement_unit})
            </label>
            <input
              type="number"
              id="swatch_width"
              value={formData.swatch_width}
              onChange={(e) => handleInputChange('swatch_width', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.swatch_width ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.swatch_width && (
              <p className="mt-1 text-sm text-red-600">{errors.swatch_width}</p>
            )}
          </div>

          <div>
            <label htmlFor="swatch_height" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gauge.form.swatch_height')} ({formData.measurement_unit})
            </label>
            <input
              type="number"
              id="swatch_height"
              value={formData.swatch_height}
              onChange={(e) => handleInputChange('swatch_height', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.swatch_height ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.swatch_height && (
              <p className="mt-1 text-sm text-red-600">{errors.swatch_height}</p>
            )}
          </div>
        </div>

        {/* Gauge Measurements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="stitch_count" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gauge.form.stitch_count')} *
            </label>
            <input
              type="number"
              id="stitch_count"
              value={formData.stitch_count}
              onChange={(e) => handleInputChange('stitch_count', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.stitch_count ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.stitch_count && (
              <p className="mt-1 text-sm text-red-600">{errors.stitch_count}</p>
            )}
          </div>

          <div>
            <label htmlFor="row_count" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gauge.form.row_count')} *
            </label>
            <input
              type="number"
              id="row_count"
              value={formData.row_count}
              onChange={(e) => handleInputChange('row_count', parseFloat(e.target.value) || 0)}
              step="0.1"
              min="0.1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.row_count ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.row_count && (
              <p className="mt-1 text-sm text-red-600">{errors.row_count}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            {t('gauge.form.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder={t('gauge.form.notes_placeholder')}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.notes ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            {t('gauge.info.what_is_gauge')}
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            {t('gauge.info.gauge_explanation')}
          </p>
          <p className="text-sm font-medium text-blue-900 mb-2">
            {t('gauge.info.how_to_measure')}
          </p>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            {(t('gauge.info.measure_steps', { returnObjects: true }) as string[]).map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('gauge.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('gauge.loading') : t('gauge.save')}
          </button>
        </div>
      </form>
    </div>
  );
} 