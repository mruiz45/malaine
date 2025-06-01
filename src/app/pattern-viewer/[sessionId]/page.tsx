/**
 * Pattern Viewer Page (US_9.1 + US_11.7)
 * Main page for viewing assembled pattern documents with progress tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { AssembledPattern, PatternViewerState } from '@/types/assembled-pattern';
import { patternViewerService } from '@/services/patternViewerService';
import PatternViewer from '@/components/pattern-viewer/PatternViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PatternProgressProvider } from '@/contexts/PatternProgressContext';

/**
 * Pattern Viewer Page Component
 */
export default function PatternViewerPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [state, setState] = useState<PatternViewerState>({
    pattern: null,
    isLoading: true,
    error: null,
    printMode: false
  });

  // Load pattern on mount
  useEffect(() => {
    if (!sessionId) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: t('patternViewer.errors.noSessionId', 'No session ID provided')
      }));
      return;
    }

    loadPattern();
  }, [sessionId]);

  /**
   * Loads the assembled pattern from the API
   */
  const loadPattern = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const assembledPattern = await patternViewerService.assemblePatternQuick(sessionId);
      
      setState(prev => ({
        ...prev,
        pattern: assembledPattern,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading pattern:', error);
      
      let errorMessage = t('patternViewer.errors.loadFailed', 'Failed to load pattern');
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = t('patternViewer.errors.sessionNotFound', 'Session not found or not accessible');
        } else if (error.message.includes('401')) {
          errorMessage = t('patternViewer.errors.unauthorized', 'Please log in to view this pattern');
        } else {
          errorMessage = error.message;
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  };

  /**
   * Handles print mode toggle
   */
  const handlePrintModeChange = (printMode: boolean) => {
    setState(prev => ({ ...prev, printMode }));
  };

  /**
   * Handles retry loading
   */
  const handleRetry = () => {
    loadPattern();
  };

  /**
   * Handles navigation back
   */
  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {t('patternViewer.loading', 'Loading your pattern...')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {t('patternViewer.errors.title', 'Pattern Load Error')}
          </h1>
          <p className="text-gray-600 mb-6">
            {state.error}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('patternViewer.retry', 'Try Again')}
            </button>
            <button
              onClick={handleGoBack}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('patternViewer.goBack', 'Go Back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show pattern
  if (!state.pattern) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">
            {t('patternViewer.errors.noPattern', 'No pattern data available')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${state.printMode ? 'bg-white' : 'bg-gray-50'}`}>
      <PatternProgressProvider
        sessionId={sessionId}
        pattern={state.pattern}
        options={{
          loadExisting: true,
          enableAutoSave: true,
          autoSaveInterval: 2000
        }}
      >
        <PatternViewer
          pattern={state.pattern}
          printMode={state.printMode}
          onPrintModeChange={handlePrintModeChange}
          className={state.printMode ? 'shadow-none' : 'shadow-lg'}
        />
      </PatternProgressProvider>
    </div>
  );
} 