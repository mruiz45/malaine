'use client';

import React from 'react';
import { usePattern } from '@/hooks/usePattern';
import { PatternSection, GarmentType } from '@/types/pattern';

/**
 * Pattern Navigation Component
 * Provides navigation between different pattern design sections
 * and garment type selection
 */
export const PatternNavigation: React.FC = () => {
  const { state, setCurrentSection, setGarmentType } = usePattern();
  const { uiSettings, garmentType } = state;

  // Available sections for navigation
  const sections: { key: PatternSection; label: string; description: string }[] = [
    { key: 'gauge', label: 'Gauge', description: 'Swatch measurements' },
    { key: 'measurements', label: 'Measurements', description: 'Body measurements' },
    { key: 'ease', label: 'Ease', description: 'Fit preferences' },
    { key: 'bodyStructure', label: 'Structure', description: 'Construction details' },
    { key: 'neckline', label: 'Neckline', description: 'Neck styling' },
    { key: 'sleeves', label: 'Sleeves', description: 'Sleeve details' },
    { key: 'finishing', label: 'Finishing', description: 'Final touches' }
  ];

  // Available garment types
  const garmentTypes: { key: GarmentType; label: string }[] = [
    { key: 'sweater', label: 'Sweater' },
    { key: 'cardigan', label: 'Cardigan' },
    { key: 'vest', label: 'Vest' },
    { key: 'hat', label: 'Hat' },
    { key: 'scarf', label: 'Scarf' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4">
        
        {/* Garment Type Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Garment Type</h3>
          <div className="flex flex-wrap gap-2">
            {garmentTypes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setGarmentType(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  garmentType === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setGarmentType(null)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                garmentType === null
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              Clear Selection
            </button>
          </div>
        </div>

        {/* Section Navigation */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Design Sections</h3>
          <div className="flex flex-wrap gap-2">
            {sections.map(({ key, label, description }) => {
              const isActive = uiSettings.currentSection === key;
              const sectionData = state[key];
              const isCompleted = sectionData && 'isSet' in sectionData && sectionData.isSet;
              
              return (
                <button
                  key={key}
                  onClick={() => setCurrentSection(key)}
                  className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  title={description}
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    {isCompleted && (
                      <div className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-white' : 'bg-green-500'
                      }`} />
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-600">Current: </span>
              <span className="font-medium text-gray-900">
                {sections.find(s => s.key === uiSettings.currentSection)?.label}
              </span>
              {garmentType && (
                <>
                  <span className="text-gray-600 ml-4">Garment: </span>
                  <span className="font-medium text-gray-900 capitalize">{garmentType}</span>
                </>
              )}
            </div>
            <div className="text-gray-500">
              {sections.filter(s => {
                const sectionData = state[s.key];
                return sectionData && 'isSet' in sectionData && sectionData.isSet;
              }).length} / {sections.length} sections completed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 