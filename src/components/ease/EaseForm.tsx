'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { 
  EasePreference, 
  CreateEasePreference, 
  UpdateEasePreference, 
  EaseType,
  MeasurementUnit,
  EaseCategory 
} from '@/types/ease';
import { EASE_CATEGORIES, EASE_FIELDS } from '@/types/ease';
import { validateEasePreferenceData } from '@/services/easeService';

interface EaseFormProps {
  /** Existing ease preference to edit (undefined for create mode) */
  easePreference?: EasePreference;
  /** Called when form is submitted */
  onSubmit: (data: CreateEasePreference | UpdateEasePreference) => Promise<void>;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
}

/**
 * Form component for creating or editing ease preferences
 * Supports predefined categories and custom values
 */
export default function EaseForm({ 
  easePreference, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: EaseFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!easePreference;

  // Form state
  const [formData, setFormData] = useState<CreateEasePreference>({
    preference_name: easePreference?.preference_name || '',
    ease_type: easePreference?.ease_type || 'absolute',
    bust_ease: easePreference?.bust_ease || undefined,
    waist_ease: easePreference?.waist_ease || undefined,
    hip_ease: easePreference?.hip_ease || undefined,
    sleeve_ease: easePreference?.sleeve_ease || undefined,
    measurement_unit: easePreference?.measurement_unit || 'cm',
    notes: easePreference?.notes || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Update form when ease preference changes
  useEffect(() => {
    if (easePreference) {
      setFormData({
        preference_name: easePreference.preference_name,
        ease_type: easePreference.ease_type,
        bust_ease: easePreference.bust_ease || undefined,
        waist_ease: easePreference.waist_ease || undefined,
        hip_ease: easePreference.hip_ease || undefined,
        sleeve_ease: easePreference.sleeve_ease || undefined,
        measurement_unit: easePreference.measurement_unit || 'cm',
        notes: easePreference.notes || ''
      });
    }
  }, [easePreference]);

  // Handle input changes
  const handleInputChange = (field: keyof CreateEasePreference, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle ease type change
  const handleEaseTypeChange = (easeType: EaseType) => {
    setFormData(prev => ({
      ...prev,
      ease_type: easeType,
      // Reset measurement unit for percentage type
      measurement_unit: easeType === 'percentage' ? undefined : (prev.measurement_unit || 'cm')
    }));
    setSelectedCategory(''); // Reset category selection
  };

  // Handle category selection
  const handleCategorySelect = (category: EaseCategory) => {
    setSelectedCategory(category.key);
    setFormData(prev => ({
      ...prev,
      ease_type: category.ease_type,
      bust_ease: category.values.bust_ease,
      waist_ease: category.values.waist_ease,
      hip_ease: category.values.hip_ease,
      sleeve_ease: category.values.sleeve_ease,
      measurement_unit: category.measurement_unit || prev.measurement_unit
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateEasePreferenceData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 disabled:opacity-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {t('ease.back_to_list')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? t('ease.edit_preference') : t('ease.create_preference')}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? t('ease.edit_description') : t('ease.create_description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('ease.form.basic_info')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preference Name */}
            <div>
              <label htmlFor="preference_name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('ease.form.preference_name')} *
              </label>
              <input
                type="text"
                id="preference_name"
                value={formData.preference_name}
                onChange={(e) => handleInputChange('preference_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.preference_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={t('ease.form.preference_name_placeholder')}
                disabled={isSubmitting}
              />
              {errors.preference_name && (
                <p className="mt-1 text-sm text-red-600">{errors.preference_name}</p>
              )}
            </div>

            {/* Ease Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ease.form.ease_type')} *
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="absolute"
                    checked={formData.ease_type === 'absolute'}
                    onChange={(e) => handleEaseTypeChange(e.target.value as EaseType)}
                    className="form-radio text-blue-600"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2">{t('ease.form.type_absolute')}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={formData.ease_type === 'percentage'}
                    onChange={(e) => handleEaseTypeChange(e.target.value as EaseType)}
                    className="form-radio text-blue-600"
                    disabled={isSubmitting}
                  />
                  <span className="ml-2">{t('ease.form.type_percentage')}</span>
                </label>
              </div>
              {errors.ease_type && (
                <p className="mt-1 text-sm text-red-600">{errors.ease_type}</p>
              )}
            </div>

            {/* Measurement Unit (only for absolute ease) */}
            {formData.ease_type === 'absolute' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ease.form.measurement_unit')}
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="cm"
                      checked={formData.measurement_unit === 'cm'}
                      onChange={(e) => handleInputChange('measurement_unit', e.target.value as MeasurementUnit)}
                      className="form-radio text-blue-600"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">{t('ease.form.unit_cm')}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="inch"
                      checked={formData.measurement_unit === 'inch'}
                      onChange={(e) => handleInputChange('measurement_unit', e.target.value as MeasurementUnit)}
                      className="form-radio text-blue-600"
                      disabled={isSubmitting}
                    />
                    <span className="ml-2">{t('ease.form.unit_inch')}</span>
                  </label>
                </div>
                {errors.measurement_unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.measurement_unit}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Predefined Categories */}
        {!isEditMode && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('ease.form.predefined_categories')}
            </h2>
            <p className="text-gray-600 mb-4">{t('ease.form.categories_description')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EASE_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  disabled={isSubmitting}
                  className={`p-4 border rounded-lg text-left transition-colors duration-200 disabled:opacity-50 ${
                    selectedCategory === category.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{category.label}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="text-xs text-gray-500">
                    {t('ease.form.bust')}: {category.values.bust_ease > 0 ? '+' : ''}{category.values.bust_ease}
                    {category.ease_type === 'percentage' ? '%' : category.measurement_unit}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ease Values */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('ease.form.ease_values')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EASE_FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {formData.ease_type === 'percentage' ? ' (%)' : ` (${formData.measurement_unit || 'cm'})`}
                </label>
                <input
                  type="number"
                  id={field.key}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[field.key] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  step="0.1"
                  min={field.min}
                  max={field.max}
                  disabled={isSubmitting}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                )}
                {errors[field.key] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('ease.form.additional_info')}
          </h2>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              {t('ease.form.notes')}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('ease.form.notes_placeholder')}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('ease.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('ease.form.saving') : (isEditMode ? t('ease.form.update') : t('ease.form.create'))}
          </button>
        </div>
      </form>
    </div>
  );
} 