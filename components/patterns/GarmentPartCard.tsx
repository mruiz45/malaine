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
  safetyConstraints?: string[]; // Nouveau pour vêtements bébé
  isBabyGarment?: boolean; // Indicateur vêtement bébé
}

export default function GarmentPartCard({
  partKey,
  isObligatory,
  isSelected,
  isDisabled = false,
  onToggle,
  safetyConstraints = [],
  isBabyGarment = false
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

        {/* Indicateur sécurité bébé */}
        {isBabyGarment && safetyConstraints && safetyConstraints.length > 0 && (
          <div className="mt-2 flex items-start text-xs text-blue-600">
            <svg 
              className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M10 1L5 6v3.09c0 2.99 2.16 5.7 5 6.82 2.84-1.12 5-3.83 5-6.82V6l-5-5zM8.5 11L7 9.5l1.5-1.5L10 9.5 8.5 11z" 
                clipRule="evenodd" 
              />
            </svg>
            <div>
              <span className="font-medium">{t('part_safety_baby_indicator')}:</span>
              <div className="mt-1 space-y-1">
                {safetyConstraints.slice(0, 2).map((constraint, index) => (
                  <div key={index} className="text-blue-500">
                    • {t(`safety_constraint_${constraint}`, { defaultValue: constraint })}
                  </div>
                ))}
                {safetyConstraints.length > 2 && (
                  <div className="text-blue-500">
                    • {t('part_safety_more_constraints', { count: safetyConstraints.length - 2 })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 