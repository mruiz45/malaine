'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConstructionMethodOption, ConstructionMethod } from '@/types/sweaterStructure';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ConstructionMethodCardProps {
  /** Construction method option to display */
  constructionMethod: ConstructionMethodOption;
  /** Whether this method is currently selected */
  isSelected: boolean;
  /** Whether this method is available for selection */
  isAvailable?: boolean;
  /** Callback when the method is selected */
  onSelect: (method: ConstructionMethod) => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component for displaying and selecting construction methods
 */
export default function ConstructionMethodCard({
  constructionMethod,
  isSelected,
  isAvailable = true,
  onSelect,
  disabled = false,
  className = ''
}: ConstructionMethodCardProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    if (!disabled && isAvailable) {
      onSelect(constructionMethod.key);
    }
  };

  const getDifficultyColor = (difficulty?: 'beginner' | 'intermediate' | 'advanced') => {
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

  const cardClasses = [
    'relative rounded-lg border p-4 cursor-pointer transition-all duration-200',
    isSelected 
      ? 'border-blue-500 bg-blue-50 shadow-md' 
      : isAvailable 
        ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60',
    disabled && 'pointer-events-none opacity-50',
    className
  ].join(' ');

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role="button"
      tabIndex={disabled || !isAvailable ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled && isAvailable) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
            <CheckIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Method content */}
      <div className="space-y-3">
        {/* Title and difficulty */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t(`bodyStructure.constructionMethods.${constructionMethod.key}.name`, constructionMethod.display_name)}
          </h3>
          
          {constructionMethod.difficulty && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(constructionMethod.difficulty)}`}>
              {t(`bodyStructure.difficulty.${constructionMethod.difficulty}`, constructionMethod.difficulty)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {t(`bodyStructure.constructionMethods.${constructionMethod.key}.description`, constructionMethod.description)}
        </p>

        {/* Availability indicator */}
        {!isAvailable && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {t('bodyStructure.incompatibleWithBodyShape', 'Not compatible with selected body shape')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 