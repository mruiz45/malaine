"use client";

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="text-gray-600 body-font">
      <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        <div className="text-center lg:w-2/3 w-full">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
            {isClient ? t('welcome_message') : 'Welcome to Malaine – your knitting/crochet assistant'}
          </h1>
        </div>
      </div>
    </section>
  );
}
