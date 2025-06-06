'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/utils/AuthContext';
import { getLoggingService } from '@/services/LoggingService';
import { LogLevel, PatternDesignEventType, LogEventDetails, LoggingConfig } from '@/types/logging';

/**
 * Configuration for the usePatternLogger hook
 */
interface UsePatternLoggerConfig extends Partial<LoggingConfig> {
  /** Component name for logging context */
  componentName?: string;
  /** Whether to automatically log component initialization */
  logInitialization?: boolean;
}

/**
 * Return type for the usePatternLogger hook
 */
interface PatternLoggerHook {
  /** Log a general pattern design event */
  log: (level: LogLevel, event: PatternDesignEventType, details: LogEventDetails) => void;
  
  /** Log garment type selection */
  logGarmentTypeSelected: (type: string, previousType?: string) => void;
  
  /** Log measurement update */
  logMeasurementUpdated: (field: string, oldValue: number | string, newValue: number | string, unit?: string) => void;
  
  /** Log neckline type change */
  logNecklineTypeChanged: (oldType: string, newType: string) => void;
  
  /** Log sleeve type change */
  logSleeveTypeChanged: (oldType: string, newType: string) => void;
  
  /** Log fit preference change */
  logFitPreferenceChanged: (oldValue: string, newValue: string) => void;
  
  /** Log undo action */
  logUndo: () => void;
  
  /** Log redo action */
  logRedo: () => void;
  
  /** Log restore point creation */
  logRestorePointCreated: (name: string, description?: string) => void;
  
  /** Log restore point restoration */
  logRestorePointRestored: (name: string) => void;
  
  /** Log pattern calculation start */
  logPatternCalculationStarted: (calculationType?: string) => void;
  
  /** Log pattern calculation completion */
  logPatternCalculationCompleted: (calculationType?: string, duration?: number) => void;
  
  /** Log pattern calculation error */
  logPatternCalculationError: (error: any, calculationType?: string) => void;
  
  /** Log validation error */
  logValidationError: (field: string, error: string, value?: any) => void;
  
  /** Log user input change */
  logUserInputChanged: (inputName: string, oldValue: any, newValue: any) => void;
  
  /** Log state mutation */
  logStateMutation: (mutation: string, before?: any, after?: any) => void;
  
  /** Log general error */
  logError: (error: any, context?: string) => void;
  
  /** Manually flush logs to server */
  flush: () => Promise<void>;
  
  /** Get current session ID */
  getSessionId: () => string;
  
  /** Update logging configuration */
  updateConfig: (config: Partial<LoggingConfig>) => void;
}

/**
 * Custom hook for pattern design logging
 * Provides easy access to logging functionality with automatic context injection
 * 
 * @param config - Optional configuration for the logger
 * @returns PatternLoggerHook object with logging methods
 */
export function usePatternLogger(config?: UsePatternLoggerConfig): PatternLoggerHook {
  const { user } = useAuth();
  const loggingService = getLoggingService(config);
  const componentName = config?.componentName;
  const hasLoggedInit = useRef(false);

  // Auto-log component initialization
  useEffect(() => {
    if (config?.logInitialization && componentName && !hasLoggedInit.current) {
      loggingService.logComponentInitialized(componentName, user?.id);
      hasLoggedInit.current = true;
    }
  }, [loggingService, componentName, user?.id, config?.logInitialization]);

  // General logging method
  const log = useCallback((
    level: LogLevel,
    event: PatternDesignEventType,
    details: LogEventDetails
  ) => {
    loggingService.log(level, event, details, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  // Specific logging methods
  const logGarmentTypeSelected = useCallback((type: string, previousType?: string) => {
    loggingService.logGarmentTypeSelected(type, previousType, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logMeasurementUpdated = useCallback((
    field: string,
    oldValue: number | string,
    newValue: number | string,
    unit?: string
  ) => {
    loggingService.logMeasurementUpdated(field, oldValue, newValue, unit, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logNecklineTypeChanged = useCallback((oldType: string, newType: string) => {
    loggingService.logNecklineTypeChanged(oldType, newType, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logSleeveTypeChanged = useCallback((oldType: string, newType: string) => {
    log('INFO', 'SLEEVE_TYPE_CHANGED', { oldType, newType });
  }, [log]);

  const logFitPreferenceChanged = useCallback((oldValue: string, newValue: string) => {
    log('INFO', 'FIT_PREFERENCE_CHANGED', { oldValue, newValue });
  }, [log]);

  const logUndo = useCallback(() => {
    loggingService.logUndoTriggered(componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logRedo = useCallback(() => {
    loggingService.logRedoTriggered(componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logRestorePointCreated = useCallback((name: string, description?: string) => {
    loggingService.logRestorePointCreated(name, description, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logRestorePointRestored = useCallback((name: string) => {
    log('INFO', 'RESTORE_POINT_RESTORED', { name });
  }, [log]);

  const logPatternCalculationStarted = useCallback((calculationType?: string) => {
    log('INFO', 'PATTERN_CALCULATION_STARTED', { calculationType });
  }, [log]);

  const logPatternCalculationCompleted = useCallback((calculationType?: string, duration?: number) => {
    log('INFO', 'PATTERN_CALCULATION_COMPLETED', { calculationType, duration });
  }, [log]);

  const logPatternCalculationError = useCallback((error: any, calculationType?: string) => {
    log('ERROR', 'PATTERN_CALCULATION_ERROR', { 
      error: typeof error === 'string' ? { message: error } : error,
      calculationType 
    });
  }, [log]);

  const logValidationError = useCallback((field: string, error: string, value?: any) => {
    log('WARN', 'VALIDATION_ERROR', { field, error, value });
  }, [log]);

  const logUserInputChanged = useCallback((inputName: string, oldValue: any, newValue: any) => {
    log('DEBUG', 'USER_INPUT_CHANGED', { inputName, oldValue, newValue });
  }, [log]);

  const logStateMutation = useCallback((mutation: string, before?: any, after?: any) => {
    loggingService.logStateMutation(mutation, before, after, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const logError = useCallback((error: any, context?: string) => {
    loggingService.logError(error, context, componentName, user?.id);
  }, [loggingService, componentName, user?.id]);

  const flush = useCallback(async () => {
    await loggingService.flush();
  }, [loggingService]);

  const getSessionId = useCallback(() => {
    return loggingService.getSessionId();
  }, [loggingService]);

  const updateConfig = useCallback((newConfig: Partial<LoggingConfig>) => {
    loggingService.updateConfig(newConfig);
  }, [loggingService]);

  return {
    log,
    logGarmentTypeSelected,
    logMeasurementUpdated,
    logNecklineTypeChanged,
    logSleeveTypeChanged,
    logFitPreferenceChanged,
    logUndo,
    logRedo,
    logRestorePointCreated,
    logRestorePointRestored,
    logPatternCalculationStarted,
    logPatternCalculationCompleted,
    logPatternCalculationError,
    logValidationError,
    logUserInputChanged,
    logStateMutation,
    logError,
    flush,
    getSessionId,
    updateConfig,
  };
}

/**
 * Higher-order component to automatically inject pattern logging
 * @param WrappedComponent - Component to wrap
 * @param config - Logging configuration
 * @returns Enhanced component with logging capabilities
 */
export function withPatternLogger<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  config?: UsePatternLoggerConfig
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const EnhancedComponent = (props: P) => {
    const logger = usePatternLogger({
      ...config,
      componentName: config?.componentName || displayName,
      logInitialization: config?.logInitialization ?? true,
    });

    const enhancedProps = { ...props, logger } as P & { logger: PatternLoggerHook };
    return <WrappedComponent {...enhancedProps} />;
  };

  EnhancedComponent.displayName = `withPatternLogger(${displayName})`;
  return EnhancedComponent;
} 