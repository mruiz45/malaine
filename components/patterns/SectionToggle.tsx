'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SectionToggleProps {
  selectedSection: 'baby' | 'general';
  onSectionChange: (section: 'baby' | 'general') => void;
}

export default function SectionToggle({ selectedSection, onSectionChange }: SectionToggleProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="animate-pulse mb-6">
        <div className="h-12 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onSectionChange('general')}
          className={`
            flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${selectedSection === 'general'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {t('section_toggle_general')}
        </button>
        <button
          onClick={() => onSectionChange('baby')}
          className={`
            flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${selectedSection === 'baby'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {t('section_toggle_baby')}
        </button>
      </div>
    </div>
  );
} 