'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const UnauthorizedPage = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center">
      <h1 className="text-4xl font-bold text-red-600">
        {isClient ? t('unauthorized_title') : 'Accès Refusé'}
      </h1>
      <p className="mt-4 text-lg">
        {isClient ? t('unauthorized_message') : 'Vous n\'avez pas les permissions nécessaires pour voir cette page.'}
      </p>
      <p className="mt-2 text-gray-600">
        {isClient ? t('unauthorized_contact') : 'Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter un administrateur.'}
      </p>
      <Link href="/" className="mt-6 px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700">
        {isClient ? t('unauthorized_go_home') : 'Aller à l\'Accueil'}
      </Link>
    </div>
  );
};

export default UnauthorizedPage; 