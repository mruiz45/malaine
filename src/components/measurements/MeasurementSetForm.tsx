'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { 
  MeasurementSet, 
  CreateMeasurementSet, 
  UpdateMeasurementSet, 
  MeasurementSetFormErrors,
  MeasurementUnit 
} from '@/types/measurements';
import { STANDARD_MEASUREMENT_FIELDS } from '@/types/measurements';
import { 
  createMeasurementSet, 
  updateMeasurementSet, 
  validateMeasurementSetData 
} from '@/services/measurementService';

interface MeasurementSetFormProps {
  measurementSet?: MeasurementSet; // If provided, form is in edit mode
  onSuccess?: (measurementSet: MeasurementSet) => void;
  onCancel?: () => void;
}

/**
 * Form component to create or edit a measurement set
 * Corresponds to User Story 1.2 - User Measurements (Mensurations) Input and Management
 */
export default function MeasurementSetForm({
  measurementSet,
  onSuccess,
  onCancel
}: MeasurementSetFormProps) {
  const { t } = useTranslation();
  const isEditMode = !!measurementSet;
  
  // Form state
  const [formData, setFormData] = useState<CreateMeasurementSet>({
    set_name: measurementSet?.set_name || '',
    measurement_unit: measurementSet?.measurement_unit || 'cm',
    notes: measurementSet?.notes || '',
    custom_measurements: measurementSet?.custom_measurements || {}
  });

  // Initialize standard measurements
  useEffect(() => {
    if (measurementSet) {
      const initialData: CreateMeasurementSet = {
        set_name: measurementSet.set_name,
        measurement_unit: measurementSet.measurement_unit,
        notes: measurementSet.notes || '',
        custom_measurements: measurementSet.custom_measurements || {}
      };

      // Add standard measurements
      STANDARD_MEASUREMENT_FIELDS.forEach(field => {
        const value = measurementSet[field.key];
        if (value !== undefined && value !== null) {
          (initialData as any)[field.key] = value;
        }
      });

      setFormData(initialData);
    }
  }, [measurementSet]);

  const [errors, setErrors] = useState<MeasurementSetFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [customMeasurementKey, setCustomMeasurementKey] = useState('');
  const [customMeasurementValue, setCustomMeasurementValue] = useState('');

  // Handle standard field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : (field === 'set_name' || field === 'notes' ? value : parseFloat(value))
    }));

    // Clear error for this field
    if (errors[field as keyof MeasurementSetFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle measurement unit change
  const handleUnitChange = (unit: MeasurementUnit) => {
    setFormData(prev => ({
      ...prev,
      measurement_unit: unit
    }));
  };

  // Add custom measurement
  const addCustomMeasurement = () => {
    if (!customMeasurementKey.trim() || !customMeasurementValue.trim()) {
      return;
    }

    const value = parseFloat(customMeasurementValue);
    if (isNaN(value) || value <= 0) {
      alert(t('measurements.form.custom_value_error'));
      return;
    }

    setFormData(prev => ({
      ...prev,
      custom_measurements: {
        ...prev.custom_measurements,
        [customMeasurementKey.trim()]: value
      }
    }));

    setCustomMeasurementKey('');
    setCustomMeasurementValue('');
  };

  // Remove custom measurement
  const removeCustomMeasurement = (key: string) => {
    setFormData(prev => {
      const newCustom = { ...prev.custom_measurements };
      delete newCustom[key];
      return {
        ...prev,
        custom_measurements: newCustom
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateMeasurementSetData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let result: MeasurementSet;

      if (isEditMode && measurementSet) {
        // Update existing measurement set
        const updateData: UpdateMeasurementSet = { ...formData };
        result = await updateMeasurementSet(measurementSet.id, updateData);
      } else {
        // Create new measurement set
        result = await createMeasurementSet(formData);
      }

      onSuccess?.(result);
    } catch (err) {
      console.error('Error saving measurement set:', err);
      setErrors({
        set_name: err instanceof Error ? err.message : t('measurements.form.save_error')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? t('measurements.form.title_edit') : t('measurements.form.title_create')}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditMode 
            ? t('measurements.form.description_edit')
            : t('measurements.form.description_create')
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Set Name */}
          <div>
            <label htmlFor="set_name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('measurements.form.set_name')} *
            </label>
            <input
              type="text"
              id="set_name"
              value={formData.set_name}
              onChange={(e) => handleFieldChange('set_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.set_name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('measurements.form.set_name_placeholder')}
            />
            {errors.set_name && (
              <p className="mt-1 text-sm text-red-600">{errors.set_name}</p>
            )}
          </div>

          {/* Measurement Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('measurements.form.measurement_unit')} *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="measurement_unit"
                  value="cm"
                  checked={formData.measurement_unit === 'cm'}
                  onChange={() => handleUnitChange('cm')}
                  className="mr-2"
                />
                {t('measurements.form.unit_cm')}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="measurement_unit"
                  value="inch"
                  checked={formData.measurement_unit === 'inch'}
                  onChange={() => handleUnitChange('inch')}
                  className="mr-2"
                />
                {t('measurements.form.unit_inch')}
              </label>
            </div>
            {errors.measurement_unit && (
              <p className="mt-1 text-sm text-red-600">{errors.measurement_unit}</p>
            )}
          </div>
        </div>

        {/* Standard Measurements */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('measurements.form.standard_measurements')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STANDARD_MEASUREMENT_FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                  {t(`measurements.fields.${field.key}`)}
                  {field.required && ' *'}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 mb-1">{t(`measurements.fields.${field.key}_description`)}</p>
                )}
                <div className="relative">
                  <input
                    type="number"
                    id={field.key}
                    step="0.1"
                    min={field.min}
                    max={field.max}
                    value={(formData as any)[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors[field.key] ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={`Enter ${t(`measurements.fields.${field.key}`).toLowerCase()}`}
                  />
                  <span className="absolute right-3 top-2 text-sm text-gray-500">
                    {formData.measurement_unit === 'cm' ? 'cm' : 'in'}
                  </span>
                </div>
                {errors[field.key] && (
                  <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Measurements */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('measurements.form.custom_measurements')}</h3>
          
          {/* Add Custom Measurement */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{t('measurements.form.add_custom')}</h4>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customMeasurementKey}
                onChange={(e) => setCustomMeasurementKey(e.target.value)}
                placeholder={t('measurements.form.custom_name_placeholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={customMeasurementValue}
                  onChange={(e) => setCustomMeasurementValue(e.target.value)}
                  placeholder={t('measurements.form.custom_value_placeholder')}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">
                  {formData.measurement_unit === 'cm' ? 'cm' : 'in'}
                </span>
              </div>
              <button
                type="button"
                onClick={addCustomMeasurement}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {t('measurements.form.add_button')}
              </button>
            </div>
          </div>

          {/* Display Custom Measurements */}
          {Object.keys(formData.custom_measurements || {}).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.custom_measurements || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-md">
                  <span className="font-medium">{key}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">
                      {value} {formData.measurement_unit === 'cm' ? 'cm' : 'in'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCustomMeasurement(key)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {t('measurements.form.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {errors.custom_measurements && (
            <p className="mt-1 text-sm text-red-600">{errors.custom_measurements}</p>
          )}
        </div>

        {/* Notes */}
        <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              {t('measurements.form.notes')}
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.notes ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder={t('measurements.form.notes_placeholder')}
            />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {t('measurements.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? t('measurements.form.updating') : t('measurements.form.creating')}
              </div>
            ) : (
              isEditMode ? t('measurements.form.update_button') : t('measurements.form.create_button')
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 