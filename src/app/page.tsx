'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">{t('home.welcome_message')}</h1>
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('home.subtitle')}</h2>
          <p className="mb-4 text-lg">
            {t('home.description')}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <a 
              href="/login" 
              className="bg-indigo-600 text-white py-3 px-6 rounded-lg text-center hover:bg-indigo-700 transition"
            >
              {t('home.login_button')}
            </a>
            <a 
              href="/signup" 
              className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg text-center hover:bg-gray-300 transition"
            >
              {t('home.signup_button')}
            </a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-3">{t('home.features.adapt_patterns.title')}</h3>
            <p>{t('home.features.adapt_patterns.description')}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-3">{t('home.features.interactive_editor.title')}</h3>
            <p>{t('home.features.interactive_editor.description')}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-xl mb-3">{t('home.features.ai_assistant.title')}</h3>
            <p>{t('home.features.ai_assistant.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
