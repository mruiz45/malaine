'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('auth.reset_password')}</h1>
        <ResetPasswordForm />
      </div>
    </div>
  );
} 