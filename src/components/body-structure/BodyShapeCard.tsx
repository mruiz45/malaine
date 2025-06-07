'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { BodyShapeOption, BodyShape } from '@/types/sweaterStructure';
import { CheckIcon } from '@heroicons/react/24/solid';

interface BodyShapeCardProps {
  /** Body shape option to display */
  bodyShape: BodyShapeOption;
  /** Whether this shape is currently selected */
  isSelected: boolean;
  /** Whether this shape is available for selection */
  isAvailable?: boolean;
  /** Callback when the shape is selected */
  onSelect: (shape: BodyShape) => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Card component for displaying and selecting body shapes
 */
export default function BodyShapeCard({
  bodyShape,
  isSelected,
  isAvailable = true,
  onSelect,
  disabled = false,
  className = ''
}: BodyShapeCardProps) {
  const { t } = useTranslation();

  const handleClick = () => {
    if (!disabled && isAvailable) {
      onSelect(bodyShape.key);
    }
  };

  const getFitTypeColor = (fitType?: 'loose' | 'fitted' | 'oversized') => {
    switch (fitType) {
      case 'fitted':
        return 'bg-purple-100 text-purple-800';
      case 'loose':
        return 'bg-blue-100 text-blue-800';
      case 'oversized':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const cardClasses = [
    'relative rounded-lg border p-4 cursor-pointer transition-all duration-200',
    isSelected 
      ? 'border-purple-500 bg-purple-50 shadow-md' 
      : isAvailable 
        ? 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
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
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
            <CheckIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      {/* Shape content */}
      <div className="space-y-3">
        {/* Title and fit type */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t(`bodyStructure.bodyShapes.${bodyShape.key}.name`, bodyShape.display_name)}
          </h3>
          
          {bodyShape.fit_type && (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFitTypeColor(bodyShape.fit_type)}`}>
              {t(`bodyStructure.fitType.${bodyShape.fit_type}`, bodyShape.fit_type)}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          {t(`bodyStructure.bodyShapes.${bodyShape.key}.description`, bodyShape.description)}
        </p>

        {/* Availability indicator */}
        {!isAvailable && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {t('bodyStructure.incompatibleWithConstructionMethod', 'Not compatible with selected construction method')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 