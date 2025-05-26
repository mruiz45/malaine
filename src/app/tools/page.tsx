import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  CalculatorIcon, 
  WrenchScrewdriverIcon,
  BeakerIcon,
  ChartBarIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Outils de Développement | Malaine',
  description: 'Page temporaire pour tester tous les outils développés pour Malaine',
};

/**
 * Page temporaire pour tester tous les outils développés
 * Cette page sera utilisée pendant le développement pour accéder facilement à tous les outils
 */
export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Outils de Développement
          </h1>
          <p className="text-lg text-gray-600">
            Page temporaire pour tester tous les outils développés pour Malaine
          </p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Cette page est temporaire et sera utilisée uniquement pendant le développement 
              pour faciliter les tests des différents outils.
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Reverse Gauge Calculator */}
          <Link 
            href="/tools/reverse-gauge-calculator"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <CalculatorIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                Calculateur d'Échantillon Inversé
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Calculez les mailles/rangs nécessaires pour des dimensions cibles, 
              ou les dimensions résultantes à partir d'un nombre de mailles.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                US_2.1
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ Implémenté
              </span>
            </div>
          </Link>

          {/* Yarn Quantity Estimator */}
          <Link 
            href="/tools/yarn-quantity-estimator"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <ScaleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-3">
                Estimateur de Quantité de Laine
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Estimez la quantité de laine nécessaire pour votre projet basée sur 
              l'échantillon, les spécifications de laine et le type de projet.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                US_2.2
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✅ Implémenté
              </span>
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                Outil Futur #1
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Prochain outil à développer selon les spécifications fonctionnelles.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                À venir
              </span>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                Outil Futur #2
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Autre outil à développer selon les spécifications fonctionnelles.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                À venir
              </span>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-200 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-500 ml-3">
                Outil Futur #3
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Autre outil à développer selon les spécifications fonctionnelles.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                À venir
              </span>
            </div>
          </div>

        </div>

        {/* Development Info */}
        <div className="mt-12 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📋 Informations de Développement
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Outils Implémentés</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✅ Calculateur d'Échantillon Inversé (US_2.1)</li>
                <li>✅ Estimateur de Quantité de Laine (US_2.2)</li>
                <li className="text-gray-400">⏳ Prochain outil selon spécifications</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Architecture</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Composants réutilisables</li>
                <li>• Services avec logique métier</li>
                <li>• API routes Next.js</li>
                <li>• Tests unitaires avec Jest</li>
                <li>• Internationalisation (FR/EN)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            🔗 Liens Rapides
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/dashboard"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → Tableau de Bord
            </Link>
            <Link 
              href="/gauge-profiles"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → Profils d'Échantillon
            </Link>
            <Link 
              href="/measurements"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              → Mensurations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 