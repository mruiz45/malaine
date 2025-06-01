/**
 * Page de test pour les styles de diagrammes de points (US_12.8)
 * Démontre les fonctionnalités de personnalisation des diagrammes
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import StitchChartViewer from '@/components/pattern-viewer/StitchChartViewer';
import type { StitchChartData } from '@/types/stitchChart';

/**
 * Données de test pour un diagramme de points simple
 */
const sampleChartData: StitchChartData = {
  id: 'test-chart-styles',
  stitch_pattern_id: 'test-pattern-01',
  dimensions: {
    width: 12,
    height: 8
  },
  grid: [
    // Rangée 8 (haut du diagramme)
    [
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false }
    ],
    // Rangée 7
    [
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false }
    ],
    // Rangée 6
    [
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false }
    ],
    // Rangée 5
    [
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false }
    ],
    // Rangée 4
    [
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false }
    ],
    // Rangée 3
    [
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false },
      { symbol_key: 'p', is_no_stitch: false }
    ],
    // Rangée 2
    [
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'yo', is_no_stitch: false },
      { symbol_key: 'k2tog', is_no_stitch: false }
    ],
    // Rangée 1 (bas du diagramme)
    [
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false },
      { symbol_key: 'k', is_no_stitch: false }
    ]
  ],
  legend: [
    {
      symbol_key: 'k',
      definition: 'Knit stitch',
      graphic_ref: '/assets/symbols/knit.svg'
    },
    {
      symbol_key: 'p',
      definition: 'Purl stitch',
      graphic_ref: '/assets/symbols/purl.svg'
    },
    {
      symbol_key: 'yo',
      definition: 'Yarn over',
      graphic_ref: '/assets/symbols/yarn-over.svg'
    },
    {
      symbol_key: 'k2tog',
      definition: 'Knit 2 together',
      graphic_ref: '/assets/symbols/k2tog.svg'
    }
  ],
  reading_directions: {
    rs: 'right_to_left',
    ws: 'left_to_right'
  },
  metadata: {
    craft_type: 'knitting',
    has_no_stitch_cells: false,
    has_colorwork: false,
    generated_at: new Date().toISOString(),
    stitch_pattern_name: 'Test Lace Pattern',
    stitch_repeat_width: 4,
    stitch_repeat_height: 4
  }
};

/**
 * Page de test pour les styles de diagrammes
 */
export default function StitchChartStylesTestPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('stitchChart.styleControls.title', 'Chart Style Options')} - Test
          </h1>
          <p className="text-lg text-gray-600">
            {t(
              'test.stitchChartStyles.description',
              'Test and demonstrate the stitch chart style customization features (US_12.8)'
            )}
          </p>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            {t('test.instructions', 'Test Instructions')}
          </h2>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• {t('test.stitchChartStyles.instruction1', 'Use the style controls below to customize the chart appearance')}</li>
            <li>• {t('test.stitchChartStyles.instruction2', 'Try different color schemes for various use cases')}</li>
            <li>• {t('test.stitchChartStyles.instruction3', 'Toggle grid options to see the effect on readability')}</li>
            <li>• {t('test.stitchChartStyles.instruction4', 'Enable repeat highlighting to see the pattern repeat area')}</li>
            <li>• {t('test.stitchChartStyles.instruction5', 'Settings are automatically saved in your browser')}</li>
          </ul>
        </div>

        {/* Chart Viewer with Style Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t('test.stitchChartStyles.sampleChart', 'Sample Lace Pattern Chart')}
          </h2>
          
          <StitchChartViewer
            chartData={sampleChartData}
            cellSize={40}
            showRowNumbers={true}
            showStitchNumbers={true}
            showLegend={true}
            showStyleControls={true}
            styleControlsCollapsed={false}
            className="test-chart-viewer"
          />
        </div>

        {/* Feature Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('test.stitchChartStyles.features', 'Available Features')}
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• {t('test.stitchChartStyles.feature1', 'Color customization for all chart elements')}</li>
              <li>• {t('test.stitchChartStyles.feature2', 'Pre-defined color schemes for common scenarios')}</li>
              <li>• {t('test.stitchChartStyles.feature3', 'Grid line styling and visibility controls')}</li>
              <li>• {t('test.stitchChartStyles.feature4', 'Pattern repeat highlighting')}</li>
              <li>• {t('test.stitchChartStyles.feature5', 'Persistent settings via localStorage')}</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t('test.stitchChartStyles.useCases', 'Use Cases')}
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• {t('test.stitchChartStyles.useCase1', 'High contrast for better visibility')}</li>
              <li>• {t('test.stitchChartStyles.useCase2', 'Print-friendly black and white output')}</li>
              <li>• {t('test.stitchChartStyles.useCase3', 'Dark mode for reduced eye strain')}</li>
              <li>• {t('test.stitchChartStyles.useCase4', 'Colorblind-friendly alternatives')}</li>
              <li>• {t('test.stitchChartStyles.useCase5', 'Custom branding colors for publications')}</li>
            </ul>
          </div>
        </div>

        {/* Technical Notes */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {t('test.technicalNotes', 'Technical Notes')}
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• {t('test.stitchChartStyles.note1', 'Styles are applied in real-time without page reload')}</p>
            <p>• {t('test.stitchChartStyles.note2', 'Settings persist across browser sessions using localStorage')}</p>
            <p>• {t('test.stitchChartStyles.note3', 'Chart supports both monochrome and colorwork patterns')}</p>
            <p>• {t('test.stitchChartStyles.note4', 'Repeat highlighting automatically detects pattern dimensions')}</p>
            <p>• {t('test.stitchChartStyles.note5', 'All styles are compatible with PDF export functionality')}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 