/**
 * Repetition Counter Component (US_11.7)
 * Interactive counter for tracking repetitions in pattern instructions
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MinusIcon, 
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import type { RepetitionInstruction } from '@/types/pattern-progress';

interface RepetitionCounterProps {
  /** Repetition instruction data */
  repetition: RepetitionInstruction;
  /** Current count value */
  currentCount: number;
  /** Callback when count changes */
  onCountChange: (counterId: string, newCount: number) => void;
  /** Callback to reset counter */
  onReset: (counterId: string) => void;
  /** Whether the counter is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Repetition Counter Component
 */
export default function RepetitionCounter({
  repetition,
  currentCount,
  onCountChange,
  onReset,
  disabled = false,
  size = 'md',
  className = ''
}: RepetitionCounterProps) {
  const { t } = useTranslation();

  // Size-specific styles
  const sizeStyles = {
    sm: {
      container: 'text-xs',
      button: 'p-1',
      icon: 'h-3 w-3',
      counter: 'px-2 py-1 min-w-[2rem]',
      text: 'text-xs'
    },
    md: {
      container: 'text-sm',
      button: 'p-1.5',
      icon: 'h-4 w-4',
      counter: 'px-3 py-1.5 min-w-[2.5rem]',
      text: 'text-sm'
    },
    lg: {
      container: 'text-base',
      button: 'p-2',
      icon: 'h-5 w-5',
      counter: 'px-4 py-2 min-w-[3rem]',
      text: 'text-base'
    }
  };

  const styles = sizeStyles[size];

  const handleDecrement = () => {
    if (disabled || currentCount <= 0) return;
    onCountChange(repetition.id, currentCount - 1);
  };

  const handleIncrement = () => {
    if (disabled || currentCount >= repetition.maxRepetitions) return;
    onCountChange(repetition.id, currentCount + 1);
  };

  const handleReset = () => {
    if (disabled) return;
    onReset(repetition.id);
  };

  const isAtMinimum = currentCount <= 0;
  const isAtMaximum = currentCount >= repetition.maxRepetitions;
  const progressPercentage = repetition.maxRepetitions > 0 
    ? Math.round((currentCount / repetition.maxRepetitions) * 100)
    : 0;

  return (
    <div className={`inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2 ${styles.container} ${className}`}>
      {/* Repetition Description */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-blue-900 truncate ${styles.text}`}>
          {repetition.description}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-blue-600">
            {currentCount} / {repetition.maxRepetitions}
          </span>
          {repetition.maxRepetitions > 0 && (
            <div className="flex-1 bg-blue-200 rounded-full h-1.5 min-w-[3rem]">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Counter Controls */}
      <div className="flex items-center space-x-1">
        {/* Decrement Button */}
        <button
          onClick={handleDecrement}
          disabled={disabled || isAtMinimum}
          className={`${styles.button} border border-blue-300 rounded bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors`}
          title={t('repetitionCounter.decrement', 'Decrease count')}
        >
          <MinusIcon className={`${styles.icon} text-blue-600`} />
        </button>

        {/* Current Count Display */}
        <div className={`${styles.counter} bg-white border border-blue-300 rounded font-medium text-blue-900 text-center`}>
          {currentCount}
        </div>

        {/* Increment Button */}
        <button
          onClick={handleIncrement}
          disabled={disabled || isAtMaximum}
          className={`${styles.button} border border-blue-300 rounded bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors`}
          title={t('repetitionCounter.increment', 'Increase count')}
        >
          <PlusIcon className={`${styles.icon} text-blue-600`} />
        </button>

        {/* Reset Button */}
        {currentCount > 0 && (
          <button
            onClick={handleReset}
            disabled={disabled}
            className={`${styles.button} border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-1`}
            title={t('repetitionCounter.reset', 'Reset counter')}
          >
            <ArrowPathIcon className={`${styles.icon} text-gray-600`} />
          </button>
        )}
      </div>

      {/* Completion Status */}
      {isAtMaximum && (
        <div className="flex items-center space-x-1 text-green-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">
            {t('repetitionCounter.complete', 'Complete')}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Simple inline repetition counter for embedded use
 */
export function InlineRepetitionCounter({
  repetition,
  currentCount,
  onCountChange,
  disabled = false,
  className = ''
}: Omit<RepetitionCounterProps, 'onReset' | 'size'>) {
  const { t } = useTranslation();

  const handleDecrement = () => {
    if (disabled || currentCount <= 0) return;
    onCountChange(repetition.id, currentCount - 1);
  };

  const handleIncrement = () => {
    if (disabled || currentCount >= repetition.maxRepetitions) return;
    onCountChange(repetition.id, currentCount + 1);
  };

  const isAtMinimum = currentCount <= 0;
  const isAtMaximum = currentCount >= repetition.maxRepetitions;

  return (
    <span className={`inline-flex items-center space-x-1 bg-blue-100 rounded px-2 py-1 text-xs ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={disabled || isAtMinimum}
        className="p-0.5 hover:bg-blue-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('repetitionCounter.decrement', 'Decrease count')}
      >
        <MinusIcon className="h-3 w-3 text-blue-600" />
      </button>
      
      <span className="px-1 font-medium text-blue-900 min-w-[1.5rem] text-center">
        {currentCount}
      </span>
      
      <button
        onClick={handleIncrement}
        disabled={disabled || isAtMaximum}
        className="p-0.5 hover:bg-blue-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title={t('repetitionCounter.increment', 'Increase count')}
      >
        <PlusIcon className="h-3 w-3 text-blue-600" />
      </button>

      <span className="text-blue-600">
        /{repetition.maxRepetitions}
      </span>
    </span>
  );
} 