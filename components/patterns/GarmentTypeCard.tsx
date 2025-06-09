'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Database } from '@/lib/database.types';
import { getTranslatedGarmentName, getTranslatedGarmentDesc } from '@/lib/garmentTranslations';

type GarmentType = Database['public']['Tables']['garment_types']['Row'];

interface GarmentTypeCardProps {
  type: GarmentType;
  selected: boolean;
  onClick: (type: GarmentType) => void;
}

export default function GarmentTypeCard({ type, selected, onClick }: GarmentTypeCardProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getCategoryLabel = () => {
    if (!isClient) return type.category === 'clothing' ? 'Vêtement' : 'Accessoire';
    return type.category === 'clothing' ? t('garment_type_clothing') : t('garment_type_accessory');
  };

  const getDisplayName = () => {
    if (!isClient) return type.type_key; // Fallback pendant hydratation
    return getTranslatedGarmentName(type, t);
  };

  const getDescription = () => {
    if (!isClient) return ''; // Fallback pendant hydratation
    return getTranslatedGarmentDesc(type, t);
  };

  return (
    <div
      className={`
        relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-lg
        ${selected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      onClick={() => onClick(type)}
    >
      {/* Checkmark for selected state */}
      {selected && (
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Image placeholder */}
      <div className="mb-3 flex h-24 w-full items-center justify-center rounded-md bg-gray-100">
        <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      </div>

      {/* Type name */}
      <h3 className={`text-lg font-semibold ${selected ? 'text-blue-700' : 'text-gray-900'}`}>
        {getDisplayName()}
      </h3>

      {/* Short description */}
      <p className={`mt-1 text-sm ${selected ? 'text-blue-600' : 'text-gray-600'}`}>
        {getDescription()}
      </p>

      {/* Category badge */}
      <div className="mt-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
          ${type.category === 'clothing' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-purple-100 text-purple-800'
          }
        `}>
          {getCategoryLabel()}
        </span>
      </div>
    </div>
  );
} 