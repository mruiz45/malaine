'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';
import type { GaugeProfile, CreateGaugeProfile, UpdateGaugeProfile } from '@/types/gauge';
import { 
  getGaugeProfiles, 
  createGaugeProfile, 
  updateGaugeProfile, 
  deleteGaugeProfile 
} from '@/services/gaugeService';
import GaugeProfileList from '@/components/gauge/GaugeProfileList';
import GaugeForm from '@/components/gauge/GaugeForm';

type ViewMode = 'list' | 'create' | 'edit';

/**
 * Main page for managing gauge profiles
 * Handles authentication, data fetching, and orchestrates the UI components
 */
export default function GaugeProfilesPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State management
  const [gaugeProfiles, setGaugeProfiles] = useState<GaugeProfile[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProfile, setEditingProfile] = useState<GaugeProfile | undefined>();
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

  // Load gauge profiles on component mount
  useEffect(() => {
    if (user) {
      loadGaugeProfiles();
    }
  }, [user]);

  // Clear messages after a delay
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  /**
   * Loads all gauge profiles for the current user
   */
  const loadGaugeProfiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profiles = await getGaugeProfiles();
      setGaugeProfiles(profiles);
    } catch (err) {
      console.error('Error loading gauge profiles:', err);
      setError(t('gauge.messages.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles creating a new gauge profile
   */
  const handleCreateProfile = async (data: CreateGaugeProfile) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newProfile = await createGaugeProfile(data);
      setGaugeProfiles(prev => [newProfile, ...prev]);
      setViewMode('list');
      setSuccessMessage(t('gauge.messages.created_success'));
    } catch (err: any) {
      console.error('Error creating gauge profile:', err);
      if (err.message.includes('already exists')) {
        setError(t('gauge.messages.name_exists'));
      } else {
        setError(t('gauge.messages.create_error'));
      }
      throw err; // Re-throw to prevent form from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles updating an existing gauge profile
   */
  const handleUpdateProfile = async (data: UpdateGaugeProfile) => {
    if (!editingProfile) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updatedProfile = await updateGaugeProfile(editingProfile.id, data);
      setGaugeProfiles(prev => 
        prev.map(profile => 
          profile.id === editingProfile.id ? updatedProfile : profile
        )
      );
      setViewMode('list');
      setEditingProfile(undefined);
      setSuccessMessage(t('gauge.messages.updated_success'));
    } catch (err: any) {
      console.error('Error updating gauge profile:', err);
      if (err.message.includes('already exists')) {
        setError(t('gauge.messages.name_exists'));
      } else {
        setError(t('gauge.messages.update_error'));
      }
      throw err; // Re-throw to prevent form from closing
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles deleting a gauge profile
   */
  const handleDeleteProfile = async (profile: GaugeProfile) => {
    try {
      setError(null);
      await deleteGaugeProfile(profile.id);
      setGaugeProfiles(prev => prev.filter(p => p.id !== profile.id));
      setSuccessMessage(t('gauge.messages.deleted_success'));
    } catch (err) {
      console.error('Error deleting gauge profile:', err);
      setError(t('gauge.messages.delete_error'));
    }
  };

  /**
   * Handles starting to create a new profile
   */
  const handleStartCreate = () => {
    setViewMode('create');
    setEditingProfile(undefined);
    setError(null);
  };

  /**
   * Handles starting to edit a profile
   */
  const handleStartEdit = (profile: GaugeProfile) => {
    setViewMode('edit');
    setEditingProfile(profile);
    setError(null);
  };

  /**
   * Handles cancelling form operations
   */
  const handleCancel = () => {
    setViewMode('list');
    setEditingProfile(undefined);
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
          <GaugeProfileList
            gaugeProfiles={gaugeProfiles}
            onCreateNew={handleStartCreate}
            onEdit={handleStartEdit}
            onDelete={handleDeleteProfile}
            isLoading={isLoading}
            disabled={isSubmitting}
          />
        )}

        {viewMode === 'create' && (
          <GaugeForm
            onSubmit={handleCreateProfile as (data: CreateGaugeProfile | UpdateGaugeProfile) => Promise<void>}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}

        {viewMode === 'edit' && editingProfile && (
          <GaugeForm
            gaugeProfile={editingProfile}
            onSubmit={handleUpdateProfile as (data: CreateGaugeProfile | UpdateGaugeProfile) => Promise<void>}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
} 