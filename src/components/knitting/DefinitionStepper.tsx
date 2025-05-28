'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import {
  BeakerIcon,
  UserIcon,
  ArrowsRightLeftIcon,
  SparklesIcon,
  Square3Stack3DIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  HandRaisedIcon,
  SwatchIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import {
  BeakerIcon as BeakerIconSolid,
  UserIcon as UserIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  SparklesIcon as SparklesIconSolid,
  Square3Stack3DIcon as Square3Stack3DIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  RectangleStackIcon as RectangleStackIconSolid,
  HandRaisedIcon as HandRaisedIconSolid,
  SwatchIcon as SwatchIconSolid,
  Squares2X2Icon as Squares2X2IconSolid
} from '@heroicons/react/24/solid';
import { DefinitionStep } from '@/types/patternDefinition';

/**
 * Step configuration with icons and labels
 */
const STEP_CONFIG: Record<DefinitionStep, {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
}> = {
  'garment-type': {
    icon: SwatchIcon,
    iconSolid: SwatchIconSolid,
    label: 'Garment Type',
    color: 'teal'
  },
  gauge: {
    icon: BeakerIcon,
    iconSolid: BeakerIconSolid,
    label: 'Gauge',
    color: 'blue'
  },
  measurements: {
    icon: UserIcon,
    iconSolid: UserIconSolid,
    label: 'Measurements',
    color: 'green'
  },
  ease: {
    icon: ArrowsRightLeftIcon,
    iconSolid: ArrowsRightLeftIconSolid,
    label: 'Ease',
    color: 'purple'
  },
  yarn: {
    icon: SparklesIcon,
    iconSolid: SparklesIconSolid,
    label: 'Yarn',
    color: 'orange'
  },
  'stitch-pattern': {
    icon: Square3Stack3DIcon,
    iconSolid: Square3Stack3DIconSolid,
    label: 'Stitch Pattern',
    color: 'indigo'
  },
  'garment-structure': {
    icon: Squares2X2Icon,
    iconSolid: Squares2X2IconSolid,
    label: 'Garment Structure',
    color: 'emerald'
  },
  neckline: {
    icon: RectangleStackIcon,
    iconSolid: RectangleStackIconSolid,
    label: 'Neckline',
    color: 'pink'
  },
  sleeves: {
    icon: HandRaisedIcon,
    iconSolid: HandRaisedIconSolid,
    label: 'Sleeves',
    color: 'red'
  },
  summary: {
    icon: DocumentTextIcon,
    iconSolid: DocumentTextIconSolid,
    label: 'Summary',
    color: 'gray'
  }
};

/**
 * Definition Stepper Component
 * Visual progress indicator for pattern definition steps
 */
export default function DefinitionStepper() {
  const { t } = useTranslation();
  const { navigation, navigateToStep } = usePatternDefinition();

  const { currentStep, availableSteps, completedSteps } = navigation;

  /**
   * Get step status
   */
  const getStepStatus = (step: DefinitionStep): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(step)) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  /**
   * Get step classes
   */
  const getStepClasses = (step: DefinitionStep, status: string) => {
    const config = STEP_CONFIG[step];
    const baseClasses = 'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-${config.color}-600 border-${config.color}-600 text-white`;
      case 'current':
        return `${baseClasses} bg-white border-${config.color}-600 text-${config.color}-600 ring-4 ring-${config.color}-100`;
      default:
        return `${baseClasses} bg-gray-100 border-gray-300 text-gray-400`;
    }
  };

  /**
   * Get connector classes
   */
  const getConnectorClasses = (stepIndex: number) => {
    const nextStep = availableSteps[stepIndex + 1];
    if (!nextStep) return '';
    
    const nextStatus = getStepStatus(nextStep);
    const isCompleted = nextStatus === 'completed' || nextStatus === 'current';
    
    return `flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-6">
        {t('patternDefinition.progress', 'Pattern Definition Progress')}
      </h3>
      
      <div className="flex items-center">
        {availableSteps.map((step, index) => {
          const status = getStepStatus(step);
          const config = STEP_CONFIG[step];
          const Icon = status === 'completed' ? config.iconSolid : config.icon;
          
          return (
            <React.Fragment key={step}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => navigateToStep(step)}
                  className={`${getStepClasses(step, status)} hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  title={t(`patternDefinition.steps.${step}.label`, config.label)}
                >
                  <Icon className="w-5 h-5" />
                </button>
                <span className={`mt-2 text-xs font-medium ${
                  status === 'current' ? `text-${config.color}-600` :
                  status === 'completed' ? 'text-gray-900' :
                  'text-gray-500'
                }`}>
                  {t(`patternDefinition.steps.${step}.label`, config.label)}
                </span>
              </div>
              
              {/* Connector */}
              {index < availableSteps.length - 1 && (
                <div className={getConnectorClasses(index)} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress percentage */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{t('patternDefinition.completed', 'Completed')}</span>
          <span>{Math.round((completedSteps.length / availableSteps.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / availableSteps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
} 