/**
 * Page de test pour l'export PDF - US_9.2
 * Cette page permet de tester la fonctionnalité d'export PDF avec des données d'exemple
 */

'use client';

import { useTranslation } from 'react-i18next';
import PatternViewerExample, { samplePatternData } from '@/components/knitting/PatternViewerExample';

export default function TestPdfPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('testPdf.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('testPdf.description')}
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-700">
              <strong>{t('testPdf.note.title')}:</strong> {t('testPdf.note.content')}
            </p>
          </div>
        </div>

        {/* Composant d'exemple avec export PDF */}
        <PatternViewerExample 
          patternData={samplePatternData}
          canEdit={true}
        />

        {/* Section d'informations techniques */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">{t('testPdf.technical.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('testPdf.technical.features.title')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.export_button')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.server_generation')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.print_optimized')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.headers_footers')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.user_feedback')}
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('testPdf.technical.features.future_support')}
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('testPdf.technical.architecture.title')}</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>{t('testPdf.technical.architecture.frontend')}:</strong> {t('testPdf.technical.architecture.frontend_desc')}</li>
                <li><strong>{t('testPdf.technical.architecture.api')}:</strong> {t('testPdf.technical.architecture.api_desc')}</li>
                <li><strong>{t('testPdf.technical.architecture.pdf')}:</strong> {t('testPdf.technical.architecture.pdf_desc')}</li>
                <li><strong>{t('testPdf.technical.architecture.auth')}:</strong> {t('testPdf.technical.architecture.auth_desc')}</li>
                <li><strong>{t('testPdf.technical.architecture.styles')}:</strong> {t('testPdf.technical.architecture.styles_desc')}</li>
                <li><strong>{t('testPdf.technical.architecture.i18n')}:</strong> {t('testPdf.technical.architecture.i18n_desc')}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">{t('testPdf.future.title')}</h4>
            <p className="text-yellow-700 text-sm">
              {t('testPdf.future.content')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 