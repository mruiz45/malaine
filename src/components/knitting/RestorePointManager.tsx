/**
 * Restore Point Manager Component (PD_PH3_US002)
 * Main interface component for managing restore points
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinitionWithUndoRedo } from '@/contexts/InMemoryPatternDefinitionWithUndoRedoContext';
import { CreateRestorePointDialog } from './CreateRestorePointDialog';
import { RestorePointList } from './RestorePointList';

/**
 * Props for RestorePointManager component
 */
interface RestorePointManagerProps {
  /** Whether the manager is displayed in a collapsed/expanded state */
  className?: string;
}

/**
 * Main restore point management component
 */
export function RestorePointManager({ className = '' }: RestorePointManagerProps) {
  const { t } = useTranslation();
  const {
    currentPattern,
    hasRestorePoints,
    isAtMaxRestorePointCapacity,
    createRestorePoint,
    revertToRestorePoint,
    deleteRestorePoint,
    clearAllRestorePoints,
    getAllRestorePoints
  } = useInMemoryPatternDefinitionWithUndoRedo();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current restore points
  const restorePoints = getAllRestorePoints();

  // Handle create restore point
  const handleCreateRestorePoint = useCallback(async (name: string, description?: string) => {
    setIsCreating(true);
    try {
      createRestorePoint(name, description);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating restore point:', error);
      // TODO: Show error toast
    } finally {
      setIsCreating(false);
    }
  }, [createRestorePoint]);

  // Handle revert to restore point
  const handleRevert = useCallback(async (restorePointId: string) => {
    setIsProcessing(true);
    try {
      revertToRestorePoint(restorePointId);
    } catch (error) {
      console.error('Error reverting to restore point:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  }, [revertToRestorePoint]);

  // Handle delete restore point
  const handleDelete = useCallback(async (restorePointId: string) => {
    setIsProcessing(true);
    try {
      deleteRestorePoint(restorePointId);
    } catch (error) {
      console.error('Error deleting restore point:', error);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  }, [deleteRestorePoint]);

  // Handle clear all restore points
  const handleClearAll = useCallback(() => {
    if (window.confirm(t('restorePoints.manager.clearAllConfirm', 
      'Are you sure you want to delete all restore points? This action cannot be undone.'))) {
      clearAllRestorePoints();
    }
  }, [clearAllRestorePoints, t]);

  // If no pattern is active, show disabled state
  if (!currentPattern) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">
            {t('restorePoints.manager.noPattern', 'No active pattern')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('restorePoints.manager.createPatternHint', 'Create a pattern to use restore points')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('restorePoints.manager.title', 'Restore Points')}
            </h2>
            {hasRestorePoints && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {restorePoints.length}
              </span>
            )}
          </div>
          
          {/* Create button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={isCreating || isProcessing}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('restorePoints.manager.create', 'Create')}
            </button>
            
            {/* Clear all button (only show if there are restore points) */}
            {hasRestorePoints && (
              <button
                onClick={handleClearAll}
                disabled={isCreating || isProcessing}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                title={t('restorePoints.manager.clearAllTooltip', 'Clear all restore points')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Status info */}
        {isAtMaxRestorePointCapacity && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {t('restorePoints.manager.maxCapacity', 'Maximum restore points reached. Creating new ones will remove the oldest.')}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <RestorePointList
          restorePoints={restorePoints}
          onRevert={handleRevert}
          onDelete={handleDelete}
          isProcessing={isProcessing}
        />
      </div>

      {/* Create restore point dialog */}
      <CreateRestorePointDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateRestorePoint}
        isCreating={isCreating}
        isAtMaxCapacity={isAtMaxRestorePointCapacity}
      />
    </div>
  );
} 