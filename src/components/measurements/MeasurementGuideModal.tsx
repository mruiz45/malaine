'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { MeasurementGuideModalProps } from '@/types/measurements';

/**
 * MeasurementGuideModal Component
 * 
 * Displays a modal with detailed instructions and visual guide for taking
 * a specific body measurement. Includes an illustration/diagram and clear
 * textual instructions.
 * 
 * US 3.1: Body Measurement Guide Tool
 * 
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Callback function to close the modal
 * @param measurementKey - The key of the measurement to show guide for
 * @param guide - The measurement guide data from the database
 */
export default function MeasurementGuideModal({
  isOpen,
  onClose,
  measurementKey,
  guide
}: MeasurementGuideModalProps) {
  const { t } = useTranslation();

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Get fallback content from translations if guide is not available
  const title = guide?.title || t(`measurements.fields.${measurementKey}`);
  const description = guide?.description || t(`measurements.fields.${measurementKey}_description`);
  const imageUrl = guide?.image_url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="measurement-guide-title"
      aria-describedby="measurement-guide-description"
    >
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            id="measurement-guide-title"
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label={t('measurements.form.cancel')}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Image/Diagram */}
          {imageUrl && (
            <div className="mb-6 flex justify-center">
              <div className="relative w-full max-w-md">
                <img
                  src={imageUrl}
                  alt={`How to measure ${title}`}
                  className="w-full h-auto rounded-lg border border-gray-200"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('measurements.guide.instructions_title', 'How to Measure')}
            </h3>
            <div 
              id="measurement-guide-description"
              className="text-gray-700 leading-relaxed whitespace-pre-line"
            >
              {description}
            </div>
          </div>

          {/* Tips section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {t('measurements.guide.tips_title', 'Tips for Accurate Measurement')}
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('measurements.guide.tip_1', 'Use a flexible measuring tape')}</li>
              <li>• {t('measurements.guide.tip_2', 'Keep the tape snug but not tight')}</li>
              <li>• {t('measurements.guide.tip_3', 'Stand in a natural, relaxed position')}</li>
              <li>• {t('measurements.guide.tip_4', 'Take measurements over fitted clothing or undergarments')}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('measurements.form.cancel', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
} 