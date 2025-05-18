'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from "next/image";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold text-yellow-700 text-center mb-8">{t('home.welcome_message')}</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mt-12 bg-stone-50 p-6 rounded-lg">
          {/* Box 1: Adaptez les patrons */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
              <h3 className="font-serif text-2xl text-yellow-700 mb-4 text-center">{t('home.features.adapt_patterns.title')}</h3>
              {/* Placeholder for image - to be added later */}
              <div className="w-full h-48 bg-gray-200 my-4 rounded flex items-center justify-center">
                <span className="text-gray-500">Image coming soon</span>
              </div>
            </div>
            <div className="bg-gray-800 p-4 text-white min-h-36">
              <h4 className="font-semibold uppercase text-sm mb-1">{t('home.features.adapt_patterns.footer_title', 'Pattern Wizard')}</h4>
              <p className="text-sm">{t('home.features.adapt_patterns.description')}</p>
            </div>
          </div>

          {/* Box 2: Editeur interactif */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
              <h3 className="font-serif text-2xl text-yellow-700 mb-4 text-center">{t('home.features.interactive_editor.title')}</h3>
              {/* Placeholder for image - to be added later */}
              <div className="w-full h-48 bg-gray-200 my-4 rounded flex items-center justify-center">
                <span className="text-gray-500">Image coming soon</span>
              </div>
            </div>
            <div className="bg-gray-800 p-4 text-white min-h-36">
              <h4 className="font-semibold uppercase text-sm mb-1">{t('home.features.interactive_editor.footer_title', 'ADAPTEZ VOS PATRONS')}</h4>
              <p className="text-sm">{t('home.features.interactive_editor.description')}</p>
            </div>
          </div>

          {/* Box 3: Assistant IA */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
              <h3 className="font-serif text-2xl text-yellow-700 mb-4 text-center">{t('home.features.ai_assistant.title')}</h3>
              {/* Placeholder for image - to be added later */}
              <div className="w-full h-48 bg-gray-200 my-4 rounded flex items-center justify-center">
                <span className="text-gray-500">Image coming soon</span>
              </div>
            </div>
            <div className="bg-gray-800 p-4 text-white min-h-36">
              <h4 className="font-semibold uppercase text-sm mb-1">{t('home.features.ai_assistant.footer_title', 'VOTRE ASSISTANT AI')}</h4>
              <p className="text-sm">{t('home.features.ai_assistant.description')}</p>
            </div>
          </div>
        </div>

        {/* New Title and Text Section */}
        <div className="text-center my-10 md:my-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">{t('home.stitch_by_stitch.title', 'Stitch by Stitch')}</h2>
          <p className="text-lg md:text-xl text-gray-700 mb-3">{t('home.stitch_by_stitch.subtitle', 'Learn, all you need to create your own magic')}</p>
          <p className="text-md text-gray-600 px-4">{t('home.stitch_by_stitch.description', 'from yarns, needles and accessoires to a pattern library and much more...')}</p>
        </div>

        {/* First row of three additional boxes */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {/* New Box 1 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box1_placeholder', 'Link to Page 1')}</p>
          </div>
          {/* New Box 2 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box2_placeholder', 'Link to Page 2')}</p>
          </div>
          {/* New Box 3 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box3_placeholder', 'Link to Page 3')}</p>
          </div>
        </div>

        {/* Second row of three additional boxes */}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {/* New Box 4 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box4_placeholder', 'Link to Page 4')}</p>
          </div>
          {/* New Box 5 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box5_placeholder', 'Link to Page 5')}</p>
          </div>
          {/* New Box 6 */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 h-48 flex items-center justify-center">
            <p className="text-gray-500 text-center">{t('home.new_section.box6_placeholder', 'Link to Page 6')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
