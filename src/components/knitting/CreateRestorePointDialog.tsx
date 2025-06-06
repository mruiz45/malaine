/**
 * Create Restore Point Dialog Component (PD_PH3_US002)
 * Dialog for creating a new restore point with user-provided name
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Props for CreateRestorePointDialog component
 */
interface CreateRestorePointDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to handle dialog close */
  onClose: () => void;
  /** Function to handle restore point creation */
  onCreate: (name: string, description?: string) => void;
  /** Whether creation is in progress */
  isCreating?: boolean;
  /** Maximum capacity reached */
  isAtMaxCapacity?: boolean;
}

/**
 * Dialog component for creating restore points
 */
export function CreateRestorePointDialog({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
  isAtMaxCapacity = false
}: CreateRestorePointDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim() || undefined);
      // Reset form
      setName('');
      setDescription('');
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('restorePoints.createDialog.title', 'Create Restore Point')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isCreating}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {/* Warning for max capacity */}
          {isAtMaxCapacity && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-700">
                  {t('restorePoints.createDialog.maxCapacityWarning', 
                    'Maximum restore points reached. Creating a new one will remove the oldest point.')}
                </p>
              </div>
            </div>
          )}

          {/* Name field */}
          <div className="mb-4">
            <label htmlFor="restore-point-name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('restorePoints.createDialog.nameLabel', 'Name')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="restore-point-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('restorePoints.createDialog.namePlaceholder', 'e.g., "After basic shaping", "V-Neck idea"')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
              disabled={isCreating}
              required
            />
          </div>

          {/* Description field */}
          <div className="mb-6">
            <label htmlFor="restore-point-description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('restorePoints.createDialog.descriptionLabel', 'Description (optional)')}
            </label>
            <textarea
              id="restore-point-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('restorePoints.createDialog.descriptionPlaceholder', 
                'Optional description of what this restore point represents...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={250}
              disabled={isCreating}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isCreating}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isCreating ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('restorePoints.createDialog.creating', 'Creating...')}
                </div>
              ) : (
                t('restorePoints.createDialog.create', 'Create Restore Point')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 