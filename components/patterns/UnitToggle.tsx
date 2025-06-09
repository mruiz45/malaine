'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface UnitToggleProps {
  selectedUnit: 'cm' | 'inches';
  onUnitChange: (unit: 'cm' | 'inches') => void;
  className?: string;
}

export default function UnitToggle({ selectedUnit, onUnitChange, className = '' }: UnitToggleProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
        <button className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white">
          {t('measurement_unit_cm')}
        </button>
        <button className="px-3 py-1 text-sm rounded-md text-gray-700">
          {t('measurement_unit_inches')}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
      <button
        onClick={() => onUnitChange('cm')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          selectedUnit === 'cm'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={selectedUnit === 'cm'}
      >
        {t('measurement_unit_cm')}
      </button>
      <button
        onClick={() => onUnitChange('inches')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          selectedUnit === 'inches'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        aria-pressed={selectedUnit === 'inches'}
      >
        {t('measurement_unit_inches')}
      </button>
    </div>
  );
} 