'use client';

import React from 'react';
import { ReverseGaugeCalculator } from '@/components/tools';

/**
 * Reverse Gauge Calculator Tool Page
 * Demonstrates the standalone usage of the ReverseGaugeCalculator component
 */
export default function ReverseGaugeCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reverse Gauge Calculator
          </h1>
          <p className="text-lg text-gray-600">
            A powerful tool to help you work with gauge discrepancies and calculate adjustments for your knitting and crochet projects.
          </p>
        </div>

        {/* Tool Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            How to Use This Tool
          </h2>
          <div className="space-y-3 text-blue-800">
            <div>
              <strong>Scenario A - Target Dimension to Stitches/Rows:</strong>
              <p className="text-sm">
                You know the dimension you want (e.g., 50cm wide) and your gauge. 
                The tool calculates how many stitches or rows you need.
              </p>
            </div>
            <div>
              <strong>Scenario B - Stitches/Rows to Dimension:</strong>
              <p className="text-sm">
                You have a specific number of stitches or rows (e.g., from a pattern) and your gauge. 
                The tool calculates the resulting dimension.
              </p>
            </div>
            <div>
              <strong>Scenario C - Pattern vs Your Gauge Comparison:</strong>
              <p className="text-sm">
                You have both the pattern&apos;s gauge and your actual gauge. 
                The tool shows how the dimensions will differ and what adjustments you need.
              </p>
            </div>
          </div>
        </div>

        {/* Calculator Component */}
        <ReverseGaugeCalculator
          onCalculationComplete={(result) => {
            console.log('Calculation completed:', result);
            // You could add analytics tracking here, save to user history, etc.
          }}
        />

        {/* Usage Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Example Use Cases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Sweater Width Adjustment</h3>
              <p className="text-sm text-gray-600">
                Your gauge is tighter than the pattern. Use Scenario C to see how much narrower 
                your sweater will be and how many extra stitches to cast on.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Custom Scarf Length</h3>
              <p className="text-sm text-gray-600">
                You want a 180cm scarf. Use Scenario A to calculate exactly how many rows 
                you need with your specific gauge.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Pattern Adaptation</h3>
              <p className="text-sm text-gray-600">
                Converting a pattern from one yarn weight to another. Use Scenario B to see 
                the final dimensions with your new gauge.
              </p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-3">
            💡 Pro Tips
          </h2>
          <ul className="space-y-2 text-yellow-800 text-sm">
            <li>• Always measure your gauge in the same stitch pattern you&apos;ll use for the project</li>
            <li>• Wash and block your gauge swatch before measuring for the most accurate results</li>
            <li>• When in doubt, make a larger gauge swatch (at least 6&quot; x 6&quot;) for better accuracy</li>
            <li>• Remember that gauge can change throughout a project as you get into a rhythm</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 