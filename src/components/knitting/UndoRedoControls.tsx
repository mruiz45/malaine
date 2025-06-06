/**
 * Undo/Redo Controls Component (PD_PH3_US001)
 * Provides UI controls for undo/redo functionality in pattern definition
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUturnLeftIcon, ArrowUturnRightIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { UndoRedoState } from '@/types/undoRedo';

/**
 * Props for UndoRedoControls component
 */
interface UndoRedoControlsProps {
  /** Current undo/redo state */
  undoRedoState: UndoRedoState;
  /** Function to trigger undo */
  onUndo: () => void;
  /** Function to trigger redo */
  onRedo: () => void;
  /** Optional function to open configuration */
  onConfigure?: () => void;
  /** Whether to show configuration button */
  showConfiguration?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * UndoRedoControls Component
 * Renders undo/redo buttons with appropriate enabled/disabled states
 */
export default function UndoRedoControls({
  undoRedoState,
  onUndo,
  onRedo,
  onConfigure,
  showConfiguration = false,
  className = '',
  orientation = 'horizontal',
  size = 'md',
}: UndoRedoControlsProps) {
  const { t } = useTranslation();

  // Button size classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  // Container classes based on orientation
  const containerClasses = orientation === 'horizontal'
    ? 'flex flex-row space-x-2'
    : 'flex flex-col space-y-2';

  // Base button classes
  const baseButtonClasses = `
    ${sizeClasses[size]}
    rounded-lg
    border
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-blue-500
    focus:ring-offset-2
  `.trim();

  // Button variant classes
  const getButtonClasses = (enabled: boolean) => `
    ${baseButtonClasses}
    ${enabled
      ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 cursor-pointer'
      : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
    }
  `.trim();

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Undo Button */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!undoRedoState.canUndo}
        className={getButtonClasses(undoRedoState.canUndo)}
        title={
          undoRedoState.canUndo
            ? t('undoRedo.undo', 'Undo last change')
            : t('undoRedo.noUndo', 'Nothing to undo')
        }
        aria-label={t('undoRedo.undo', 'Undo last change')}
      >
        <ArrowUturnLeftIcon className={iconSizeClasses[size]} />
      </button>

      {/* Redo Button */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!undoRedoState.canRedo}
        className={getButtonClasses(undoRedoState.canRedo)}
        title={
          undoRedoState.canRedo
            ? t('undoRedo.redo', 'Redo last undone change')
            : t('undoRedo.noRedo', 'Nothing to redo')
        }
        aria-label={t('undoRedo.redo', 'Redo last undone change')}
      >
        <ArrowUturnRightIcon className={iconSizeClasses[size]} />
      </button>

      {/* Configuration Button (Optional) */}
      {showConfiguration && onConfigure && (
        <button
          type="button"
          onClick={onConfigure}
          className={getButtonClasses(true)}
          title={t('undoRedo.configure', 'Configure undo/redo settings')}
          aria-label={t('undoRedo.configure', 'Configure undo/redo settings')}
        >
          <Cog6ToothIcon className={iconSizeClasses[size]} />
        </button>
      )}
    </div>
  );
}

/**
 * UndoRedoStatusBadge Component
 * Shows current undo/redo status information
 */
interface UndoRedoStatusBadgeProps {
  undoRedoState: UndoRedoState;
  className?: string;
  showDetails?: boolean;
}

export function UndoRedoStatusBadge({
  undoRedoState,
  className = '',
  showDetails = false,
}: UndoRedoStatusBadgeProps) {
  const { t } = useTranslation();

  if (!undoRedoState.config.enabled) {
    return null;
  }

  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      {showDetails ? (
        <div className="space-y-1">
          <div>
            {t('undoRedo.status.position', 'Position')}: {undoRedoState.currentIndex + 1} / {undoRedoState.historySize}
          </div>
          <div>
            {t('undoRedo.status.canUndo', 'Can undo')}: {undoRedoState.canUndo ? t('common.yes', 'Yes') : t('common.no', 'No')}
          </div>
          <div>
            {t('undoRedo.status.canRedo', 'Can redo')}: {undoRedoState.canRedo ? t('common.yes', 'Yes') : t('common.no', 'No')}
          </div>
        </div>
      ) : (
        <span>
          {t('undoRedo.status.history', 'History')}: {undoRedoState.currentIndex} / {undoRedoState.historySize - 1}
        </span>
      )}
    </div>
  );
} 