/**
 * Sweater Structure Selector Component (US_4.3)
 * Allows users to select construction method and body shape for sweaters
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ConstructionMethod,
  BodyShape,
  ConstructionMethodOption,
  BodyShapeOption,
  SweaterStructureSelectorProps
} from '@/types/sweaterStructure';
import {
  CubeIcon,
  Square3Stack3DIcon,
  ArrowsRightLeftIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import {
  CubeIcon as CubeIconSolid,
  Square3Stack3DIcon as Square3Stack3DIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  RectangleStackIcon as RectangleStackIconSolid
} from '@heroicons/react/24/solid';

/**
 * Available construction methods with metadata
 * Extended for US_12.1 to include raglan top-down construction
 */
const CONSTRUCTION_METHODS: ConstructionMethodOption[] = [
  {
    key: 'drop_shoulder',
    display_name: 'Drop Shoulder',
    description: 'Simple construction with no shoulder shaping. The sleeve extends straight from the body.',
    difficulty: 'beginner',
    compatible_garment_types: ['sweater', 'cardigan']
  },
  {
    key: 'set_in_sleeve',
    display_name: 'Set-in Sleeve',
    description: 'Traditional construction with shaped armholes and sleeve caps for a fitted look.',
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'cardigan']
  },
  {
    key: 'raglan',
    display_name: 'Raglan',
    description: 'Diagonal seams from neck to underarm create a sporty, comfortable fit.',
    difficulty: 'intermediate',
    compatible_garment_types: ['sweater', 'cardigan']
  },
  {
    key: 'raglan_top_down',
    display_name: 'Raglan Top-Down',
    description: 'Seamless raglan construction knitted from the neckline down, ideal for circular knitting.',
    difficulty: 'advanced',
    compatible_garment_types: ['sweater']
  },
  {
    key: 'dolman',
    display_name: 'Dolman',
    description: 'Wide, loose sleeves that are part of the body piece, creating a flowing silhouette.',
    difficulty: 'advanced',
    compatible_garment_types: ['sweater']
  }
];

/**
 * Available body shapes with metadata
 * Updated to include raglan_top_down compatibility
 */
const BODY_SHAPES: BodyShapeOption[] = [
  {
    key: 'straight',
    display_name: 'Straight',
    description: 'Classic straight silhouette with minimal shaping, comfortable and versatile.',
    fit_type: 'loose',
    compatible_construction_methods: ['drop_shoulder', 'set_in_sleeve', 'raglan', 'raglan_top_down', 'dolman']
  },
  {
    key: 'a_line',
    display_name: 'A-line',
    description: 'Fitted at the bust with gradual widening toward the hem for a flattering shape.',
    fit_type: 'fitted',
    compatible_construction_methods: ['set_in_sleeve', 'raglan', 'raglan_top_down']
  },
  {
    key: 'fitted_shaped_waist',
    display_name: 'Fitted/Shaped Waist',
    description: 'Tailored fit with waist shaping for a feminine, structured silhouette.',
    fit_type: 'fitted',
    compatible_construction_methods: ['set_in_sleeve']
  },
  {
    key: 'oversized_boxy',
    display_name: 'Oversized Boxy',
    description: 'Relaxed, boxy fit with extra ease for a modern, casual look.',
    fit_type: 'oversized',
    compatible_construction_methods: ['drop_shoulder', 'raglan_top_down', 'dolman']
  }
];

/**
 * Get icon for construction method
 * Updated for US_12.1 to include raglan_top_down icon
 */
const getConstructionMethodIcon = (method: ConstructionMethod, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (method) {
    case 'drop_shoulder':
      return isSelected ? <CubeIconSolid {...iconProps} /> : <CubeIcon {...iconProps} />;
    case 'set_in_sleeve':
      return isSelected ? <Square3Stack3DIconSolid {...iconProps} /> : <Square3Stack3DIcon {...iconProps} />;
    case 'raglan':
      return isSelected ? <ArrowsRightLeftIconSolid {...iconProps} /> : <ArrowsRightLeftIcon {...iconProps} />;
    case 'raglan_top_down':
      return isSelected ? <ArrowsRightLeftIconSolid {...iconProps} /> : <ArrowsRightLeftIcon {...iconProps} />; // Use similar icon as raglan but could be differentiated
    case 'dolman':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    default:
      return isSelected ? <CubeIconSolid {...iconProps} /> : <CubeIcon {...iconProps} />;
  }
};

/**
 * Get icon for body shape
 */
const getBodyShapeIcon = (shape: BodyShape, isSelected: boolean) => {
  const iconProps = { className: "w-6 h-6" };
  
  switch (shape) {
    case 'straight':
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
    case 'a_line':
      return isSelected ? <ArrowsRightLeftIconSolid {...iconProps} /> : <ArrowsRightLeftIcon {...iconProps} />;
    case 'fitted_shaped_waist':
      return isSelected ? <Square3Stack3DIconSolid {...iconProps} /> : <Square3Stack3DIcon {...iconProps} />;
    case 'oversized_boxy':
      return isSelected ? <CubeIconSolid {...iconProps} /> : <CubeIcon {...iconProps} />;
    default:
      return isSelected ? <RectangleStackIconSolid {...iconProps} /> : <RectangleStackIcon {...iconProps} />;
  }
};

/**
 * Get difficulty badge color
 */
const getDifficultyBadgeColor = (difficulty?: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Sweater Structure Selector Component
 */
export default function SweaterStructureSelector({
  selectedGarmentTypeId,
  selectedConstructionMethod,
  selectedBodyShape,
  onConstructionMethodSelect,
  onBodyShapeSelect,
  disabled = false,
  isLoading = false
}: SweaterStructureSelectorProps) {
  const { t } = useTranslation();
  const [filteredConstructionMethods, setFilteredConstructionMethods] = useState<ConstructionMethodOption[]>([]);
  const [filteredBodyShapes, setFilteredBodyShapes] = useState<BodyShapeOption[]>([]);

  /**
   * Filter available options based on selected garment type and construction method
   */
  useEffect(() => {
    // For now, we'll show all options since we don't have the garment type details
    // In a full implementation, this would filter based on garment type metadata
    setFilteredConstructionMethods(CONSTRUCTION_METHODS);
    
    // Filter body shapes based on selected construction method
    if (selectedConstructionMethod) {
      const compatibleShapes = BODY_SHAPES.filter(shape => 
        shape.compatible_construction_methods?.includes(selectedConstructionMethod)
      );
      setFilteredBodyShapes(compatibleShapes);
    } else {
      setFilteredBodyShapes(BODY_SHAPES);
    }
  }, [selectedGarmentTypeId, selectedConstructionMethod]);

  /**
   * Handle construction method selection
   */
  const handleConstructionMethodSelect = (method: ConstructionMethod) => {
    if (disabled || isLoading) return;
    onConstructionMethodSelect(method);
    
    // If the current body shape is not compatible with the new construction method, clear it
    if (selectedBodyShape) {
      const selectedShape = BODY_SHAPES.find(shape => shape.key === selectedBodyShape);
      if (selectedShape && !selectedShape.compatible_construction_methods?.includes(method)) {
        // The parent component should handle clearing the body shape
        // This is just for UX feedback
      }
    }
  };

  /**
   * Handle body shape selection
   */
  const handleBodyShapeSelect = (shape: BodyShape) => {
    if (disabled || isLoading) return;
    onBodyShapeSelect(shape);
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg p-6 h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('sweaterStructure.title', 'Sweater Structure')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('sweaterStructure.description', 'Choose the construction method and body shape for your sweater. These choices will influence the pattern calculations and available options.')}
        </p>
      </div>

      {/* Construction Method Selection */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900">
          {t('sweaterStructure.constructionMethod', 'Construction Method')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConstructionMethods.map((method) => {
            const isSelected = selectedConstructionMethod === method.key;
            
            return (
              <div
                key={method.key}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${isSelected 
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-50' 
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => handleConstructionMethodSelect(method.key)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getConstructionMethodIcon(method.key, isSelected)}
                    <h5 className="text-sm font-medium text-gray-900">
                      {method.display_name}
                    </h5>
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {method.description}
                  </p>
                  
                  {method.difficulty && (
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(method.difficulty)}`}>
                        {t(`sweaterStructure.difficulty.${method.difficulty}`, method.difficulty)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body Shape Selection */}
      <div className="space-y-4">
        <h4 className="text-base font-medium text-gray-900">
          {t('sweaterStructure.bodyShape', 'Body Shape')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBodyShapes.map((shape) => {
            const isSelected = selectedBodyShape === shape.key;
            const isDisabled = disabled || (selectedConstructionMethod && 
              !shape.compatible_construction_methods?.includes(selectedConstructionMethod));
            
            return (
              <div
                key={shape.key}
                className={`
                  relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
                  ${isSelected 
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500 ring-opacity-50' 
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isDisabled && handleBodyShapeSelect(shape.key)}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getBodyShapeIcon(shape.key, isSelected)}
                    <h5 className="text-sm font-medium text-gray-900">
                      {shape.display_name}
                    </h5>
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {shape.description}
                  </p>
                  
                  {shape.fit_type && (
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t(`sweaterStructure.fitType.${shape.fit_type}`, shape.fit_type)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help text */}
      {selectedConstructionMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {t('sweaterStructure.helpText', 'Your construction method choice affects which body shapes are available. Some combinations work better together for optimal fit and construction ease.')}
          </p>
        </div>
      )}
    </div>
  );
} 