'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { PlusIcon, SwatchIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getYarnProfiles, deleteYarnProfile } from '@/services/yarnProfileService';
import type { YarnProfile } from '@/types/yarn';

export default function YarnProfilesPage() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<YarnProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getYarnProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Error loading yarn profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load yarn profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile: YarnProfile) => {
    if (!confirm(t('yarn.confirm_delete', { name: profile.yarn_name }))) {
      return;
    }

    try {
      setDeletingId(profile.id);
      await deleteYarnProfile(profile.id);
      setProfiles(profiles.filter(p => p.id !== profile.id));
    } catch (err) {
      console.error('Error deleting yarn profile:', err);
      alert(t('yarn.delete_error'));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <SwatchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('yarn.loading')}</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <SwatchIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('yarn.error_loading')}
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadProfiles}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {t('yarn.try_again')}
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('yarn.title')}</h1>
              <p className="text-gray-600 mt-1">{t('yarn.subtitle')}</p>
            </div>
            <Link
              href="/yarn-profiles/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('yarn.create_new')}
            </Link>
          </div>

          {/* Content */}
          {profiles.length === 0 ? (
            <div className="text-center py-12">
              <SwatchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('yarn.no_profiles')}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('yarn.no_profiles_description')}
              </p>
              <Link
                href="/yarn-profiles/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('yarn.create_first')}
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  {t('yarn.your_profiles')}
                </h2>
                <p className="text-sm text-gray-500">
                  {profiles.length} {profiles.length === 1 ? t('yarn.profile_count') : t('yarn.profile_count_plural')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <YarnProfileCard
                    key={profile.id}
                    profile={profile}
                    onDelete={handleDelete}
                    isDeleting={deletingId === profile.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

interface YarnProfileCardProps {
  profile: YarnProfile;
  onDelete: (profile: YarnProfile) => void;
  isDeleting: boolean;
}

function YarnProfileCard({ profile, onDelete, isDeleting }: YarnProfileCardProps) {
  const { t } = useTranslation();

  const formatFiberContent = (fiberContent?: any[]) => {
    if (!fiberContent || fiberContent.length === 0) return null;
    return fiberContent.map(fiber => `${fiber.percentage}% ${fiber.fiber}`).join(', ');
  };

  const getYarnWeightDisplay = (category?: string) => {
    if (!category) return null;
    const weightMap: Record<string, string> = {
      'Lace': '0 - Lace',
      'Fingering': '1 - Fingering',
      'DK': '3 - DK',
      'Worsted': '4 - Worsted',
      'Bulky': '5 - Bulky',
      'Super Bulky': '6 - Super Bulky',
      'Jumbo': '7 - Jumbo'
    };
    return weightMap[category] || category;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Color bar if hex code is available */}
      {profile.color_hex_code && (
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: profile.color_hex_code }}
        />
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {profile.yarn_name}
            </h3>
            {profile.brand_name && (
              <p className="text-sm text-gray-600 mb-2">{profile.brand_name}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {profile.yarn_weight_category && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">Weight:</span>
              <span className="text-gray-900">{getYarnWeightDisplay(profile.yarn_weight_category)}</span>
            </div>
          )}
          
          {formatFiberContent(profile.fiber_content) && (
            <div className="flex items-start text-sm">
              <span className="text-gray-500 w-16 flex-shrink-0">Fiber:</span>
              <span className="text-gray-900">{formatFiberContent(profile.fiber_content)}</span>
            </div>
          )}

          {(profile.skein_weight_grams || profile.skein_yardage || profile.skein_meterage) && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">Skein:</span>
              <span className="text-gray-900">
                {profile.skein_weight_grams && `${profile.skein_weight_grams}g`}
                {profile.skein_weight_grams && (profile.skein_yardage || profile.skein_meterage) && ' / '}
                {profile.skein_yardage && `${profile.skein_yardage}yd`}
                {profile.skein_meterage && `${profile.skein_meterage}m`}
              </span>
            </div>
          )}

          {profile.color_name && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">Color:</span>
              <span className="text-gray-900">{profile.color_name}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link
              href={`/yarn-profiles/${profile.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('yarn.view')}
            </Link>
            <Link
              href={`/yarn-profiles/${profile.id}/edit`}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              {t('yarn.edit')}
            </Link>
          </div>
          <button
            onClick={() => onDelete(profile)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
          >
            {isDeleting ? t('yarn.deleting') : t('yarn.delete')}
          </button>
        </div>
      </div>
    </div>
  );
} 