'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { 
  SweaterStructureAttributes, 
  ConstructionMethod, 
  BodyShape 
} from '@/types/sweaterStructure';
import {
  getCompatibleConstructionMethods,
  getCompatibleBodyShapes,
  isCompatibleCombination,
  getAllConstructionMethods,
  getAllBodyShapes
} from '@/utils/bodyStructureConfig';
import ConstructionMethodCard from './ConstructionMethodCard';
import BodyShapeCard from './BodyShapeCard';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface BodyStructureSelectorProps {
  /** Currently selected garment type key */
  garmentTypeKey?: string;
  /** Currently selected structure attributes */
  selectedStructure?: SweaterStructureAttributes | null;
  /** Callback when construction method is selected */
  onConstructionMethodSelect: (method: ConstructionMethod | null) => void;
  /** Callback when body shape is selected */
  onBodyShapeSelect: (shape: BodyShape | null) => void;
  /** Callback when the complete structure is updated */
  onStructureUpdate?: (structure: SweaterStructureAttributes) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main selector component for body structure (construction method + body shape)
 * Handles compatibility validation between construction methods and body shapes
 */
export default function BodyStructureSelector({
  garmentTypeKey = 'sweater_pullover',
  selectedStructure = null,
  onConstructionMethodSelect,
  onBodyShapeSelect,
  onStructureUpdate,
  disabled = false,
  className = ''
}: BodyStructureSelectorProps) {
  const { t } = useTranslation();
  
  // Local state for selections
  const [selectedConstructionMethod, setSelectedConstructionMethod] = useState<ConstructionMethod | null>(
    selectedStructure?.construction_method || null
  );
  const [selectedBodyShape, setSelectedBodyShape] = useState<BodyShape | null>(
    selectedStructure?.body_shape || null
  );
  const [compatibilityWarning, setCompatibilityWarning] = useState<string | null>(null);

  // Get available options based on garment type
  const availableConstructionMethods = getCompatibleConstructionMethods(garmentTypeKey);
  const allBodyShapes = getAllBodyShapes();

  // Update local state when props change
  useEffect(() => {
    setSelectedConstructionMethod(selectedStructure?.construction_method || null);
    setSelectedBodyShape(selectedStructure?.body_shape || null);
  }, [selectedStructure]);

  // Check compatibility when selections change
  useEffect(() => {
    if (selectedConstructionMethod && selectedBodyShape) {
      if (!isCompatibleCombination(selectedConstructionMethod, selectedBodyShape)) {
        setCompatibilityWarning(
          t('bodyStructure.compatibilityWarning', 
            'The selected construction method and body shape may not be fully compatible. Consider adjusting your selection.')
        );
      } else {
        setCompatibilityWarning(null);
      }
    } else {
      setCompatibilityWarning(null);
    }
  }, [selectedConstructionMethod, selectedBodyShape, t]);

  /**
   * Handle construction method selection
   */
  const handleConstructionMethodSelect = (method: ConstructionMethod) => {
    setSelectedConstructionMethod(method);
    onConstructionMethodSelect(method);

    // Check if current body shape is compatible
    if (selectedBodyShape && !isCompatibleCombination(method, selectedBodyShape)) {
      // Optionally clear incompatible body shape
      setSelectedBodyShape(null);
      onBodyShapeSelect(null);
    }

    // Trigger structure update
    if (onStructureUpdate) {
      onStructureUpdate({
        construction_method: method,
        body_shape: selectedBodyShape || undefined
      });
    }
  };

  /**
   * Handle body shape selection
   */
  const handleBodyShapeSelect = (shape: BodyShape) => {
    setSelectedBodyShape(shape);
    onBodyShapeSelect(shape);

    // Trigger structure update
    if (onStructureUpdate) {
      onStructureUpdate({
        construction_method: selectedConstructionMethod || undefined,
        body_shape: shape
      });
    }
  };

  /**
   * Clear all selections
   */
  const handleClearSelections = () => {
    setSelectedConstructionMethod(null);
    setSelectedBodyShape(null);
    onConstructionMethodSelect(null);
    onBodyShapeSelect(null);
    setCompatibilityWarning(null);

    if (onStructureUpdate) {
      onStructureUpdate({});
    }
  };

  /**
   * Check if a body shape is available for selection
   */
  const isBodyShapeAvailable = (shape: BodyShape): boolean => {
    if (!selectedConstructionMethod) return true;
    return isCompatibleCombination(selectedConstructionMethod, shape);
  };

  /**
   * Get compatible body shapes for the selected construction method
   */
  const getAvailableBodyShapes = () => {
    if (!selectedConstructionMethod) return allBodyShapes;
    return getCompatibleBodyShapes(selectedConstructionMethod);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {t('bodyStructure.title', 'Body Structure')}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('bodyStructure.description', 'Define how your garment body is constructed and shaped')}
          </p>
        </div>

        {(selectedConstructionMethod || selectedBodyShape) && (
          <button
            type="button"
            onClick={handleClearSelections}
            className="text-sm text-gray-500 hover:text-gray-700"
            disabled={disabled}
          >
            {t('common.clearSelection', 'Clear Selection')}
          </button>
        )}
      </div>

      {/* Compatibility Warning */}
      {compatibilityWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                {t('bodyStructure.compatibilityWarningTitle', 'Compatibility Notice')}
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {compatibilityWarning}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Construction Methods Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-md font-medium text-gray-900">
            {t('bodyStructure.constructionMethod', 'Construction Method')}
          </h4>
          <span className="text-red-500 text-sm">*</span>
        </div>
        
        <p className="text-sm text-gray-600">
          {t('bodyStructure.constructionMethodDescription', 'Choose how the sleeves will be attached to the body')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableConstructionMethods.map((method) => (
            <ConstructionMethodCard
              key={method.key}
              constructionMethod={method}
              isSelected={selectedConstructionMethod === method.key}
              onSelect={handleConstructionMethodSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Body Shapes Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h4 className="text-md font-medium text-gray-900">
            {t('bodyStructure.bodyShape', 'Body Shape')}
          </h4>
          <span className="text-gray-400 text-sm">
            {t('common.optional', '(Optional)')}
          </span>
        </div>
        
        <p className="text-sm text-gray-600">
          {t('bodyStructure.bodyShapeDescription', 'Define the overall silhouette and fit of your garment')}
        </p>

        {/* Info about filtering */}
        {selectedConstructionMethod && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                {t('bodyStructure.compatibilityFiltering', 
                  'Showing body shapes compatible with your selected construction method')}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allBodyShapes.map((shape) => {
            const isAvailable = isBodyShapeAvailable(shape.key);
            return (
              <BodyShapeCard
                key={shape.key}
                bodyShape={shape}
                isSelected={selectedBodyShape === shape.key}
                isAvailable={isAvailable}
                onSelect={handleBodyShapeSelect}
                disabled={disabled}
              />
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(selectedConstructionMethod || selectedBodyShape) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {t('bodyStructure.selectionSummary', 'Current Selection')}
          </h4>
          <div className="space-y-1 text-sm text-gray-600">
            {selectedConstructionMethod && (
              <div>
                <span className="font-medium">{t('bodyStructure.constructionMethod', 'Construction Method')}: </span>
                <span>{t(`bodyStructure.constructionMethods.${selectedConstructionMethod}.name`, selectedConstructionMethod)}</span>
              </div>
            )}
            {selectedBodyShape && (
              <div>
                <span className="font-medium">{t('bodyStructure.bodyShape', 'Body Shape')}: </span>
                <span>{t(`bodyStructure.bodyShapes.${selectedBodyShape}.name`, selectedBodyShape)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}