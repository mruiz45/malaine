'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DocumentTextIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { 
  StructuredPatternText, 
  PatternTextParseResult,
  OriginalPatternGauge,
  OriginalPatternValues
} from '@/types/pattern-resizer';
import { MeasurementUnit } from '@/types/gauge';
import { 
  parsePatternText, 
  validatePatternTextInput, 
  formatPatternTextParseResult 
} from '@/services/patternResizerService';
import { getExampleTextForTemplate } from '@/utils/pattern-text-parser';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PatternTextParserProps {
  /** Selected template key */
  templateKey: string;
  /** Current unit preference */
  unit: MeasurementUnit;
  /** Callback when parsing is successful */
  onParseSuccess: (
    originalGauge: OriginalPatternGauge,
    originalPatternValues: OriginalPatternValues
  ) => void;
  /** Callback when unit changes */
  onUnitChange: (unit: MeasurementUnit) => void;
  /** Whether the parser is disabled */
  disabled?: boolean;
}

/**
 * Pattern Text Parser Component (US 10.2)
 * Allows users to paste structured pattern text and extract numerical values
 */
export default function PatternTextParser({
  templateKey,
  unit,
  onParseSuccess,
  onUnitChange,
  disabled = false
}: PatternTextParserProps) {
  const { t } = useTranslation();
  
  // State
  const [patternText, setPatternText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<PatternTextParseResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showExample, setShowExample] = useState(false);

  // Reset when template changes
  useEffect(() => {
    setPatternText('');
    setParseResult(null);
    setErrors([]);
    setShowExample(false);
  }, [templateKey]);

  /**
   * Handle text input change
   */
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPatternText(event.target.value);
    setParseResult(null);
    setErrors([]);
  };

  /**
   * Handle unit toggle
   */
  const handleUnitToggle = () => {
    const newUnit: MeasurementUnit = unit === 'cm' ? 'inch' : 'cm';
    onUnitChange(newUnit);
  };

  /**
   * Handle parse button click
   */
  const handleParse = async () => {
    if (disabled) return;

    // Validate input
    const input: StructuredPatternText = {
      text: patternText,
      template_key: templateKey,
      unit: unit
    };

    const validation = validatePatternTextInput(input);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsParsing(true);
    setErrors([]);

    try {
      const result = await parsePatternText(input);
      setParseResult(result);

      if (result.success && result.data) {
        // Extract parsed data
        const originalGauge: OriginalPatternGauge = {
          original_gauge_stitches: result.data.original_gauge?.original_gauge_stitches || 0,
          original_gauge_rows: result.data.original_gauge?.original_gauge_rows || 0,
          original_gauge_unit: result.data.original_gauge?.original_gauge_unit || unit,
          original_swatch_width: result.data.original_gauge?.original_swatch_width || 10,
          original_swatch_height: result.data.original_gauge?.original_swatch_height || 10
        };

        const originalPatternValues: OriginalPatternValues = result.data.original_pattern_values || {};

        // Call success callback
        onParseSuccess(originalGauge, originalPatternValues);
      } else {
        setErrors([result.error || 'Parsing failed']);
      }

    } catch (error) {
      console.error('Parse error:', error);
      setErrors([error instanceof Error ? error.message : 'Unknown error occurred']);
    } finally {
      setIsParsing(false);
    }
  };

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    setPatternText('');
    setParseResult(null);
    setErrors([]);
  };

  /**
   * Handle show example
   */
  const handleShowExample = () => {
    const exampleText = getExampleTextForTemplate(templateKey, unit);
    setPatternText(exampleText);
    setShowExample(true);
    setParseResult(null);
    setErrors([]);
  };

  /**
   * Get formatted parse result
   */
  const formattedResult = parseResult ? formatPatternTextParseResult(parseResult) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            {t('tools.pattern_resizer.text_parser.title', 'Import from Text')}
          </h3>
        </div>
        
        {/* Unit Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {t('tools.pattern_resizer.text_parser.unit', 'Unit:')}
          </span>
          <button
            type="button"
            onClick={handleUnitToggle}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              unit === 'cm' ? 'bg-blue-600' : 'bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                unit === 'cm' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {unit === 'cm' ? 'cm' : 'inch'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="mb-2">
              {t('tools.pattern_resizer.text_parser.description', 
                'Paste your pattern text using the structured format below. The parser will extract gauge and measurement values automatically.')}
            </p>
            <button
              type="button"
              onClick={handleShowExample}
              disabled={disabled}
              className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium"
            >
              <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
              {t('tools.pattern_resizer.text_parser.show_example', 'Show Example Format')}
            </button>
          </div>
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label htmlFor="pattern-text" className="block text-sm font-medium text-gray-700">
          {t('tools.pattern_resizer.text_parser.text_label', 'Pattern Text')}
        </label>
        <textarea
          id="pattern-text"
          value={patternText}
          onChange={handleTextChange}
          disabled={disabled}
          rows={12}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm"
          placeholder={t('tools.pattern_resizer.text_parser.placeholder', 
            'Paste your structured pattern text here...\n\nExample:\nPATTERN_NAME: My Pattern\nORIGINAL_GAUGE_STITCHES_PER_10CM: 20\nORIGINAL_GAUGE_ROWS_PER_10CM: 28\n...')}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={handleParse}
          disabled={disabled || isParsing || !patternText.trim()}
          className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isParsing ? (
            <>
              <LoadingSpinner size="sm" color="white" className="mr-2" />
              {t('tools.pattern_resizer.text_parser.parsing', 'Parsing...')}
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              {t('tools.pattern_resizer.text_parser.parse_button', 'Parse Text')}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled || !patternText}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('tools.pattern_resizer.text_parser.clear_button', 'Clear')}
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">
                {t('tools.pattern_resizer.text_parser.parse_errors', 'Parsing Errors')}
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Parse Result */}
      {formattedResult && formattedResult.hasData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                {t('tools.pattern_resizer.text_parser.parse_success', 'Parsing Successful')}
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                {formattedResult.patternName && (
                  <p>
                    <span className="font-medium">
                      {t('tools.pattern_resizer.text_parser.pattern_name', 'Pattern:')}
                    </span>{' '}
                    {formattedResult.patternName}
                  </p>
                )}
                {formattedResult.gaugeInfo && (
                  <p>
                    <span className="font-medium">
                      {t('tools.pattern_resizer.text_parser.gauge', 'Gauge:')}
                    </span>{' '}
                    {formattedResult.gaugeInfo}
                  </p>
                )}
                <p>
                  <span className="font-medium">
                    {t('tools.pattern_resizer.text_parser.values_found', 'Values found:')}
                  </span>{' '}
                  {formattedResult.valuesCount}
                </p>
                {formattedResult.componentsCount > 0 && (
                  <p>
                    <span className="font-medium">
                      {t('tools.pattern_resizer.text_parser.components_found', 'Components:')}
                    </span>{' '}
                    {formattedResult.componentsCount}
                  </p>
                )}
              </div>
              
              {/* Warnings */}
              {formattedResult.warnings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-1">
                    {t('tools.pattern_resizer.text_parser.warnings', 'Warnings:')}
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    {formattedResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 