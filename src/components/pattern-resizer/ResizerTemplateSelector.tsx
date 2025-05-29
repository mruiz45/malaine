'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatternResizerTemplate } from '@/types/pattern-resizer';
import { getAllTemplates } from '@/utils/pattern-resizer-templates';

interface ResizerTemplateSelectorProps {
  /** Currently selected template key */
  selectedTemplate?: string;
  /** Called when template selection changes */
  onTemplateChange: (templateKey: string) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Error message to display */
  error?: string;
}

/**
 * Component for selecting pattern structure templates in the resizer tool
 * Displays available templates with descriptions and handles selection
 */
export default function ResizerTemplateSelector({
  selectedTemplate,
  onTemplateChange,
  disabled = false,
  error
}: ResizerTemplateSelectorProps) {
  const { t } = useTranslation();
  
  const templates = getAllTemplates();

  const handleTemplateSelect = (templateKey: string) => {
    if (!disabled) {
      onTemplateChange(templateKey);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('tools.pattern_resizer.template_selection')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('tools.pattern_resizer.select_template')}
        </p>
      </div>

      {/* Template Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template: PatternResizerTemplate) => (
          <div
            key={template.template_key}
            className={`
              relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200
              ${selectedTemplate === template.template_key
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => handleTemplateSelect(template.template_key)}
          >
            {/* Selection indicator */}
            {selectedTemplate === template.template_key && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Template content */}
            <div className="pr-8">
              <h4 className="font-medium text-gray-900 mb-2">
                {t(`tools.pattern_resizer.templates.${template.template_key}.name`) || template.display_name}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(`tools.pattern_resizer.templates.${template.template_key}.description`) || template.description}
              </p>
              
              {/* Shaping support indicator */}
              {template.supports_shaping && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Supports Shaping
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help section */}
      {!selectedTemplate && (
        <div className="rounded-md bg-blue-50 p-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {t('tools.pattern_resizer.help.title')}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">{t('tools.pattern_resizer.help.steps.0')}</p>
                <ul className="list-disc list-inside space-y-1">
                  {[1, 2, 3, 4].map(step => (
                    <li key={step}>
                      {t(`tools.pattern_resizer.help.steps.${step}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 