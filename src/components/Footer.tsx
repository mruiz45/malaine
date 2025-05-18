'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-left">
              {t('footer.copyright', { year: 2025 })}
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-indigo-300">{t('footer.links.home')}</Link>
            <Link href="/about" className="hover:text-indigo-300">{t('footer.links.about')}</Link>
            <Link href="/contact" className="hover:text-indigo-300">{t('footer.links.contact')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 