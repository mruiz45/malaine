/**
 * Page de Test pour les Diagrammes de Tricot (US_11.6)
 * Démontre l'affichage des diagrammes avec des données d'exemple
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import StitchChartDisplay from '@/components/pattern-viewer/StitchChartDisplay';
import { StitchChartData } from '@/types/stitchChart';

/**
 * Données d'exemple pour un diagramme simple de côtes 2x2
 */
const sampleRibbingChart: StitchChartData = {
  id: "sample-ribbing-chart",
  stitch_pattern_id: "ribbing-2x2",
  metadata: {
    stitch_pattern_name: "Côtes 2x2",
    craft_type: "knitting",
    has_no_stitch_cells: false,
    generated_at: new Date().toISOString()
  },
  dimensions: {
    width: 8,
    height: 4
  },
  reading_directions: {
    rs: "left_to_right",
    ws: "right_to_left"
  },
  grid: [
    // Rang 4 (en haut du diagramme)
    [
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false }
    ],
    // Rang 3
    [
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false }
    ],
    // Rang 2
    [
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false }
    ],
    // Rang 1 (en bas du diagramme)
    [
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false }
    ]
  ],
  legend: [
    {
      symbol_key: "knit",
      definition: "Maille endroit",
      graphic_ref: "/assets/symbols/knit.svg"
    },
    {
      symbol_key: "purl",
      definition: "Maille envers",
      graphic_ref: "/assets/symbols/purl.svg"
    }
  ]
};

/**
 * Données d'exemple pour un diagramme avec diminutions
 */
const sampleDecreaseChart: StitchChartData = {
  id: "sample-decrease-chart",
  stitch_pattern_id: "decrease-pattern",
  metadata: {
    stitch_pattern_name: "Diminutions Simples",
    craft_type: "knitting",
    has_no_stitch_cells: false,
    generated_at: new Date().toISOString()
  },
  dimensions: {
    width: 6,
    height: 3
  },
  reading_directions: {
    rs: "left_to_right",
    ws: "right_to_left"
  },
  grid: [
    // Rang 3
    [
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "ssk", is_no_stitch: false },
      { symbol_key: "yarn_over", is_no_stitch: false },
      { symbol_key: "yarn_over", is_no_stitch: false },
      { symbol_key: "k2tog", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false }
    ],
    // Rang 2
    [
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false },
      { symbol_key: "purl", is_no_stitch: false }
    ],
    // Rang 1
    [
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false },
      { symbol_key: "knit", is_no_stitch: false }
    ]
  ],
  legend: [
    {
      symbol_key: "knit",
      definition: "Maille endroit",
      graphic_ref: "/assets/symbols/knit.svg"
    },
    {
      symbol_key: "purl",
      definition: "Maille envers",
      graphic_ref: "/assets/symbols/purl.svg"
    },
    {
      symbol_key: "ssk",
      definition: "Diminution penchée à gauche",
      graphic_ref: "/assets/symbols/ssk.svg"
    },
    {
      symbol_key: "k2tog",
      definition: "Diminution penchée à droite",
      graphic_ref: "/assets/symbols/k2tog.svg"
    },
    {
      symbol_key: "yarn_over",
      definition: "Jeté",
      graphic_ref: "/assets/symbols/yarn_over.svg"
    }
  ]
};

/**
 * Page de test pour les diagrammes de tricot
 */
export default function TestStitchChartsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test des Diagrammes de Tricot (US_11.6)
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Cette page démontre l'implémentation des diagrammes de tricot avec des exemples concrets.
          </p>
          
          {/* Critères d'acceptation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3">
              Critères d'Acceptation Validés
            </h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ <strong>AC1:</strong> Affichage des diagrammes en grille SVG avec symboles</li>
              <li>✅ <strong>AC2:</strong> Numérotation des rangs et mailles</li>
              <li>✅ <strong>AC3:</strong> Légende des symboles avec définitions</li>
              <li>✅ <strong>AC4:</strong> Directions de lecture (endroit/envers)</li>
              <li>✅ <strong>AC5:</strong> Intégration dans PatternViewer</li>
              <li>✅ <strong>AC6:</strong> Support de l'export PDF</li>
              <li>✅ <strong>AC7:</strong> Tooltips interactifs (mode web)</li>
              <li>✅ <strong>AC8:</strong> Mode impression optimisé</li>
            </ul>
          </div>
        </div>

        {/* Exemple 1: Côtes 2x2 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Exemple 1: Motif de Côtes 2x2
          </h2>
          <p className="text-gray-600 mb-6">
            Diagramme simple montrant un motif de côtes avec alternance de mailles endroit et envers.
          </p>
          
          <StitchChartDisplay
            chartData={sampleRibbingChart}
            cellSize={40}
            showRowNumbers={true}
            showStitchNumbers={true}
            showLegend={true}
            printMode={false}
            theme={{
              backgroundColor: '#ffffff',
              gridColor: '#374151',
              noStitchColor: '#e5e7eb',
              textColor: '#374151'
            }}
          />
        </div>

        {/* Exemple 2: Diminutions et jetés */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Exemple 2: Diminutions et Jetés
          </h2>
          <p className="text-gray-600 mb-6">
            Diagramme montrant des techniques plus avancées avec diminutions et jetés.
          </p>
          
          <StitchChartDisplay
            chartData={sampleDecreaseChart}
            cellSize={40}
            showRowNumbers={true}
            showStitchNumbers={true}
            showLegend={true}
            printMode={false}
            theme={{
              backgroundColor: '#ffffff',
              gridColor: '#374151',
              noStitchColor: '#e5e7eb',
              textColor: '#374151'
            }}
          />
        </div>

        {/* Mode impression */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Exemple 3: Mode Impression
          </h2>
          <p className="text-gray-600 mb-6">
            Le même diagramme en mode impression (cellules plus petites, pas de tooltips).
          </p>
          
          <StitchChartDisplay
            chartData={sampleDecreaseChart}
            cellSize={24}
            showRowNumbers={true}
            showStitchNumbers={true}
            showLegend={true}
            printMode={true}
            theme={{
              backgroundColor: '#ffffff',
              gridColor: '#374151',
              noStitchColor: '#e5e7eb',
              textColor: '#374151'
            }}
          />
        </div>

        {/* Informations techniques */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Informations Techniques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <h3 className="font-medium mb-2">Composants Implémentés</h3>
              <ul className="space-y-1">
                <li>• <code>StitchChartDisplay</code> - Composant principal</li>
                <li>• Assets SVG des symboles standards</li>
                <li>• Types TypeScript pour les données</li>
                <li>• Intégration dans ComponentInstructionsSection</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Fonctionnalités</h3>
              <ul className="space-y-1">
                <li>• Rendu SVG responsive</li>
                <li>• Tooltips interactifs au survol</li>
                <li>• Numérotation automatique</li>
                <li>• Directions de lecture configurables</li>
                <li>• Thèmes personnalisables</li>
                <li>• Support de l'export PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 