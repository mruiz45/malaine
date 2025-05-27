/**
 * Garment Type Selector Component (US_4.2)
 * Allows users to select the type of garment they want to create
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GarmentType } from '@/types/garment';
import { ClientGarmentTypeService } from '@/services/clientGarmentTypeService';

interface GarmentTypeSelectorProps {
  /** Currently selected garment type ID */
  selectedGarmentTypeId?: string;
  /** Callback when a garment type is selected */
  onGarmentTypeSelect: (garmentType: GarmentType) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Garment Type Selector Component
 */
export default function GarmentTypeSelector({
  selectedGarmentTypeId,
  onGarmentTypeSelect,
  disabled = false,
  isLoading = false
}: GarmentTypeSelectorProps) {
  const { t } = useTranslation();
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load available garment types on component mount
   */
  useEffect(() => {
    const loadGarmentTypes = async () => {
      try {
        setLoadingTypes(true);
        setError(null);
        const types = await ClientGarmentTypeService.getAllGarmentTypes();
        setGarmentTypes(types);
      } catch (error) {
        console.error('Error loading garment types:', error);
        setError(error instanceof Error ? error.message : 'Failed to load garment types');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadGarmentTypes();
  }, []);

  /**
   * Handle garment type selection
   */
  const handleGarmentTypeSelect = (garmentType: GarmentType) => {
    if (disabled || isLoading) return;
    onGarmentTypeSelect(garmentType);
  };

  /**
   * Get difficulty level badge color
   */
  const getDifficultyBadgeColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Render loading state
   */
  if (loadingTypes) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('garmentType.selectType', 'Select Garment Type')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-6 h-32">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('garmentType.selectType', 'Select Garment Type')}
        </h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t('common.error', 'Error')}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render garment type selector
   */
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('garmentType.selectType', 'Select Garment Type')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('garmentType.selectTypeDescription', 'Choose the type of garment you want to create. This will determine the available options and tools for your pattern.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {garmentTypes.map((garmentType) => {
          const isSelected = selectedGarmentTypeId === garmentType.id;
          const difficulty = garmentType.metadata?.difficulty_level;

          return (
            <div
              key={garmentType.id}
              className={`
                relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }
                ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => handleGarmentTypeSelect(garmentType)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Garment type content */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-medium text-gray-900">
                    {garmentType.display_name}
                  </h4>
                  {garmentType.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {garmentType.description}
                    </p>
                  )}
                </div>

                {/* Difficulty badge */}
                {difficulty && (
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(difficulty)}`}>
                      {t(`garmentType.difficulty.${difficulty}`, difficulty) as string}
                    </span>
                  </div>
                )}

                {/* Additional metadata */}
                {garmentType.metadata?.typical_components && (
                  <div className="text-xs text-gray-500">
                    {t('garmentType.components', 'Components')}: {garmentType.metadata.typical_components.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {garmentTypes.length === 0 && !loadingTypes && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {t('garmentType.noTypesAvailable', 'No garment types available')}
          </p>
        </div>
      )}
    </div>
  );
} 