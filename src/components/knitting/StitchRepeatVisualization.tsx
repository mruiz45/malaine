/**
 * StitchRepeatVisualization Component
 * US_8.2 FR4 - Aide visuelle pour la visualisation des répétitions de motifs
 * Affiche une représentation visuelle des répétitions de motifs dans un composant
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface StitchRepeatVisualizationProps {
  /** Nombre total de mailles pour le composant */
  totalStitches: number;
  /** Largeur d'une répétition du motif */
  repeatWidth: number;
  /** Nombre de répétitions complètes */
  fullRepeats: number;
  /** Mailles restantes après les répétitions complètes */
  remainingStitches: number;
  /** Mailles de lisière de chaque côté */
  edgeStitches: number;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Composant de visualisation des répétitions de motifs
 * Affiche une barre segmentée montrant la répartition des mailles
 */
export default function StitchRepeatVisualization({
  totalStitches,
  repeatWidth,
  fullRepeats,
  remainingStitches,
  edgeStitches,
  className = ''
}: StitchRepeatVisualizationProps) {
  const { t } = useTranslation();

  // Calculs pour la visualisation
  const patternStitches = fullRepeats * repeatWidth;
  const stockinetteStitches = remainingStitches;
  const totalEdgeStitches = edgeStitches * 2;
  
  // Vérification de cohérence
  const calculatedTotal = totalEdgeStitches + patternStitches + stockinetteStitches;
  const isValid = calculatedTotal === totalStitches && totalStitches > 0;

  if (!isValid || totalStitches === 0) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600 text-center">
          {t('stitchIntegration.visualizationUnavailable', 'Visualization unavailable for current parameters')}
        </p>
      </div>
    );
  }

  // Calcul des pourcentages pour les segments
  const edgeLeftPercent = totalEdgeStitches > 0 ? (edgeStitches / totalStitches) * 100 : 0;
  const patternPercent = (patternStitches / totalStitches) * 100;
  const stockinetteLeftPercent = stockinetteStitches > 0 ? (Math.floor(stockinetteStitches / 2) / totalStitches) * 100 : 0;
  const stockinetteRightPercent = stockinetteStitches > 0 ? (Math.ceil(stockinetteStitches / 2) / totalStitches) * 100 : 0;
  const edgeRightPercent = edgeLeftPercent;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Titre */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {t('stitchIntegration.stitchDistribution', 'Stitch Distribution Visualization')}
        </h4>
        <p className="text-xs text-gray-600">
          {t('stitchIntegration.visualizationHelp', 'This shows how your stitches will be distributed across the component width')}
        </p>
      </div>

      {/* Barre de visualisation */}
      <div className="relative">
        {/* Barre principale */}
        <div className="flex h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          {/* Lisière gauche */}
          {edgeStitches > 0 && (
            <div 
              className="bg-yellow-400 flex items-center justify-center text-xs font-medium text-yellow-800"
              style={{ width: `${edgeLeftPercent}%` }}
              title={`${edgeStitches} edge stitches (left)`}
            >
              {edgeStitches > 0 && edgeLeftPercent > 8 && 'E'}
            </div>
          )}

          {/* Stockinette gauche */}
          {stockinetteLeftPercent > 0 && (
            <div 
              className="bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-800"
              style={{ width: `${stockinetteLeftPercent}%` }}
              title={`${Math.floor(stockinetteStitches / 2)} stockinette stitches (left)`}
            >
              {stockinetteLeftPercent > 5 && 'St'}
            </div>
          )}

          {/* Motif principal */}
          <div 
            className="bg-green-400 flex items-center justify-center text-xs font-medium text-green-800 relative"
            style={{ width: `${patternPercent}%` }}
            title={`${fullRepeats} repeats × ${repeatWidth} stitches = ${patternStitches} stitches`}
          >
            {/* Divisions des répétitions */}
            {fullRepeats > 1 && (
              <div className="absolute inset-0 flex">
                {Array.from({ length: fullRepeats - 1 }).map((_, index) => (
                  <div 
                    key={index}
                    className="border-r border-green-600 opacity-50"
                    style={{ width: `${100 / fullRepeats}%` }}
                  />
                ))}
              </div>
            )}
            {patternPercent > 15 && (
              <span className="relative z-10">
                {fullRepeats} × {repeatWidth}
              </span>
            )}
          </div>

          {/* Stockinette droite */}
          {stockinetteRightPercent > 0 && (
            <div 
              className="bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-800"
              style={{ width: `${stockinetteRightPercent}%` }}
              title={`${Math.ceil(stockinetteStitches / 2)} stockinette stitches (right)`}
            >
              {stockinetteRightPercent > 5 && 'St'}
            </div>
          )}

          {/* Lisière droite */}
          {edgeStitches > 0 && (
            <div 
              className="bg-yellow-400 flex items-center justify-center text-xs font-medium text-yellow-800"
              style={{ width: `${edgeRightPercent}%` }}
              title={`${edgeStitches} edge stitches (right)`}
            >
              {edgeStitches > 0 && edgeRightPercent > 8 && 'E'}
            </div>
          )}
        </div>

        {/* Étiquettes */}
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex justify-between items-center">
            <span>0</span>
            <span className="font-medium">{totalStitches} stitches total</span>
            <span>{totalStitches}</span>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {edgeStitches > 0 && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
            <span>{t('stitchIntegration.edgeStitches', 'Edge Stitches')} ({edgeStitches} × 2)</span>
          </div>
        )}
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded mr-2"></div>
          <span>{t('stitchIntegration.patternRepeats', 'Pattern Repeats')} ({fullRepeats} × {repeatWidth})</span>
        </div>
        {stockinetteStitches > 0 && (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-200 rounded mr-2"></div>
            <span>{t('stitchIntegration.stockinette', 'Stockinette')} ({stockinetteStitches})</span>
          </div>
        )}
      </div>

      {/* Détails calculatoires */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <h5 className="text-xs font-medium text-gray-900 mb-2">
          {t('stitchIntegration.calculationDetails', 'Calculation Details')}
        </h5>
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>{t('stitchIntegration.totalStitches', 'Total stitches')}:</span>
            <span className="font-medium">{totalStitches}</span>
          </div>
          {edgeStitches > 0 && (
            <div className="flex justify-between">
              <span>{t('stitchIntegration.edgeStitchesTotal', 'Edge stitches')}:</span>
              <span>{totalEdgeStitches} ({edgeStitches} × 2)</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>{t('stitchIntegration.patternStitches', 'Pattern stitches')}:</span>
            <span>{patternStitches} ({fullRepeats} × {repeatWidth})</span>
          </div>
          {stockinetteStitches > 0 && (
            <div className="flex justify-between">
              <span>{t('stitchIntegration.stockinetteStitches', 'Stockinette stitches')}:</span>
              <span>{stockinetteStitches}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 