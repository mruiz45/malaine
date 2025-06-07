/**
 * Pattern Display Component (PD_PH6_US004)
 * Main component for displaying generated pattern instructions and schematics
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  PrinterIcon, 
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { PatternInstructionGenerationResult } from '@/types/pattern-instruction-generation';
import PatternInstructionView from './PatternInstructionView';
import PatternNavigationTabs from './PatternNavigationTabs';
import PatternPrintView from './PatternPrintView';

interface PatternDisplayProps {
  /** Generated pattern instructions and details */
  patternResult: PatternInstructionGenerationResult;
  /** Optional session ID for schematic loading */
  sessionId?: string;
  /** Display options */
  options?: {
    /** Show print button */
    showPrint?: boolean;
    /** Show download button */
    showDownload?: boolean;
    /** Show schematics if available */
    showSchematics?: boolean;
    /** Compact display mode */
    compact?: boolean;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main component for displaying pattern instructions
 */
export default function PatternDisplay({
  patternResult,
  sessionId,
  options = {},
  className = ''
}: PatternDisplayProps) {
  const { t } = useTranslation();
  const [selectedPieceKey, setSelectedPieceKey] = useState<string | null>(null);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(true);
  const [showAbbreviations, setShowAbbreviations] = useState(false);

  const {
    showPrint = true,
    showDownload = true,
    showSchematics = true,
    compact = false
  } = options;

  // Get available pieces
  const pieceKeys = patternResult.instructionsByPiece 
    ? Object.keys(patternResult.instructionsByPiece)
    : [];
  
  // Auto-select first piece if none selected
  const activePieceKey = selectedPieceKey || pieceKeys[0] || null;
  const activePiece = activePieceKey && patternResult.instructionsByPiece 
    ? patternResult.instructionsByPiece[activePieceKey]
    : null;

  /**
   * Handle print functionality
   */
  const handlePrint = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  /**
   * Handle PDF download (future enhancement)
   */
  const handleDownload = () => {
    // For now, trigger print which allows save as PDF
    handlePrint();
  };

  /**
   * Toggle introduction section
   */
  const toggleIntroduction = () => {
    setShowIntroduction(!showIntroduction);
  };

  /**
   * Toggle abbreviations glossary
   */
  const toggleAbbreviations = () => {
    setShowAbbreviations(!showAbbreviations);
  };

  if (!patternResult.success) {
    return (
      <div className={`pattern-display-error p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            {t('patternDisplay.error.title', 'Pattern Display Error')}
          </h3>
          <div className="text-red-700">
            {patternResult.errors?.map((error, index) => (
              <p key={index} className="mb-1">{error}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPrintMode) {
    return (
      <PatternPrintView
        patternResult={patternResult}
        sessionId={sessionId}
        showSchematics={showSchematics}
      />
    );
  }

  return (
    <div className={`pattern-display ${className}`}>
      {/* Header with controls */}
      <div className="pattern-display-header bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('patternDisplay.title', 'Pattern Instructions')}
            </h1>
            {patternResult.metadata && (
              <p className="text-sm text-gray-600 mt-1">
                {t('patternDisplay.generatedAt', 'Generated on')}{' '}
                {new Date(patternResult.metadata.generatedAt).toLocaleDateString()}
                {' '}• {patternResult.metadata.totalInstructions}{' '}
                {t('patternDisplay.instructions', 'instructions')}
              </p>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {showDownload && (
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                {t('patternDisplay.download', 'Download PDF')}
              </button>
            )}
            
            {showPrint && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                {t('patternDisplay.print', 'Print')}
              </button>
            )}
          </div>
        </div>

        {/* Warnings */}
        {patternResult.warnings && patternResult.warnings.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">
              {t('patternDisplay.warnings', 'Warnings')}
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {patternResult.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="pattern-display-content">
        {/* Pattern Introduction */}
        {patternResult.patternIntroduction && (
          <div className="pattern-introduction bg-gray-50 border-b border-gray-200">
            <div className="px-6 py-4">
              <button
                onClick={toggleIntroduction}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('patternDisplay.introduction', 'Pattern Introduction')}
                </h2>
                {showIntroduction ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {showIntroduction && (
                <div className="mt-4 prose prose-gray max-w-none">
                  <div dangerouslySetInnerHTML={{ 
                    __html: patternResult.patternIntroduction 
                  }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Abbreviations Glossary */}
        {patternResult.abbreviationsGlossary && (
          <div className="abbreviations-section bg-blue-50 border-b border-gray-200">
            <div className="px-6 py-4">
              <button
                onClick={toggleAbbreviations}
                className="flex items-center justify-between w-full text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('patternDisplay.abbreviations', 'Abbreviations')}
                </h2>
                {showAbbreviations ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {showAbbreviations && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(patternResult.abbreviationsGlossary.abbreviations).map(
                      ([key, abbrev]) => (
                        <div key={key} className="bg-white rounded-lg p-3 border border-blue-200">
                          <div className="font-mono font-bold text-blue-900">
                            {abbrev.abbreviation}
                          </div>
                          <div className="text-sm text-gray-700 mt-1">
                            {abbrev.fullTerm}
                          </div>
                          {abbrev.description && (
                            <div className="text-xs text-gray-600 mt-1">
                              {abbrev.description}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pattern Instructions */}
        {pieceKeys.length > 0 && (
          <div className="pattern-instructions">
            {/* Navigation Tabs */}
            <PatternNavigationTabs
              pieceKeys={pieceKeys}
              instructionsByPiece={patternResult.instructionsByPiece!}
              selectedPieceKey={activePieceKey}
              onPieceSelect={setSelectedPieceKey}
              compact={compact}
            />

            {/* Selected Piece Instructions */}
            {activePiece && (
              <PatternInstructionView
                pieceInstructions={activePiece}
                sessionId={sessionId}
                showSchematics={showSchematics}
                compact={compact}
              />
            )}
          </div>
        )}

        {/* Empty state */}
        {pieceKeys.length === 0 && (
          <div className="empty-state p-12 text-center">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('patternDisplay.noInstructions', 'No Instructions Available')}
              </h3>
              <p className="text-gray-600">
                {t('patternDisplay.noInstructionsDesc', 'Pattern instructions could not be generated or are empty.')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 