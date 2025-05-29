/**
 * Measurements Section Component (US_9.1)
 * Displays finished garment measurements
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FinishedMeasurements } from '@/types/assembled-pattern';

interface MeasurementsSectionProps {
  /** Finished measurements */
  measurements: FinishedMeasurements;
  /** Whether in print mode */
  printMode?: boolean;
  /** Section ID for navigation */
  id?: string;
}

/**
 * Component for displaying finished measurements
 */
export default function MeasurementsSection({
  measurements,
  printMode = false,
  id
}: MeasurementsSectionProps) {
  const { t } = useTranslation();

  // Convert measurements object to array for easier display
  const measurementEntries = Object.entries(measurements).filter(([_, value]) => value !== undefined);

  if (measurementEntries.length === 0) {
    return null;
  }

  // Map measurement keys to display labels
  const measurementLabels: Record<string, string> = {
    chest: t('patternViewer.measurements.chest', 'Chest/Bust'),
    length: t('patternViewer.measurements.length', 'Length'),
    waist: t('patternViewer.measurements.waist', 'Waist'),
    hips: t('patternViewer.measurements.hips', 'Hips'),
    shoulder_width: t('patternViewer.measurements.shoulderWidth', 'Shoulder Width'),
    arm_length: t('patternViewer.measurements.armLength', 'Arm Length'),
    upper_arm: t('patternViewer.measurements.upperArm', 'Upper Arm'),
    neck: t('patternViewer.measurements.neck', 'Neck')
  };

  return (
    <section id={id} className="space-y-6">
      {/* Section Title */}
      <h2 className={`font-bold text-gray-900 border-b border-gray-200 pb-2 ${
        printMode ? 'text-xl' : 'text-lg'
      }`}>
        {t('patternViewer.sections.measurements', 'Finished Measurements')}
      </h2>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {measurementEntries.map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-3 bg-white rounded-md">
              <span className="font-medium text-green-900">
                {measurementLabels[key] || key}:
              </span>
              <span className="text-green-800 font-semibold">
                {value}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-green-800">
          <p className="font-medium">
            📏 {t('patternViewer.measurementsNote', 'These are the finished garment measurements including ease.')}
          </p>
        </div>
      </div>
    </section>
  );
} 