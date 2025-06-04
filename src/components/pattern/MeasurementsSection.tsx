'use client';

import React, { useState, useEffect } from 'react';
import { usePattern } from '@/hooks/usePattern';
import { GarmentType } from '@/types/pattern';

/**
 * Measurements Section Component
 * Displays relevant measurement fields based on selected garment type
 */
export const MeasurementsSection: React.FC = () => {
  const { state, updateMeasurements } = usePattern();
  const { measurements, garmentType } = state;
  
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

  // Update form data when measurements change (e.g., from garment type change)
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
   * Handle input changes and update pattern state
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    const numericValue = value ? parseFloat(value) : null;
    updateMeasurements({ [field]: numericValue });
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
          { key: 'chestCircumference', label: 'Chest Circumference (cm)', placeholder: 'e.g., 96' },
          { key: 'bodyLength', label: 'Body Length (cm)', placeholder: 'e.g., 60' },
          { key: 'shoulderWidth', label: 'Shoulder Width (cm)', placeholder: 'e.g., 42' },
          { key: 'armholeDepth', label: 'Armhole Depth (cm)', placeholder: 'e.g., 20' }
        );
        if (garmentType !== 'vest') {
          fields.push({ key: 'sleeveLength', label: 'Sleeve Length (cm)', placeholder: 'e.g., 58' });
        }
        break;
        
      case 'hat':
        fields.push(
          { key: 'headCircumference', label: 'Head Circumference (cm)', placeholder: 'e.g., 56' },
          { key: 'hatHeight', label: 'Hat Height (cm)', placeholder: 'e.g., 20' }
        );
        break;
        
      case 'scarf':
        fields.push(
          { key: 'scarfLength', label: 'Scarf Length (cm)', placeholder: 'e.g., 150' },
          { key: 'scarfWidth', label: 'Scarf Width (cm)', placeholder: 'e.g., 20' }
        );
        break;
        
      default:
        // Generic measurements when no specific garment type is selected
        fields.push(
          { key: 'length', label: 'Length (cm)', placeholder: 'e.g., 60' },
          { key: 'width', label: 'Width (cm)', placeholder: 'e.g., 40' }
        );
        break;
    }
    
    return fields;
  };

  const relevantFields = getRelevantFields(garmentType);

  if (!garmentType) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Measurements</h2>
          <p className="text-gray-600">
            Please select a garment type first to see relevant measurement fields.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Measurements - {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)}
        </h2>
        <p className="text-gray-600">
          Enter the measurements for your {garmentType}. All measurements should be in centimeters.
        </p>
      </div>

      <div className="space-y-6">
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

      {/* Status indicator */}
      <div className="mt-6 p-3 rounded-md bg-gray-50 border">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${measurements.isSet ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-700">
            {measurements.isSet ? 'Measurements saved' : 'Enter measurements to continue'}
          </span>
        </div>
      </div>

      {/* Helpful tips */}
      <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-1">Measurement Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {garmentType === 'sweater' || garmentType === 'cardigan' || garmentType === 'vest' ? (
            <>
              <li>• Measure chest circumference at the fullest part</li>
              <li>• Body length is measured from shoulder to desired hem</li>
              <li>• Add ease for comfort - this will be handled in the next section</li>
            </>
          ) : garmentType === 'hat' ? (
            <>
              <li>• Measure head circumference around the forehead</li>
              <li>• Hat height includes any turn-back brim</li>
            </>
          ) : garmentType === 'scarf' ? (
            <>
              <li>• Standard scarf length is 150-180cm</li>
              <li>• Width typically ranges from 15-25cm</li>
            </>
          ) : null}
        </ul>
      </div>
    </div>
  );
}; 