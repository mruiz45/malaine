'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SizeEquivalences, StandardMeasurements } from '@/lib/types';

interface SizeData {
  size_key: string;
  equivalences: SizeEquivalences;
  measurements: StandardMeasurements;
}

interface SizeGridProps {
  region: string;
  demographic: string;
  selectedSize?: string;
  onSizeSelect: (size: string, measurements: StandardMeasurements) => void;
  className?: string;
}

export default function SizeGrid({
  region,
  demographic,
  selectedSize,
  onSizeSelect,
  className = ''
}: SizeGridProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [sizes, setSizes] = useState<SizeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadSizes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/size-standards/sizes?region=${region}&demographic=${demographic}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSizes(result.data);
      } else {
        throw new Error(result.error || 'Failed to load sizes');
      }
    } catch (err) {
      console.error('Error loading sizes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [region, demographic]);

  useEffect(() => {
    if (isClient && region && demographic) {
      loadSizes();
    }
  }, [isClient, region, demographic, loadSizes]);

  const handleSizeClick = (size: SizeData) => {
    onSizeSelect(size.size_key, size.measurements);
  };

  const getDemographicDisplayName = (demo: string) => {
    const names: Record<string, string> = {
      'adult_female': t('size_standards_demo_adult_female'),
      'adult_male': t('size_standards_demo_adult_male'),
      'child': t('size_standards_demo_child'),
      'baby': t('size_standards_demo_baby')
    };
    return names[demo] || demo;
  };

  const formatEquivalences = (equivalences: SizeEquivalences) => {
    const parts: string[] = [];
    if (equivalences.eu) parts.push(`EU ${equivalences.eu}`);
    if (equivalences.us) parts.push(`US ${equivalences.us}`);
    if (equivalences.uk) parts.push(`UK ${equivalences.uk}`);
    if (equivalences.asia) parts.push(`Asia ${equivalences.asia}`);
    return parts.join(' • ');
  };

  if (!isClient) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-40 ${className}`}>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
            <div className="h-20 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('size_standards_select_size')} - {getDemographicDisplayName(demographic)}
        </h3>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">{t('size_standards_loading_sizes')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('size_standards_select_size')} - {getDemographicDisplayName(demographic)}
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                {t('size_standards_error_loading_sizes')}: {error}
              </p>
              <button
                onClick={loadSizes}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
              >
                {t('size_standards_retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {t('size_standards_select_size')} - {getDemographicDisplayName(demographic)}
      </h3>
      
      {sizes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sizes.map((size) => (
            <button
              key={size.size_key}
              onClick={() => handleSizeClick(size)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 
                hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${selectedSize === size.size_key
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="text-center">
                <div className="text-xl font-bold mb-2">
                  {size.size_key}
                </div>
                <div className="text-xs text-gray-600 leading-tight">
                  {formatEquivalences(size.equivalences)}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {t('size_standards_chest')}: {size.measurements.chest_bust_cm}cm
                </div>
              </div>
              
              {selectedSize === size.size_key && (
                <div className="absolute top-2 right-2">
                  <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-gray-600">{t('size_standards_no_sizes_available')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('size_standards_combination_not_supported')}
          </p>
        </div>
      )}
    </div>
  );
} 