/**
 * Beanie Definition Form Component (US_7.1 - FR2)
 * Allows users to define beanie/hat parameters including head circumference,
 * height, crown style, and brim style
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BeanieDefinitionFormProps,
  BeanieAttributes,
  CROWN_STYLE_OPTIONS,
  BRIM_STYLE_OPTIONS,
  validateBeanieAttributes,
  CrownStyle,
  BrimStyle
} from '@/types/accessories';

/**
 * Beanie Definition Form Component
 */
export default function BeanieDefinitionForm({
  selectedAttributes,
  measurementSets = [],
  onAttributesChange,
  disabled = false,
  isLoading = false,
  error
}: BeanieDefinitionFormProps) {
  const { t } = useTranslation();

  // Local state for form inputs
  const [formData, setFormData] = useState<Partial<BeanieAttributes>>({
    target_circumference_cm: selectedAttributes?.target_circumference_cm || 56,
    body_height_cm: selectedAttributes?.body_height_cm || 15,
    crown_style: selectedAttributes?.crown_style || 'classic_tapered',
    brim_style: selectedAttributes?.brim_style || 'folded_ribbed_1x1',
    brim_depth_cm: selectedAttributes?.brim_depth_cm || 5,
    work_style: 'in_the_round'
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedMeasurementSet, setSelectedMeasurementSet] = useState<string>('');

  /**
   * Update form data when selectedAttributes changes
   */
  useEffect(() => {
    if (selectedAttributes) {
      setFormData(selectedAttributes);
    }
  }, [selectedAttributes]);

  /**
   * Validate and emit changes
   */
  const handleFormChange = (updates: Partial<BeanieAttributes>) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);

    // Validate the form
    const errors = validateBeanieAttributes(newFormData);
    setValidationErrors(errors);

    // If valid, emit the changes
    if (errors.length === 0 && newFormData.target_circumference_cm && newFormData.body_height_cm && newFormData.crown_style && newFormData.brim_style) {
      const completeAttributes: BeanieAttributes = {
        target_circumference_cm: newFormData.target_circumference_cm,
        body_height_cm: newFormData.body_height_cm,
        crown_style: newFormData.crown_style,
        brim_style: newFormData.brim_style,
        brim_depth_cm: newFormData.brim_depth_cm,
        work_style: 'in_the_round'
      };
      onAttributesChange(completeAttributes);
    }
  };

  /**
   * Handle measurement set selection
   */
  const handleMeasurementSetChange = (measurementSetId: string) => {
    setSelectedMeasurementSet(measurementSetId);
    
    if (measurementSetId) {
      const measurementSet = measurementSets.find(ms => ms.id === measurementSetId);
      if (measurementSet?.head_circumference) {
        // Convert to cm if needed
        const circumferenceCm = measurementSet.measurement_unit === 'inch' 
          ? measurementSet.head_circumference * 2.54 
          : measurementSet.head_circumference;
        
        handleFormChange({ target_circumference_cm: circumferenceCm });
      }
    }
  };

  /**
   * Handle crown style change
   */
  const handleCrownStyleChange = (crownStyle: CrownStyle) => {
    handleFormChange({ crown_style: crownStyle });
  };

  /**
   * Handle brim style change
   */
  const handleBrimStyleChange = (brimStyle: BrimStyle) => {
    const updates: Partial<BeanieAttributes> = { brim_style: brimStyle };
    
    // Set default depth for brim styles that need it
    if (brimStyle !== 'no_brim') {
      const brimOption = BRIM_STYLE_OPTIONS.find(option => option.key === brimStyle);
      if (brimOption?.default_depth_cm) {
        updates.brim_depth_cm = brimOption.default_depth_cm;
      }
    } else {
      updates.brim_depth_cm = undefined;
    }
    
    handleFormChange(updates);
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('beanie.defineParameters', 'Define Beanie Parameters')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('beanie.defineParametersDescription', 'Set the dimensions and style options for your beanie or hat.')}
        </p>
      </div>

      {/* Error display */}
      {(error || validationErrors.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('common.validationErrors', 'Validation Errors')}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error && <p>{error}</p>}
                {validationErrors.map((validationError, index) => (
                  <p key={index}>{validationError}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Head Circumference Section */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            {t('beanie.headCircumference', 'Head Circumference')}
          </h4>

          {/* Measurement Set Selector */}
          {measurementSets.length > 0 && (
            <div>
              <label htmlFor="measurement-set" className="block text-sm font-medium text-gray-700 mb-2">
                {t('beanie.useMeasurementSet', 'Use Measurement Set')}
              </label>
              <select
                id="measurement-set"
                value={selectedMeasurementSet}
                onChange={(e) => handleMeasurementSetChange(e.target.value)}
                disabled={disabled}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">{t('beanie.selectMeasurementSet', 'Select a measurement set...')}</option>
                {measurementSets.map((measurementSet) => (
                  <option key={measurementSet.id} value={measurementSet.id}>
                    {measurementSet.set_name} 
                    {measurementSet.head_circumference && (
                      ` (${measurementSet.head_circumference} ${measurementSet.measurement_unit})`
                    )}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Input */}
          <div>
            <label htmlFor="head-circumference" className="block text-sm font-medium text-gray-700 mb-2">
              {t('beanie.targetCircumference', 'Target Head Circumference (cm)')}
            </label>
            <input
              type="number"
              id="head-circumference"
              value={formData.target_circumference_cm || ''}
              onChange={(e) => handleFormChange({ target_circumference_cm: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              min="40"
              max="70"
              step="0.5"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="56"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('beanie.circumferenceHelp', 'Typical adult range: 54-60 cm')}
            </p>
          </div>

          {/* Hat Height */}
          <div>
            <label htmlFor="hat-height" className="block text-sm font-medium text-gray-700 mb-2">
              {t('beanie.hatHeight', 'Hat Height (cm)')}
            </label>
            <input
              type="number"
              id="hat-height"
              value={formData.body_height_cm || ''}
              onChange={(e) => handleFormChange({ body_height_cm: parseFloat(e.target.value) || 0 })}
              disabled={disabled}
              min="10"
              max="30"
              step="0.5"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="15"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('beanie.heightHelp', 'From crown to brim edge')}
            </p>
          </div>
        </div>

        {/* Style Options Section */}
        <div className="space-y-4">
          <h4 className="text-base font-medium text-gray-900">
            {t('beanie.styleOptions', 'Style Options')}
          </h4>

          {/* Crown Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('beanie.crownStyle', 'Crown Style')}
            </label>
            <div className="space-y-2">
              {CROWN_STYLE_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-start">
                  <input
                    type="radio"
                    name="crown-style"
                    value={option.key}
                    checked={formData.crown_style === option.key}
                    onChange={() => handleCrownStyleChange(option.key)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Brim Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('beanie.brimStyle', 'Brim Style')}
            </label>
            <div className="space-y-2">
              {BRIM_STYLE_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-start">
                  <input
                    type="radio"
                    name="brim-style"
                    value={option.key}
                    checked={formData.brim_style === option.key}
                    onChange={() => handleBrimStyleChange(option.key)}
                    disabled={disabled}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Brim Depth (conditional) */}
          {formData.brim_style && formData.brim_style !== 'no_brim' && (
            <div>
              <label htmlFor="brim-depth" className="block text-sm font-medium text-gray-700 mb-2">
                {t('beanie.brimDepth', 'Brim Depth (cm)')}
              </label>
              <input
                type="number"
                id="brim-depth"
                value={formData.brim_depth_cm || ''}
                onChange={(e) => handleFormChange({ brim_depth_cm: parseFloat(e.target.value) || 0 })}
                disabled={disabled}
                min="2"
                max="15"
                step="0.5"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="5"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {formData.target_circumference_cm && formData.body_height_cm && formData.crown_style && formData.brim_style && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            {t('beanie.summary', 'Beanie Summary')}
          </h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <span className="font-medium">{t('beanie.circumference', 'Circumference')}:</span> {formData.target_circumference_cm} cm
            </p>
            <p>
              <span className="font-medium">{t('beanie.height', 'Height')}:</span> {formData.body_height_cm} cm
            </p>
            <p>
              <span className="font-medium">{t('beanie.crown', 'Crown')}:</span> {CROWN_STYLE_OPTIONS.find(o => o.key === formData.crown_style)?.name}
            </p>
            <p>
              <span className="font-medium">{t('beanie.brim', 'Brim')}:</span> {BRIM_STYLE_OPTIONS.find(o => o.key === formData.brim_style)?.name}
              {formData.brim_depth_cm && formData.brim_style !== 'no_brim' && ` (${formData.brim_depth_cm} cm)`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 