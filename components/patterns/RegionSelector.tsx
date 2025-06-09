'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface RegionData {
  region_key: string;
  region_name: string;
  available_demographics: string[];
}

interface RegionSelectorProps {
  selectedRegion?: string;
  onRegionSelect: (region: string, availableDemographics: string[]) => void;
  className?: string;
}

export default function RegionSelector({
  selectedRegion,
  onRegionSelect,
  className = ''
}: RegionSelectorProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadRegions();
    }
  }, [isClient]);

  const loadRegions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/size-standards/regions');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setRegions(result.data);
      } else {
        throw new Error(result.error || 'Failed to load regions');
      }
    } catch (err) {
      console.error('Error loading regions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionClick = (region: RegionData) => {
    onRegionSelect(region.region_key, region.available_demographics);
  };

  const getRegionFlag = (regionKey: string) => {
    const flags: Record<string, string> = {
      'europe': '🇪🇺',
      'us': '🇺🇸',
      'uk': '🇬🇧',
      'asia': '🌏'
    };
    return flags[regionKey] || '🌍';
  };

  const getRegionDisplayName = (regionKey: string) => {
    const names: Record<string, string> = {
      'europe': t('size_standards_region_europe'),
      'us': t('size_standards_region_us'),
      'uk': t('size_standards_region_uk'),
      'asia': t('size_standards_region_asia')
    };
    return names[regionKey] || regionKey;
  };

  if (!isClient) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg h-32 ${className}`}>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-3"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-300 rounded"></div>
            <div className="h-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('size_standards_select_region')}
        </h3>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">{t('size_standards_loading_regions')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('size_standards_select_region')}
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
                {t('size_standards_error_loading_regions')}: {error}
              </p>
              <button
                onClick={loadRegions}
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
        {t('size_standards_select_region')}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {regions.map((region) => (
          <button
            key={region.region_key}
            onClick={() => handleRegionClick(region)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 
              hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${selectedRegion === region.region_key
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">
                {getRegionFlag(region.region_key)}
              </div>
              <div className="text-sm font-medium">
                {getRegionDisplayName(region.region_key)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {region.available_demographics.length} {t('size_standards_demographics')}
              </div>
            </div>
            
            {selectedRegion === region.region_key && (
              <div className="absolute top-2 right-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {regions.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          {t('size_standards_no_regions_available')}
        </div>
      )}
    </div>
  );
} 