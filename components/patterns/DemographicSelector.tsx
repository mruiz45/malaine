'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DemographicSelectorProps {
  selectedCategory: 'baby' | 'child' | 'adult';
  selectedGender: 'male' | 'female' | 'neutral';
  onCategoryChange: (category: 'baby' | 'child' | 'adult') => void;
  onGenderChange: (gender: 'male' | 'female' | 'neutral') => void;
  className?: string;
}

export default function DemographicSelector({
  selectedCategory,
  selectedGender,
  onCategoryChange,
  onGenderChange,
  className = ''
}: DemographicSelectorProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('measurement_demographic_age')}
          </label>
          <div className="flex space-x-2">
            <button className="px-3 py-2 border rounded-md bg-blue-500 text-white">
              {t('measurement_adult')}
            </button>
            <button className="px-3 py-2 border rounded-md border-gray-300 text-gray-700">
              {t('measurement_child')}
            </button>
            <button className="px-3 py-2 border rounded-md border-gray-300 text-gray-700">
              {t('measurement_baby')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    { value: 'adult', label: t('measurement_adult') },
    { value: 'child', label: t('measurement_child') },
    { value: 'baby', label: t('measurement_baby') },
  ] as const;

  const genders = [
    { value: 'neutral', label: t('measurement_neutral') },
    { value: 'female', label: t('measurement_female') },
    { value: 'male', label: t('measurement_male') },
  ] as const;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('measurement_demographic_age')}
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onCategoryChange(value)}
              className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                selectedCategory === value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('measurement_demographic_gender')}
        </label>
        <div className="flex flex-wrap gap-2">
          {genders.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onGenderChange(value)}
              className={`px-3 py-2 border rounded-md text-sm transition-colors ${
                selectedGender === value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 