/**
 * Loading Component for Pattern Display Page (PD_PH6_US004)
 */

import React from 'react';

export default function PatternDisplayLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Loading Pattern Instructions
        </h2>
        <p className="text-gray-600">
          Generating your pattern instructions...
        </p>
      </div>
    </div>
  );
} 