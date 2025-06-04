'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePattern } from '@/hooks/usePattern';
import { GarmentType, MeasurementsData } from '@/types/pattern';
import { SchematicPreview2D } from './SchematicPreview2D';
import { StandardSizeSelector } from './StandardSizeSelector';
import { StandardSizesService } from '@/services/StandardSizesService';
import { MeasurementMode } from '@/types/standardSizes';

/**
 * Measurements Section Component (PD_PH2_US004)
 * Displays relevant measurement fields based on selected garment type
 * with support for custom measurements or standard size selection
 * with real-time 2D schematic preview (PD_PH2_US002)
 */
export const MeasurementsSection: React.FC = () => {
  const { t } = useTranslation();
  const { state, updateMeasurements } = usePattern();
  const { measurements, garmentType, neckline } = state;
  
  // Local form state for controlled inputs
  const [formData, setFormData] = useState({
    // Common measurements
    length: measurements.length?.toString() || '',
    width: measurements.width?.toString() || '',
    
    // Sweater/Cardigan specific
    chestCircumference: measurements.chestCircumference?.toString() || '',
    bodyLength: measurements.bodyLength?.toString() || '',
    sleeveLength: measurements.sleeveLength?.toString() || '',
    shoulderWidth: measurements.shoulderWidth?.toString() || '',
    armholeDepth: measurements.armholeDepth?.toString() || '',
    
    // Hat specific
    headCircumference: measurements.headCircumference?.toString() || '',
    hatHeight: measurements.hatHeight?.toString() || '',
    
    // Scarf specific
    scarfLength: measurements.scarfLength?.toString() || '',
    scarfWidth: measurements.scarfWidth?.toString() || ''
  });

  // Loading state for standard size operations
  const [isLoadingStandardSize, setIsLoadingStandardSize] = useState(false);

  // Update form data when measurements change (e.g., from garment type change or standard size selection)
  useEffect(() => {
    setFormData({
      length: measurements.length?.toString() || '',
      width: measurements.width?.toString() || '',
      chestCircumference: measurements.chestCircumference?.toString() || '',
      bodyLength: measurements.bodyLength?.toString() || '',
      sleeveLength: measurements.sleeveLength?.toString() || '',
      shoulderWidth: measurements.shoulderWidth?.toString() || '',
      armholeDepth: measurements.armholeDepth?.toString() || '',
      headCircumference: measurements.headCircumference?.toString() || '',
      hatHeight: measurements.hatHeight?.toString() || '',
      scarfLength: measurements.scarfLength?.toString() || '',
      scarfWidth: measurements.scarfWidth?.toString() || ''
    });
  }, [measurements]);

  /**
   * Handle measurement mode change between custom and standard
   */
  const handleModeChange = (mode: MeasurementMode) => {
    if (mode === 'custom') {
      // Switch to custom mode, keep existing measurements but clear standard size reference
      updateMeasurements({
        mode: 'custom',
        standardSizeId: null,
        standardSizeLabel: null
      });
    } else {
      // Switch to standard mode, will be handled by standard size selection
      updateMeasurements({
        mode: 'standard'
      });
    }
  };

  /**
   * Handle standard size selection
   */
  const handleStandardSizeSelected = async (sizeId: string, _sizeLabel: string) => {
    setIsLoadingStandardSize(true);
    
    try {
      const result = await StandardSizesService.getMeasurementsForPatternState(sizeId);
      
      if (result.success && result.measurements) {
        // Update measurements with standard size data
        updateMeasurements(result.measurements);
      } else {
        console.error('Failed to load standard size measurements:', result.error);
        // Could add user notification here
      }
    } catch (error) {
      console.error('Error loading standard size measurements:', error);
    } finally {
      setIsLoadingStandardSize(false);
    }
  };

  /**
   * Handle input changes for custom measurements
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const numericValue = value ? parseFloat(value) : null;
    updateMeasurements({ 
      [field]: numericValue,
      mode: 'custom', // Switch to custom mode when manually editing
      standardSizeId: null,
      standardSizeLabel: null
    });
  };

  /**
   * Get relevant measurement fields based on garment type
   */
  const getRelevantFields = (garmentType: GarmentType) => {
    const fields = [];
    
    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
      case 'vest':
        fields.push(
          { key: 'chestCircumference', label: t('measurements.fields.chestCircumference', 'Chest Circumference (cm)'), placeholder: 'e.g., 96' },
          { key: 'bodyLength', label: t('measurements.fields.bodyLength', 'Body Length (cm)'), placeholder: 'e.g., 60' },
          { key: 'shoulderWidth', label: t('measurements.fields.shoulderWidth', 'Shoulder Width (cm)'), placeholder: 'e.g., 42' },
          { key: 'armholeDepth', label: t('measurements.fields.armholeDepth', 'Armhole Depth (cm)'), placeholder: 'e.g., 20' }
        );
        if (garmentType !== 'vest') {
          fields.push({ key: 'sleeveLength', label: t('measurements.fields.sleeveLength', 'Sleeve Length (cm)'), placeholder: 'e.g., 58' });
        }
        break;
        
      case 'hat':
        fields.push(
          { key: 'headCircumference', label: t('measurements.fields.headCircumference', 'Head Circumference (cm)'), placeholder: 'e.g., 56' },
          { key: 'hatHeight', label: t('measurements.fields.hatHeight', 'Hat Height (cm)'), placeholder: 'e.g., 20' }
        );
        break;
        
      case 'scarf':
        fields.push(
          { key: 'scarfLength', label: t('measurements.fields.scarfLength', 'Scarf Length (cm)'), placeholder: 'e.g., 150' },
          { key: 'scarfWidth', label: t('measurements.fields.scarfWidth', 'Scarf Width (cm)'), placeholder: 'e.g., 20' }
        );
        break;
        
      default:
        // Generic measurements when no specific garment type is selected
        fields.push(
          { key: 'length', label: t('measurements.fields.length', 'Length (cm)'), placeholder: 'e.g., 60' },
          { key: 'width', label: t('measurements.fields.width', 'Width (cm)'), placeholder: 'e.g., 40' }
        );
        break;
    }
    
    return fields;
  };

  const relevantFields = getRelevantFields(garmentType);

  if (!garmentType) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('measurements.title', 'Measurements')}
          </h2>
          <p className="text-gray-600">
            {t('measurements.selectGarmentTypeFirst', 'Please select a garment type first to see relevant measurement fields.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('measurements.title', 'Measurements')} - {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)}
        </h2>
        <p className="text-gray-600">
          {t('measurements.description', 'Choose between standard sizes or enter custom measurements for your {{garmentType}}.', { garmentType })}
        </p>
      </div>

      {/* Two-column layout: Form + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Measurement form */}
        <div className="space-y-6">
          
          {/* Measurement Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('measurements.measurementMode', 'Measurement Mode')}
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="measurementMode"
                  value="custom"
                  checked={measurements.mode === 'custom'}
                  onChange={() => handleModeChange('custom')}
                  className="mr-2"
                />
                <span className="text-sm">{t('measurements.customMeasurements', 'Custom Measurements')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="measurementMode"
                  value="standard"
                  checked={measurements.mode === 'standard'}
                  onChange={() => handleModeChange('standard')}
                  className="mr-2"
                />
                <span className="text-sm">{t('measurements.standardSizes', 'Standard Sizes')}</span>
              </label>
            </div>
          </div>

          {/* Standard Size Selection */}
          {measurements.mode === 'standard' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('measurements.selectStandardSize', 'Select Standard Size')}
              </h3>
              <StandardSizeSelector
                garmentType={garmentType}
                onSizeSelected={handleStandardSizeSelected}
                selectedSizeId={measurements.standardSizeId}
                isLoading={isLoadingStandardSize}
              />
              
              {/* Display selected size info */}
              {measurements.standardSizeLabel && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>{t('measurements.selectedSize', 'Selected Size')}:</strong> {measurements.standardSizeLabel}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Custom Measurement Fields */}
          {measurements.mode === 'custom' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('measurements.enterMeasurements', 'Enter Measurements')}
              </h3>
              {relevantFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <input
                    id={key}
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Read-only measurement display for standard sizes */}
          {measurements.mode === 'standard' && measurements.standardSizeId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('measurements.measurementValues', 'Measurement Values')}
                </h3>
                <button
                  onClick={() => handleModeChange('custom')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('measurements.editMeasurements', 'Edit Measurements')}
                </button>
              </div>
              {relevantFields.map(({ key, label }) => {
                const value = measurements[key as keyof MeasurementsData];
                return (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm text-gray-900">
                      {value ? `${value} cm` : t('common.notSet', 'Not set')}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Status indicator */}
          <div className="mt-6 flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${measurements.isSet ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">
              {measurements.isSet 
                ? t('measurements.measurementsSaved', 'Measurements saved')
                : t('measurements.enterMeasurementsToContinue', 'Enter measurements to continue')
              }
            </span>
          </div>

          {/* Helpful tips */}
          <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              {t('measurements.measurementTips', 'Measurement Tips')}
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              {garmentType === 'sweater' || garmentType === 'cardigan' || garmentType === 'vest' ? (
                <>
                  <li>• {t('measurements.tips.chestCircumference', 'Measure chest circumference at the fullest part')}</li>
                  <li>• {t('measurements.tips.bodyLength', 'Body length is measured from shoulder to desired hem')}</li>
                  <li>• {t('measurements.tips.easeNext', 'Add ease for comfort - this will be handled in the next section')}</li>
                </>
              ) : garmentType === 'hat' ? (
                <>
                  <li>• {t('measurements.tips.headCircumference', 'Measure head circumference around the forehead')}</li>
                  <li>• {t('measurements.tips.hatHeight', 'Hat height includes any turn-back brim')}</li>
                </>
              ) : garmentType === 'scarf' ? (
                <>
                  <li>• {t('measurements.tips.scarfLength', 'Standard scarf length is 150-180cm')}</li>
                  <li>• {t('measurements.tips.scarfWidth', 'Width typically ranges from 15-25cm')}</li>
                </>
              ) : null}
            </ul>
          </div>
        </div>

        {/* Right column: 2D Schematic Preview */}
        <div className="lg:sticky lg:top-8">
          <SchematicPreview2D
            garmentType={garmentType}
            measurements={measurements}
            neckline={neckline}
            width={320}
            height={420}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}; 