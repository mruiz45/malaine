'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslatedPartName, getTranslatedPartDesc } from '@/lib/garmentTranslations';

interface GarmentPartCardProps {
  partKey: string;
  isObligatory: boolean;
  isSelected: boolean;
  isDisabled?: boolean;
  onToggle?: (partKey: string) => void;
}

export default function GarmentPartCard({
  partKey,
  isObligatory,
  isSelected,
  isDisabled = false,
  onToggle
}: GarmentPartCardProps) {
  const { t } = useTranslation();

  const partName = getTranslatedPartName(partKey, t);
  const partDesc = getTranslatedPartDesc(partKey, t);

  const handleClick = () => {
    if (!isObligatory && !isDisabled && onToggle) {
      onToggle(partKey);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${isObligatory ? 'opacity-100' : 'hover:bg-gray-50'}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={isObligatory || isDisabled ? -1 : 0}
      role={isObligatory ? 'presentation' : 'button'}
      aria-pressed={!isObligatory ? isSelected : undefined}
      aria-disabled={isObligatory || isDisabled}
    >
      {/* Badge de statut */}
      <div className="absolute top-2 right-2">
        {isObligatory ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {t('part_status_obligatory')}
          </span>
        ) : (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isSelected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {t('part_status_optional')}
          </span>
        )}
      </div>

      {/* Checkbox pour parties optionnelles */}
      {!isObligatory && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              if (onToggle && !isDisabled) {
                onToggle(partKey);
              }
            }}
            disabled={isDisabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            aria-label={`${t('part_toggle_aria_label')} ${partName}`}
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className={`${!isObligatory ? 'ml-8' : ''} pr-4`}>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {partName}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {partDesc}
        </p>

        {/* Indicateur obligatoire pour les parties requises */}
        {isObligatory && (
          <div className="mt-3 flex items-center text-xs text-red-600">
            <svg 
              className="h-4 w-4 mr-1" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            {t('part_required_indicator')}
          </div>
        )}
      </div>
    </div>
  );
} 