'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Session Header Component
 * Header for pattern definition workspace with session name editing
 */
export default function SessionHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentSession, updateSession } = usePatternDefinition();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    router.push('/pattern-definition');
  };

  /**
   * Start editing session name
   */
  const startEditing = () => {
    if (currentSession) {
      setEditedName(currentSession.session_name || '');
      setIsEditing(true);
    }
  };

  /**
   * Save edited session name
   */
  const saveEdit = async () => {
    if (currentSession && editedName.trim()) {
      try {
        await updateSession({
          session_name: editedName.trim()
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating session name:', error);
      }
    }
  };

  /**
   * Cancel editing
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  /**
   * Handle key press in edit mode
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Back button and session name */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {t('common.back', 'Back')}
          </button>
          
          <div className="h-6 w-px bg-gray-300" />
          
          <div className="flex items-center">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                  autoFocus
                />
                <button
                  onClick={saveEdit}
                  className="p-1 text-green-600 hover:text-green-700 transition-colors duration-200"
                  title={t('common.save', 'Save')}
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1 text-red-600 hover:text-red-700 transition-colors duration-200"
                  title={t('common.cancel', 'Cancel')}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentSession.session_name || t('patternDefinition.untitledSession', 'Untitled Session')}
                </h1>
                <button
                  onClick={startEditing}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  title={t('common.edit', 'Edit')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Session info */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{t('patternDefinition.status.label', 'Status')}:</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              currentSession.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              currentSession.status === 'ready_for_calculation' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {t(`patternDefinition.status.${currentSession.status}`, currentSession.status)}
            </span>
          </div>
          
          <div className="h-4 w-px bg-gray-300" />
          
          <div>
            {t('patternDefinition.lastUpdated', 'Last updated')}: {' '}
            {new Date(currentSession.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
} 