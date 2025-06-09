'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SizeEquivalences } from '@/lib/types';

interface SizeEquivalenceDisplayProps {
  equivalences: SizeEquivalences;
  selectedSize: string;
  className?: string;
}

export default function SizeEquivalenceDisplay({
  equivalences,
  selectedSize,
  className = ''
}: SizeEquivalenceDisplayProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getSystemDisplayName = (system: string) => {
    const names: Record<string, string> = {
      'eu': t('size_standards_system_europe'),
      'us': t('size_standards_system_us'),
      'uk': t('size_standards_system_uk'),
      'asia': t('size_standards_system_asia')
    };
    return names[system] || system.toUpperCase();
  };

  const getSystemFlag = (system: string) => {
    const flags: Record<string, string> = {
      'eu': '🇪🇺',
      'us': '🇺🇸',
      'uk': '🇬🇧',
      'asia': '🌏'
    };
    return flags[system] || '🌍';
  };

  if (!isClient) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-24 ${className}`}>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-3"></div>
          <div className="flex space-x-3">
            <div className="flex-1 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const availableSystems = Object.entries(equivalences).filter(([, value]) => value !== undefined && value !== null);

  if (availableSystems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="text-sm font-medium text-blue-900">
          {t('size_standards_size_equivalences')} - {selectedSize}
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {availableSystems.map(([system, value]) => (
          <div 
            key={system}
            className="flex items-center space-x-2 bg-white rounded-md p-2 border border-blue-100"
          >
            <span className="text-lg">
              {getSystemFlag(system)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-600 truncate">
                {getSystemDisplayName(system)}
              </div>
              <div className="text-sm font-medium text-gray-900 truncate">
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-blue-700">
        <svg className="inline h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        {t('size_standards_equivalences_note')}
      </div>
    </div>
  );
} 