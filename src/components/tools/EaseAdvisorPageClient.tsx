'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeftIcon,
  SparklesIcon,
  InformationCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import EaseAdvisorTool from '@/components/tools/EaseAdvisorTool';

/**
 * Ease Advisor Page Client Component
 * Client-side component for the Ease Selection Advisor page
 */
export default function EaseAdvisorPageClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/tools"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>{t('tools.ease_advisor.back_to_tools')}</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('tools.ease_advisor.page_title')}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Tool */}
          <div className="lg:col-span-2">
            <EaseAdvisorTool />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Ease */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('tools.ease_advisor.about_ease.title')}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>{t('tools.ease_advisor.about_ease.ease_term')}</strong> {t('tools.ease_advisor.about_ease.description')}
                </p>
                <div className="space-y-2">
                  <p><strong>{t('tools.ease_advisor.about_ease.negative_ease')}:</strong> {t('tools.ease_advisor.about_ease.negative_ease_desc')}</p>
                  <p><strong>{t('tools.ease_advisor.about_ease.zero_ease')}:</strong> {t('tools.ease_advisor.about_ease.zero_ease_desc')}</p>
                  <p><strong>{t('tools.ease_advisor.about_ease.positive_ease')}:</strong> {t('tools.ease_advisor.about_ease.positive_ease_desc')}</p>
                </div>
              </div>
            </div>

            {/* Fit Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('tools.ease_advisor.fit_guide.title')}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">{t('tools.ease_advisor.fit_guide.very_close_fitting')}</p>
                  <p>{t('tools.ease_advisor.fit_guide.very_close_fitting_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.ease_advisor.fit_guide.close_fitting')}</p>
                  <p>{t('tools.ease_advisor.fit_guide.close_fitting_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.ease_advisor.fit_guide.classic')}</p>
                  <p>{t('tools.ease_advisor.fit_guide.classic_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.ease_advisor.fit_guide.relaxed')}</p>
                  <p>{t('tools.ease_advisor.fit_guide.relaxed_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.ease_advisor.fit_guide.oversized')}</p>
                  <p>{t('tools.ease_advisor.fit_guide.oversized_desc')}</p>
                </div>
              </div>
            </div>

            {/* Yarn Weight Considerations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('tools.ease_advisor.yarn_weight.title')}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  {t('tools.ease_advisor.yarn_weight.description')}
                </p>
                <div className="space-y-2">
                  <p><strong>{t('tools.ease_advisor.yarn_weight.fingering_sport')}:</strong> {t('tools.ease_advisor.yarn_weight.fingering_sport_desc')}</p>
                  <p><strong>{t('tools.ease_advisor.yarn_weight.dk_worsted')}:</strong> {t('tools.ease_advisor.yarn_weight.dk_worsted_desc')}</p>
                  <p><strong>{t('tools.ease_advisor.yarn_weight.bulky')}:</strong> {t('tools.ease_advisor.yarn_weight.bulky_desc')}</p>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('tools.ease_advisor.related_tools.title')}
              </h3>
              <div className="space-y-3">
                <Link
                  href="/measurements"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{t('tools.ease_advisor.related_tools.measurements.title')}</div>
                  <div className="text-sm text-gray-600">{t('tools.ease_advisor.related_tools.measurements.description')}</div>
                </Link>
                <Link
                  href="/ease-preferences"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{t('tools.ease_advisor.related_tools.ease_preferences.title')}</div>
                  <div className="text-sm text-gray-600">{t('tools.ease_advisor.related_tools.ease_preferences.description')}</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 