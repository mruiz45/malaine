/**
 * Component Instructions Section (US_9.1 + US_9.3 + US_11.6 + US_11.7)
 * Displays detailed instructions for each garment component with schematic diagrams, stitch charts, and progress tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PatternComponent } from '@/types/assembled-pattern';
import { SchematicDiagram } from '@/types/schematics';
import { schematicService } from '@/services/schematicService';
import SchematicDisplay from '@/components/knitting/SchematicDisplay';
import StitchChartDisplay from './StitchChartDisplay';
import RepetitionCounter from './RepetitionCounter';
import { parseRepetitionInstructions, hasRepetitionPattern } from '@/services/patternProgressService';
import type { PatternProgressContextType } from '@/types/pattern-progress';

interface ComponentInstructionsSectionProps {
  /** List of pattern components */
  components: PatternComponent[];
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
  /** Session ID for generating schematics */
  sessionId?: string;
  /** Pattern progress context for tracking user progress */
  progressContext?: PatternProgressContextType | null;
}

/**
 * Component for displaying component instructions with schematics and progress tracking
 */
export default function ComponentInstructionsSection({
  components,
  printMode = false,
  id,
  sessionId,
  progressContext
}: ComponentInstructionsSectionProps) {
  const { t } = useTranslation();
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(
    printMode ? new Set(components.map((_, index) => index)) : new Set()
  );
  const [schematics, setSchematics] = useState<{ [componentName: string]: SchematicDiagram }>({});
  const [loadingSchematics, setLoadingSchematics] = useState(false);
  const [schematicsError, setSchematicsError] = useState<string | null>(null);

  /**
   * Load schematics for all components
   */
  useEffect(() => {
    if (sessionId && components.length > 0) {
      loadSchematics();
    }
  }, [sessionId, components]);

  /**
   * Auto-expand component based on current progress
   */
  useEffect(() => {
    if (progressContext?.progress?.currentComponent && !printMode) {
      const componentIndex = components.findIndex(
        c => c.componentName === progressContext.progress?.currentComponent
      );
      if (componentIndex >= 0) {
        setExpandedComponents(prev => new Set(prev).add(componentIndex));
      }
    }
  }, [progressContext?.progress?.currentComponent, components, printMode]);

  const loadSchematics = async () => {
    if (!sessionId) return;

    try {
      setLoadingSchematics(true);
      setSchematicsError(null);

      console.log('Loading schematics for session:', sessionId);
      
      // Generate schematics for the session
      const schematicDiagrams = await schematicService.generateSchematicsForSession(sessionId);
      
      // Convert to component name indexed object
      const schematicsMap: { [componentName: string]: SchematicDiagram } = {};
      schematicDiagrams.forEach(schematic => {
        schematicsMap[schematic.componentName] = schematic;
      });
      
      setSchematics(schematicsMap);
    } catch (error) {
      console.error('Error loading schematics:', error);
      
      let errorMessage = t('patternViewer.schematicLoadError', 'Failed to load schematics');
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          if (error.message.includes('Pattern session not found or not accessible')) {
            errorMessage = t('patternViewer.schematicSessionNotFound', 'Pattern session not found or you don\'t have access to it');
          } else {
            errorMessage = t('patternViewer.schematicSessionMissing', 'Pattern session not found');
          }
        } else if (error.message.includes('401')) {
          errorMessage = t('patternViewer.schematicUnauthorized', 'Please log in to view schematics');
        } else {
          errorMessage = error.message;
        }
      }
      
      setSchematicsError(errorMessage);
    } finally {
      setLoadingSchematics(false);
    }
  };

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

  /**
   * Handle instruction click for progress tracking
   */
  const handleInstructionClick = (componentName: string, instructionStep: number) => {
    if (progressContext && !printMode) {
      progressContext.goToStep(componentName, instructionStep);
    }
  };

  /**
   * Check if instruction is currently active
   */
  const isInstructionActive = (componentName: string, instructionStep: number): boolean => {
    if (!progressContext?.progress) return false;
    return (
      progressContext.progress.currentComponent === componentName &&
      progressContext.progress.currentInstructionStep === instructionStep
    );
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
          const componentSchematic = schematics[component.componentName];

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
                  {/* Schematic Display (US_9.3) */}
                  {componentSchematic && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        {t('patternViewer.componentSchematic', 'Component Diagram')}
                      </h4>
                      <div className="flex justify-center">
                        <SchematicDisplay
                          schematic={componentSchematic}
                          compact={false}
                          showDownload={!printMode}
                          showZoomControls={!printMode}
                          printMode={printMode}
                          maxWidth="500px"
                        />
                      </div>
                    </div>
                  )}

                  {/* Schematic Loading State */}
                  {loadingSchematics && !componentSchematic && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>{t('patternViewer.loadingSchematic', 'Loading schematic...')}</span>
                      </div>
                    </div>
                  )}

                  {/* Schematic Error State */}
                  {schematicsError && !componentSchematic && !loadingSchematics && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium text-blue-800">
                            {t('patternViewer.schematicNotAvailable', 'Diagram not available')}
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            {schematicsError.includes('Pattern session not found') 
                              ? t('patternViewer.schematicSessionIssue', 'The pattern session may need to be refreshed to generate diagrams.')
                              : schematicsError
                            }
                          </p>
                          {process.env.NODE_ENV === 'development' && sessionId && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  console.log('Debug: Session ID for schematics:', sessionId);
                                  console.log('Debug: Components available:', components.map(c => c.componentName));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Debug Session Info (Dev Mode)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stitch Chart Display (US_11.6) */}
                  {component.stitch_chart && (
                    <div>
                      <StitchChartDisplay
                        chartData={component.stitch_chart}
                        cellSize={printMode ? 24 : 32}
                        showRowNumbers={true}
                        showStitchNumbers={true}
                        showLegend={true}
                        printMode={printMode}
                        theme={{
                          backgroundColor: '#ffffff',
                          gridColor: '#374151',
                          noStitchColor: '#e5e7eb',
                          textColor: '#374151'
                        }}
                      />
                    </div>
                  )}

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
                        {component.instructions.map((instruction, instrIndex) => {
                          const isActive = isInstructionActive(component.componentName, instrIndex);
                          const hasRepetitions = hasRepetitionPattern(instruction.text);
                          const repetitionInstructions = hasRepetitions 
                            ? parseRepetitionInstructions(instruction.text, component.componentName, instrIndex)
                            : [];

                          return (
                            <div 
                              key={instrIndex} 
                              className={`flex space-x-4 p-3 rounded-lg transition-colors ${
                                isActive 
                                  ? 'bg-blue-100 border-2 border-blue-300' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                              } ${
                                progressContext && !printMode ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => handleInstructionClick(component.componentName, instrIndex)}
                            >
                              <div className="flex-shrink-0">
                                <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                                  isActive 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-600 text-white'
                                }`}>
                                  {instruction.step}
                                </span>
                              </div>
                              <div className="flex-1 space-y-2">
                                <p className="text-sm text-gray-900">
                                  {instruction.text}
                                </p>
                                
                                {/* Instruction metadata */}
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

                                {/* Repetition Counters (US_11.7) */}
                                {progressContext && repetitionInstructions.length > 0 && !printMode && (
                                  <div className="space-y-2">
                                    {repetitionInstructions.map((repetition) => {
                                      const currentCount = progressContext.progress?.repetitionCounters[repetition.id] || 0;
                                      
                                      return (
                                        <RepetitionCounter
                                          key={repetition.id}
                                          repetition={repetition}
                                          currentCount={currentCount}
                                          onCountChange={(counterId, newCount) => {
                                            const increment = newCount - currentCount;
                                            progressContext.updateRepetitionCounter(counterId, increment);
                                          }}
                                          onReset={(counterId) => {
                                            progressContext.resetRepetitionCounter(counterId);
                                          }}
                                          size="sm"
                                        />
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Progress hint for interactive mode */}
                                {progressContext && !printMode && isActive && (
                                  <div className="text-xs text-blue-600 font-medium">
                                    {t('patternProgress.currentRow', 'Current Row')}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
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