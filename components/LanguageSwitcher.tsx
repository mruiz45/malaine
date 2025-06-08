"use client";

import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={() => changeLanguage('en')} 
        disabled={i18n.language.startsWith('en')}
        className="disabled:font-bold"
      >
        EN
      </button>
      <span className="mx-1">/</span>
      <button 
        onClick={() => changeLanguage('fr')} 
        disabled={i18n.language.startsWith('fr')}
        className="disabled:font-bold"
      >
        FR
      </button>
    </div>
  );
};

export default LanguageSwitcher; 