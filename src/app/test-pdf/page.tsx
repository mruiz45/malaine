/**
 * Page de test pour l'export PDF - US_9.2
 * Cette page permet de tester la fonctionnalité d'export PDF avec des données d'exemple
 */

'use client';

import PatternViewerExample, { samplePatternData } from '@/components/knitting/PatternViewerExample';

export default function TestPdfPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Export PDF - US_9.2
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cette page démontre la fonctionnalité d'export PDF implémentée pour la US_9.2. 
            Vous pouvez tester l'export en cliquant sur les boutons "Télécharger PDF" ci-dessous.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Cette page utilise des données d'exemple. 
              En production, elle serait intégrée dans le vrai PatternViewer de US_9.1.
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
          <h2 className="text-2xl font-bold mb-6">Informations Techniques - US_9.2</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Fonctionnalités Implémentées</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Bouton d'export PDF dans PatternViewer
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Génération PDF côté serveur avec Puppeteer
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Page HTML optimisée pour l'impression
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Headers et footers avec pagination
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Feedback utilisateur et gestion d'erreurs
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Support pour les diagrammes futurs (US_9.3)
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Architecture Technique</h3>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Frontend:</strong> Composant React avec hooks</li>
                <li><strong>API:</strong> Route Next.js App Router</li>
                <li><strong>PDF:</strong> Puppeteer + HTML/CSS</li>
                <li><strong>Auth:</strong> Session Supabase</li>
                <li><strong>Styles:</strong> Tailwind CSS print media</li>
                <li><strong>i18n:</strong> Support français/anglais</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Préparation pour US_9.3</h4>
            <p className="text-yellow-700 text-sm">
              L'architecture inclut déjà le support pour les diagrammes schématiques de US_9.3. 
              Quand cette fonctionnalité sera implémentée, elle s'intégrera automatiquement dans l'export PDF 
              via les interfaces <code>SchematicsData</code> et l'option <code>includeSchematics</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 