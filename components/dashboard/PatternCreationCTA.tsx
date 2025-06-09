'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function PatternCreationCTA() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-20 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
      <div className="flex items-start space-x-4">
        {/* Icône */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('pattern_cta_title')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('pattern_cta_description')}
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('pattern_cta_feature_1')}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('pattern_cta_feature_2')}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('pattern_cta_feature_3')}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('pattern_cta_feature_4')}
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/dashboard/patterns/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('pattern_cta_button')}
          </Link>
        </div>
      </div>
    </div>
  );
} 