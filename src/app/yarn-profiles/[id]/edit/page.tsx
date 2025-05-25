'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, SwatchIcon } from '@heroicons/react/24/outline';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getYarnProfile, updateYarnProfile, validateYarnProfileData } from '@/services/yarnProfileService';
import type { YarnProfile, UpdateYarnProfile, YarnWeightCategory } from '@/types/yarn';

const YARN_WEIGHT_OPTIONS: YarnWeightCategory[] = [
  'Lace', 'Fingering', 'DK', 'Worsted', 'Bulky', 'Super Bulky', 'Jumbo'
];

const FIBER_TYPE_OPTIONS = [
  'wool', 'cotton', 'acrylic', 'alpaca', 'silk', 'linen', 'bamboo', 
  'cashmere', 'mohair', 'nylon', 'polyester', 'merino', 'angora'
];

export default function EditYarnProfilePage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [originalProfile, setOriginalProfile] = useState<YarnProfile | null>(null);

  const profileId = params?.id as string;

  const [formData, setFormData] = useState<UpdateYarnProfile>({
    yarn_name: '',
    brand_name: '',
    fiber_content: [],
    yarn_weight_category: undefined,
    skein_yardage: undefined,
    skein_meterage: undefined,
    skein_weight_grams: undefined,
    color_name: '',
    color_hex_code: '',
    dye_lot: '',
    purchase_link: '',
    ravelry_id: '',
    notes: ''
  });

  useEffect(() => {
    if (profileId) {
      loadProfile();
    }
  }, [profileId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getYarnProfile(profileId);
      setOriginalProfile(profile);
      
      // Populate form with existing data
      setFormData({
        yarn_name: profile.yarn_name,
        brand_name: profile.brand_name || '',
        fiber_content: profile.fiber_content || [],
        yarn_weight_category: profile.yarn_weight_category,
        skein_yardage: profile.skein_yardage,
        skein_meterage: profile.skein_meterage,
        skein_weight_grams: profile.skein_weight_grams,
        color_name: profile.color_name || '',
        color_hex_code: profile.color_hex_code || '',
        dye_lot: profile.dye_lot || '',
        purchase_link: profile.purchase_link || '',
        ravelry_id: profile.ravelry_id || '',
        notes: profile.notes || ''
      });
    } catch (err) {
      console.error('Error loading yarn profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load yarn profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateYarnProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFiberContentChange = (index: number, field: 'fiber' | 'percentage', value: string | number) => {
    const newFiberContent = [...(formData.fiber_content || [])];
    if (field === 'fiber') {
      newFiberContent[index] = { ...newFiberContent[index], fiber: value as string };
    } else {
      newFiberContent[index] = { ...newFiberContent[index], percentage: value as number };
    }
    setFormData(prev => ({ ...prev, fiber_content: newFiberContent }));
  };

  const addFiberContent = () => {
    const newFiberContent = [...(formData.fiber_content || []), { fiber: '', percentage: 0 }];
    setFormData(prev => ({ ...prev, fiber_content: newFiberContent }));
  };

  const removeFiberContent = (index: number) => {
    const newFiberContent = (formData.fiber_content || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, fiber_content: newFiberContent }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateYarnProfileData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Clean up form data - remove empty strings and convert to null/undefined
      const cleanedData: UpdateYarnProfile = {
        yarn_name: formData.yarn_name?.trim(),
        brand_name: formData.brand_name?.trim() || undefined,
        fiber_content: formData.fiber_content && formData.fiber_content.length > 0 ? formData.fiber_content : undefined,
        yarn_weight_category: formData.yarn_weight_category || undefined,
        skein_yardage: formData.skein_yardage || undefined,
        skein_meterage: formData.skein_meterage || undefined,
        skein_weight_grams: formData.skein_weight_grams || undefined,
        color_name: formData.color_name?.trim() || undefined,
        color_hex_code: formData.color_hex_code?.trim() || undefined,
        dye_lot: formData.dye_lot?.trim() || undefined,
        purchase_link: formData.purchase_link?.trim() || undefined,
        ravelry_id: formData.ravelry_id?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      };

      await updateYarnProfile(profileId, cleanedData);
      router.push(`/yarn-profiles/${profileId}`);
    } catch (error) {
      console.error('Error updating yarn profile:', error);
      setErrors({ submit: error instanceof Error ? error.message : t('yarn.form.save_error') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
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

  if (error || !originalProfile) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/yarn-profiles/${profileId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {originalProfile.yarn_name}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('yarn.form.title_edit')}</h1>
            <p className="text-gray-600 mt-1">{t('yarn.form.description_edit')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.form.basic_info')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="yarn_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.yarn_name')} *
                  </label>
                  <input
                    type="text"
                    id="yarn_name"
                    value={formData.yarn_name}
                    onChange={(e) => handleInputChange('yarn_name', e.target.value)}
                    placeholder={t('yarn.form.yarn_name_placeholder')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.yarn_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.yarn_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.yarn_name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="brand_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.brand_name')}
                  </label>
                  <input
                    type="text"
                    id="brand_name"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange('brand_name', e.target.value)}
                    placeholder={t('yarn.form.brand_name_placeholder')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.brand_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.brand_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.brand_name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="yarn_weight_category" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.yarn_weight')}
                  </label>
                  <select
                    id="yarn_weight_category"
                    value={formData.yarn_weight_category || ''}
                    onChange={(e) => handleInputChange('yarn_weight_category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('yarn.form.yarn_weight_placeholder')}</option>
                    {YARN_WEIGHT_OPTIONS.map(weight => (
                      <option key={weight} value={weight}>
                        {t(`yarn.weight_categories.${weight.toLowerCase().replace(' ', '_')}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Fiber Composition */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">{t('yarn.form.fiber_composition')}</h2>
                <button
                  type="button"
                  onClick={addFiberContent}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {t('yarn.form.add_fiber')}
                </button>
              </div>

              {formData.fiber_content && formData.fiber_content.length > 0 && (
                <div className="space-y-3">
                  {formData.fiber_content.map((fiber, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-1">
                        <select
                          value={fiber.fiber}
                          onChange={(e) => handleFiberContentChange(index, 'fiber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t('yarn.form.fiber_type')}</option>
                          {FIBER_TYPE_OPTIONS.map(fiberType => (
                            <option key={fiberType} value={fiberType}>
                              {t(`yarn.fiber_types.${fiberType}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={fiber.percentage || ''}
                          onChange={(e) => handleFiberContentChange(index, 'percentage', parseFloat(e.target.value) || 0)}
                          placeholder="%"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFiberContent(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.fiber_content && (
                <p className="text-red-600 text-sm mt-2">{errors.fiber_content}</p>
              )}
            </div>

            {/* Skein Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.form.skein_details')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="skein_weight_grams" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.skein_weight')}
                  </label>
                  <input
                    type="number"
                    id="skein_weight_grams"
                    min="0"
                    step="0.1"
                    value={formData.skein_weight_grams || ''}
                    onChange={(e) => handleInputChange('skein_weight_grams', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.skein_weight_grams ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.skein_weight_grams && (
                    <p className="text-red-600 text-sm mt-1">{errors.skein_weight_grams}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="skein_yardage" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.skein_yardage')}
                  </label>
                  <input
                    type="number"
                    id="skein_yardage"
                    min="0"
                    step="0.1"
                    value={formData.skein_yardage || ''}
                    onChange={(e) => handleInputChange('skein_yardage', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.skein_yardage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.skein_yardage && (
                    <p className="text-red-600 text-sm mt-1">{errors.skein_yardage}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="skein_meterage" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.skein_meterage')}
                  </label>
                  <input
                    type="number"
                    id="skein_meterage"
                    min="0"
                    step="0.1"
                    value={formData.skein_meterage || ''}
                    onChange={(e) => handleInputChange('skein_meterage', parseFloat(e.target.value) || undefined)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.skein_meterage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.skein_meterage && (
                    <p className="text-red-600 text-sm mt-1">{errors.skein_meterage}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Color Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.form.color_info')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="color_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.color_name')}
                  </label>
                  <input
                    type="text"
                    id="color_name"
                    value={formData.color_name}
                    onChange={(e) => handleInputChange('color_name', e.target.value)}
                    placeholder={t('yarn.form.color_name_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="color_hex_code" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.color_hex')}
                  </label>
                  <input
                    type="text"
                    id="color_hex_code"
                    value={formData.color_hex_code}
                    onChange={(e) => handleInputChange('color_hex_code', e.target.value)}
                    placeholder={t('yarn.form.color_hex_placeholder')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.color_hex_code ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.color_hex_code && (
                    <p className="text-red-600 text-sm mt-1">{errors.color_hex_code}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dye_lot" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.dye_lot')}
                  </label>
                  <input
                    type="text"
                    id="dye_lot"
                    value={formData.dye_lot}
                    onChange={(e) => handleInputChange('dye_lot', e.target.value)}
                    placeholder={t('yarn.form.dye_lot_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('yarn.form.additional_info')}</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="purchase_link" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.purchase_link')}
                  </label>
                  <input
                    type="url"
                    id="purchase_link"
                    value={formData.purchase_link}
                    onChange={(e) => handleInputChange('purchase_link', e.target.value)}
                    placeholder={t('yarn.form.purchase_link_placeholder')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.purchase_link ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.purchase_link && (
                    <p className="text-red-600 text-sm mt-1">{errors.purchase_link}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="ravelry_id" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.ravelry_id')}
                  </label>
                  <input
                    type="text"
                    id="ravelry_id"
                    value={formData.ravelry_id}
                    onChange={(e) => handleInputChange('ravelry_id', e.target.value)}
                    placeholder={t('yarn.form.ravelry_id_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('yarn.form.notes')}
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={t('yarn.form.notes_placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href={`/yarn-profiles/${profileId}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                {t('yarn.cancel')}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? t('yarn.form.updating') : t('yarn.form.update_button')}
              </button>
            </div>

            {errors.submit && (
              <div className="text-red-600 text-sm text-center">{errors.submit}</div>
            )}
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
} 