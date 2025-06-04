'use client';

import React, { useState } from 'react';
import { usePattern } from '@/hooks/usePattern';

/**
 * Gauge Section Component
 * Allows users to input and manage gauge information for their pattern
 */
export const GaugeSection: React.FC = () => {
  const { state, updateGauge } = usePattern();
  const { gauge } = state;
  
  // Local form state for controlled inputs
  const [formData, setFormData] = useState({
    stitchesPer10cm: gauge.stitchesPer10cm?.toString() || '',
    rowsPer10cm: gauge.rowsPer10cm?.toString() || '',
    yarnUsed: gauge.yarnUsed || '',
    needleSize: gauge.needleSize?.toString() || '',
    tensionNotes: gauge.tensionNotes || ''
  });

  /**
   * Handle input changes and update pattern state
   */
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update pattern state immediately for numeric fields
    if (field === 'stitchesPer10cm' || field === 'rowsPer10cm' || field === 'needleSize') {
      const numericValue = value ? parseFloat(value) : null;
      updateGauge({ [field]: numericValue });
    } else {
      // For string fields
      updateGauge({ [field]: value || null });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gauge Information</h2>
        <p className="text-gray-600">
          Enter your gauge swatch measurements to ensure accurate pattern calculations.
        </p>
      </div>

      <div className="space-y-6">
        {/* Stitches per 10cm */}
        <div>
          <label htmlFor="stitches" className="block text-sm font-medium text-gray-700 mb-2">
            Stitches per 10cm
          </label>
          <input
            id="stitches"
            type="number"
            step="0.5"
            min="0"
            value={formData.stitchesPer10cm}
            onChange={(e) => handleInputChange('stitchesPer10cm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 18"
          />
        </div>

        {/* Rows per 10cm */}
        <div>
          <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-2">
            Rows per 10cm
          </label>
          <input
            id="rows"
            type="number"
            step="0.5"
            min="0"
            value={formData.rowsPer10cm}
            onChange={(e) => handleInputChange('rowsPer10cm', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 24"
          />
        </div>

        {/* Yarn Used */}
        <div>
          <label htmlFor="yarn" className="block text-sm font-medium text-gray-700 mb-2">
            Yarn Used
          </label>
          <input
            id="yarn"
            type="text"
            value={formData.yarnUsed}
            onChange={(e) => handleInputChange('yarnUsed', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Worsted Weight Wool"
          />
        </div>

        {/* Needle Size */}
        <div>
          <label htmlFor="needleSize" className="block text-sm font-medium text-gray-700 mb-2">
            Needle Size (mm)
          </label>
          <input
            id="needleSize"
            type="number"
            step="0.25"
            min="0"
            value={formData.needleSize}
            onChange={(e) => handleInputChange('needleSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 4.5"
          />
        </div>

        {/* Tension Notes */}
        <div>
          <label htmlFor="tensionNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Tension Notes
          </label>
          <textarea
            id="tensionNotes"
            rows={3}
            value={formData.tensionNotes}
            onChange={(e) => handleInputChange('tensionNotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional notes about your gauge swatch..."
          />
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-6 p-3 rounded-md bg-gray-50 border">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${gauge.isSet ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-700">
            {gauge.isSet ? 'Gauge information saved' : 'Enter gauge information to continue'}
          </span>
        </div>
      </div>
    </div>
  );
}; 