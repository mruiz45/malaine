'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { InMemoryPatternDefinitionProvider, useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import NewPatternDefinitionWorkspace from '@/components/knitting/NewPatternDefinitionWorkspace';

/**
 * Pattern Definition Page Content Component (PD_PH1_US001)
 * Rewritten to use in-memory pattern definition with garment-centric approach
 */
function PatternDefinitionPageContent() {
  const { t } = useTranslation();
  const { state, createPattern } = useInMemoryPatternDefinition();
  
  const { currentPattern, isLoading, error } = state;

  /**
   * Handle creating a new pattern session
   */
  const handleCreateNewPattern = () => {
    const sessionName = `Pattern ${new Date().toLocaleDateString()}`;
    createPattern(sessionName, 'knitting');
  };

  /**
   * Render initial state - no active pattern
   */
  if (!currentPattern && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('patternDefinition.title', 'Pattern Definition')}</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t('patternDefinition.getStarted', 'Get Started')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('patternDefinition.newDescription', 'Create a new pattern definition. Start by selecting the type of garment you want to create, then complete the relevant sections in any order you prefer.')}
            </p>
            
            <button
              onClick={handleCreateNewPattern}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {t('patternDefinition.createNew', 'Create New Pattern')}
            </button>
          </div>

          {/* Information about the new approach */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              {t('patternDefinition.newApproach.title', 'New Garment-Centric Approach')}
            </h3>
            <div className="space-y-2 text-blue-800">
              <p>
                {t('patternDefinition.newApproach.step1', '1. First, select your garment type (sweater, scarf, hat, etc.)')}
              </p>
              <p>
                {t('patternDefinition.newApproach.step2', '2. Only relevant sections for your garment will be shown')}
              </p>
              <p>
                {t('patternDefinition.newApproach.step3', '3. Navigate freely between sections - complete them in any order')}
              </p>
              <p>
                {t('patternDefinition.newApproach.step4', '4. Required sections are clearly marked')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              {t('common.error', 'Error')}
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleCreateNewPattern}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t('common.tryAgain', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render the new pattern definition workspace
   */
  return <NewPatternDefinitionWorkspace />;
}

/**
 * Main Pattern Definition Page Component (PD_PH1_US001)
 * Wrapper with the new in-memory provider
 */
export default function PatternDefinitionPage() {
  return (
    <ProtectedRoute>
      <InMemoryPatternDefinitionProvider>
        <PatternDefinitionPageContent />
      </InMemoryPatternDefinitionProvider>
    </ProtectedRoute>
  );
} 