/**
 * Restore Point List Component (PD_PH3_US002)
 * Component for displaying and managing restore points
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RestorePoint, StateWithoutRestorePoints } from '@/types/restorePoints';
import { InMemoryPatternDefinition } from '@/types/patternDefinitionInMemory';

/**
 * Props for RestorePointList component
 */
interface RestorePointListProps {
  /** List of restore points */
  restorePoints: RestorePoint<StateWithoutRestorePoints<InMemoryPatternDefinition>>[];
  /** Function to revert to a restore point */
  onRevert: (restorePointId: string) => void;
  /** Function to delete a restore point */
  onDelete: (restorePointId: string) => void;
  /** Whether operations are in progress */
  isProcessing?: boolean;
}

/**
 * Component for displaying restore points list
 */
export function RestorePointList({
  restorePoints,
  onRevert,
  onDelete,
  isProcessing = false
}: RestorePointListProps) {
  const { t } = useTranslation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Format date for display
  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle revert confirmation
  const handleRevert = (restorePointId: string) => {
    if (window.confirm(t('restorePoints.list.revertConfirm', 
      'Are you sure you want to revert to this restore point? This action can be undone.'))) {
      onRevert(restorePointId);
    }
  };

  // Handle delete confirmation
  const handleDelete = (restorePointId: string) => {
    setConfirmDelete(restorePointId);
  };

  // Confirm delete action
  const confirmDeleteAction = (restorePointId: string) => {
    onDelete(restorePointId);
    setConfirmDelete(null);
  };

  // Cancel delete action
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  if (restorePoints.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <p className="text-sm">
          {t('restorePoints.list.empty', 'No restore points saved yet')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {t('restorePoints.list.emptyHint', 'Create a restore point to save your current design state')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {restorePoints.map((restorePoint) => (
        <div 
          key={restorePoint.id}
          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          {/* Restore point header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {restorePoint.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(restorePoint.timestamp)}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-1 ml-3">
              {/* Revert button */}
              <button
                onClick={() => handleRevert(restorePoint.id)}
                disabled={isProcessing}
                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('restorePoints.list.revertTooltip', 'Revert to this point')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.333 4z" />
                </svg>
              </button>
              
              {/* Delete button */}
              <button
                onClick={() => handleDelete(restorePoint.id)}
                disabled={isProcessing}
                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('restorePoints.list.deleteTooltip', 'Delete this restore point')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description if available */}
          {restorePoint.description && (
            <p className="text-xs text-gray-600 mt-2 italic">
              {restorePoint.description}
            </p>
          )}

          {/* Delete confirmation */}
          {confirmDelete === restorePoint.id && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 mb-3">
                {t('restorePoints.list.deleteConfirm', 'Are you sure you want to delete this restore point? This action cannot be undone.')}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelDelete}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => confirmDeleteAction(restorePoint.id)}
                  className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  {t('common.delete', 'Delete')}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 