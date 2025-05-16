'use client';

import React, { useEffect, useState } from 'react';
import i18n from '@/utils/i18n';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    // Initialize i18n on client side
    if (!i18n.isInitialized) {
      i18n.init().then(() => {
        setIsI18nInitialized(true);
      });
    } else {
      setIsI18nInitialized(true);
    }
  }, []);

  if (!isI18nInitialized) {
    // You could show a loading indicator here if needed
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider; 