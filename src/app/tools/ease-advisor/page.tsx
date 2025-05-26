/**
 * Ease Advisor Tool Page
 * Implements User Story 3.2 - Ease Selection Advisor Tool
 * 
 * Dedicated page for the Ease Selection Advisor tool with educational content
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChevronLeftIcon,
  SparklesIcon,
  InformationCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import EaseAdvisorTool from '@/components/tools/EaseAdvisorTool';

export const metadata: Metadata = {
  title: 'Ease Selection Advisor | Malaine',
  description: 'Get personalized ease recommendations based on garment type, desired fit, and yarn weight for the perfect style and comfort.',
  keywords: ['ease', 'knitting', 'crochet', 'fit', 'garment', 'advisor', 'recommendations']
};

/**
 * Ease Advisor Tool Page Component
 */
export default function EaseAdvisorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/tools"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                <span>Back to Tools</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Ease Selection Advisor
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Tool */}
          <div className="lg:col-span-2">
            <EaseAdvisorTool />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* About Ease */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  About Ease
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>Ease</strong> is the difference between your body measurements 
                  and the finished garment measurements. It determines how the garment 
                  will fit and feel when worn.
                </p>
                <div className="space-y-2">
                  <p><strong>Negative Ease:</strong> Garment is smaller than body measurements (stretchy fabrics)</p>
                  <p><strong>Zero Ease:</strong> Garment matches body measurements exactly</p>
                  <p><strong>Positive Ease:</strong> Garment is larger than body measurements</p>
                </div>
              </div>
            </div>

            {/* Fit Guide */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpenIcon className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Fit Guide
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900">Very Close-fitting</p>
                  <p>Negative ease, body-hugging fit. Best with stretchy yarns.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Close-fitting</p>
                  <p>Zero to minimal ease, fitted but comfortable.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Classic</p>
                  <p>Slight positive ease, traditional comfortable fit.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Relaxed</p>
                  <p>Moderate positive ease, loose and comfortable.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Oversized</p>
                  <p>Significant positive ease, very loose and flowing.</p>
                </div>
              </div>
            </div>

            {/* Yarn Weight Considerations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Yarn Weight Impact
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Different yarn weights affect how ease translates to the final garment:
                </p>
                <div className="space-y-2">
                  <p><strong>Fingering/Sport:</strong> More precise ease control, good for fitted garments</p>
                  <p><strong>DK/Worsted:</strong> Balanced drape and structure, versatile for most fits</p>
                  <p><strong>Bulky:</strong> Adds volume, may require less ease for desired fit</p>
                </div>
              </div>
            </div>

            {/* Related Tools */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Related Tools
              </h3>
              <div className="space-y-3">
                <Link
                  href="/measurements"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Body Measurements</div>
                  <div className="text-sm text-gray-600">Manage your body measurements for accurate sizing</div>
                </Link>
                <Link
                  href="/ease-preferences"
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Ease Preferences</div>
                  <div className="text-sm text-gray-600">Save and manage your personal ease preferences</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 