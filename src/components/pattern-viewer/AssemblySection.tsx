/**
 * Assembly Section Component (US_9.1)
 * Displays assembly and finishing instructions
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { AssemblyInstruction } from '@/types/assembled-pattern';

interface AssemblySectionProps {
  /** List of assembly instructions */
  instructions: AssemblyInstruction[];
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
}

/**
 * Component for displaying assembly and finishing instructions
 */
export default function AssemblySection({
  instructions,
  printMode = false,
  id
}: AssemblySectionProps) {
  const { t } = useTranslation();

  if (instructions.length === 0) {
    return null;
  }

  return (
    <section id={id} className="space-y-6">
      {/* Section Title */}
      <h2 className={`font-bold text-gray-900 border-b border-gray-200 pb-2 ${
        printMode ? 'text-xl' : 'text-lg'
      }`}>
        {t('patternViewer.sections.assembly', 'Assembly & Finishing')}
      </h2>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className={`font-semibold text-purple-900 ${
            printMode ? 'text-lg' : 'text-base'
          }`}>
            {t('patternViewer.finishingSteps', 'Finishing Steps')}
          </h3>
          <p className="text-sm text-purple-700 mt-1">
            {t('patternViewer.assemblyNote', 'Follow these steps to complete your garment.')}
          </p>
        </div>

        <div className="space-y-4">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex space-x-4 p-4 bg-white rounded-lg border border-purple-100">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white text-sm font-bold rounded-full">
                  {instruction.step}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium">
                  {instruction.text}
                </p>
                {instruction.note && (
                  <p className="text-sm text-gray-600 mt-1">
                    💡 {instruction.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
          <p className="text-sm text-purple-800">
            <span className="font-medium">🎉 {t('patternViewer.congratulations', 'Congratulations!')} </span>
            {t('patternViewer.projectComplete', 'Your project is now complete. Take time to admire your beautiful work!')}
          </p>
        </div>
      </div>
    </section>
  );
} 