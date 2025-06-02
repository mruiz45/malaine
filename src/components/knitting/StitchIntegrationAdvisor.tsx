/**
 * StitchIntegrationAdvisor Component
 * US_8.2 - Stitch Pattern Integration Advisor Tool
 * Aide les utilisateurs à intégrer des motifs de mailles dans des composants de vêtement
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalculatorIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import type {
  StitchIntegrationRequest,
  StitchIntegrationChoice,
  IntegrationOption,
  ComponentForIntegration,
  StitchPatternForIntegration
} from '@/types/stitch-integration';
import { useStitchIntegration } from '@/hooks/useStitchIntegration';
import { useBasicStitchPatterns } from '@/hooks/useStitchPatterns';

// Import du composant de visualisation (sera créé)
interface StitchRepeatVisualizationProps {
  totalStitches: number;
  repeatWidth: number;
  fullRepeats: number;
  remainingStitches: number;
  edgeStitches: number;
}

// Composant de visualisation temporaire en attendant la résolution de l'import
function StitchRepeatVisualization(props: StitchRepeatVisualizationProps) {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-2">
        {t('stitchIntegration.stitchDistribution', 'Stitch Distribution Visualization')}
      </h4>
      <p className="text-sm text-gray-600">
        Pattern: {props.fullRepeats} repeats × {props.repeatWidth} stitches = {props.fullRepeats * props.repeatWidth} stitches
      </p>
      {props.remainingStitches > 0 && (
        <p className="text-sm text-gray-600">
          Remaining: {props.remainingStitches} stitches for stockinette or adjustment
        </p>
      )}
    </div>
  );
}

interface StitchIntegrationAdvisorProps {
  /** ID de la session de définition de patron */
  sessionId: string;
  /** Composants disponibles pour l'intégration */
  availableComponents: ComponentForIntegration[];
  /** Fonction appelée lors de la fermeture */
  onClose: () => void;
  /** Fonction appelée après une mise à jour réussie */
  onSuccess?: (componentId: string, integration: any) => void;
  /** Mode ouvert en modal ou section intégrée */
  isModal?: boolean;
}

/**
 * Composant principal pour l'outil d'intégration de motifs de mailles
 */
export default function StitchIntegrationAdvisor({
  sessionId,
  availableComponents,
  onClose,
  onSuccess,
  isModal = true
}: StitchIntegrationAdvisorProps) {
  const { t } = useTranslation();
  
  // États locaux
  const [selectedComponentId, setSelectedComponentId] = useState<string>('');
  const [selectedStitchPatternId, setSelectedStitchPatternId] = useState<string>('');
  const [targetStitchCount, setTargetStitchCount] = useState<number>(100);
  const [desiredEdgeStitches, setDesiredEdgeStitches] = useState<number>(2);
  const [selectedOption, setSelectedOption] = useState<IntegrationOption | null>(null);
  const [step, setStep] = useState<'setup' | 'analysis' | 'choice' | 'confirmation'>('setup');

  // Hooks
  const {
    isAnalyzing,
    isUpdating,
    analysisResult,
    error: integrationError,
    analyzeIntegration,
    applyIntegration,
    resetState,
    validateAnalysisRequest,
    hasAnalysis
  } = useStitchIntegration();

  const { patterns: stitchPatterns, isLoading: patternsLoading } = useBasicStitchPatterns();

  // Données dérivées
  const selectedComponent = availableComponents.find(c => c.id === selectedComponentId);
  const selectedStitchPattern = stitchPatterns.find(p => p.id === selectedStitchPatternId);

  // Mise à jour du nombre de mailles cible quand le composant change
  useEffect(() => {
    if (selectedComponent) {
      setTargetStitchCount(selectedComponent.target_stitch_count);
    }
  }, [selectedComponent]);

  // Réinitialisation lors de la fermeture
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  /**
   * Lance l'analyse d'intégration
   */
  const handleAnalyze = useCallback(async () => {
    if (!selectedComponentId || !selectedStitchPatternId) {
      return;
    }

    const request: StitchIntegrationRequest = {
      componentId: selectedComponentId,
      targetStitchCount,
      selectedStitchPatternId,
      desiredEdgeStitches
    };

    const validationError = validateAnalysisRequest(request);
    if (validationError) {
      alert(validationError); // TODO: Utiliser un système de notification plus élégant
      return;
    }

    const result = await analyzeIntegration(request);
    if (result) {
      setStep('analysis');
    }
  }, [selectedComponentId, selectedStitchPatternId, targetStitchCount, desiredEdgeStitches, analyzeIntegration, validateAnalysisRequest]);

  /**
   * Sélectionne une option d'intégration
   */
  const handleSelectOption = useCallback((option: IntegrationOption) => {
    setSelectedOption(option);
    setStep('choice');
  }, []);

  /**
   * Applique l'intégration choisie
   */
  const handleApplyIntegration = useCallback(async () => {
    if (!selectedOption || !selectedStitchPattern || !selectedComponent) {
      return;
    }

    const choice: StitchIntegrationChoice = {
      selectedOption,
      stitchPatternId: selectedStitchPattern.id,
      stitchPatternName: selectedStitchPattern.stitch_name,
      finalStitchCount: selectedOption.totalStitches
    };

    const result = await applyIntegration(sessionId, selectedComponentId, choice);
    if (result && result.success) {
      setStep('confirmation');
      if (onSuccess) {
        onSuccess(selectedComponentId, result.updatedComponent);
      }
    }
  }, [selectedOption, selectedStitchPattern, selectedComponent, sessionId, selectedComponentId, applyIntegration, onSuccess]);

  /**
   * Retour à l'étape de configuration
   */
  const handleBackToSetup = useCallback(() => {
    setStep('setup');
    setSelectedOption(null);
    resetState();
  }, [resetState]);

  /**
   * Fermeture avec réinitialisation
   */
  const handleClose = useCallback(() => {
    resetState();
    setStep('setup');
    setSelectedOption(null);
    onClose();
  }, [resetState, onClose]);

  const containerClasses = isModal 
    ? "fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4" 
    : "w-full";

  const contentClasses = isModal
    ? "w-full max-w-4xl"
    : "w-full";

  const modalClasses = isModal
    ? "bg-white rounded-lg shadow-xl p-6 max-h-screen overflow-y-auto"
    : "bg-white rounded-lg border border-gray-200 p-6";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className={modalClasses}>
          {/* En-tête */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <SparklesIcon className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {t('stitchIntegration.title', 'Stitch Pattern Integration Advisor')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('stitchIntegration.subtitle', 'Plan how your stitch pattern fits into your garment component')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu selon l'étape */}
          <div className="mt-6">
            {step === 'setup' && (
              <SetupStep
                availableComponents={availableComponents}
                stitchPatterns={stitchPatterns}
                patternsLoading={patternsLoading}
                selectedComponentId={selectedComponentId}
                selectedStitchPatternId={selectedStitchPatternId}
                targetStitchCount={targetStitchCount}
                desiredEdgeStitches={desiredEdgeStitches}
                onComponentSelect={setSelectedComponentId}
                onStitchPatternSelect={setSelectedStitchPatternId}
                onTargetStitchCountChange={setTargetStitchCount}
                onEdgeStitchesChange={setDesiredEdgeStitches}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                error={integrationError}
              />
            )}

            {step === 'analysis' && analysisResult && (
              <AnalysisStep
                analysis={analysisResult}
                stitchPattern={selectedStitchPattern}
                component={selectedComponent}
                onSelectOption={handleSelectOption}
                onBack={handleBackToSetup}
              />
            )}

            {step === 'choice' && selectedOption && (
              <ChoiceStep
                option={selectedOption}
                stitchPattern={selectedStitchPattern}
                component={selectedComponent}
                onApply={handleApplyIntegration}
                onBack={() => setStep('analysis')}
                isApplying={isUpdating}
              />
            )}

            {step === 'confirmation' && (
              <ConfirmationStep
                component={selectedComponent}
                stitchPattern={selectedStitchPattern}
                appliedOption={selectedOption}
                onClose={handleClose}
                onNewIntegration={handleBackToSetup}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Étape 1: Configuration initiale
 */
interface SetupStepProps {
  availableComponents: ComponentForIntegration[];
  stitchPatterns: any[];
  patternsLoading: boolean;
  selectedComponentId: string;
  selectedStitchPatternId: string;
  targetStitchCount: number;
  desiredEdgeStitches: number;
  onComponentSelect: (id: string) => void;
  onStitchPatternSelect: (id: string) => void;
  onTargetStitchCountChange: (count: number) => void;
  onEdgeStitchesChange: (count: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  error: string | null;
}

function SetupStep({
  availableComponents,
  stitchPatterns,
  patternsLoading,
  selectedComponentId,
  selectedStitchPatternId,
  targetStitchCount,
  desiredEdgeStitches,
  onComponentSelect,
  onStitchPatternSelect,
  onTargetStitchCountChange,
  onEdgeStitchesChange,
  onAnalyze,
  isAnalyzing,
  error
}: SetupStepProps) {
  const { t } = useTranslation();

  const canAnalyze = selectedComponentId && selectedStitchPatternId && targetStitchCount > 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                {t('stitchIntegration.error', 'Integration Error')}
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sélection du composant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('stitchIntegration.selectComponent', 'Select Garment Component')}
        </label>
        <select
          value={selectedComponentId}
          onChange={(e) => onComponentSelect(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">
            {t('stitchIntegration.chooseComponent', 'Choose a component...')}
          </option>
          {availableComponents.map((component) => (
            <option key={component.id} value={component.id}>
              {component.name} ({component.target_stitch_count} stitches)
            </option>
          ))}
        </select>
      </div>

      {/* Sélection du motif */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('stitchIntegration.selectPattern', 'Select Stitch Pattern')}
        </label>
        {patternsLoading ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
        ) : (
          <select
            value={selectedStitchPatternId}
            onChange={(e) => onStitchPatternSelect(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              {t('stitchIntegration.choosePattern', 'Choose a stitch pattern...')}
            </option>
            {stitchPatterns.map((pattern) => (
              <option key={pattern.id} value={pattern.id}>
                {pattern.stitch_name} ({pattern.stitch_repeat_width} st repeat)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Paramètres d'intégration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchIntegration.targetStitchCount', 'Target Stitch Count')}
          </label>
          <input
            type="number"
            min="1"
            value={targetStitchCount}
            onChange={(e) => onTargetStitchCountChange(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('stitchIntegration.edgeStitches', 'Edge Stitches (each side)')}
          </label>
          <input
            type="number"
            min="0"
            value={desiredEdgeStitches}
            onChange={(e) => onEdgeStitchesChange(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bouton d'analyse */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze || isAnalyzing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              {t('stitchIntegration.analyzing', 'Analyzing...')}
            </>
          ) : (
            <>
              <CalculatorIcon className="h-4 w-4 mr-2" />
              {t('stitchIntegration.analyze', 'Analyze Integration')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Étape 2: Résultats d'analyse
 */
interface AnalysisStepProps {
  analysis: any;
  stitchPattern: any;
  component: ComponentForIntegration | undefined;
  onSelectOption: (option: IntegrationOption) => void;
  onBack: () => void;
}

function AnalysisStep({
  analysis,
  stitchPattern,
  component,
  onSelectOption,
  onBack
}: AnalysisStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Résumé de l'analyse */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          {t('stitchIntegration.analysisResults', 'Analysis Results')}
        </h3>
        <div className="text-sm text-blue-800">
          <p>
            <strong>{analysis.fullRepeats}</strong> complete repeats of "{stitchPattern?.stitch_name}" 
            will fit, using <strong>{analysis.stitchesUsedByRepeats}</strong> stitches.
          </p>
          {analysis.remainingStitches > 0 && (
            <p className="mt-1">
              <strong>{analysis.remainingStitches}</strong> stitches remaining to handle.
            </p>
          )}
        </div>
      </div>

      {/* Visualisation */}
      <StitchRepeatVisualization
        totalStitches={component?.target_stitch_count || 0}
        repeatWidth={stitchPattern?.stitch_repeat_width || 0}
        fullRepeats={analysis.fullRepeats}
        remainingStitches={analysis.remainingStitches}
        edgeStitches={analysis.edgeStitches || 0}
      />

      {/* Options d'intégration */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          {t('stitchIntegration.integrationOptions', 'Integration Options')}
        </h3>
        <div className="space-y-3">
          {analysis.options.map((option: IntegrationOption, index: number) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => onSelectOption(option)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {option.description}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Total: {option.totalStitches} stitches
                  </p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.back', 'Back')}
        </button>
      </div>
    </div>
  );
}

/**
 * Étape 3: Confirmation du choix
 */
interface ChoiceStepProps {
  option: IntegrationOption;
  stitchPattern: any;
  component: ComponentForIntegration | undefined;
  onApply: () => void;
  onBack: () => void;
  isApplying: boolean;
}

function ChoiceStep({
  option,
  stitchPattern,
  component,
  onApply,
  onBack,
  isApplying
}: ChoiceStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">
          {t('stitchIntegration.selectedOption', 'Selected Option')}
        </h3>
        <p className="text-sm text-green-800">{option.description}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          {t('stitchIntegration.integrationSummary', 'Integration Summary')}
        </h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('stitchIntegration.component', 'Component')}
            </dt>
            <dd className="text-sm text-gray-900">{component?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('stitchIntegration.pattern', 'Pattern')}
            </dt>
            <dd className="text-sm text-gray-900">{stitchPattern?.stitch_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('stitchIntegration.finalStitchCount', 'Final Stitch Count')}
            </dt>
            <dd className="text-sm text-gray-900">{option.totalStitches}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {t('stitchIntegration.edgeStitches', 'Edge Stitches')}
            </dt>
            <dd className="text-sm text-gray-900">{option.edgeStitchesEachSide || 0} each side</dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.back', 'Back')}
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isApplying}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isApplying ? (
            <>
              <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              {t('stitchIntegration.applying', 'Applying...')}
            </>
          ) : (
            <>
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {t('stitchIntegration.applyIntegration', 'Apply Integration')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Étape 4: Confirmation finale
 */
interface ConfirmationStepProps {
  component: ComponentForIntegration | undefined;
  stitchPattern: any;
  appliedOption: IntegrationOption | null;
  onClose: () => void;
  onNewIntegration: () => void;
}

function ConfirmationStep({
  component,
  stitchPattern,
  appliedOption,
  onClose,
  onNewIntegration
}: ConfirmationStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckCircleIcon className="h-6 w-6 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          {t('stitchIntegration.integrationComplete', 'Integration Complete!')}
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          {t('stitchIntegration.successMessage', 'The stitch pattern has been successfully integrated into your component.')}
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('stitchIntegration.appliedIntegration', 'Applied Integration')}
        </h4>
        <p className="text-sm text-gray-700">
          {appliedOption?.description}
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={onNewIntegration}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('stitchIntegration.newIntegration', 'New Integration')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {t('common.close', 'Close')}
        </button>
      </div>
    </div>
  );
} 