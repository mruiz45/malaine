'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface MeasurementFieldProps {
  id: string;
  label: string;
  description: string;
  value: number | string | undefined;
  unit: 'cm' | 'inches';
  type: 'numeric' | 'text'; // Pour la pointure qui est un string
  isRequired?: boolean;
  onChange: (value: number | string | undefined) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  className?: string;
}

// Fonctions utilitaires pour conversion
function convertCmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

function convertInchesToCm(inches: number): number {
  return Math.round((inches * 2.54) * 10) / 10;
}

function validateNumericValue(value: number | undefined, isRequired: boolean, t: (key: string) => string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (isRequired && (value === undefined || value === null)) {
    errors.push(t('measurement_validation_required'));
  }
  
  if (value !== undefined && value !== null) {
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(t('measurement_validation_invalid_number'));
    } else if (value <= 0) {
      errors.push(t('measurement_validation_positive'));
    } else if (value > 500) {
      errors.push(t('measurement_validation_too_high'));
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default function MeasurementField({
  id,
  label,
  description,
  value,
  unit,
  type,
  isRequired = false,
  onChange,
  onValidation,
  className = ''
}: MeasurementFieldProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [localValue, setLocalValue] = useState<string>('');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Synchronisation avec la valeur externe
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    } else {
      setLocalValue('');
    }
  }, [value]);

  // Conversion et affichage selon l'unité
  const getDisplayValue = () => {
    if (type === 'text' || !localValue || localValue === '') {
      return localValue;
    }
    
    const numValue = parseFloat(localValue);
    if (isNaN(numValue)) return localValue;
    
    // Si la valeur stockée est en cm et qu'on affiche en pouces
    if (unit === 'inches') {
      return convertCmToInches(numValue).toString();
    }
    
    return localValue;
  };

  const handleValueChange = (inputValue: string) => {
    setLocalValue(inputValue);
    
    if (inputValue === '') {
      onChange(undefined);
      const validation = validateNumericValue(undefined, isRequired, t);
      setIsValid(validation.isValid);
      setErrors(validation.errors);
      onValidation?.(validation.isValid, validation.errors);
      return;
    }

    if (type === 'text') {
      onChange(inputValue);
      setIsValid(true);
      setErrors([]);
      onValidation?.(true, []);
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      const validation = validateNumericValue(undefined, isRequired, t);
      setIsValid(false);
      setErrors([t('measurement_validation_invalid_number')]);
      onValidation?.(false, [t('measurement_validation_invalid_number')]);
      return;
    }

    // Conversion vers cm si nécessaire
    const valueInCm = unit === 'inches' ? convertInchesToCm(numValue) : numValue;
    onChange(valueInCm);
    
    // Validation
    const validation = validateNumericValue(valueInCm, isRequired, t);
    setIsValid(validation.isValid);
    setErrors(validation.errors);
    onValidation?.(validation.isValid, validation.errors);
  };

  if (!isClient) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type === 'numeric' ? 'number' : 'text'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder={type === 'numeric' ? `En ${unit}` : 'Ex: 38, 7.5'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-500 hover:text-blue-700 text-sm"
          aria-label={`${t('help_for')} ${label}`}
        >
          ?
        </button>
      </div>
      
      {showHelp && (
        <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
          {description}
        </div>
      )}
      
      <div className="relative">
        <input
          id={id}
          type={type === 'numeric' ? 'number' : 'text'}
          value={getDisplayValue()}
          onChange={(e) => handleValueChange(e.target.value)}
          step={type === 'numeric' ? '0.1' : undefined}
          min={type === 'numeric' ? '0' : undefined}
          max={type === 'numeric' ? '500' : undefined}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isValid ? 'border-gray-300' : 'border-red-300 bg-red-50'
          }`}
          placeholder={
            type === 'numeric' 
              ? `${t('in')} ${unit}` 
              : t('measurement_shoe_size_help')
          }
          aria-describedby={!isValid ? `${id}-error` : undefined}
        />
        
        {type === 'numeric' && localValue && !isNaN(parseFloat(localValue)) && (
          <div className="absolute right-3 top-2 text-sm text-gray-500">
            {unit === 'cm' ? t('measurement_unit_cm') : t('measurement_unit_inches')}
            {unit === 'inches' && ` (${convertInchesToCm(parseFloat(getDisplayValue()))} ${t('measurement_unit_cm')})`}
            {unit === 'cm' && ` (${convertCmToInches(parseFloat(localValue))} ${t('measurement_unit_inches')})`}
          </div>
        )}
      </div>
      
      {!isValid && errors.length > 0 && (
        <div id={`${id}-error`} className="text-sm text-red-600">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
} 