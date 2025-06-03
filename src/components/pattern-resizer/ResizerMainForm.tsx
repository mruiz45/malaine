'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PatternResizerInput, 
  PatternResizerResult, 
  PatternResizerFormErrors,
  OriginalPatternGauge,
  NewGaugeData,
  OriginalPatternValues,
  NewDimensionValues
} from '@/types/pattern-resizer';
import { MeasurementUnit } from '@/types/gauge';
import { getTemplateByKey, getAllTemplates } from '@/utils/pattern-resizer-templates';
import { calculatePatternResize } from '@/services/patternResizerService';
import ResizerTemplateSelector from './ResizerTemplateSelector';
import ResizerResultsDisplay from './ResizerResultsDisplay';
import PatternTextParser from './PatternTextParser';

interface ResizerMainFormProps {
  /** Called when calculation is completed */
  onCalculationComplete?: (result: PatternResizerResult) => void;
  /** Whether the form should be disabled */
  disabled?: boolean;
}

export default function ResizerMainForm({
  onCalculationComplete,
  disabled = false
}: ResizerMainFormProps) {
  const { t } = useTranslation();

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [originalGauge, setOriginalGauge] = useState<OriginalPatternGauge>({
    original_gauge_stitches: 0,
    original_gauge_rows: 0,
    original_gauge_unit: 'cm' as MeasurementUnit,
    original_swatch_width: 10,
    original_swatch_height: 10
  });
  const [newGauge, setNewGauge] = useState<NewGaugeData>({
    new_gauge_stitches: 0,
    new_gauge_rows: 0,
    new_gauge_unit: 'cm' as MeasurementUnit,
    new_swatch_width: 10,
    new_swatch_height: 10
  });
  const [originalPatternValues, setOriginalPatternValues] = useState<OriginalPatternValues>({});
  const [newDimensionValues, setNewDimensionValues] = useState<NewDimensionValues>({});
  
  // UI state
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<PatternResizerResult | null>(null);
  const [errors, setErrors] = useState<PatternResizerFormErrors>({});
  const [showResults, setShowResults] = useState(false);
  
  // US 10.2: Tab state for input method
  const [inputMethod, setInputMethod] = useState<'manual' | 'text'>('manual');

  // Get current template
  const currentTemplate = selectedTemplate ? getTemplateByKey(selectedTemplate) : null;

  // Reset dependent form data when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setOriginalPatternValues({});
      setNewDimensionValues({});
      setResult(null);
      setShowResults(false);
      setErrors({});
    }
  }, [selectedTemplate]);

  // Handle template selection
  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
  };

  // US 10.2: Handle successful text parsing
  const handleTextParseSuccess = (
    parsedGauge: OriginalPatternGauge,
    parsedValues: OriginalPatternValues
  ) => {
    setOriginalGauge(parsedGauge);
    setOriginalPatternValues(parsedValues);
    // Switch to manual tab to allow user to review and complete the form
    setInputMethod('manual');
    setErrors({});
  };

  // US 10.2: Handle unit change from text parser
  const handleUnitChange = (unit: MeasurementUnit) => {
    setOriginalGauge(prev => ({ ...prev, original_gauge_unit: unit }));
    setNewGauge(prev => ({ ...prev, new_gauge_unit: unit }));
  };

  // Handle input changes
  const handleOriginalGaugeChange = (field: keyof OriginalPatternGauge, value: any) => {
    setOriginalGauge(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors.original_gauge?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.original_gauge) {
          const { [field]: removed, ...rest } = newErrors.original_gauge;
          newErrors.original_gauge = rest;
          if (Object.keys(rest).length === 0) {
            delete newErrors.original_gauge;
          }
        }
        return newErrors;
      });
    }
  };

  const handleNewGaugeChange = (field: keyof NewGaugeData, value: any) => {
    setNewGauge(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors.new_gauge?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.new_gauge) {
          const { [field]: removed, ...rest } = newErrors.new_gauge;
          newErrors.new_gauge = rest;
          if (Object.keys(rest).length === 0) {
            delete newErrors.new_gauge;
          }
        }
        return newErrors;
      });
    }
  };

  const handleOriginalPatternValueChange = (field: string, value: any) => {
    setOriginalPatternValues(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors.original_pattern_values?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.original_pattern_values) {
          const { [field]: removed, ...rest } = newErrors.original_pattern_values;
          newErrors.original_pattern_values = rest;
          if (Object.keys(rest).length === 0) {
            delete newErrors.original_pattern_values;
          }
        }
        return newErrors;
      });
    }
  };

  const handleNewDimensionValueChange = (field: string, value: any) => {
    setNewDimensionValues(prev => ({ ...prev, [field]: value }));
    // Clear related errors
    if (errors.new_dimension_values?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.new_dimension_values) {
          const { [field]: removed, ...rest } = newErrors.new_dimension_values;
          newErrors.new_dimension_values = rest;
          if (Object.keys(rest).length === 0) {
            delete newErrors.new_dimension_values;
          }
        }
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: PatternResizerFormErrors = {};

    // Template validation
    if (!selectedTemplate) {
      newErrors.template_key = t('tools.pattern_resizer.validation.template_required');
    }

    // Original gauge validation
    const originalGaugeErrors: { [key: string]: string } = {};
    if (!originalGauge.original_gauge_stitches || originalGauge.original_gauge_stitches <= 0) {
      originalGaugeErrors.original_gauge_stitches = t('tools.pattern_resizer.validation.original_gauge_stitches_required');
    }
    if (!originalGauge.original_gauge_rows || originalGauge.original_gauge_rows <= 0) {
      originalGaugeErrors.original_gauge_rows = t('tools.pattern_resizer.validation.original_gauge_rows_required');
    }
    if (Object.keys(originalGaugeErrors).length > 0) {
      newErrors.original_gauge = originalGaugeErrors;
    }

    // New gauge validation
    const newGaugeErrors: { [key: string]: string } = {};
    if (!newGauge.new_gauge_stitches || newGauge.new_gauge_stitches <= 0) {
      newGaugeErrors.new_gauge_stitches = t('tools.pattern_resizer.validation.new_gauge_required');
    }
    if (!newGauge.new_gauge_rows || newGauge.new_gauge_rows <= 0) {
      newGaugeErrors.new_gauge_rows = t('tools.pattern_resizer.validation.new_gauge_required');
    }
    if (Object.keys(newGaugeErrors).length > 0) {
      newErrors.new_gauge = newGaugeErrors;
    }

    // Template-specific validation
    if (currentTemplate) {
      const originalPatternErrors: { [key: string]: string } = {};
      const newDimensionErrors: { [key: string]: string } = {};

      // Validate original pattern inputs
      currentTemplate.inputs_original_pattern.forEach(field => {
        if (field.required && (!originalPatternValues[field.key] || Number(originalPatternValues[field.key]) <= 0)) {
          originalPatternErrors[field.key] = t('tools.pattern_resizer.validation.original_pattern_values_required');
        }
      });

      // Validate new dimension inputs
      currentTemplate.inputs_new_params.forEach(field => {
        if (field.required && (!newDimensionValues[field.key] || Number(newDimensionValues[field.key]) <= 0)) {
          newDimensionErrors[field.key] = t('tools.pattern_resizer.validation.new_dimensions_required');
        }
      });

      if (Object.keys(originalPatternErrors).length > 0) {
        newErrors.original_pattern_values = originalPatternErrors;
      }
      if (Object.keys(newDimensionErrors).length > 0) {
        newErrors.new_dimension_values = newDimensionErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle calculation
  const handleCalculate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCalculating(true);
    setErrors({});

    try {
      const input: PatternResizerInput = {
        template_key: selectedTemplate,
        original_gauge: originalGauge,
        new_gauge: newGauge,
        original_pattern_values: originalPatternValues,
        new_dimension_values: newDimensionValues
      };

      const calculationResult = await calculatePatternResize(input);
      
      setResult(calculationResult);
      setShowResults(true);
      
      if (onCalculationComplete) {
        onCalculationComplete(calculationResult);
      }

    } catch (error) {
      setErrors({
        general: t('tools.pattern_resizer.messages.calculation_error')
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setSelectedTemplate('');
    setOriginalGauge({
      original_gauge_stitches: 0,
      original_gauge_rows: 0,
      original_gauge_unit: 'cm' as MeasurementUnit,
      original_swatch_width: 10,
      original_swatch_height: 10
    });
    setNewGauge({
      new_gauge_stitches: 0,
      new_gauge_rows: 0,
      new_gauge_unit: 'cm' as MeasurementUnit,
      new_swatch_width: 10,
      new_swatch_height: 10
    });
    setOriginalPatternValues({});
    setNewDimensionValues({});
    setResult(null);
    setShowResults(false);
    setErrors({});
  };

  // Render input field
  const renderInputField = (
    field: any,
    value: any,
    onChange: (field: string, value: any) => void,
    error?: string
  ) => (
    <div key={field.key} className="space-y-2">
      <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.type || 'number'}
        id={field.key}
        value={value || ''}
        onChange={(e) => onChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={field.placeholder}
        min={field.min}
        step={field.step}
        disabled={disabled || isCalculating}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
          error 
            ? 'border-red-500 focus:border-red-500' 
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
        } dark:bg-gray-700 dark:text-white`}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Template Selection */}
      <section>
        <ResizerTemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
          disabled={disabled || isCalculating}
          error={errors.template_key}
        />
      </section>

      {/* Show form sections only when template is selected */}
      {currentTemplate && (
        <>
          {/* US 10.2: Input Method Tabs */}
          <section>
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setInputMethod('manual')}
                  disabled={disabled || isCalculating}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    inputMethod === 'manual'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } ${disabled || isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('tools.pattern_resizer.input_method.manual', 'Manual Input')}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('text')}
                  disabled={disabled || isCalculating}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    inputMethod === 'text'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  } ${disabled || isCalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {t('tools.pattern_resizer.input_method.text', 'Import from Text')}
                </button>
              </nav>
            </div>
          </section>

          {/* US 10.2: Text Parser Tab Content */}
          {inputMethod === 'text' && (
            <section>
              <PatternTextParser
                templateKey={selectedTemplate}
                unit={originalGauge.original_gauge_unit}
                onParseSuccess={handleTextParseSuccess}
                onUnitChange={handleUnitChange}
                disabled={disabled || isCalculating}
              />
            </section>
          )}

          {/* Manual Input Tab Content */}
          {inputMethod === 'manual' && (
            <>
              {/* Original Gauge Section */}
              <section>
                {/* Step instruction */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('tools.pattern_resizer.form.step_instructions.original_gauge')}
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('tools.pattern_resizer.form.original_gauge_section')}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInputField(
                      { key: 'original_gauge_stitches', label: t('tools.pattern_resizer.form.original_gauge_stitches'), type: 'number', min: 0.1, step: 0.1, required: true },
                      originalGauge.original_gauge_stitches,
                      (_, value) => handleOriginalGaugeChange('original_gauge_stitches', value),
                      errors.original_gauge?.original_gauge_stitches
                    )}
                    {renderInputField(
                      { key: 'original_gauge_rows', label: t('tools.pattern_resizer.form.original_gauge_rows'), type: 'number', min: 0.1, step: 0.1, required: true },
                      originalGauge.original_gauge_rows,
                      (_, value) => handleOriginalGaugeChange('original_gauge_rows', value),
                      errors.original_gauge?.original_gauge_rows
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      {t('tools.pattern_resizer.form.original_gauge_unit')}
                    </label>
                    <select
                      value={originalGauge.original_gauge_unit}
                      onChange={(e) => handleOriginalGaugeChange('original_gauge_unit', e.target.value as MeasurementUnit)}
                      disabled={disabled || isCalculating}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="cm">{t('tools.pattern_resizer.form.unit_cm')}</option>
                      <option value="inch">{t('tools.pattern_resizer.form.unit_inch')}</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Original Pattern Values Section */}
              <section>
                {/* Step instruction */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('tools.pattern_resizer.form.step_instructions.original_pattern')}
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('tools.pattern_resizer.original_pattern_section')}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTemplate.inputs_original_pattern
                      .filter(field => !field.key.includes('gauge')) // Filter out gauge fields since we handle them separately
                      .map(field => renderInputField(
                        field,
                        originalPatternValues[field.key],
                        handleOriginalPatternValueChange,
                        errors.original_pattern_values?.[field.key]
                      ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* New Gauge Section - Always visible */}
          <section>
            {/* Step instruction */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('tools.pattern_resizer.form.step_instructions.new_gauge')}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('tools.pattern_resizer.new_gauge_section')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField(
                  { key: 'new_gauge_stitches', label: t('tools.pattern_resizer.form.original_gauge_stitches').replace('Original', 'New'), type: 'number', min: 0.1, step: 0.1, required: true },
                  newGauge.new_gauge_stitches,
                  (_, value) => handleNewGaugeChange('new_gauge_stitches', value),
                  errors.new_gauge?.new_gauge_stitches
                )}
                {renderInputField(
                  { key: 'new_gauge_rows', label: t('tools.pattern_resizer.form.original_gauge_rows').replace('Original', 'New'), type: 'number', min: 0.1, step: 0.1, required: true },
                  newGauge.new_gauge_rows,
                  (_, value) => handleNewGaugeChange('new_gauge_rows', value),
                  errors.new_gauge?.new_gauge_rows
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('tools.pattern_resizer.form.original_gauge_unit').replace('Original', 'New')}
                </label>
                <select
                  value={newGauge.new_gauge_unit}
                  onChange={(e) => handleNewGaugeChange('new_gauge_unit', e.target.value as MeasurementUnit)}
                  disabled={disabled || isCalculating}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="cm">{t('tools.pattern_resizer.form.unit_cm')}</option>
                  <option value="inch">{t('tools.pattern_resizer.form.unit_inch')}</option>
                </select>
              </div>
            </div>
          </section>

          {/* New Dimensions Section - Always visible */}
          <section>
            {/* Step instruction */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('tools.pattern_resizer.form.step_instructions.new_dimensions')}
              </p>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('tools.pattern_resizer.new_dimensions_section')}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTemplate.inputs_new_params.map(field => renderInputField(
                  field,
                  newDimensionValues[field.key],
                  handleNewDimensionValueChange,
                  errors.new_dimension_values?.[field.key]
                ))}
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section>
            {/* Step instruction for calculate button */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 rounded-r-md">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('tools.pattern_resizer.form.step_instructions.calculate')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCalculate}
                disabled={disabled || isCalculating || !selectedTemplate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isCalculating ? t('tools.pattern_resizer.calculating') : t('tools.pattern_resizer.calculate')}
              </button>
              <button
                onClick={handleReset}
                disabled={disabled || isCalculating}
                className="flex-1 sm:flex-none bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {t('tools.pattern_resizer.reset')}
              </button>
            </div>
          </section>

          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Results Section */}
          {showResults && result && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('tools.pattern_resizer.results_section')}
              </h3>
              <ResizerResultsDisplay
                result={result}
                templateKey={selectedTemplate}
                showMetadata={true}
              />
            </section>
          )}
        </>
      )}

      {/* No Template Selected Message */}
      {!selectedTemplate && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>{t('tools.pattern_resizer.select_template_first')}</p>
        </div>
      )}
    </div>
  );
} 