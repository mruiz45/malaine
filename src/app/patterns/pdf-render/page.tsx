/**
 * Page dédiée au rendu PDF des patrons - US_9.2
 * Cette page est optimisée pour la conversion PDF via Puppeteer
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PdfTemplateData, SchematicsData } from '@/types/pdf';

export default function PdfRenderPage() {
  const searchParams = useSearchParams();
  const [templateData, setTemplateData] = useState<PdfTemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const encodedData = searchParams?.get('data');
      if (!encodedData) {
        setError('Aucune donnée de patron fournie');
        setLoading(false);
        return;
      }

      const parsedData = JSON.parse(decodeURIComponent(encodedData)) as PdfTemplateData;
      setTemplateData(parsedData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du parsing des données:', err);
      setError('Données de patron invalides');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement du patron...</div>
      </div>
    );
  }

  if (error || !templateData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-lg">{error || 'Erreur de chargement'}</div>
      </div>
    );
  }

  return (
    <div 
      className="pdf-content print:p-0 print:m-0 max-w-none"
      data-pdf-ready="true"
    >
      <PdfPatternTemplate data={templateData} />
    </div>
  );
}

/**
 * Template principal pour le rendu PDF du patron
 */
function PdfPatternTemplate({ data }: { data: PdfTemplateData }) {
  const { pattern, options, schematics, metadata } = data;

  return (
    <div className="pdf-template font-serif text-black bg-white">
      {/* En-tête du document */}
      {options.includeHeader && (
        <header className="print:hidden mb-6 border-b-2 border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            {metadata.title}
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Généré le {metadata.generatedAt}
          </p>
        </header>
      )}

      {/* Contenu principal du patron */}
      <main className="pdf-main-content space-y-8">
        {/* Section des informations générales */}
        <PatternInfoSection pattern={pattern} />

        {/* Section des matériaux */}
        <MaterialsSection pattern={pattern} />

        {/* Section de l'échantillon */}
        <GaugeSection pattern={pattern} />

        {/* Instructions du patron */}
        <InstructionsSection pattern={pattern} />

        {/* Diagrammes schématiques (US_9.3 future) */}
        {options.includeSchematics && schematics && schematics.length > 0 && (
          <SchematicsSection schematics={schematics} />
        )}

        {/* Section d'assemblage */}
        <AssemblySection pattern={pattern} />

        {/* Notes et conseils */}
        <NotesSection pattern={pattern} />
      </main>

      {/* Pied de page */}
      <footer className="print:hidden mt-12 pt-6 border-t-2 border-gray-300">
        <p className="text-center text-sm text-gray-500">
          Patron généré par Malaine - Assistant Tricot & Crochet
        </p>
      </footer>
    </div>
  );
}

/**
 * Section des informations générales du patron
 */
function PatternInfoSection({ pattern }: { pattern: any }) {
  return (
    <section className="pattern-info print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Informations du Patron
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Type de projet :</strong> {pattern.type || 'Non spécifié'}
        </div>
        <div>
          <strong>Difficulté :</strong> {pattern.difficulty || 'Non spécifiée'}
        </div>
        <div>
          <strong>Techniques utilisées :</strong> {pattern.techniques?.join(', ') || 'Non spécifiées'}
        </div>
        <div>
          <strong>Temps estimé :</strong> {pattern.estimatedTime || 'Non spécifié'}
        </div>
      </div>
      {pattern.description && (
        <div className="mt-4">
          <strong>Description :</strong>
          <p className="mt-2 text-gray-700">{pattern.description}</p>
        </div>
      )}
    </section>
  );
}

/**
 * Section des matériaux nécessaires
 */
function MaterialsSection({ pattern }: { pattern: any }) {
  return (
    <section className="materials print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Matériaux Nécessaires
      </h2>
      
      {/* Laines */}
      {pattern.yarn && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Laine</h3>
          <div className="ml-4">
            <p><strong>Type :</strong> {pattern.yarn.type}</p>
            <p><strong>Poids :</strong> {pattern.yarn.weight}</p>
            <p><strong>Quantité :</strong> {pattern.yarn.quantity}</p>
            {pattern.yarn.color && <p><strong>Couleur :</strong> {pattern.yarn.color}</p>}
          </div>
        </div>
      )}

      {/* Aiguilles/Crochets */}
      {pattern.tools && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Outils</h3>
          <ul className="ml-4 list-disc">
            {pattern.tools.map((tool: any, index: number) => (
              <li key={index}>{tool.name} - {tool.size}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessoires */}
      {pattern.accessories && pattern.accessories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Accessoires</h3>
          <ul className="ml-4 list-disc">
            {pattern.accessories.map((accessory: string, index: number) => (
              <li key={index}>{accessory}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * Section de l'échantillon/gauge
 */
function GaugeSection({ pattern }: { pattern: any }) {
  if (!pattern.gauge) return null;

  return (
    <section className="gauge print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Échantillon
      </h2>
      <div className="bg-gray-50 p-4 rounded border">
        <p className="font-semibold mb-2">Réalisez un échantillon de 10cm x 10cm :</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Mailles :</strong> {pattern.gauge.stitches} mailles
          </div>
          <div>
            <strong>Rangs :</strong> {pattern.gauge.rows} rangs
          </div>
        </div>
        {pattern.gauge.notes && (
          <p className="mt-2 text-sm italic">{pattern.gauge.notes}</p>
        )}
      </div>
    </section>
  );
}

/**
 * Section des instructions du patron
 */
function InstructionsSection({ pattern }: { pattern: any }) {
  if (!pattern.instructions) return null;

  return (
    <section className="instructions">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Instructions
      </h2>
      
      {/* Abréviations */}
      {pattern.abbreviations && (
        <div className="mb-6 print:break-inside-avoid">
          <h3 className="text-lg font-semibold mb-2">Abréviations</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(pattern.abbreviations).map(([abbrev, meaning]) => (
              <div key={abbrev} className="flex">
                <span className="font-medium mr-2">{abbrev}:</span>
                <span>{meaning as string}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions par composant */}
      {pattern.components?.map((component: any, index: number) => (
        <ComponentInstructions 
          key={index} 
          component={component} 
          index={index}
        />
      ))}
    </section>
  );
}

/**
 * Instructions pour un composant du patron
 */
function ComponentInstructions({ component, index }: { component: any; index: number }) {
  return (
    <div className="component-instructions mb-8 print:break-inside-avoid">
      <h3 className="text-xl font-semibold mb-3 text-blue-800">
        {component.name || `Composant ${index + 1}`}
      </h3>
      
      {component.instructions?.map((instruction: any, instrIndex: number) => (
        <div key={instrIndex} className="mb-4">
          {instruction.title && (
            <h4 className="font-medium mb-2">{instruction.title}</h4>
          )}
          <div className="ml-4">
            {Array.isArray(instruction.steps) ? (
              <ol className="list-decimal list-inside space-y-1">
                {instruction.steps.map((step: string, stepIndex: number) => (
                  <li key={stepIndex} className="text-sm">{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm">{instruction.content || instruction}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Section des diagrammes schématiques (US_9.3 future)
 */
function SchematicsSection({ schematics }: { schematics: SchematicsData[] }) {
  const inlineSchematics = schematics.filter(s => s.position === 'inline');
  const appendixSchematics = schematics.filter(s => s.position === 'appendix');

  return (
    <>
      {/* Diagrammes inline */}
      {inlineSchematics.map((schematic) => (
        <div key={schematic.id} className="schematic-inline print:break-inside-avoid mb-6">
          <h3 className="text-lg font-semibold mb-2">{schematic.title}</h3>
          <div className="border rounded p-4 bg-gray-50">
            <div dangerouslySetInnerHTML={{ __html: schematic.content }} />
          </div>
        </div>
      ))}

      {/* Annexe des diagrammes */}
      {appendixSchematics.length > 0 && (
        <section className="schematics-appendix print:break-before-page">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
            Diagrammes et Schémas
          </h2>
          {appendixSchematics.map((schematic) => (
            <div key={schematic.id} className="schematic-appendix mb-8 print:break-inside-avoid">
              <h3 className="text-xl font-semibold mb-3">{schematic.title}</h3>
              <div className="border rounded p-4">
                <div dangerouslySetInnerHTML={{ __html: schematic.content }} />
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

/**
 * Section d'assemblage
 */
function AssemblySection({ pattern }: { pattern: any }) {
  if (!pattern.assembly) return null;

  return (
    <section className="assembly print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Assemblage
      </h2>
      <div className="space-y-3">
        {Array.isArray(pattern.assembly) ? (
          <ol className="list-decimal list-inside space-y-2">
            {pattern.assembly.map((step: string, index: number) => (
              <li key={index} className="text-sm">{step}</li>
            ))}
          </ol>
        ) : (
          <p>{pattern.assembly}</p>
        )}
      </div>
    </section>
  );
}

/**
 * Section des notes et conseils
 */
function NotesSection({ pattern }: { pattern: any }) {
  if (!pattern.notes && !pattern.tips) return null;

  return (
    <section className="notes print:break-inside-avoid">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-400 pb-2">
        Notes et Conseils
      </h2>
      
      {pattern.notes && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Notes importantes</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-sm">{pattern.notes}</p>
          </div>
        </div>
      )}

      {pattern.tips && pattern.tips.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Conseils utiles</h3>
          <ul className="list-disc list-inside space-y-1">
            {pattern.tips.map((tip: string, index: number) => (
              <li key={index} className="text-sm">{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
} 