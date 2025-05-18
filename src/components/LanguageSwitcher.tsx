'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'en' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => changeLanguage('en')}
      >
        {t('language_switcher.en')}
      </button>
      <button
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === 'fr' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
        }`}
        onClick={() => changeLanguage('fr')}
      >
        {t('language_switcher.fr')}
      </button>
    </div>
  );
};

export default LanguageSwitcher; 