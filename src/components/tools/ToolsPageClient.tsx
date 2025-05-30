'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { 
  CalculatorIcon, 
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarIcon,
  ScaleIcon,
  SparklesIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

/**
 * Tools Page Client Component
 * Client-side component for the tools overview page
 */
export default function ToolsPageClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ {t('tools.development.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('tools.development.description')}
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>{t('tools.development.note.title')}</strong> {t('tools.development.note.content')}
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Reverse Gauge Calculator */}
          <Link 
            href="/tools/reverse-gauge-calculator"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <CalculatorIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                {t('tools.reverse_gauge_calculator.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('tools.reverse_gauge_calculator.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                US_2.1
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ {t('tools.development.status.implemented')}
              </span>
            </div>
          </Link>

          {/* Yarn Quantity Estimator */}
          <Link 
            href="/tools/yarn-quantity-estimator"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <ScaleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                {t('tools.yarn_quantity_estimator.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('tools.yarn_quantity_estimator.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                US_2.2
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ {t('tools.development.status.implemented')}
              </span>
            </div>
          </Link>

          {/* Ease Selection Advisor */}
          <Link 
            href="/tools/ease-advisor"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <SparklesIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                {t('tools.ease_advisor.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('tools.ease_advisor.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                US_3.2
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ {t('tools.development.status.implemented')}
              </span>
            </div>
          </Link>

          {/* Pattern Resizer */}
          <Link 
            href="/tools/pattern-resizer"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <ArrowsRightLeftIcon className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                {t('tools.pattern_resizer.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('tools.pattern_resizer.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                US_10.1
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ {t('tools.development.status.implemented')}
              </span>
            </div>
          </Link>

          {/* Morphology Advisor */}
          <Link 
            href="/tools/morphology-advisor"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                <BeakerIcon className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                {t('tools.morphology_advisor.title')}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t('tools.morphology_advisor.description')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                US_3.1
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ {t('tools.development.status.implemented')}
              </span>
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                {t('tools.development.future_tools.tool1')}
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('tools.development.future_tools.description1')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                {t('tools.development.status.coming_soon')}
              </span>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                {t('tools.development.future_tools.tool2')}
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('tools.development.future_tools.description2')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                {t('tools.development.status.coming_soon')}
              </span>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                {t('tools.development.future_tools.tool3')}
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              {t('tools.development.future_tools.description3')}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                {t('tools.development.status.coming_soon')}
              </span>
            </div>
          </div>

        </div>

        {/* Development Info */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 {t('tools.development.info.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{t('tools.development.info.implemented_tools')}</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ {t('tools.development.info.tools.reverse_gauge')}</li>
                <li>✅ {t('tools.development.info.tools.yarn_estimator')}</li>
                <li>✅ {t('tools.development.info.tools.ease_advisor')}</li>
                <li>✅ {t('tools.development.info.tools.pattern_resizer')}</li>
                <li>✅ {t('tools.development.info.tools.morphology_advisor')}</li>
                <li className="text-gray-400">⏳ {t('tools.development.info.tools.next_tool')}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">{t('tools.development.info.architecture')}</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {t('tools.development.info.arch.reusable_components')}</li>
                <li>• {t('tools.development.info.arch.business_logic')}</li>
                <li>• {t('tools.development.info.arch.api_routes')}</li>
                <li>• {t('tools.development.info.arch.unit_tests')}</li>
                <li>• {t('tools.development.info.arch.i18n')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            🔗 {t('tools.development.quick_links.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → {t('tools.development.quick_links.dashboard')}
            </Link>
            <Link 
              href="/gauge-profiles"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → {t('tools.development.quick_links.gauge_profiles')}
            </Link>
            <Link 
              href="/measurements"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → {t('tools.development.quick_links.measurements')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 