'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon, TrashIcon, SwatchIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getYarnProfile, deleteYarnProfile, formatFiberContent, getYarnWeightDisplayName } from '@/services/yarnProfileService';
import type { YarnProfile } from '@/types/yarn';

export default function YarnProfileViewPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<YarnProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const profileId = params?.id as string;

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getYarnProfile(profileId);
      setProfile(data);
    } catch (err) {
      console.error('Error loading yarn profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load yarn profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    
    if (!confirm(t('yarn.confirm_delete', { name: profile.yarn_name }))) {
      return;
    }

    try {
      setDeleting(true);
      await deleteYarnProfile(profile.id);
      router.push('/yarn-profiles');
    } catch (err) {
      console.error('Error deleting yarn profile:', err);
      alert(t('yarn.delete_error'));
    } finally {
      setDeleting(false);
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

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <SwatchIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t('yarn.error_loading')}
              </h2>
              <p className="text-gray-600 mb-4">{error || 'Yarn profile not found'}</p>
              <Link
                href="/yarn-profiles"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {t('yarn.view.back_to_list')}
              </Link>
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
          <div className="mb-8">
            <Link
              href="/yarn-profiles"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('yarn.breadcrumb.yarn_profiles')}
            </Link>
            
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.yarn_name}</h1>
                {profile.brand_name && (
                  <p className="text-lg text-gray-600 mt-1">{profile.brand_name}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Link
                  href={`/yarn-profiles/${profile.id}/edit`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  {t('yarn.edit')}
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {deleting ? t('yarn.deleting') : t('yarn.delete')}
                </button>
              </div>
            </div>
          </div>

          {/* Color bar if hex code is available */}
          {profile.color_hex_code && (
            <div 
              className="h-4 w-full rounded-md mb-6"
              style={{ backgroundColor: profile.color_hex_code }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.view.basic_info')}</h2>
              
              <div className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('yarn.form.yarn_name')}</dt>
                  <dd className="text-sm text-gray-900">{profile.yarn_name}</dd>
                </div>
                
                {profile.brand_name && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('yarn.form.brand_name')}</dt>
                    <dd className="text-sm text-gray-900">{profile.brand_name}</dd>
                  </div>
                )}
                
                {profile.yarn_weight_category && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('yarn.form.yarn_weight')}</dt>
                    <dd className="text-sm text-gray-900">
                      {getYarnWeightDisplayName(profile.yarn_weight_category)}
                    </dd>
                  </div>
                )}
              </div>
            </div>

            {/* Fiber Composition */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.view.fiber_composition')}</h2>
              
              {profile.fiber_content && profile.fiber_content.length > 0 ? (
                <div className="space-y-2">
                  {profile.fiber_content.map((fiber, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-900 capitalize">{fiber.fiber}</span>
                      <span className="text-sm font-medium text-gray-900">{fiber.percentage}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('yarn.view.no_fiber_info')}</p>
              )}
            </div>

            {/* Skein Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.view.skein_details')}</h2>
              
              <div className="space-y-3">
                {profile.skein_weight_grams && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('yarn.form.skein_weight')}</dt>
                    <dd className="text-sm text-gray-900">{t('yarn.view.weight_grams', { weight: profile.skein_weight_grams })}</dd>
                  </div>
                )}
                
                {profile.skein_yardage && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('yarn.form.skein_yardage')}</dt>
                    <dd className="text-sm text-gray-900">{t('yarn.view.yardage_yards', { yardage: profile.skein_yardage })}</dd>
                  </div>
                )}
                
                {profile.skein_meterage && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('yarn.form.skein_meterage')}</dt>
                    <dd className="text-sm text-gray-900">{t('yarn.view.meterage_meters', { meterage: profile.skein_meterage })}</dd>
                  </div>
                )}
                
                {!profile.skein_weight_grams && !profile.skein_yardage && !profile.skein_meterage && (
                  <p className="text-sm text-gray-500">No skein information available</p>
                )}
              </div>
            </div>

            {/* Color Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.view.color_info')}</h2>
              
              {(profile.color_name || profile.color_hex_code || profile.dye_lot) ? (
                <div className="space-y-3">
                  {profile.color_name && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('yarn.form.color_name')}</dt>
                      <dd className="text-sm text-gray-900">{profile.color_name}</dd>
                    </div>
                  )}
                  
                  {profile.color_hex_code && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('yarn.form.color_hex')}</dt>
                      <dd className="text-sm text-gray-900 flex items-center">
                        <span 
                          className="inline-block w-4 h-4 rounded mr-2 border border-gray-300"
                          style={{ backgroundColor: profile.color_hex_code }}
                        />
                        {profile.color_hex_code}
                      </dd>
                    </div>
                  )}
                  
                  {profile.dye_lot && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('yarn.form.dye_lot')}</dt>
                      <dd className="text-sm text-gray-900">{profile.dye_lot}</dd>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('yarn.view.no_color_info')}</p>
              )}
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.view.additional_info')}</h2>
              
              {(profile.purchase_link || profile.ravelry_id || profile.notes) ? (
                <div className="space-y-4">
                  {profile.purchase_link && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">{t('yarn.form.purchase_link')}</dt>
                      <dd className="text-sm">
                        <a 
                          href={profile.purchase_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {profile.purchase_link}
                        </a>
                      </dd>
                    </div>
                  )}
                  
                  {profile.ravelry_id && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">{t('yarn.form.ravelry_id')}</dt>
                      <dd className="text-sm text-gray-900">{profile.ravelry_id}</dd>
                    </div>
                  )}
                  
                  {profile.notes && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">{t('yarn.form.notes')}</dt>
                      <dd className="text-sm text-gray-900 whitespace-pre-wrap">{profile.notes}</dd>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t('yarn.view.no_additional_info')}</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>
                {t('yarn.view.created')}: {new Date(profile.created_at).toLocaleDateString()}
              </span>
              <span>
                {t('yarn.view.updated')}: {new Date(profile.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 