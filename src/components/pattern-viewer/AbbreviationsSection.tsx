/**
 * Abbreviations Section Component (US_9.1)
 * Displays abbreviations and special stitches
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatternAbbreviation, SpecialStitch } from '@/types/assembled-pattern';

interface AbbreviationsSectionProps {
  /** List of abbreviations */
  abbreviations: PatternAbbreviation[];
  /** List of special stitches */
  specialStitches: SpecialStitch[];
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
}

/**
 * Component for displaying abbreviations and special stitches
 */
export default function AbbreviationsSection({
  abbreviations,
  specialStitches,
  printMode = false,
  id
}: AbbreviationsSectionProps) {
  const { t } = useTranslation();

  if (abbreviations.length === 0 && specialStitches.length === 0) {
    return null;
  }

  return (
    <section id={id} className="space-y-6">
      {/* Section Title */}
      <h2 className={`font-bold text-gray-900 border-b border-gray-200 pb-2 ${
        printMode ? 'text-xl' : 'text-lg'
      }`}>
        {t('patternViewer.sections.abbreviations', 'Abbreviations & Special Stitches')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Standard Abbreviations */}
        {abbreviations.length > 0 && (
          <div>
            <h3 className={`font-semibold text-gray-800 mb-3 ${
              printMode ? 'text-lg' : 'text-base'
            }`}>
              {t('patternViewer.standardAbbreviations', 'Standard Abbreviations')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-2">
                {abbreviations.map((abbr, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="font-mono text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded">
                      {abbr.abbr}
                    </span>
                    <span className="text-sm text-gray-700 ml-4">
                      {abbr.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Special Stitches */}
        {specialStitches.length > 0 && (
          <div>
            <h3 className={`font-semibold text-gray-800 mb-3 ${
              printMode ? 'text-lg' : 'text-base'
            }`}>
              {t('patternViewer.specialStitches', 'Special Stitches')}
            </h3>
            <div className="space-y-4">
              {specialStitches.map((stitch, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-blue-900">
                      {stitch.name}
                    </h4>
                    {stitch.abbreviation && (
                      <span className="font-mono text-sm font-semibold text-blue-800 bg-white px-2 py-1 rounded">
                        {stitch.abbreviation}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-blue-800">
                    {stitch.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* General Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">{t('patternViewer.note', 'Note')}:</span>{' '}
          {t('patternViewer.abbreviationsNote', 'Familiarize yourself with these abbreviations before starting the pattern. Refer back to this section as needed.')}
        </p>
      </div>
    </section>
  );
} 