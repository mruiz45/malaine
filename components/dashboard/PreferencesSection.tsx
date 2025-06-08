'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tables } from '@/lib/database.types';
import { useRouter } from 'next/navigation';

type Profile = Tables<'profiles'>;

interface PreferencesSectionProps {
  user: Profile;
}

export default function PreferencesSection({ user }: PreferencesSectionProps) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(user.language_preference || 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleLanguageChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language_preference: selectedLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences.');
      }

      await i18n.changeLanguage(selectedLanguage ?? 'en');
      setFeedbackMessage('Preferences saved successfully!');
      
      // Refresh the page to reflect server-side changes if necessary
      router.refresh();

    } catch (error) {
      setFeedbackMessage('An error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Preferences</h2>
      <form onSubmit={handleLanguageChange}>
        <div className="space-y-3">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedLanguage ?? 'en'}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
        {feedbackMessage && <p className="mt-4 text-sm text-gray-600">{feedbackMessage}</p>}
      </form>
    </div>
  );
} 