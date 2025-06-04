/**
 * Pattern Definition Navigation Component (PD_PH1_US001)
 * Displays available sections for the selected garment type and allows free navigation
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInMemoryPatternDefinition } from '@/contexts/InMemoryPatternDefinitionContext';
import { PatternDefinitionSection } from '@/types/garmentTypeConfig';
import { SECTION_METADATA } from '@/utils/garmentTypeConfig';
import {
  ViewfinderCircleIcon,
  RectangleStackIcon,
  ArrowsPointingOutIcon,
  GlobeAmericasIcon,
  SwatchIcon,
  CubeIcon,
  EllipsisHorizontalIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid
} from '@heroicons/react/24/solid';

/**
 * Icon mapping for sections
 */
const ICON_MAPPING = {
  ViewfinderCircleIcon,
  RectangleStackIcon,
  ArrowsPointingOutIcon,
  GlobeAmericasIcon,
  SwatchIcon,
  CubeIcon,
  EllipseHorizontalIcon: EllipsisHorizontalIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  DocumentTextIcon
};

interface PatternDefinitionNavigationProps {
  /** Whether to show as compact sidebar or full navigation */
  variant?: 'sidebar' | 'full';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Pattern Definition Navigation Component
 */
export default function PatternDefinitionNavigation({
  variant = 'sidebar',
  className = ''
}: PatternDefinitionNavigationProps) {
  const { t } = useTranslation();
  const { state, navigateToSection } = useInMemoryPatternDefinition();
  
  const { currentPattern, navigation } = state;
  const { currentSection, availableSections, completedSections, requiredSections } = navigation;
  
  /**
   * Handle section navigation
   */
  const handleSectionClick = (section: PatternDefinitionSection) => {
    navigateToSection(section);
  };
  
  /**
   * Get icon component for a section
   */
  const getIconComponent = (iconName: string) => {
    return ICON_MAPPING[iconName as keyof typeof ICON_MAPPING] || DocumentTextIcon;
  };
  
  /**
   * Check if a section is completed
   */
  const isSectionCompleted = (section: PatternDefinitionSection): boolean => {
    return completedSections.includes(section);
  };
  
  /**
   * Check if a section is required
   */
  const isSectionRequired = (section: PatternDefinitionSection): boolean => {
    return requiredSections.includes(section);
  };
  
  /**
   * Get section status classes
   */
  const getSectionClasses = (section: PatternDefinitionSection): string => {
    const isActive = currentSection === section;
    const isCompleted = isSectionCompleted(section);
    const isRequired = isSectionRequired(section);
    
    let classes = 'flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer ';
    
    if (isActive) {
      classes += 'bg-blue-100 text-blue-900 border-2 border-blue-300 ';
    } else if (isCompleted) {
      classes += 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200 ';
    } else {
      classes += 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 ';
    }
    
    return classes;
  };
  
  // If no garment type is selected, don't show navigation
  if (!currentPattern?.garmentType || availableSections.length === 0) {
    return null;
  }
  
  const baseClasses = variant === 'sidebar' 
    ? 'space-y-2' 
    : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Header */}
      <div className={variant === 'sidebar' ? 'mb-4' : 'col-span-full mb-6'}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('patternDefinition.navigation.title', 'Pattern Sections')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('patternDefinition.navigation.description', 'Click any section to navigate. You can complete them in any order.')}
        </p>
      </div>
      
      {/* Section List */}
      {availableSections.map((section) => {
        const metadata = SECTION_METADATA[section];
        const IconComponent = getIconComponent(metadata.icon);
        const isCompleted = isSectionCompleted(section);
        const isRequired = isSectionRequired(section);
        const isActive = currentSection === section;
        
        return (
          <div
            key={section}
            className={getSectionClasses(section)}
            onClick={() => handleSectionClick(section)}
          >
            {/* Icon and completion status */}
            <div className="flex-shrink-0 mr-3">
              {isCompleted ? (
                <CheckCircleIconSolid className="h-6 w-6 text-green-600" />
              ) : (
                <IconComponent className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              )}
            </div>
            
            {/* Section info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                  {t(`patternDefinition.sections.${section}.title`, metadata.displayName)}
                </h4>
                
                {/* Badges */}
                <div className="flex items-center space-x-1 ml-2">
                  {isRequired && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {t('common.required', 'Required')}
                    </span>
                  )}
                  {metadata.estimatedTime && variant === 'full' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {metadata.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
              
              {variant === 'full' && (
                <p className={`text-xs mt-1 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                  {t(`patternDefinition.sections.${section}.description`, metadata.description)}
                </p>
              )}
            </div>
            
            {/* Navigation indicator */}
            {isActive && (
              <div className="flex-shrink-0 ml-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Progress Summary */}
      <div className={`${variant === 'sidebar' ? 'mt-6 pt-4 border-t border-gray-200' : 'col-span-full mt-6 pt-6 border-t border-gray-200'}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {t('patternDefinition.navigation.progress', 'Progress')}
          </span>
          <span className="font-medium text-gray-900">
            {completedSections.length} / {availableSections.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${availableSections.length > 0 ? (completedSections.length / availableSections.length) * 100 : 0}%` 
            }}
          />
        </div>
        
        {/* Required sections status */}
        {requiredSections.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            <span>
              {t('patternDefinition.navigation.required', 'Required')}: {' '}
              {requiredSections.filter(section => completedSections.includes(section)).length} / {requiredSections.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 