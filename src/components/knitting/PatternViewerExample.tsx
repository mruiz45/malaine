/**
 * Exemple d'intégration du bouton PDF dans PatternViewer - US_9.2
 * Ce fichier montre comment intégrer le bouton d'export PDF
 */

'use client';

import { useState } from 'react';
import PdfExportButton, { usePdfExport } from './PdfExportButton';

// Interface exemple pour les données de patron (à remplacer par les vraies types de US_9.1)
interface ExamplePatternData {
  title: string;
  type: string;
  difficulty: string;
  description?: string;
  techniques?: string[];
  estimatedTime?: string;
  yarn?: {
    type: string;
    weight: string;
    quantity: string;
    color?: string;
  };
  tools?: Array<{
    name: string;
    size: string;
  }>;
  accessories?: string[];
  gauge?: {
    stitches: number;
    rows: number;
    notes?: string;
  };
  abbreviations?: Record<string, string>;
  components?: Array<{
    name: string;
    instructions: Array<{
      title?: string;
      steps?: string[];
      content?: string;
    }>;
  }>;
  assembly?: string | string[];
  notes?: string;
  tips?: string[];
}

interface PatternViewerExampleProps {
  /** Données du patron */
  patternData: ExamplePatternData;
  /** Si l'utilisateur peut éditer le patron */
  canEdit?: boolean;
}

/**
 * Exemple de composant PatternViewer avec intégration PDF
 */
export default function PatternViewerExample({ 
  patternData, 
  canEdit = false 
}: PatternViewerExampleProps) {
  const [exportCount, setExportCount] = useState(0);
  const { exportToPdf, isExporting, lastExportError, clearError } = usePdfExport();

  /**
   * Gestionnaire d'export PDF avec analytics
   */
  const handlePdfExport = async () => {
    const success = await exportToPdf(patternData, {
      includeHeader: true,
      includePageNumbers: true,
      includeSchematics: false, // Sera true quand US_9.3 sera implémentée
    });

    if (success) {
      setExportCount(prev => prev + 1);
      console.log('Export PDF réussi');
    }
  };

  /**
   * Callback personnalisé pour le suivi des exports
   */
  const handleExportSuccess = (fileSize: number) => {
    console.log(`PDF généré avec succès: ${Math.round(fileSize / 1024)}KB`);
    // Ici on pourrait envoyer des analytics, notifications, etc.
  };

  const handleExportError = (error: string) => {
    console.error('Erreur d\'export PDF:', error);
    // Ici on pourrait envoyer des logs d'erreur, afficher une notification, etc.
  };

  return (
    <div className="pattern-viewer max-w-4xl mx-auto p-6">
      {/* En-tête avec titre et actions */}
      <header className="pattern-header mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {patternData.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Type: {patternData.type}</span>
              <span>•</span>
              <span>Difficulté: {patternData.difficulty}</span>
            </div>
          </div>

          {/* Actions principales */}
          <div className="flex items-center gap-3">
            {canEdit && (
              <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                Éditer
              </button>
            )}
            
            {/* Bouton d'export PDF principal */}
            <PdfExportButton
              patternData={patternData}
              variant="primary"
              size="md"
              onExportStart={() => console.log('Début export PDF')}
              onExportSuccess={handleExportSuccess}
              onExportError={handleExportError}
            />
            
            {/* Bouton d'export alternatif avec hook */}
            <button
              onClick={handlePdfExport}
              disabled={isExporting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isExporting ? 'Export...' : 'Export (Hook)'}
            </button>
          </div>
        </div>

        {/* Statistiques d'export */}
        {exportCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              Ce patron a été exporté {exportCount} fois en PDF
            </p>
          </div>
        )}

        {/* Affichage des erreurs d'export */}
        {lastExportError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{lastExportError}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Contenu principal du patron */}
      <main className="pattern-content space-y-8">
        {/* Description */}
        {patternData.description && (
          <section className="pattern-description">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{patternData.description}</p>
          </section>
        )}

        {/* Informations techniques */}
        <section className="pattern-info bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Informations Techniques</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Techniques:</span>
              <p className="text-gray-600">{patternData.techniques?.join(', ') || 'Non spécifiées'}</p>
            </div>
            <div>
              <span className="font-medium">Temps estimé:</span>
              <p className="text-gray-600">{patternData.estimatedTime || 'Non spécifié'}</p>
            </div>
            <div>
              <span className="font-medium">Difficulté:</span>
              <p className="text-gray-600">{patternData.difficulty}</p>
            </div>
          </div>
        </section>

        {/* Matériaux */}
        {patternData.yarn && (
          <section className="pattern-materials">
            <h2 className="text-xl font-semibold mb-4">Matériaux</h2>
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium mb-2">Laine</h3>
              <ul className="space-y-1 text-gray-600">
                <li>Type: {patternData.yarn.type}</li>
                <li>Poids: {patternData.yarn.weight}</li>
                <li>Quantité: {patternData.yarn.quantity}</li>
                {patternData.yarn.color && <li>Couleur: {patternData.yarn.color}</li>}
              </ul>
            </div>
          </section>
        )}

        {/* Échantillon */}
        {patternData.gauge && (
          <section className="pattern-gauge">
            <h2 className="text-xl font-semibold mb-4">Échantillon</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium mb-2">Pour un carré de 10cm x 10cm:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>Mailles: {patternData.gauge.stitches}</div>
                <div>Rangs: {patternData.gauge.rows}</div>
              </div>
              {patternData.gauge.notes && (
                <p className="text-sm italic mt-2">{patternData.gauge.notes}</p>
              )}
            </div>
          </section>
        )}

        {/* Zone d'export PDF alternative */}
        <section className="pattern-export bg-gray-100 p-6 rounded-lg border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-semibold mb-4">Export et Partage</h2>
          <div className="flex flex-wrap gap-3">
            <PdfExportButton
              patternData={patternData}
              variant="outline"
              size="lg"
              exportOptions={{
                includeHeader: true,
                includePageNumbers: true,
                pageFormat: 'A4',
                orientation: 'portrait',
              }}
            />
            <PdfExportButton
              patternData={patternData}
              variant="secondary"
              size="sm"
              exportOptions={{
                includeHeader: false,
                includePageNumbers: false,
                pageFormat: 'Letter',
              }}
              className="min-w-32"
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Téléchargez votre patron en PDF pour l'imprimer ou le sauvegarder hors ligne.
          </p>
        </section>
      </main>
    </div>
  );
}

/**
 * Exemple de données de patron pour les tests
 */
export const samplePatternData: ExamplePatternData = {
  title: "Pull à col roulé pour débutant",
  type: "Pull",
  difficulty: "Débutant",
  description: "Un pull confortable à col roulé, parfait pour apprendre les bases du tricot. Ce modèle utilise des points simples et est accessible aux tricoteurs débutants.",
  techniques: ["Point jersey", "Point de côte", "Diminutions simples"],
  estimatedTime: "4-6 semaines",
  yarn: {
    type: "Laine mérinos",
    weight: "DK (3)",
    quantity: "600g (6 pelotes de 100g)",
    color: "Bleu marine"
  },
  tools: [
    { name: "Aiguilles circulaires", size: "4.5mm" },
    { name: "Aiguilles à pointe double", size: "4.5mm" },
    { name: "Marqueurs de mailles", size: "4 pièces" }
  ],
  accessories: ["Aiguille à laine", "Ciseaux", "Mètre ruban"],
  gauge: {
    stitches: 18,
    rows: 24,
    notes: "Mesuré en point jersey après blocage"
  },
  abbreviations: {
    "m": "maille",
    "rg": "rang",
    "end": "endroit",
    "env": "envers",
    "dim": "diminution"
  },
  components: [
    {
      name: "Corps du pull",
      instructions: [
        {
          title: "Montage",
          steps: [
            "Monter 144 mailles sur les aiguilles circulaires",
            "Joindre en rond en veillant à ne pas vriller",
            "Placer un marqueur pour indiquer le début du tour"
          ]
        },
        {
          title: "Bordure côtes",
          steps: [
            "Tricoter en côtes 2/2 pendant 5cm",
            "Au dernier tour, augmenter régulièrement pour obtenir 160 mailles"
          ]
        }
      ]
    }
  ],
  assembly: [
    "Coudre les épaules",
    "Monter les manches",
    "Coudre les côtés et les manches",
    "Rentrer tous les fils"
  ],
  notes: "Ce patron est conçu pour une taille M. Ajustez le nombre de mailles selon votre taille.",
  tips: [
    "Toujours faire un échantillon avant de commencer",
    "Utiliser des marqueurs pour séparer les sections",
    "Compter régulièrement vos mailles"
  ]
}; 