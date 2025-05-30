'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  UserIcon,
  BookOpenIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import MorphologyAdvisorTool from '@/components/tools/MorphologyAdvisorTool';

/**
 * Morphology Advisor Page Client Component
 * Client-side component for the Body Morphology Adaptation Advisor page
 */
export default function MorphologyAdvisorPageClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('tools.morphology_advisor.page_title')}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {t('tools.morphology_advisor.page_subtitle')}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{t('tools.morphology_advisor.about.title')}</p>
                <p>
                  {t('tools.morphology_advisor.about.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Tool */}
          <div className="lg:col-span-2">
            <MorphologyAdvisorTool />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Morphology Fitting */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('tools.morphology_advisor.morphological_fitting.title')}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>{t('tools.morphology_advisor.morphological_fitting.concept')}</strong> {t('tools.morphology_advisor.morphological_fitting.description')}
                </p>
                <div className="space-y-2">
                  <p><strong>{t('tools.morphology_advisor.morphological_fitting.full_bust')}:</strong> {t('tools.morphology_advisor.morphological_fitting.full_bust_desc')}</p>
                  <p><strong>{t('tools.morphology_advisor.morphological_fitting.broad_shoulders')}:</strong> {t('tools.morphology_advisor.morphological_fitting.broad_shoulders_desc')}</p>
                  <p><strong>{t('tools.morphology_advisor.morphological_fitting.long_short_torso')}:</strong> {t('tools.morphology_advisor.morphological_fitting.long_short_torso_desc')}</p>
                  <p><strong>{t('tools.morphology_advisor.morphological_fitting.particular_posture')}:</strong> {t('tools.morphology_advisor.morphological_fitting.particular_posture_desc')}</p>
                </div>
              </div>
            </div>

            {/* Fitting Tips */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('tools.morphology_advisor.fitting_tips.title')}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.fitting_tips.accurate_measurements')}</p>
                  <p>{t('tools.morphology_advisor.fitting_tips.accurate_measurements_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.fitting_tips.make_swatch')}</p>
                  <p>{t('tools.morphology_advisor.fitting_tips.make_swatch_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.fitting_tips.adjust_gradually')}</p>
                  <p>{t('tools.morphology_advisor.fitting_tips.adjust_gradually_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.fitting_tips.document_changes')}</p>
                  <p>{t('tools.morphology_advisor.fitting_tips.document_changes_desc')}</p>
                </div>
              </div>
            </div>

            {/* Common Adjustments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  {t('tools.morphology_advisor.common_adjustments.title')}
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.common_adjustments.bust_adjustment')}</p>
                  <p>{t('tools.morphology_advisor.common_adjustments.bust_adjustment_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.common_adjustments.shoulder_adjustment')}</p>
                  <p>{t('tools.morphology_advisor.common_adjustments.shoulder_adjustment_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.common_adjustments.length_adjustment')}</p>
                  <p>{t('tools.morphology_advisor.common_adjustments.length_adjustment_desc')}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('tools.morphology_advisor.common_adjustments.waist_adjustment')}</p>
                  <p>{t('tools.morphology_advisor.common_adjustments.waist_adjustment_desc')}</p>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('tools.morphology_advisor.related_tools.title')}
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <a href="/measurements" className="text-purple-600 hover:text-purple-700 font-medium">
                    → {t('tools.morphology_advisor.related_tools.measurements_management')}
                  </a>
                  <p className="text-gray-600">{t('tools.morphology_advisor.related_tools.measurements_management_desc')}</p>
                </div>
                <div>
                  <a href="/tools/ease-advisor" className="text-purple-600 hover:text-purple-700 font-medium">
                    → {t('tools.morphology_advisor.related_tools.ease_advisor')}
                  </a>
                  <p className="text-gray-600">{t('tools.morphology_advisor.related_tools.ease_advisor_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 