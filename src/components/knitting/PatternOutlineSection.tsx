'use client';

import React, { ReactNode } from 'react';

/**
 * Pattern Outline Section Component
 * Provides a consistent layout for sections within the pattern outline
 */
interface PatternOutlineSectionProps {
  /** Section title */
  title: string;
  /** Optional icon for the section */
  icon?: ReactNode;
  /** Section content */
  children: ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

export default function PatternOutlineSection({ 
  title, 
  icon, 
  children, 
  className = '' 
}: PatternOutlineSectionProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="text-gray-600">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
} 