/**
 * Pattern Warnings Component (US_9.1)
 * Displays pattern notes and warnings
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface PatternWarningsProps {
  /** List of pattern notes and warnings */
  notes: string[];
  /** Whether in print mode */
  printMode?: boolean;
}

/**
 * Component for displaying pattern warnings and notes
 */
export default function PatternWarnings({
  notes,
  printMode = false
}: PatternWarningsProps) {
  const { t } = useTranslation();

  if (notes.length === 0) {
    return null;
  }

  // Categorize notes (basic heuristic - could be enhanced)
  const warnings: string[] = [];
  const infos: string[] = [];

  notes.forEach(note => {
    const lowerNote = note.toLowerCase();
    if (lowerNote.includes('warning') || lowerNote.includes('critical') || 
        lowerNote.includes('important') || lowerNote.includes('danger') ||
        lowerNote.includes('caution') || lowerNote.includes('careful')) {
      warnings.push(note);
    } else {
      infos.push(note);
    }
  });

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">
                {t('patternViewer.importantWarnings', 'Important Warnings')}
              </h3>
              <ul className="space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* General Notes */}
      {infos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                {t('patternViewer.patternNotes', 'Pattern Notes')}
              </h3>
              <ul className="space-y-1">
                {infos.map((info, index) => (
                  <li key={index} className="text-sm text-blue-700">
                    • {info}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 