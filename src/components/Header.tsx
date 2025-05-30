'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '@/utils/AuthContext';
import LogoutButton from './auth/LogoutButton';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  return (
    <header className="bg-stone-50 text-neutral-800 fixed w-full z-10 top-0 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="font-serif text-2xl font-bold">
          <Link href="/">
            Malaine
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          <LanguageSwitcher />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
            aria-label={t('navigation.toggleMenu', 'Toggle menu')}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:underline">{t('navigation.home')}</Link></li>
              <li><Link href="/showcase" className="hover:underline">{t('navigation.showcase')}</Link></li>
              <li><Link href="/tools" className="hover:underline">{t('navigation.tools')}</Link></li>
              {!loading && (
                user ? (
                  <>
                    <li><Link href="/dashboard" className="hover:underline">{t('navigation.dashboard')}</Link></li>
                    <li><LogoutButton className="hover:underline" /></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:underline">{t('navigation.login')}</Link></li>
                    <li><Link href="/signup" className="hover:underline">{t('navigation.signup')}</Link></li>
                  </>
                )
              )}
            </ul>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Mobile navigation menu */}
      {menuOpen && (
        <nav className="md:hidden bg-stone-100 text-neutral-800">
          <ul className="flex flex-col items-center py-4">
            <li className="py-2"><Link href="/" className="hover:underline">{t('navigation.home')}</Link></li>
            <li className="py-2"><Link href="/showcase" className="hover:underline">{t('navigation.showcase')}</Link></li>
            <li className="py-2"><Link href="/tools" className="hover:underline">{t('navigation.tools')}</Link></li>
            {!loading && (
              user ? (
                <>
                  <li className="py-2"><Link href="/dashboard" className="hover:underline">{t('navigation.dashboard')}</Link></li>
                  <li className="py-2"><LogoutButton className="hover:underline" /></li>
                </>
              ) : (
                <>
                  <li className="py-2"><Link href="/login" className="hover:underline">{t('navigation.login')}</Link></li>
                  <li className="py-2"><Link href="/signup" className="hover:underline">{t('navigation.signup')}</Link></li>
                </>
              )
            )}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header; 