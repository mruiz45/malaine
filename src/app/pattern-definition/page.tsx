'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { PatternDefinitionProvider, usePatternDefinition } from '@/contexts/PatternDefinitionContext';
import PatternDefinitionWorkspace from '@/components/knitting/PatternDefinitionWorkspace';
import { patternDefinitionService } from '@/services/patternDefinitionService';
import { PatternDefinitionSessionWithData } from '@/types/patternDefinition';

/**
 * Pattern Definition Page Content Component
 */
function PatternDefinitionPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('sessionId');
  
  const {
    currentSession,
    isLoading,
    error,
    createSession,
    loadSession
  } = usePatternDefinition();

  const [availableSessions, setAvailableSessions] = useState<PatternDefinitionSessionWithData[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  /**
   * Load available sessions on component mount
   */
  useEffect(() => {
    const loadAvailableSessions = async () => {
      try {
        setLoadingSessions(true);
        const sessions = await patternDefinitionService.getAllSessions();
        setAvailableSessions(sessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadAvailableSessions();
  }, []);

  /**
   * Load session if sessionId is provided in URL
   */
  useEffect(() => {
    if (sessionId && !currentSession) {
      loadSession(sessionId).catch(error => {
        console.error('Error loading session from URL:', error);
        // Redirect to pattern definition without sessionId if loading fails
        router.replace('/pattern-definition');
      });
    }
  }, [sessionId, currentSession, loadSession, router]);

  /**
   * Handle creating a new session
   */
  const handleCreateNewSession = async () => {
    try {
      const newSession = await createSession({
        session_name: `Pattern ${new Date().toLocaleDateString()}`
      });
      
      // Update URL with new session ID
      router.push(`/pattern-definition?sessionId=${newSession.id}`);
      
      // Refresh available sessions
      const sessions = await patternDefinitionService.getAllSessions();
      setAvailableSessions(sessions);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  /**
   * Handle loading an existing session
   */
  const handleLoadSession = async (sessionId: string) => {
    try {
      await loadSession(sessionId);
      router.push(`/pattern-definition?sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  /**
   * Render session selection if no current session
   */
  if (!currentSession && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t('patternDefinition.title', 'Pattern Definition')}</h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {t('patternDefinition.getStarted', 'Get Started')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('patternDefinition.description', 'Create a new pattern definition session or continue working on an existing one.')}
            </p>
            
            <button
              onClick={handleCreateNewSession}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              {t('patternDefinition.createNew', 'Create New Pattern')}
            </button>
          </div>

          {/* Existing Sessions */}
          {!loadingSessions && availableSessions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold mb-4">
                {t('patternDefinition.existingSessions', 'Your Pattern Definitions')}
              </h2>
              
              <div className="space-y-4">
                {availableSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleLoadSession(session.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {session.session_name || t('patternDefinition.untitledSession', 'Untitled Session')}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {t('patternDefinition.lastUpdated', 'Last updated')}: {' '}
                          {new Date(session.updated_at).toLocaleDateString()}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {session.selected_gauge_profile_id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {t('gauge.title', 'Gauge')}
                            </span>
                          )}
                          {session.selected_measurement_set_id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {t('measurements.title', 'Measurements')}
                            </span>
                          )}
                          {session.ease_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {t('ease.title', 'Ease')}
                            </span>
                          )}
                          {session.selected_yarn_profile_id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {t('yarn.title', 'Yarn')}
                            </span>
                          )}
                          {session.selected_stitch_pattern_id && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {t('stitchPattern.title', 'Stitch Pattern')}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        session.status === 'ready_for_calculation' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {t(`patternDefinition.status.${session.status}`, session.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingSessions && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-red-800 mb-4">
              {t('common.error', 'Error')}
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => router.push('/pattern-definition')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t('common.tryAgain', 'Try Again')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render pattern definition workspace
   */
  return <PatternDefinitionWorkspace />;
}

/**
 * Main Pattern Definition Page Component
 */
export default function PatternDefinitionPage() {
  return (
    <ProtectedRoute>
      <PatternDefinitionProvider>
        <PatternDefinitionPageContent />
      </PatternDefinitionProvider>
    </ProtectedRoute>
  );
} 