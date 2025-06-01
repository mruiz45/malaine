/**
 * Pattern Progress Controls Component (US_11.7)
 * Navigation controls for pattern instructions
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ArrowPathIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { 
  ChevronLeftIcon as ChevronLeftSolidIcon,
  ChevronRightIcon as ChevronRightSolidIcon 
} from '@heroicons/react/24/solid';
import type { ProgressNavigation } from '@/types/pattern-progress';

interface PatternProgressControlsProps {
  /** Current navigation state */
  navigation: ProgressNavigation;
  /** Whether progress tracking is enabled */
  isEnabled: boolean;
  /** Callback for previous step */
  onPreviousStep: () => void;
  /** Callback for next step */
  onNextStep: () => void;
  /** Callback for resetting progress */
  onResetProgress: () => void;
  /** Whether to show compact version */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pattern Progress Controls Component
 */
export default function PatternProgressControls({
  navigation,
  isEnabled,
  onPreviousStep,
  onNextStep,
  onResetProgress,
  compact = false,
  className = ''
}: PatternProgressControlsProps) {
  const { t } = useTranslation();

  if (!isEnabled) {
    return null;
  }

  const progressPercentage = navigation.totalSteps > 0 
    ? Math.round((navigation.currentPosition / navigation.totalSteps) * 100)
    : 0;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="h-5 w-5 text-blue-500" />
          <h3 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {t('patternProgress.title', 'Pattern Progress')}
          </h3>
        </div>
        
        {!compact && (
          <button
            onClick={onResetProgress}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title={t('patternProgress.resetProgress', 'Reset Progress')}
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            {t('patternProgress.reset', 'Reset')}
          </button>
        )}
      </div>

      {/* Progress Information */}
      <div className="mb-4">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            {t('patternProgress.step', 'Step')} {navigation.currentPosition + 1} 
            {t('patternProgress.of', ' of ')} {navigation.totalSteps}
          </span>
          <span className="font-medium">
            {progressPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Current Component */}
        {navigation.currentComponent && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">
              {t('patternProgress.currentComponent', 'Current section')}: 
            </span>
            <span className="ml-1">
              {navigation.currentComponent}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center space-x-3">
        {/* Previous Step Button */}
        <button
          onClick={onPreviousStep}
          disabled={!navigation.canGoPrevious}
          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
            navigation.canGoPrevious
              ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
          title={navigation.canGoPrevious 
            ? t('patternProgress.previousStep', 'Previous Step')
            : t('patternProgress.noPreviousStep', 'No previous step')
          }
        >
          {navigation.canGoPrevious ? (
            <ChevronLeftSolidIcon className="h-4 w-4 mr-1" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
          )}
          {compact ? '' : t('patternProgress.previous', 'Previous')}
        </button>

        {/* Step Counter (compact mode) */}
        {compact && (
          <div className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-900">
            {navigation.currentPosition + 1}/{navigation.totalSteps}
          </div>
        )}

        {/* Next Step Button */}
        <button
          onClick={onNextStep}
          disabled={!navigation.canGoNext}
          className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
            navigation.canGoNext
              ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
          title={navigation.canGoNext 
            ? t('patternProgress.nextStep', 'Next Step')
            : t('patternProgress.noNextStep', 'No next step')
          }
        >
          {compact ? '' : t('patternProgress.next', 'Next')}
          {navigation.canGoNext ? (
            <ChevronRightSolidIcon className="h-4 w-4 ml-1" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 ml-1" />
          )}
        </button>
      </div>

      {/* Quick Actions (non-compact mode) */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {t('patternProgress.clickInstructions', 'Click on instructions to jump to specific steps')}
            </span>
            {compact && (
              <button
                onClick={onResetProgress}
                className="text-gray-400 hover:text-gray-600"
                title={t('patternProgress.resetProgress', 'Reset Progress')}
              >
                <ArrowPathIcon className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 