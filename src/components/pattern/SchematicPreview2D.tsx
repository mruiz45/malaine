'use client';

import React, { useMemo } from 'react';
import { GarmentType, MeasurementsData, NecklineData, EaseData, SleevesData } from '@/types/pattern';
import { useFinishedDimensions } from '@/hooks/useFinishedDimensions';

interface SchematicPreview2DProps {
  /** Type de vêtement sélectionné */
  garmentType: GarmentType | null;
  /** Données de mesures */
  measurements: MeasurementsData;
  /** Données d'aisance (PD_PH4_US001) */
  ease: EaseData;
  /** Données d'encolure (PD_PH2_US003) */
  neckline?: NecklineData;
  /** Données de manches (PD_PH4_US002) */
  sleeves?: SleevesData;
  /** Largeur du canvas SVG */
  width?: number;
  /** Hauteur du canvas SVG */
  height?: number;
  /** Classes CSS supplémentaires */
  className?: string;
}

interface CanvasConfig {
  width: number;
  height: number;
  padding: number;
  drawWidth: number;
  drawHeight: number;
}

interface SchematicDimensions {
  bodyWidth: number;
  bodyHeight: number;
  sleeveWidth?: number;
  sleeveLength?: number;
  neckWidth?: number;
}

/**
 * Composant de prévisualisation 2D en temps réel pour les vêtements
 * Implémente PD_PH2_US002
 */
export const SchematicPreview2D: React.FC<SchematicPreview2DProps> = ({
  garmentType,
  measurements,
  ease,
  neckline,
  sleeves,
  width = 300,
  height = 400,
  className = ''
}) => {
  
  /**
   * Configuration du canvas avec zones de dessin
   */
  const canvasConfig: CanvasConfig = useMemo(() => {
    const padding = 40;
    return {
      width,
      height,
      padding,
      drawWidth: width - (padding * 2),
      drawHeight: height - (padding * 2)
    };
  }, [width, height]);

  /**
   * Calcule les dimensions finies en appliquant l'aisance aux mesures corporelles
   * Implémente PD_PH4_US001: Ease Affecting Finished Dimensions
   */
  const finishedDimensions = useFinishedDimensions(measurements, ease, garmentType);

  /**
   * Calcule les dimensions du schéma basées sur les dimensions finies (mesures + aisance)
   * Implémente PD_PH4_US001: Use finished dimensions instead of raw measurements
   */
  const schematicDimensions: SchematicDimensions | null = useMemo(() => {
    if (!garmentType || !measurements) return null;

    const { drawWidth, drawHeight } = canvasConfig;

    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
      case 'vest': {
        // Use finished dimensions when available, fallback to raw measurements
        const chestCirc = finishedDimensions.finishedChestCircumference || measurements.chestCircumference || 100;
        const bodyLength = finishedDimensions.finishedBodyLength || measurements.bodyLength || 60;
        const sleeveLength = finishedDimensions.finishedSleeveLength || measurements.sleeveLength || 58;
        const shoulderWidth = finishedDimensions.finishedShoulderWidth || measurements.shoulderWidth || 42;

        // Calculer les proportions pour s'adapter au canvas
        const bodyWidth = chestCirc / 2; // Largeur du corps (demi-circonférence)
        const maxRealWidth = Math.max(bodyWidth, shoulderWidth);
        const scale = Math.min(drawWidth * 0.7 / maxRealWidth, drawHeight * 0.7 / bodyLength);

        return {
          bodyWidth: bodyWidth * scale,
          bodyHeight: bodyLength * scale,
          sleeveWidth: shoulderWidth * scale,
          sleeveLength: garmentType !== 'vest' ? sleeveLength * scale * 0.6 : undefined,
          neckWidth: (shoulderWidth * 0.3) * scale
        };
      }

      case 'scarf': {
        // Use finished dimensions when available, fallback to raw measurements
        const scarfLength = finishedDimensions.finishedScarfLength || measurements.scarfLength || 150;
        const scarfWidth = finishedDimensions.finishedScarfWidth || measurements.scarfWidth || 20;

        // Adapter au canvas en gardant les proportions
        const scale = Math.min(drawWidth * 0.8 / scarfLength, drawHeight * 0.8 / scarfWidth);

        return {
          bodyWidth: scarfLength * scale,
          bodyHeight: scarfWidth * scale
        };
      }

      case 'hat': {
        // Use finished dimensions when available, fallback to raw measurements
        const headCirc = finishedDimensions.finishedHeadCircumference || measurements.headCircumference || 56;
        const hatHeight = finishedDimensions.finishedHatHeight || measurements.hatHeight || 20;

        const diameter = headCirc / Math.PI;
        const scale = Math.min(drawWidth * 0.7 / diameter, drawHeight * 0.7 / hatHeight);

        return {
          bodyWidth: diameter * scale,
          bodyHeight: hatHeight * scale
        };
      }

      default:
        return null;
    }
  }, [garmentType, measurements, finishedDimensions, canvasConfig]);

  /**
   * Dessine une encolure ronde
   */
  const drawRoundNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 8) => {
    const radius = neckWidth / 2;
    const neckCenterX = centerX;
    const neckCenterY = neckY + depth;
    
    return (
      <path
        key="round-neckline"
        d={`M ${neckCenterX - radius} ${neckY} Q ${neckCenterX} ${neckCenterY} ${neckCenterX + radius} ${neckY}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    );
  };

  /**
   * Dessine une encolure en V
   */
  const drawVNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 12) => {
    const halfWidth = neckWidth / 2;
    
    return (
      <path
        key="v-neckline"
        d={`M ${centerX - halfWidth} ${neckY} L ${centerX} ${neckY + depth} L ${centerX + halfWidth} ${neckY}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    );
  };

  /**
   * Dessine une encolure bateau
   */
  const drawBoatNeckline = (centerX: number, neckY: number, neckWidth: number) => {
    const halfWidth = neckWidth / 2;
    
    return (
      <line
        key="boat-neckline"
        x1={centerX - halfWidth}
        y1={neckY}
        x2={centerX + halfWidth}
        y2={neckY}
        stroke="#374151"
        strokeWidth="2"
      />
    );
  };

  /**
   * Dessine une encolure carrée
   */
  const drawSquareNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 10) => {
    const halfWidth = neckWidth / 2;
    
    return (
      <path
        key="square-neckline"
        d={`M ${centerX - halfWidth} ${neckY} L ${centerX - halfWidth} ${neckY + depth} L ${centerX + halfWidth} ${neckY + depth} L ${centerX + halfWidth} ${neckY}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    );
  };

  /**
   * Dessine une encolure échancrée (scoop)
   */
  const drawScoopNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 12) => {
    const halfWidth = neckWidth / 2;
    const controlPointY = neckY + depth * 0.7;
    
    return (
      <path
        key="scoop-neckline"
        d={`M ${centerX - halfWidth} ${neckY} Q ${centerX - halfWidth * 0.5} ${controlPointY} ${centerX} ${neckY + depth} Q ${centerX + halfWidth * 0.5} ${controlPointY} ${centerX + halfWidth} ${neckY}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    );
  };

  /**
   * Dessine une encolure col roulé
   */
  const drawTurtleneckNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 15) => {
    const halfWidth = neckWidth / 2;
    
    return (
      <g key="turtleneck-neckline">
        {/* Col principal */}
        <rect
          x={centerX - halfWidth}
          y={neckY - depth}
          width={neckWidth}
          height={depth}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />
        {/* Ligne de pli du col */}
        <line
          x1={centerX - halfWidth}
          y1={neckY - depth * 0.6}
          x2={centerX + halfWidth}
          y2={neckY - depth * 0.6}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </g>
    );
  };

  /**
   * Dessine une encolure cowl
   */
  const drawCowlNeckline = (centerX: number, neckY: number, neckWidth: number, depth: number = 18) => {
    const halfWidth = neckWidth / 2;
    
    return (
      <g key="cowl-neckline">
        {/* Forme principale du cowl */}
        <path
          d={`M ${centerX - halfWidth} ${neckY} Q ${centerX} ${neckY + depth} ${centerX + halfWidth} ${neckY}`}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />
        {/* Pli du cowl */}
        <path
          d={`M ${centerX - halfWidth * 0.7} ${neckY + depth * 0.3} Q ${centerX} ${neckY + depth * 0.7} ${centerX + halfWidth * 0.7} ${neckY + depth * 0.3}`}
          fill="none"
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </g>
    );
  };

  /**
   * Rend l'encolure appropriée selon le type sélectionné
   */
  const renderNeckline = (centerX: number, neckY: number, neckWidth: number) => {
    if (!neckline || !neckline.necklineType || !neckWidth) {
      // Encolure par défaut (rectangulaire simple)
      return (
        <rect
          key="default-neckline"
          x={centerX - neckWidth / 2}
          y={neckY}
          width={neckWidth}
          height={8}
          fill="none"
          stroke="#374151"
          strokeWidth="1"
        />
      );
    }

    const depth = neckline.necklineDepth || 8;

    switch (neckline.necklineType) {
      case 'round':
        return drawRoundNeckline(centerX, neckY, neckWidth, depth);
      case 'v_neck':
        return drawVNeckline(centerX, neckY, neckWidth, depth);
      case 'boat_neck':
        return drawBoatNeckline(centerX, neckY, neckWidth);
      case 'square_neck':
        return drawSquareNeckline(centerX, neckY, neckWidth, depth);
      case 'scoop':
        return drawScoopNeckline(centerX, neckY, neckWidth, depth);
      case 'turtleneck':
        return drawTurtleneckNeckline(centerX, neckY, neckWidth, depth);
      case 'cowl':
        return drawCowlNeckline(centerX, neckY, neckWidth, depth);
      default:
        // Fallback à l'encolure par défaut
        return (
          <rect
            key="fallback-neckline"
            x={centerX - neckWidth / 2}
            y={neckY}
            width={neckWidth}
            height={8}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
          />
        );
    }
  };

  /**
   * Interface pour les paramètres de dessin des manches
   */
  interface SleeveDrawingParams {
    centerX: number;
    bodyX: number;
    bodyY: number;
    bodyWidth: number;
    bodyHeight: number;
    sleeveWidth: number;
    sleeveLength: number;
    leftSleeveX: number;
    rightSleeveX: number;
    sleeveY: number;
    neckWidth: number;
  }

  /**
   * Dessine les manches set-in (emmanchure classique avec courbe)
   * PD_PH4_US002: Set-in sleeve type
   */
  const drawSetInSleeves = (params: SleeveDrawingParams): React.JSX.Element[] => {
    const { leftSleeveX, rightSleeveX, sleeveY, sleeveLength, sleeveWidth, bodyX, bodyY, bodyWidth } = params;
    
    return [
      // Manche gauche
      <rect
        key="left-sleeve"
        x={leftSleeveX}
        y={sleeveY}
        width={sleeveLength}
        height={sleeveWidth}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Manche droite
      <rect
        key="right-sleeve"
        x={rightSleeveX}
        y={sleeveY}
        width={sleeveLength}
        height={sleeveWidth}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Emmanchures courbes (caractéristique set-in)
      <path
        key="left-armhole"
        d={`M ${bodyX} ${sleeveY + sleeveWidth * 0.2} Q ${bodyX - 8} ${sleeveY + sleeveWidth * 0.6} ${bodyX} ${sleeveY + sleeveWidth * 0.8}`}
        fill="none"
        stroke="#374151"
        strokeWidth="1"
        strokeDasharray="2,2"
      />,
      <path
        key="right-armhole"
        d={`M ${bodyX + bodyWidth} ${sleeveY + sleeveWidth * 0.2} Q ${bodyX + bodyWidth + 8} ${sleeveY + sleeveWidth * 0.6} ${bodyX + bodyWidth} ${sleeveY + sleeveWidth * 0.8}`}
        fill="none"
        stroke="#374151"
        strokeWidth="1"
        strokeDasharray="2,2"
      />
    ];
  };

  /**
   * Dessine les manches raglan (lignes diagonales du col vers l'emmanchure)
   * PD_PH4_US002: Raglan sleeve type
   */
  const drawRaglanSleeves = (params: SleeveDrawingParams): React.JSX.Element[] => {
    const { centerX, bodyX, bodyY, bodyWidth, sleeveWidth, sleeveLength, leftSleeveX, rightSleeveX, sleeveY, neckWidth } = params;
    
    const neckLeftX = centerX - neckWidth / 2;
    const neckRightX = centerX + neckWidth / 2;
    
    return [
      // Manche gauche
      <rect
        key="left-sleeve"
        x={leftSleeveX}
        y={sleeveY}
        width={sleeveLength}
        height={sleeveWidth}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Manche droite
      <rect
        key="right-sleeve"
        x={rightSleeveX}
        y={sleeveY}
        width={sleeveLength}
        height={sleeveWidth}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Lignes raglan caractéristiques (diagonales du col vers l'emmanchure)
      <line
        key="left-raglan-line"
        x1={neckLeftX}
        y1={bodyY}
        x2={bodyX}
        y2={sleeveY + sleeveWidth}
        stroke="#374151"
        strokeWidth="2"
        strokeDasharray="3,3"
      />,
      <line
        key="right-raglan-line"
        x1={neckRightX}
        y1={bodyY}
        x2={bodyX + bodyWidth}
        y2={sleeveY + sleeveWidth}
        stroke="#374151"
        strokeWidth="2"
        strokeDasharray="3,3"
      />
    ];
  };

  /**
   * Dessine les manches drop shoulder (épaule étendue, manches attachées plus bas)
   * PD_PH4_US002: Drop shoulder sleeve type
   */
  const drawDropShoulderSleeves = (params: SleeveDrawingParams): React.JSX.Element[] => {
    const { leftSleeveX, rightSleeveX, sleeveY, sleeveLength, sleeveWidth, bodyX, bodyY, bodyWidth } = params;
    
    // Pour drop shoulder, on étend la ligne d'épaule
    const extendedShoulderLength = sleeveLength * 0.3;
    
    return [
      // Épaules étendues
      <line
        key="left-extended-shoulder"
        x1={bodyX}
        y1={bodyY}
        x2={bodyX - extendedShoulderLength}
        y2={bodyY}
        stroke="#374151"
        strokeWidth="2"
      />,
      <line
        key="right-extended-shoulder"
        x1={bodyX + bodyWidth}
        y1={bodyY}
        x2={bodyX + bodyWidth + extendedShoulderLength}
        y2={bodyY}
        stroke="#374151"
        strokeWidth="2"
      />,
      // Manches attachées plus bas
      <rect
        key="left-sleeve"
        x={leftSleeveX}
        y={sleeveY + sleeveWidth * 0.3}
        width={sleeveLength}
        height={sleeveWidth * 0.7}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      <rect
        key="right-sleeve"
        x={rightSleeveX}
        y={sleeveY + sleeveWidth * 0.3}
        width={sleeveLength}
        height={sleeveWidth * 0.7}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    ];
  };

  /**
   * Dessine les manches dolman (larges, fluides, intégrées au corps)
   * PD_PH4_US002: Dolman sleeve type
   */
  const drawDolmanSleeves = (params: SleeveDrawingParams): React.JSX.Element[] => {
    const { centerX, bodyX, bodyY, bodyWidth, bodyHeight, sleeveLength } = params;
    
    // Pour dolman, les manches sont intégrées dans une forme continue
    const dolmanWidth = bodyWidth + sleeveLength * 2;
    const dolmanX = centerX - dolmanWidth / 2;
    
    return [
      // Forme dolman continue (remplace le rectangle du corps)
      <path
        key="dolman-shape"
        d={`M ${dolmanX} ${bodyY + bodyHeight * 0.7} 
            Q ${dolmanX} ${bodyY} ${bodyX} ${bodyY}
            L ${bodyX + bodyWidth} ${bodyY}
            Q ${dolmanX + dolmanWidth} ${bodyY} ${dolmanX + dolmanWidth} ${bodyY + bodyHeight * 0.7}
            L ${dolmanX + dolmanWidth} ${bodyY + bodyHeight}
            L ${dolmanX} ${bodyY + bodyHeight}
            Z`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    ];
  };

  /**
   * Dessine les emmanchures pour vêtement sans manches
   * PD_PH4_US002: Sleeveless type
   */
  const drawSleevelessArmholes = (params: SleeveDrawingParams): React.JSX.Element[] => {
    const { bodyX, bodyY, bodyWidth, sleeveWidth } = params;
    
    return [
      // Emmanchure gauche
      <path
        key="left-armhole"
        d={`M ${bodyX} ${bodyY + sleeveWidth * 0.1} 
            Q ${bodyX - 10} ${bodyY + sleeveWidth * 0.5} 
            ${bodyX} ${bodyY + sleeveWidth * 0.9}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Emmanchure droite
      <path
        key="right-armhole"
        d={`M ${bodyX + bodyWidth} ${bodyY + sleeveWidth * 0.1} 
            Q ${bodyX + bodyWidth + 10} ${bodyY + sleeveWidth * 0.5} 
            ${bodyX + bodyWidth} ${bodyY + sleeveWidth * 0.9}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    ];
  };

  /**
   * Rend les manches selon le type sélectionné
   * PD_PH4_US002: Sleeve type selection implementation
   */
  const renderSleevesByType = (sleeveType: NonNullable<SleevesData['sleeveType']>, params: SleeveDrawingParams): React.JSX.Element[] => {
    switch (sleeveType) {
      case 'setIn':
        return drawSetInSleeves(params);
      case 'raglan':
        return drawRaglanSleeves(params);
      case 'dropShoulder':
        return drawDropShoulderSleeves(params);
      case 'dolman':
        return drawDolmanSleeves(params);
      case 'sleeveless':
        return drawSleevelessArmholes(params);
      default:
        // Fallback to set-in sleeves
        return drawSetInSleeves(params);
    }
  };

  /**
   * Génère le contenu SVG pour un sweater/cardigan/vest
   */
  const renderGarmentSchematic = (dimensions: SchematicDimensions) => {
    if (!dimensions) return null;

    const { padding, width: canvasWidth, height: canvasHeight } = canvasConfig;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const { bodyWidth, bodyHeight, sleeveWidth, sleeveLength, neckWidth } = dimensions;

    // Position du corps
    const bodyX = centerX - bodyWidth / 2;
    const bodyY = centerY - bodyHeight / 2;

    // Position des manches (si applicable)
    const sleeveY = bodyY;
    const leftSleeveX = bodyX - (sleeveLength || 0);
    const rightSleeveX = bodyX + bodyWidth;

    const elements = [];

    // Corps principal
    elements.push(
      <rect
        key="body"
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />
    );

    // Manches selon le type sélectionné (PD_PH4_US002)
    if (garmentType !== 'vest' && sleeveLength && sleeveWidth) {
      const sleeveType = sleeves?.sleeveType || 'setIn'; // Default to set-in as per spec
      elements.push(...renderSleevesByType(sleeveType, {
        centerX,
        bodyX,
        bodyY,
        bodyWidth,
        bodyHeight,
        sleeveWidth,
        sleeveLength,
        leftSleeveX,
        rightSleeveX,
        sleeveY,
        neckWidth: neckWidth || 0
      }));
    }

    // Encolure avec type spécifique (PD_PH2_US003)
    if (neckWidth) {
      elements.push(renderNeckline(centerX, bodyY, neckWidth));
    }

    // Ouverture centrale (pour cardigan)
    if (garmentType === 'cardigan') {
      elements.push(
        <line
          key="center-opening"
          x1={centerX}
          y1={bodyY}
          x2={centerX}
          y2={bodyY + bodyHeight}
          stroke="#374151"
          strokeWidth="1"
          strokeDasharray="4,2"
        />
      );
    }

    // Labels de dimensions
    elements.push(...renderDimensionLabels(dimensions, garmentType));

    return elements;
  };

  /**
   * Génère le contenu SVG pour une écharpe
   */
  const renderScarfSchematic = (dimensions: SchematicDimensions) => {
    const { width: canvasWidth, height: canvasHeight } = canvasConfig;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const { bodyWidth, bodyHeight } = dimensions;

    const rectX = centerX - bodyWidth / 2;
    const rectY = centerY - bodyHeight / 2;

    return [
      <rect
        key="scarf"
        x={rectX}
        y={rectY}
        width={bodyWidth}
        height={bodyHeight}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      ...renderDimensionLabels(dimensions, 'scarf')
    ];
  };

  /**
   * Génère le contenu SVG pour un chapeau
   */
  const renderHatSchematic = (dimensions: SchematicDimensions) => {
    const { width: canvasWidth, height: canvasHeight } = canvasConfig;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    const { bodyWidth, bodyHeight } = dimensions;

    // Forme de chapeau simplifiée: demi-cercle + rectangle
    const radius = bodyWidth / 2;
    const rectX = centerX - radius;
    const rectY = centerY;

    return [
      // Demi-cercle pour la calotte
      <path
        key="hat-crown"
        d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      // Rectangle pour la partie haute
      <rect
        key="hat-body"
        x={rectX}
        y={rectY - bodyHeight}
        width={bodyWidth}
        height={bodyHeight}
        fill="none"
        stroke="#374151"
        strokeWidth="2"
      />,
      ...renderDimensionLabels(dimensions, 'hat')
    ];
  };

  /**
   * Génère les labels de dimensions avec lignes de côte
   * Affiche les dimensions finies (mesures + aisance) - PD_PH4_US001
   */
  const renderDimensionLabels = (dimensions: SchematicDimensions, garmentType: GarmentType): React.JSX.Element[] => {
    const labels: React.JSX.Element[] = [];
    const { width: canvasWidth, height: canvasHeight } = canvasConfig;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    if (garmentType === 'scarf') {
      const { bodyWidth, bodyHeight } = dimensions;
      const rectX = centerX - bodyWidth / 2;
      const rectY = centerY - bodyHeight / 2;

      // Label longueur (horizontal) - use finished dimensions
      const displayLength = finishedDimensions.finishedScarfLength || measurements.scarfLength;
      if (displayLength) {
        labels.push(
          <g key="length-label">
            <line
              x1={rectX}
              y1={rectY + bodyHeight + 20}
              x2={rectX + bodyWidth}
              y2={rectY + bodyHeight + 20}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={centerX}
              y={rectY + bodyHeight + 35}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {Math.round(displayLength * 10) / 10} cm
            </text>
          </g>
        );
      }

      // Label largeur (vertical) - use finished dimensions
      const displayWidth = finishedDimensions.finishedScarfWidth || measurements.scarfWidth;
      if (displayWidth) {
        labels.push(
          <g key="width-label">
            <line
              x1={rectX - 20}
              y1={rectY}
              x2={rectX - 20}
              y2={rectY + bodyHeight}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={rectX - 30}
              y={centerY}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
              transform={`rotate(-90, ${rectX - 30}, ${centerY})`}
            >
              {Math.round(displayWidth * 10) / 10} cm
            </text>
          </g>
        );
      }
    } else if (garmentType === 'sweater' || garmentType === 'cardigan' || garmentType === 'vest') {
      const { bodyWidth, bodyHeight } = dimensions;
      const bodyX = centerX - bodyWidth / 2;
      const bodyY = centerY - bodyHeight / 2;

      // Label circonférence poitrine - use finished dimensions
      const displayChest = finishedDimensions.finishedChestCircumference || measurements.chestCircumference;
      if (displayChest) {
        labels.push(
          <g key="chest-label">
            <line
              x1={bodyX}
              y1={bodyY + bodyHeight + 20}
              x2={bodyX + bodyWidth}
              y2={bodyY + bodyHeight + 20}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={centerX}
              y={bodyY + bodyHeight + 35}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              {Math.round(displayChest * 10) / 10} cm
            </text>
          </g>
        );
      }

      // Label longueur corps - use finished dimensions
      const displayBodyLength = finishedDimensions.finishedBodyLength || measurements.bodyLength;
      if (displayBodyLength) {
        labels.push(
          <g key="body-length-label">
            <line
              x1={bodyX - 20}
              y1={bodyY}
              x2={bodyX - 20}
              y2={bodyY + bodyHeight}
              stroke="#6B7280"
              strokeWidth="1"
            />
            <text
              x={bodyX - 30}
              y={centerY}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
              transform={`rotate(-90, ${bodyX - 30}, ${centerY})`}
            >
              {Math.round(displayBodyLength * 10) / 10} cm
            </text>
          </g>
        );
      }
    } else if (garmentType === 'hat') {
      const { bodyWidth, bodyHeight } = dimensions;

      // Label circonférence tête - use finished dimensions
      const displayHeadCirc = finishedDimensions.finishedHeadCircumference || measurements.headCircumference;
      if (displayHeadCirc) {
        labels.push(
          <text
            key="head-circ-label"
            x={centerX}
            y={centerY + bodyHeight / 2 + 25}
            textAnchor="middle"
            fontSize="12"
            fill="#374151"
          >
            ⌀ {Math.round(displayHeadCirc * 10) / 10} cm
          </text>
        );
      }

      // Label hauteur - use finished dimensions
      const displayHatHeight = finishedDimensions.finishedHatHeight || measurements.hatHeight;
      if (displayHatHeight) {
        labels.push(
          <g key="hat-height-label">
            <text
              x={centerX + bodyWidth / 2 + 15}
              y={centerY - bodyHeight / 2}
              textAnchor="start"
              fontSize="12"
              fill="#374151"
            >
              {Math.round(displayHatHeight * 10) / 10} cm
            </text>
          </g>
        );
      }
    }

    return labels;
  };

  /**
   * Rendu du contenu SVG selon le type de vêtement
   */
  const renderSchematic = () => {
    if (!garmentType || !schematicDimensions) {
      return (
        <g>
          <text
            x={canvasConfig.width / 2}
            y={canvasConfig.height / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#9CA3AF"
          >
            {!garmentType 
              ? 'Sélectionnez un type de vêtement'
              : 'Entrez les mesures pour voir la prévisualisation'
            }
          </text>
        </g>
      );
    }

    switch (garmentType) {
      case 'sweater':
      case 'cardigan':
      case 'vest':
        return renderGarmentSchematic(schematicDimensions);
      case 'scarf':
        return renderScarfSchematic(schematicDimensions);
      case 'hat':
        return renderHatSchematic(schematicDimensions);
      default:
        return (
          <text
            x={canvasConfig.width / 2}
            y={canvasConfig.height / 2}
            textAnchor="middle"
            fontSize="14"
            fill="#9CA3AF"
          >
            Type de vêtement non supporté
          </text>
        );
    }
  };

  return (
    <div className={`schematic-preview-2d ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
          Prévisualisation 2D
        </h3>
        
        <div className="flex justify-center">
          <svg
            width={canvasConfig.width}
            height={canvasConfig.height}
            viewBox={`0 0 ${canvasConfig.width} ${canvasConfig.height}`}
            className="border border-gray-100 bg-gray-50"
          >
            {renderSchematic()}
          </svg>
        </div>

        {garmentType && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {garmentType.charAt(0).toUpperCase() + garmentType.slice(1)}
              {schematicDimensions && ' - Proportions temps réel'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 