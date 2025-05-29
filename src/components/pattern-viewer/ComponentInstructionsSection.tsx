/**
 * Component Instructions Section (US_9.1)
 * Displays detailed instructions for each garment component
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PatternComponent } from '@/types/assembled-pattern';

interface ComponentInstructionsSectionProps {
  /** List of pattern components */
  components: PatternComponent[];
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
}

/**
 * Component for displaying component instructions
 */
export default function ComponentInstructionsSection({
  components,
  printMode = false,
  id
}: ComponentInstructionsSectionProps) {
  const { t } = useTranslation();
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(
    printMode ? new Set(components.map((_, index) => index)) : new Set()
  );

  const toggleComponent = (index: number) => {
    if (printMode) return; // Don't allow collapse in print mode
    
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedComponents(newExpanded);
  };

  return (
    <section id={id} className="space-y-6">
      {/* Section Title */}
      <h2 className={`font-bold text-gray-900 border-b border-gray-200 pb-2 ${
        printMode ? 'text-xl' : 'text-lg'
      }`}>
        {t('patternViewer.sections.components', 'Instructions')}
      </h2>

      <div className="space-y-6">
        {components.map((component, index) => {
          const isExpanded = expandedComponents.has(index);
          const componentId = `component-${component.componentName.toLowerCase().replace(/\s+/g, '-')}`;

          return (
            <div key={index} id={componentId} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Component Header */}
              <div 
                className={`bg-gray-50 px-6 py-4 ${!printMode ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={() => !printMode && toggleComponent(index)}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-gray-900 ${
                    printMode ? 'text-lg' : 'text-base'
                  }`}>
                    {component.componentName}
                  </h3>
                  
                  {!printMode && (
                    <div className="flex items-center space-x-2">
                      {component.calculations.cast_on && (
                        <span className="text-sm text-gray-600">
                          {component.calculations.cast_on} {t('patternViewer.stitches', 'stitches')}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Quick Summary */}
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  {component.calculations.cast_on && (
                    <div>
                      <span className="font-medium">{t('patternViewer.castOn', 'Cast On')}:</span> {component.calculations.cast_on}
                    </div>
                  )}
                  {component.calculations.rows && (
                    <div>
                      <span className="font-medium">{t('patternViewer.rows', 'Rows')}:</span> {component.calculations.rows}
                    </div>
                  )}
                  {component.calculations.target_width_cm && (
                    <div>
                      <span className="font-medium">{t('patternViewer.width', 'Width')}:</span> {component.calculations.target_width_cm}cm
                    </div>
                  )}
                  {component.calculations.target_length_cm && (
                    <div>
                      <span className="font-medium">{t('patternViewer.length', 'Length')}:</span> {component.calculations.target_length_cm}cm
                    </div>
                  )}
                </div>
              </div>

              {/* Component Content */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  {/* Shaping Summary */}
                  {component.shaping_summary && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {t('patternViewer.shapingSummary', 'Shaping Summary')}
                      </h4>
                      <p className="text-sm text-blue-800">
                        {component.shaping_summary}
                      </p>
                    </div>
                  )}

                  {/* Instructions */}
                  {component.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        {t('patternViewer.stepByStepInstructions', 'Step-by-Step Instructions')}
                      </h4>
                      <div className="space-y-3">
                        {component.instructions.map((instruction, instrIndex) => (
                          <div 
                            key={instrIndex} 
                            className="flex space-x-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                                {instruction.step}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {instruction.text}
                              </p>
                              {(instruction.rowNumber || instruction.stitchCount) && (
                                <div className="mt-1 flex space-x-4 text-xs text-gray-600">
                                  {instruction.rowNumber && (
                                    <span>{t('patternViewer.row', 'Row')} {instruction.rowNumber}</span>
                                  )}
                                  {instruction.stitchCount && (
                                    <span>{instruction.stitchCount} {t('patternViewer.stitches', 'stitches')}</span>
                                  )}
                                  {instruction.isShapingRow && (
                                    <span className="text-orange-600 font-medium">
                                      {t('patternViewer.shapingRow', 'Shaping Row')}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Notes */}
                  {component.notes && component.notes.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        {t('patternViewer.notes', 'Notes')}
                      </h4>
                      <ul className="space-y-1">
                        {component.notes.map((note, noteIndex) => (
                          <li key={noteIndex} className="text-sm text-yellow-800">
                            • {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand All Button - Only in non-print mode */}
      {!printMode && (
        <div className="text-center">
          <button
            onClick={() => {
              if (expandedComponents.size === components.length) {
                setExpandedComponents(new Set());
              } else {
                setExpandedComponents(new Set(components.map((_, index) => index)));
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {expandedComponents.size === components.length 
              ? t('patternViewer.collapseAll', 'Collapse All')
              : t('patternViewer.expandAll', 'Expand All')
            }
          </button>
        </div>
      )}
    </section>
  );
} 