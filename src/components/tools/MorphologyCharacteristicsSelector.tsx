/**
 * MorphologyCharacteristicsSelector Component
 * Allows users to select morphology characteristics for advice
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { 
  MorphologyCharacteristic,
  MorphologyCharacteristicsSelectorProps
} from '@/types/morphologyAdvisor';
import { MORPHOLOGY_CHARACTERISTICS } from '@/types/morphologyAdvisor';

/**
 * Morphology characteristics selector component
 */
export default function MorphologyCharacteristicsSelector({
  selectedCharacteristics,
  onSelectionChange,
  disabled = false,
  error
}: MorphologyCharacteristicsSelectorProps) {
  const { t } = useTranslation();

  /**
   * Handles checkbox change for a characteristic
   */
  const handleCharacteristicToggle = (characteristic: MorphologyCharacteristic) => {
    if (disabled) return;

    const isSelected = selectedCharacteristics.includes(characteristic);
    let newSelection: MorphologyCharacteristic[];

    if (isSelected) {
      // Remove characteristic
      newSelection = selectedCharacteristics.filter(c => c !== characteristic);
    } else {
      // Add characteristic
      newSelection = [...selectedCharacteristics, characteristic];
    }

    onSelectionChange(newSelection);
  };

  /**
   * Groups characteristics by category for better organization
   */
  const groupedCharacteristics = MORPHOLOGY_CHARACTERISTICS.reduce((groups, characteristic) => {
    const category = characteristic.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(characteristic);
    return groups;
  }, {} as Record<string, typeof MORPHOLOGY_CHARACTERISTICS>);

  /**
   * Gets category display name
   */
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      torso: t('morphology_advisor.categories.torso', 'Torso'),
      shoulders: t('morphology_advisor.categories.shoulders', 'Shoulders'),
      arms: t('morphology_advisor.categories.arms', 'Arms'),
      posture: t('morphology_advisor.categories.posture', 'Posture')
    };
    return categoryNames[category] || category;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('morphology_advisor.select_characteristics')} *
        </label>
        <p className="text-sm text-gray-600 mb-4">
          {t('morphology_advisor.select_characteristics_description')}
        </p>

        {/* Characteristics grouped by category */}
        <div className="space-y-6">
          {Object.entries(groupedCharacteristics).map(([category, characteristics]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {getCategoryDisplayName(category)}
              </h4>
              
              <div className="grid gap-3 sm:grid-cols-2">
                {characteristics.map((characteristic) => {
                  const isSelected = selectedCharacteristics.includes(characteristic.value);
                  
                  return (
                    <label
                      key={characteristic.value}
                      className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        disabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : isSelected
                            ? 'border-purple-300 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCharacteristicToggle(characteristic.value)}
                          disabled={disabled}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {t(`morphology_advisor.characteristics.${characteristic.value}`, characteristic.label)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {t(`morphology_advisor.characteristics.${characteristic.value}_description`, characteristic.description)}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        {/* Selection summary */}
        {selectedCharacteristics.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('morphology_advisor.selected_count', { count: selectedCharacteristics.length })}:</strong>
              {' '}
              {selectedCharacteristics.map(char => {
                const config = MORPHOLOGY_CHARACTERISTICS.find(c => c.value === char);
                return t(`morphology_advisor.characteristics.${char}`, config?.label || char);
              }).join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 