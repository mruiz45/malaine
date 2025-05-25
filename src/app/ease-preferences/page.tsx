'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import type { EasePreference, CreateEasePreference, UpdateEasePreference } from '@/types/ease';
import { 
  getEasePreferences, 
  createEasePreference, 
  updateEasePreference, 
  deleteEasePreference 
} from '@/services/easeService';
import EasePreferenceList from '@/components/ease/EasePreferenceList';
import EaseForm from '@/components/ease/EaseForm';

type ViewMode = 'list' | 'create' | 'edit';

/**
 * Ease Preferences page - Manages user's ease preferences
 * Implements User Story 1.3 - Ease (Aisance) Preference Input and Management
 */
export default function EasePreferencesPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State management
  const [easePreferences, setEasePreferences] = useState<EasePreference[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingPreference, setEditingPreference] = useState<EasePreference | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load ease preferences on component mount
  useEffect(() => {
    if (user) {
      loadEasePreferences();
    }
  }, [user]);

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Loads ease preferences from the API
   */
  const loadEasePreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const preferences = await getEasePreferences();
      setEasePreferences(preferences);
    } catch (err: any) {
      console.error('Error loading ease preferences:', err);
      setError(t('ease.messages.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles creating a new ease preference
   */
  const handleCreatePreference = async (data: CreateEasePreference) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newPreference = await createEasePreference(data);
      setEasePreferences(prev => [newPreference, ...prev]);
      setViewMode('list');
      setSuccessMessage(t('ease.messages.created_success'));
    } catch (err: any) {
      console.error('Error creating ease preference:', err);
      if (err.message.includes('already exists')) {
        setError(t('ease.messages.name_exists'));
      } else {
        setError(t('ease.messages.create_error'));
      }
      throw err; // Re-throw to prevent form from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles updating an existing ease preference
   */
  const handleUpdatePreference = async (data: UpdateEasePreference) => {
    if (!editingPreference) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedPreference = await updateEasePreference(editingPreference.id, data);
      setEasePreferences(prev => 
        prev.map(preference => 
          preference.id === editingPreference.id ? updatedPreference : preference
        )
      );
      setViewMode('list');
      setEditingPreference(undefined);
      setSuccessMessage(t('ease.messages.updated_success'));
    } catch (err: any) {
      console.error('Error updating ease preference:', err);
      if (err.message.includes('already exists')) {
        setError(t('ease.messages.name_exists'));
      } else {
        setError(t('ease.messages.update_error'));
      }
      throw err; // Re-throw to prevent form from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles deleting an ease preference
   */
  const handleDeletePreference = async (preference: EasePreference) => {
    try {
      setError(null);
      await deleteEasePreference(preference.id);
      setEasePreferences(prev => prev.filter(p => p.id !== preference.id));
      setSuccessMessage(t('ease.messages.deleted_success'));
    } catch (err) {
      console.error('Error deleting ease preference:', err);
      setError(t('ease.messages.delete_error'));
    }
  };

  /**
   * Handles starting to create a new preference
   */
  const handleStartCreate = () => {
    setViewMode('create');
    setEditingPreference(undefined);
    setError(null);
  };

  /**
   * Handles starting to edit a preference
   */
  const handleStartEdit = (preference: EasePreference) => {
    setViewMode('edit');
    setEditingPreference(preference);
    setError(null);
  };

  /**
   * Handles cancelling form operations
   */
  const handleCancel = () => {
    setViewMode('list');
    setEditingPreference(undefined);
    setError(null);
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {error}
                </h3>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {successMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {viewMode === 'list' && (
          <EasePreferenceList
            easePreferences={easePreferences}
            onCreateNew={handleStartCreate}
            onEdit={handleStartEdit}
            onDelete={handleDeletePreference}
            isLoading={isLoading}
            disabled={isSubmitting}
          />
        )}

        {viewMode === 'create' && (
          <EaseForm
            onSubmit={handleCreatePreference as (data: CreateEasePreference | UpdateEasePreference) => Promise<void>}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {viewMode === 'edit' && editingPreference && (
          <EaseForm
            easePreference={editingPreference}
            onSubmit={handleUpdatePreference as (data: CreateEasePreference | UpdateEasePreference) => Promise<void>}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
} 