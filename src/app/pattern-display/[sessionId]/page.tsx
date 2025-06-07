/**
 * Pattern Display Page (PD_PH6_US004)
 * Main page for displaying generated pattern instructions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PatternInstructionGenerationService } from '@/services/PatternInstructionGenerationService';
import { PatternInstructionGenerationResult } from '@/types/pattern-instruction-generation';
import { CalculatedPatternDetails } from '@/types/core-pattern-calculation';
import PatternDisplay from '@/components/pattern/PatternDisplay';

interface PageParams {
  sessionId: string;
  [key: string]: string | string[];
}

/**
 * Pattern display page component
 */
export default function PatternDisplayPage() {
  const params = useParams<PageParams>();
  const { t } = useTranslation();
  const sessionId = params?.sessionId;

  const [patternResult, setPatternResult] = useState<PatternInstructionGenerationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const patternInstructionService = new PatternInstructionGenerationService();

  /**
   * Load pattern instructions for the session
   */
  useEffect(() => {
    if (sessionId) {
      loadPatternInstructions();
    }
  }, [sessionId]);

  const loadPatternInstructions = async () => {
    if (!sessionId) {
      setError('Session ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, create mock calculated pattern details
      // In a real implementation, this would fetch from the calculation API
      const calculatedPatternDetails: CalculatedPatternDetails = {
        patternInfo: {
          sessionId: sessionId,
          garmentType: 'sweater',
          craftType: 'knitting',
          calculatedAt: new Date().toISOString(),
          schemaVersion: '1.0.0'
        },
        pieces: {
          front_panel: {
            pieceKey: 'front_panel',
            displayName: 'Front Panel',
            castOnStitches: 120,
            lengthInRows: 180,
            finalStitchCount: 120,
            finishedDimensions: {
              width_cm: 50,
              length_cm: 60
            },
            shaping: [],
            constructionNotes: ['Cast on at the bottom', 'Work in stockinette stitch']
          },
          back_panel: {
            pieceKey: 'back_panel',
            displayName: 'Back Panel',
            castOnStitches: 120,
            lengthInRows: 180,
            finalStitchCount: 120,
            finishedDimensions: {
              width_cm: 50,
              length_cm: 60
            },
            shaping: [],
            constructionNotes: ['Cast on at the bottom', 'Work in stockinette stitch']
          },
          sleeves: {
            pieceKey: 'sleeves',
            displayName: 'Sleeves',
            castOnStitches: 60,
            lengthInRows: 120,
            finalStitchCount: 90,
            finishedDimensions: {
              width_cm: 30,
              length_cm: 45
            },
            shaping: [],
            constructionNotes: ['Increases for sleeve shaping', 'Work 2 pieces']
          }
        }
      };

      // Generate instructions from the calculated pattern details
      const instructionResult = await patternInstructionService.generateInstructionsWithValidation(
        calculatedPatternDetails,
        {
          includeStitchCounts: true,
          includeRowNumbers: true,
          useStandardAbbreviations: true,
          language: 'en',
          detailLevel: 'standard',
          includeShapingDetails: true,
          includeConstructionNotes: true
        }
      );

      if (!instructionResult.success || !instructionResult.result) {
        throw new Error(instructionResult.error || 'Failed to generate pattern instructions');
      }

      setPatternResult(instructionResult.result);
    } catch (error) {
      console.error('Error loading pattern instructions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('patternDisplay.loading.title', 'Loading Pattern Instructions')}
          </h2>
          <p className="text-gray-600">
            {t('patternDisplay.loading.message', 'Generating your pattern instructions...')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">
              {t('patternDisplay.error.title', 'Unable to Load Pattern')}
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadPatternInstructions}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t('patternDisplay.error.retry', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!patternResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('patternDisplay.noData.title', 'No Pattern Data')}
          </h2>
          <p className="text-gray-600">
            {t('patternDisplay.noData.message', 'No pattern instructions were found for this session.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PatternDisplay
        patternResult={patternResult}
        sessionId={sessionId}
        options={{
          showPrint: true,
          showDownload: true,
          showSchematics: true,
          compact: false
        }}
      />
    </div>
  );
} 