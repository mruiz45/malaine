import React from 'react';
import { Metadata } from 'next';
import { 
  UserIcon,
  BookOpenIcon,
  InformationCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import MorphologyAdvisorTool from '@/components/tools/MorphologyAdvisorTool';

export const metadata: Metadata = {
  title: 'Conseiller d\'Adaptation Morphologique | Malaine',
  description: 'Obtenez des conseils personnalisés pour adapter les patrons à votre morphologie corporelle spécifique.',
};

/**
 * Body Morphology Adaptation Advisor Tool Page
 * Implements User Story 5.2 - Body Morphology Adaptation Advisor Tool
 */
export default function MorphologyAdvisorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Conseiller d'Adaptation Morphologique
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Conseils personnalisés pour adapter les patrons à votre morphologie
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">À propos de cet outil</p>
                <p>
                  Cet outil vous aide à comprendre comment ajuster les mesures clés ou les éléments 
                  de patron pour mieux convenir à votre morphologie spécifique. Sélectionnez vos 
                  caractéristiques corporelles pour recevoir des conseils d'ajustement personnalisés.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Tool */}
          <div className="lg:col-span-2">
            <MorphologyAdvisorTool />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Morphology Fitting */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Ajustement Morphologique
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>L'ajustement morphologique</strong> consiste à adapter un patron 
                  standard aux particularités de votre corps pour obtenir un meilleur ajustement.
                </p>
                <div className="space-y-2">
                  <p><strong>Poitrine généreuse :</strong> Nécessite souvent plus de tissu et de mise en forme</p>
                  <p><strong>Épaules larges :</strong> Peut nécessiter plus d'aisance dans le haut</p>
                  <p><strong>Torse long/court :</strong> Ajustements de longueur nécessaires</p>
                  <p><strong>Posture particulière :</strong> Adaptations spécifiques requises</p>
                </div>
              </div>
            </div>

            {/* Fitting Tips */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <LightBulbIcon className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Conseils d'Ajustement
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">Prenez vos mesures avec précision</p>
                  <p>Des mesures précises sont la base de tout bon ajustement.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Faites un échantillon</p>
                  <p>Testez toujours votre échantillon avant de commencer le projet.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajustez progressivement</p>
                  <p>Commencez par de petits ajustements et testez au fur et à mesure.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Documentez vos modifications</p>
                  <p>Notez les ajustements qui fonctionnent pour vos futurs projets.</p>
                </div>
              </div>
            </div>

            {/* Common Adjustments */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Ajustements Courants
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">Ajustement de poitrine (FBA)</p>
                  <p>Ajouter du tissu et de la mise en forme pour une poitrine généreuse.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajustement d'épaules</p>
                  <p>Modifier la largeur ou la pente des épaules selon votre morphologie.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajustement de longueur</p>
                  <p>Raccourcir ou allonger le torse, les manches selon vos proportions.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajustement de taille</p>
                  <p>Adapter la forme de la taille à votre silhouette naturelle.</p>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Outils Complémentaires
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <a href="/measurements" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Gestion des Mesures
                  </a>
                  <p className="text-gray-600">Enregistrez et gérez vos mesures corporelles</p>
                </div>
                <div>
                  <a href="/tools/ease-advisor" className="text-purple-600 hover:text-purple-700 font-medium">
                    → Conseiller d'Aisance
                  </a>
                  <p className="text-gray-600">Obtenez des recommandations d'aisance personnalisées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 