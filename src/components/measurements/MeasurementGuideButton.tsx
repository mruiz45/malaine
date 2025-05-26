'use client';

import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import type { MeasurementGuideButtonProps as BaseMeasurementGuideButtonProps } from '@/types/measurements';

/**
 * MeasurementGuideButton Component
 * 
 * Displays a help/info button next to measurement input fields.
 * When clicked, triggers the opening of a measurement guide modal.
 * 
 * US 3.1: Body Measurement Guide Tool
 * 
 * @param measurementKey - The key of the measurement this button is for
 * @param className - Optional additional CSS classes
 * @param onClick - Callback function when button is clicked
 */
interface MeasurementGuideButtonProps extends BaseMeasurementGuideButtonProps {
  onClick: () => void;
}

export default function MeasurementGuideButton({ 
  measurementKey, 
  onClick, 
  className = '' 
}: MeasurementGuideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        w-5 h-5 ml-2
        text-gray-400 hover:text-blue-600
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        rounded-full
        ${className}
      `}
      aria-label={`Show measurement guide for ${measurementKey.replace('_', ' ')}`}
      title={`How to measure ${measurementKey.replace('_', ' ')}`}
    >
      <InformationCircleIcon className="w-5 h-5" />
    </button>
  );
} 