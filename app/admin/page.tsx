'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AdminPage = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">
        {isClient ? t('admin_title') : 'Tableau de Bord Administrateur'}
      </h1>
      <p className="mt-4 text-lg">
        {isClient ? t('admin_welcome') : 'Bienvenue, Administrateur !'}
      </p>
      <p className="mt-2 text-gray-600">
        {isClient ? t('admin_description') : 'Cette page est uniquement à des fins administratives.'}
      </p>
    </div>
  );
};

export default AdminPage; 