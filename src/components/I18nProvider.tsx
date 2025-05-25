'use client';

import React, { useEffect, useState } from 'react';
import i18n from '@/utils/i18n';
import { I18nextProvider } from 'react-i18next';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to be ready
    const checkI18nReady = () => {
      if (i18n.isInitialized && i18n.hasResourceBundle(i18n.language, 'common')) {
        setIsI18nReady(true);
      } else {
        // Wait a bit and check again
        setTimeout(checkI18nReady, 100);
      }
    };

    checkI18nReady();
  }, []);

  if (!isI18nReady) {
    // Show loading indicator while i18n is loading
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider; 