'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h1>
        <LoginForm />
      </div>
    </div>
  );
} 