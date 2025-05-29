/**
 * StitchInstructionsView Component
 * Displays detailed step-by-step instructions for stitch patterns (US_8.1)
 * Supports both knitting row instructions and crochet round instructions
 */

'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ClipboardDocumentIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import type { StitchPattern } from '@/types/stitchPattern';
import { 
  formatStitchPatternInstructions,
  hasDetailedInstructions 
} from '@/services/stitchPatternService';

interface StitchInstructionsViewProps {
  /** The stitch pattern to display instructions for */
  pattern: StitchPattern;
  /** Whether to show instructions in expanded state initially */
  expanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component for displaying detailed stitch pattern instructions
 */
export default function StitchInstructionsView({
  pattern,
  expanded = false,
  className = ''
}: StitchInstructionsViewProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(expanded);

  // Check if pattern has instructions
  if (!hasDetailedInstructions(pattern)) {
    return (
      <div className={`text-center py-6 text-gray-500 ${className}`}>
        <ClipboardDocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">
          {t('stitchInstructions.noInstructions', 'No detailed instructions available for this pattern')}
        </p>
      </div>
    );
  }

  const formattedInstructions = formatStitchPatternInstructions(pattern.instructions_written);

  const handleCopyInstructions = async () => {
    try {
      let textContent = `${pattern.stitch_name}\n\n`;
      
      if (pattern.description) {
        textContent += `${pattern.description}\n\n`;
      }

      if (formattedInstructions.abbreviation) {
        textContent += `Abbreviation: ${formattedInstructions.abbreviation}\n\n`;
      }

      const stepType = formattedInstructions.type === 'rows' ? 'Row' : 'Round';
      
      formattedInstructions.steps.forEach(step => {
        textContent += `${stepType} ${step.number}: ${step.instruction}`;
        if (step.note) {
          textContent += ` (${step.note})`;
        }
        textContent += '\n';
      });

      if (formattedInstructions.notes) {
        textContent += `\nNotes: ${formattedInstructions.notes}`;
      }

      await navigator.clipboard.writeText(textContent);
      
      // You could add a toast notification here
      console.log('Instructions copied to clipboard');
    } catch (err) {
      console.error('Failed to copy instructions:', err);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById(`instructions-${pattern.id}`);
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${pattern.stitch_name} - Instructions</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .step { margin: 10px 0; padding: 8px; border-left: 3px solid #007bff; }
                .step-number { font-weight: bold; color: #007bff; }
                .note { font-style: italic; color: #666; }
                .notes-section { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-left"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
            <h3 className="text-lg font-medium text-gray-900">
              {t('stitchInstructions.title', 'Instructions')}
            </h3>
          </button>

          {isExpanded && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyInstructions}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title={t('common.copy', 'Copy')}
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                {t('common.copy', 'Copy')}
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title={t('common.print', 'Print')}
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                {t('common.print', 'Print')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Content */}
      {isExpanded && (
        <div id={`instructions-${pattern.id}`} className="p-4">
          {/* Pattern Info */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {pattern.stitch_name}
            </h1>
            {pattern.description && (
              <p className="text-gray-600 mb-3">
                {pattern.description}
              </p>
            )}
            
            {/* Pattern Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Craft Type:</span> {pattern.craft_type}
              </div>
              {pattern.category && (
                <div>
                  <span className="font-medium">Category:</span> {pattern.category}
                </div>
              )}
              {pattern.difficulty_level && (
                <div>
                  <span className="font-medium">Difficulty:</span> {pattern.difficulty_level}
                </div>
              )}
              {pattern.stitch_repeat_width && pattern.stitch_repeat_height && (
                <div>
                  <span className="font-medium">Repeat:</span> {pattern.stitch_repeat_width} sts × {pattern.stitch_repeat_height} rows
                </div>
              )}
            </div>
          </div>

          {/* Abbreviation */}
          {formattedInstructions.abbreviation && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                {t('stitchInstructions.abbreviation', 'Abbreviation')}
              </h4>
              <p className="text-sm text-blue-800">
                {formattedInstructions.abbreviation}
              </p>
            </div>
          )}

          {/* Step-by-step Instructions */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-gray-900">
              {formattedInstructions.type === 'rows' 
                ? t('stitchInstructions.rowByRow', 'Row-by-Row Instructions')
                : t('stitchInstructions.roundByRound', 'Round-by-Round Instructions')
              }
            </h4>

            {formattedInstructions.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">
                    {formattedInstructions.type === 'rows' ? 'Row' : 'Round'} {step.number}:
                  </p>
                  <p className="text-gray-700 mt-1">
                    {step.instruction}
                  </p>
                  {step.note && (
                    <p className="text-sm text-gray-500 italic mt-1">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          {formattedInstructions.notes && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">
                {t('stitchInstructions.notes', 'Notes')}
              </h4>
              <p className="text-sm text-yellow-800">
                {formattedInstructions.notes}
              </p>
            </div>
          )}

          {/* Common Uses */}
          {pattern.common_uses && pattern.common_uses.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                {t('stitchInstructions.commonUses', 'Common Uses')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {pattern.common_uses.map((use, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 