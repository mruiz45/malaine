/**
 * Showcase Pattern Detail Page (US_10.3)
 * Page for viewing a specific showcased pattern using PatternViewer
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { showcaseService } from '@/services/showcaseService';
import { ShowcasedPattern } from '@/types/showcase';
import PatternViewer from '@/components/pattern-viewer/PatternViewer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ShowcasePatternState {
  pattern: ShowcasedPattern | null;
  isLoading: boolean;
  error: string | null;
  printMode: boolean;
}

/**
 * Showcase pattern detail page component
 */
export default function ShowcasePatternPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const patternId = params?.id as string;

  const [state, setState] = useState<ShowcasePatternState>({
    pattern: null,
    isLoading: true,
    error: null,
    printMode: false
  });

  // Load pattern on mount
  useEffect(() => {
    if (!patternId) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: t('showcase.errors.noPatternId', 'No pattern ID provided')
      }));
      return;
    }

    loadPattern();
  }, [patternId]);

  /**
   * Loads the showcased pattern from the API
   */
  const loadPattern = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const showcasedPattern = await showcaseService.getPattern(patternId);
      
      setState(prev => ({
        ...prev,
        pattern: showcasedPattern,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error loading showcase pattern:', error);
      
      let errorMessage = t('showcase.errors.loadFailed', 'Failed to load pattern');
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = t('showcase.errors.patternNotFound', 'Pattern not found or not available');
        } else if (error.message.includes('400')) {
          errorMessage = t('showcase.errors.invalidPattern', 'Invalid pattern ID');
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
   * Handles navigation back to gallery
   */
  const handleGoBack = () => {
    router.push('/showcase');
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {t('showcase.loading', 'Loading pattern...')}
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
            {t('showcase.errors.title', 'Pattern Load Error')}
          </h1>
          <p className="text-gray-600 mb-6">
            {state.error}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('showcase.retry', 'Try Again')}
            </button>
            <button
              onClick={handleGoBack}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('showcase.backToGallery', 'Back to Gallery')}
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
            {t('showcase.errors.noPattern', 'No pattern data available')}
          </p>
          <button
            onClick={handleGoBack}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('showcase.backToGallery', 'Back to Gallery')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${state.printMode ? 'bg-white' : 'bg-gray-50'}`}>
      {/* Back to Gallery - Hidden in print mode */}
      {!state.printMode && (
        <div className="bg-white border-b border-gray-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              {t('showcase.backToGallery', 'Back to Gallery')}
            </button>
          </div>
        </div>
      )}

      {/* Pattern Content */}
      <PatternViewer
        pattern={state.pattern.full_pattern_data}
        printMode={state.printMode}
        onPrintModeChange={handlePrintModeChange}
        className={state.printMode ? 'shadow-none' : 'shadow-lg'}
      />
    </div>
  );
} 