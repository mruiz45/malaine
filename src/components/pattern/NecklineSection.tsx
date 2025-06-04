'use client';

import React from 'react';
import { usePattern } from '@/hooks/usePattern';
import NecklineSelector from '@/components/knitting/NecklineSelector';
import { NecklineStyle, NecklineParameters } from '@/types/neckline';

/**
 * Neckline Section Component
 * Provides UI for neckline type selection with integration to pattern state
 * Used in the pattern designer for PD_PH2_US003 implementation
 */
export const NecklineSection: React.FC = () => {
  const { state, updateNeckline } = usePattern();
  const { neckline, garmentType } = state;

  // Convert pattern state to NecklineSelector format
  const selectedNecklineStyle = neckline.necklineType as NecklineStyle | undefined;
  const selectedNecklineParameters: NecklineParameters = {
    depth_cm: neckline.necklineDepth || undefined,
    width_at_center_cm: neckline.necklineWidth || undefined,
  };

  // Handle neckline style selection
  const handleNecklineStyleSelect = (style: NecklineStyle, defaultParameters: NecklineParameters) => {
    updateNeckline({
      necklineType: style,
      necklineDepth: defaultParameters.depth_cm || null,
      necklineWidth: defaultParameters.width_at_center_cm || defaultParameters.width_at_shoulder_cm || null,
    });
  };

  // Handle neckline parameters update
  const handleNecklineParametersUpdate = (parameters: NecklineParameters) => {
    updateNeckline({
      necklineDepth: parameters.depth_cm || null,
      necklineWidth: parameters.width_at_center_cm || parameters.width_at_shoulder_cm || null,
    });
  };

  // Only show neckline section for relevant garment types
  const supportsNeckline = garmentType && ['sweater', 'cardigan', 'vest'].includes(garmentType);

  if (!supportsNeckline) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600 text-center">
          Neckline options are not available for the selected garment type.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <NecklineSelector
          selectedGarmentTypeId={garmentType}
          selectedConstructionMethod="set_in_sleeve" // Default for now, could be made dynamic later
          selectedNecklineStyle={selectedNecklineStyle}
          selectedNecklineParameters={selectedNecklineParameters}
          onNecklineStyleSelect={handleNecklineStyleSelect}
          onNecklineParametersUpdate={handleNecklineParametersUpdate}
          disabled={false}
          isLoading={false}
        />
      </div>
    </div>
  );
}; 