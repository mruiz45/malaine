/**
 * StitchPreviewDisplay Component
 * Displays visual preview and characteristics of stitch patterns
 * Implements US_3.3 requirements for stitch pattern effects preview
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import type { StitchPattern, StitchPatternProperties } from '@/types/stitchPattern';

interface StitchPreviewDisplayProps {
  /** The stitch pattern to preview */
  pattern: StitchPattern;
  /** Whether to show a compact version */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for displaying stitch pattern visual preview and properties
 */
export default function StitchPreviewDisplay({
  pattern,
  compact = false,
  className = ''
}: StitchPreviewDisplayProps) {
  const { t } = useTranslation();

  if (!pattern) {
    return null;
  }

  const hasSwatchImage = pattern.swatch_image_url && pattern.swatch_image_url.trim().length > 0;
  const hasProperties = pattern.properties && Object.keys(pattern.properties).length > 0;

  // If no preview data available, don't render
  if (!hasSwatchImage && !hasProperties) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Swatch Image */}
      {hasSwatchImage && (
        <div className="flex flex-col items-center space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {t('stitchPattern.preview.swatchTitle', 'Stitch Preview')}
          </h4>
          <div className={`relative overflow-hidden rounded-lg border border-gray-200 ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}>
            <Image
              src={pattern.swatch_image_url!}
              alt={t('stitchPattern.preview.swatchAlt', {
                name: pattern.stitch_name,
                defaultValue: `Swatch preview of ${pattern.stitch_name}`
              })}
              fill
              className="object-cover"
              sizes={compact ? '64px' : '96px'}
              onError={(e) => {
                // Hide image on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Properties */}
      {hasProperties && !compact && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            {t('stitchPattern.preview.propertiesTitle', 'Characteristics')}
          </h4>
                     <div className="space-y-2">
             {pattern.properties?.fabric_behavior && (
               <PropertyItem
                 label={t('stitchPattern.preview.fabricBehavior', 'Fabric Behavior')}
                 value={pattern.properties.fabric_behavior}
               />
             )}
             {pattern.properties?.texture_description && (
               <PropertyItem
                 label={t('stitchPattern.preview.texture', 'Texture')}
                 value={pattern.properties.texture_description}
               />
             )}
             {pattern.properties?.reversibility && (
               <PropertyItem
                 label={t('stitchPattern.preview.reversible', 'Reversible')}
                 value={pattern.properties.reversibility}
               />
             )}
             {pattern.properties?.stretch_horizontal && (
               <PropertyItem
                 label={t('stitchPattern.preview.stretchHorizontal', 'Horizontal Stretch')}
                 value={pattern.properties.stretch_horizontal}
               />
             )}
             {pattern.properties?.stretch_vertical && (
               <PropertyItem
                 label={t('stitchPattern.preview.stretchVertical', 'Vertical Stretch')}
                 value={pattern.properties.stretch_vertical}
               />
             )}
             {pattern.properties?.relative_yarn_consumption && (
               <PropertyItem
                 label={t('stitchPattern.preview.yarnConsumption', 'Yarn Consumption')}
                 value={pattern.properties.relative_yarn_consumption}
               />
             )}
             {pattern.properties?.notes && (
               <PropertyItem
                 label={t('stitchPattern.preview.notes', 'Notes')}
                 value={pattern.properties.notes}
               />
             )}
           </div>
        </div>
      )}

             {/* Compact properties display */}
       {hasProperties && compact && (
         <div className="space-y-1">
           {pattern.properties?.fabric_behavior && (
             <div className="text-xs text-gray-600">
               <span className="font-medium">
                 {t('stitchPattern.preview.fabricBehavior', 'Fabric Behavior')}:
               </span>{' '}
               {pattern.properties.fabric_behavior}
             </div>
           )}
           {pattern.properties?.texture_description && (
             <div className="text-xs text-gray-600">
               <span className="font-medium">
                 {t('stitchPattern.preview.texture', 'Texture')}:
               </span>{' '}
               {pattern.properties.texture_description}
             </div>
           )}
         </div>
       )}
    </div>
  );
}

/**
 * Individual property item component
 */
interface PropertyItemProps {
  label: string;
  value: string;
}

function PropertyItem({ label, value }: PropertyItemProps) {
  return (
    <div className="flex justify-between items-start text-sm">
      <span className="font-medium text-gray-700 mr-2">{label}:</span>
      <span className="text-gray-600 text-right flex-1">{value}</span>
    </div>
  );
} 