'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePattern } from '@/hooks/usePattern';
import { SleevesData } from '@/types/pattern';

/**
 * Interface pour les options de type de manche
 */
interface SleeveTypeOption {
  value: NonNullable<SleevesData['sleeveType']>;
  labelKey: string;
  descriptionKey: string;
}

/**
 * Options de types de manches disponibles
 * Implémente PD_PH4_US002: Types Set-in, Raglan, Drop Shoulder, Sleeveless
 */
const SLEEVE_TYPE_OPTIONS: SleeveTypeOption[] = [
  {
    value: 'setIn',
    labelKey: 'sleeves.types.setIn.label',
    descriptionKey: 'sleeves.types.setIn.description'
  },
  {
    value: 'raglan',
    labelKey: 'sleeves.types.raglan.label', 
    descriptionKey: 'sleeves.types.raglan.description'
  },
  {
    value: 'dropShoulder',
    labelKey: 'sleeves.types.dropShoulder.label',
    descriptionKey: 'sleeves.types.dropShoulder.description'
  },
  {
    value: 'dolman',
    labelKey: 'sleeves.types.dolman.label',
    descriptionKey: 'sleeves.types.dolman.description'
  },
  {
    value: 'sleeveless',
    labelKey: 'sleeves.types.sleeveless.label',
    descriptionKey: 'sleeves.types.sleeveless.description'
  }
];

/**
 * Composant de sélection des manches
 * Implémente PD_PH4_US002: Enhance 2D Schematic with Sleeve Type Selection
 */
export const SleevesSection: React.FC = () => {
  const { t } = useTranslation();
  const { state, updateSleeves } = usePattern();
  const { sleeves, garmentType } = state;

  /**
   * Gère le changement de type de manche
   */
  const handleSleeveTypeChange = (sleeveType: SleevesData['sleeveType']) => {
    updateSleeves({
      sleeveType,
      isSet: true
    });
  };

  // Ne s'applique qu'aux vêtements avec manches
  if (!garmentType || !['sweater', 'cardigan', 'vest'].includes(garmentType)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">
            {t('sleeves.notApplicable', 'Sleeve selection is not applicable for this garment type')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('sleeves.title', 'Sleeves')}
        </h2>
        <p className="text-gray-600">
          {t('sleeves.description', 'Select the type of sleeve construction for your garment. This affects how the sleeves are shaped and attached to the body.')}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('sleeves.typeSelection', 'Sleeve Type')}
        </h3>

        <div className="space-y-4">
          {SLEEVE_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                sleeves.sleeveType === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="sleeveType"
                value={option.value}
                checked={sleeves.sleeveType === option.value}
                onChange={() => handleSleeveTypeChange(option.value)}
                className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  {t(option.labelKey, option.value)}
                </div>
                <div className="text-sm text-gray-600">
                  {t(option.descriptionKey, `Description for ${option.value} sleeve type`)}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Informations supplémentaires selon le type sélectionné */}
        {sleeves.sleeveType && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              {t('sleeves.constructionInfo', 'Construction Information')}
            </h4>
            <div className="text-sm text-gray-600">
              {sleeves.sleeveType === 'setIn' && (
                <p>{t('sleeves.setInInfo', 'Set-in sleeves feature a fitted armhole with a curved seam that follows the natural shoulder line. This is the most traditional sleeve construction.')}</p>
              )}
              {sleeves.sleeveType === 'raglan' && (
                <p>{t('sleeves.raglanInfo', 'Raglan sleeves are characterized by diagonal seams that run from the neckline to the underarm, creating a sporty and comfortable fit.')}</p>
              )}
              {sleeves.sleeveType === 'dropShoulder' && (
                <p>{t('sleeves.dropShoulderInfo', 'Drop shoulder sleeves extend the shoulder line beyond the natural shoulder point, creating a relaxed, casual silhouette.')}</p>
              )}
              {sleeves.sleeveType === 'dolman' && (
                <p>{t('sleeves.dolmanInfo', 'Dolman sleeves are cut as part of the body piece, creating wide, flowing sleeves that taper toward the wrist.')}</p>
              )}
              {sleeves.sleeveType === 'sleeveless' && (
                <p>{t('sleeves.sleevelessInfo', 'Sleeveless design creates a vest or tank top with finished armhole edges.')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions pour la suite */}
      {sleeves.isSet && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {t('sleeves.nextSteps', 'Your sleeve selection will be reflected in the 2D preview. Continue to the next section to complete your pattern definition.')}
          </p>
        </div>
      )}
    </div>
  );
}; 