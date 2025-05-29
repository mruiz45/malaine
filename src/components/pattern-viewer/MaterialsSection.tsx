/**
 * Materials Section Component (US_9.1)
 * Displays materials, yarns, tools, and gauge information
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssembledPattern } from '@/types/assembled-pattern';

interface MaterialsSectionProps {
  /** The assembled pattern */
  pattern: AssembledPattern;
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
}

/**
 * Component for displaying materials and tools section
 */
export default function MaterialsSection({
  pattern,
  printMode = false,
  id
}: MaterialsSectionProps) {
  const { t } = useTranslation();

  return (
    <section id={id} className="space-y-6">
      {/* Section Title */}
      <h2 className={`font-bold text-gray-900 border-b border-gray-200 pb-2 ${
        printMode ? 'text-xl' : 'text-lg'
      }`}>
        {t('patternViewer.sections.materials', 'Materials & Tools')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yarns */}
        <div>
          <h3 className={`font-semibold text-gray-800 mb-3 ${
            printMode ? 'text-lg' : 'text-base'
          }`}>
            {t('patternViewer.yarns', 'Yarns')}
          </h3>
          <div className="space-y-3">
            {pattern.yarns.map((yarn, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-1">
                  {yarn.name}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {yarn.weight_category && (
                    <p>
                      <span className="font-medium">{t('patternViewer.yarnWeight', 'Weight')}:</span> {yarn.weight_category}
                    </p>
                  )}
                  {yarn.fiber && (
                    <p>
                      <span className="font-medium">{t('patternViewer.fiber', 'Fiber')}:</span> {yarn.fiber}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">{t('patternViewer.quantity', 'Quantity')}:</span> {yarn.estimated_quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div>
          <h3 className={`font-semibold text-gray-800 mb-3 ${
            printMode ? 'text-lg' : 'text-base'
          }`}>
            {t('patternViewer.tools', 'Tools')}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {pattern.needles_hooks.map((tool, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></span>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div>
        <h3 className={`font-semibold text-gray-800 mb-3 ${
          printMode ? 'text-lg' : 'text-base'
        }`}>
          {t('patternViewer.gauge', 'Gauge')}
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-blue-900">
                {t('patternViewer.stitches', 'Stitches')}:
              </span>
              <span className="text-blue-800 ml-2">
                {pattern.gauge.stitchesPer10cm} {t('patternViewer.per10cm', 'per 10cm')}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-900">
                {t('patternViewer.rows', 'Rows')}:
              </span>
              <span className="text-blue-800 ml-2">
                {pattern.gauge.rowsPer10cm} {t('patternViewer.per10cm', 'per 10cm')}
              </span>
            </div>
          </div>
          {pattern.gauge.profileName && (
            <div className="mt-2 text-sm text-blue-700">
              <span className="font-medium">{t('patternViewer.gaugeProfile', 'Profile')}:</span> {pattern.gauge.profileName}
            </div>
          )}
          <div className="mt-3 text-sm text-blue-800 font-medium">
            ⚠️ {t('patternViewer.gaugeImportant', 'Gauge is critical for proper fit. Always make a swatch!')}
          </div>
        </div>
      </div>
    </section>
  );
} 