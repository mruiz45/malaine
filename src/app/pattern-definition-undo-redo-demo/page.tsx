/**
 * Pattern Definition Undo/Redo Demo Page (PD_PH3_US001)
 * Demonstration page for testing undo/redo functionality
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { InMemoryPatternDefinitionWithUndoRedoProvider } from '@/contexts/InMemoryPatternDefinitionWithUndoRedoContext';
import PatternDefinitionWorkspaceWithUndoRedo from '@/components/knitting/PatternDefinitionWorkspaceWithUndoRedo';

/**
 * Demo Page Content Component
 */
function UndoRedoDemoPageContent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {t('undoRedoDemo.pageTitle', 'Undo/Redo Demo - Pattern Definition')}
              </h1>
              <p className="text-lg text-gray-600">
                {t('undoRedoDemo.pageDescription', 'Test the undo/redo functionality for pattern definition changes')}
              </p>
            </div>
            
            {/* Demo Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">
                {t('undoRedoDemo.instructions.title', 'How to Test Undo/Redo')}
              </h2>
              <div className="space-y-2 text-blue-800">
                <p>
                  <strong>1.</strong> {t('undoRedoDemo.instructions.step1', 'Create a new pattern and select a garment type')}
                </p>
                <p>
                  <strong>2.</strong> {t('undoRedoDemo.instructions.step2', 'Navigate to any section and fill in the demo fields')}
                </p>
                <p>
                  <strong>3.</strong> {t('undoRedoDemo.instructions.step3', 'Every field change creates an undo point')}
                </p>
                <p>
                  <strong>4.</strong> {t('undoRedoDemo.instructions.step4', 'Use the undo/redo buttons in the top-right corner')}
                </p>
                <p>
                  <strong>5.</strong> {t('undoRedoDemo.instructions.step5', 'Watch the history counter and button states change')}
                </p>
                <p>
                  <strong>6.</strong> {t('undoRedoDemo.instructions.step6', 'Configure history size and enable/disable functionality')}
                </p>
              </div>
            </div>

            {/* Features Tested */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-3">
                {t('undoRedoDemo.features.title', 'Features Being Tested')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                <div className="space-y-1">
                  <p>✓ {t('undoRedoDemo.features.undoRedo', 'Undo/Redo buttons with proper enabled/disabled states')}</p>
                  <p>✓ {t('undoRedoDemo.features.fieldChanges', 'Field changes creating snapshots')}</p>
                  <p>✓ {t('undoRedoDemo.features.garmentSelection', 'Garment type selection as significant change')}</p>
                  <p>✓ {t('undoRedoDemo.features.sectionCompletion', 'Section completion marking')}</p>
                </div>
                <div className="space-y-1">
                  <p>✓ {t('undoRedoDemo.features.historyLimit', 'Configurable history size limit')}</p>
                  <p>✓ {t('undoRedoDemo.features.enableDisable', 'Enable/disable undo/redo functionality')}</p>
                  <p>✓ {t('undoRedoDemo.features.historyDisplay', 'History position and status display')}</p>
                  <p>✓ {t('undoRedoDemo.features.clearHistory', 'Clear history functionality')}</p>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {t('undoRedoDemo.technical.title', 'Technical Implementation')}
              </h2>
              <div className="text-gray-700 space-y-1 text-sm">
                <p>• {t('undoRedoDemo.technical.store', 'Uses Zustand store with custom undo/redo implementation')}</p>
                <p>• {t('undoRedoDemo.technical.context', 'Enhanced React Context wrapping the in-memory pattern definition')}</p>
                <p>• {t('undoRedoDemo.technical.snapshots', 'Deep cloning for state snapshots on each significant change')}</p>
                <p>• {t('undoRedoDemo.technical.granularity', 'Field-level granularity as requested (every onChange)')}</p>
                <p>• {t('undoRedoDemo.technical.config', 'Configurable history size (5-100 steps, default 20)')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Demo Area */}
      <PatternDefinitionWorkspaceWithUndoRedo />
    </div>
  );
}

/**
 * Main Demo Page Component with Providers
 */
export default function UndoRedoDemoPage() {
  return (
    <ProtectedRoute>
      <InMemoryPatternDefinitionWithUndoRedoProvider>
        <UndoRedoDemoPageContent />
      </InMemoryPatternDefinitionWithUndoRedoProvider>
    </ProtectedRoute>
  );
} 