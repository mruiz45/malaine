/**
 * Pattern Instruction View Component (PD_PH6_US004)
 * Component for displaying instructions for a single pattern piece
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { PieceInstructions } from '@/types/pattern-instruction-generation';
import { SchematicDiagram } from '@/types/schematics';
import SchematicDisplay from '@/components/knitting/SchematicDisplay';
import { schematicService } from '@/services/schematicService';

interface PatternInstructionViewProps {
  /** Instructions for the piece */
  pieceInstructions: PieceInstructions;
  /** Optional session ID for loading schematics */
  sessionId?: string;
  /** Whether to show schematics */
  showSchematics?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for displaying pattern piece instructions
 */
export default function PatternInstructionView({
  pieceInstructions,
  sessionId,
  showSchematics = true,
  compact = false,
  className = ''
}: PatternInstructionViewProps) {
  const { t } = useTranslation();
  const [schematic, setSchematic] = useState<SchematicDiagram | null>(null);
  const [loadingSchematic, setLoadingSchematic] = useState(false);
  const [schematicError, setSchematicError] = useState<string | null>(null);
  const [showRowByRow, setShowRowByRow] = useState(false);
  const [showConstructionNotes, setShowConstructionNotes] = useState(true);

  /**
   * Load schematic for this piece
   */
  useEffect(() => {
    if (showSchematics && sessionId && pieceInstructions.pieceKey) {
      loadSchematicForPiece();
    }
  }, [showSchematics, sessionId, pieceInstructions.pieceKey]);

  const loadSchematicForPiece = async () => {
    if (!sessionId) return;

    try {
      setLoadingSchematic(true);
      setSchematicError(null);

      // Load schematics for the session and find the one for this piece
      const schematics = await schematicService.generateSchematicsForSession(sessionId);
      const pieceSchematic = schematics.find(s => 
        s.componentName.toLowerCase().includes(pieceInstructions.displayName.toLowerCase()) ||
        s.componentName.toLowerCase().includes(pieceInstructions.pieceKey.toLowerCase())
      );

      setSchematic(pieceSchematic || null);
    } catch (error) {
      console.error('Error loading schematic for piece:', error);
      setSchematicError(error instanceof Error ? error.message : 'Failed to load schematic');
    } finally {
      setLoadingSchematic(false);
    }
  };

  /**
   * Render markdown instructions as HTML
   */
  const renderMarkdownInstructions = (markdown: string) => {
    // Simple markdown-like rendering (for basic formatting)
    // In a real implementation, you'd use react-markdown
    const html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
      .replace(/\n/g, '<br>');

    return html;
  };

  return (
    <div className={`pattern-instruction-view ${className}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Piece header */}
        <div className="piece-header mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {pieceInstructions.displayName}
          </h2>
          
          {/* Construction summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pieceInstructions.constructionSummary.castOnStitches}
              </div>
              <div className="text-sm text-gray-600">
                {t('patternDisplay.castOnStitches', 'Cast-on Stitches')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pieceInstructions.constructionSummary.totalRows}
              </div>
              <div className="text-sm text-gray-600">
                {t('patternDisplay.totalRows', 'Total Rows')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {pieceInstructions.constructionSummary.finalStitchCount}
              </div>
              <div className="text-sm text-gray-600">
                {t('patternDisplay.finalStitches', 'Final Stitches')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-700">
                {pieceInstructions.constructionSummary.finishedDimensions.width_cm} × {' '}
                {pieceInstructions.constructionSummary.finishedDimensions.length_cm} cm
              </div>
              <div className="text-sm text-gray-600">
                {t('patternDisplay.dimensions', 'Dimensions')}
              </div>
            </div>
          </div>
        </div>

        {/* Schematic display */}
        {showSchematics && (
          <div className="schematic-section mb-6">
            {loadingSchematic && (
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>{t('patternDisplay.loadingSchematic', 'Loading schematic...')}</span>
                </div>
              </div>
            )}

            {schematic && !loadingSchematic && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('patternDisplay.schematic', 'Schematic')}
                </h3>
                <div className="flex justify-center">
                  <SchematicDisplay
                    schematic={schematic}
                    compact={compact}
                    showDownload={true}
                    showZoomControls={true}
                    printMode={false}
                    maxWidth="600px"
                  />
                </div>
              </div>
            )}

            {schematicError && !loadingSchematic && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    {t('patternDisplay.schematicError', 'Schematic not available for this piece')}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main instructions */}
        <div className="instructions-section mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('patternDisplay.instructions', 'Instructions')}
          </h3>
          
          <div className="prose prose-gray max-w-none bg-white border border-gray-200 rounded-lg p-6">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: renderMarkdownInstructions(pieceInstructions.markdownInstructions) 
              }} 
            />
          </div>
        </div>

        {/* Row-by-row instructions (toggleable) */}
        {pieceInstructions.instructionSteps.length > 0 && (
          <div className="row-by-row-section mb-6">
            <button
              onClick={() => setShowRowByRow(!showRowByRow)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {t('patternDisplay.rowByRowInstructions', 'Row-by-Row Instructions')}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({pieceInstructions.instructionSteps.length} {t('patternDisplay.steps', 'steps')})
                </span>
              </h3>
              {showRowByRow ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showRowByRow && (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('patternDisplay.row', 'Row')}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('patternDisplay.section', 'Section')}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('patternDisplay.instruction', 'Instruction')}
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('patternDisplay.stitchCount', 'Stitches')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pieceInstructions.instructionSteps.map((step, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {step.rowNumber}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {step.section}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {step.instructionText}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {step.stitchCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Construction notes */}
        {pieceInstructions.constructionNotes && pieceInstructions.constructionNotes.length > 0 && (
          <div className="construction-notes-section">
            <button
              onClick={() => setShowConstructionNotes(!showConstructionNotes)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {t('patternDisplay.constructionNotes', 'Construction Notes')}
              </h3>
              {showConstructionNotes ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>

            {showConstructionNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {pieceInstructions.constructionNotes.map((note, index) => (
                    <li key={index} className="flex items-start">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 