/**
 * Error Component for Pattern Display Page (PD_PH6_US004)
 */

'use client';

import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface PatternDisplayErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PatternDisplayError({
  error,
  reset,
}: PatternDisplayErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Unable to Load Pattern
          </h2>
          <p className="text-red-700 mb-4">
            {error.message || 'An unexpected error occurred while loading the pattern instructions.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={reset}
              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try Again
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 