"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { type UserDetails } from '@/lib/types';
import LogoutButton from './auth/LogoutButton';

const Header = ({ user }: { user: UserDetails | null }) => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="bg-gray-100 text-gray-600 body-font shadow-md">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href="/" className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <span className="ml-3 text-xl">Malaine</span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <Link href="/" className="mr-5 hover:text-gray-900">{isClient ? t('nav_home') : 'Home'}</Link>
          <Link href="/projects" className="mr-5 hover:text-gray-900">{isClient ? t('nav_projects') : 'Projects'}</Link>
          {user && (
            <Link href="/dashboard" className="mr-5 hover:text-gray-900">
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className="mr-5 hover:text-gray-900">
              Admin
            </Link>
          )}
        </nav>
        <div className="md:ml-4 flex items-center">
          {isClient && <LanguageSwitcher />}
          <div className="ml-4">
            {user ? (
              <LogoutButton />
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium border bg-gray-200 hover:bg-gray-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 