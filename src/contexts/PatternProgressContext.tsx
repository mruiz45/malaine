/**
 * Pattern Progress Context (US_11.7)
 * React context for managing pattern progress state across components
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { AssembledPattern } from '@/types/assembled-pattern';
import { usePatternProgress } from '@/hooks/usePatternProgress';
import type { 
  PatternProgressContextType,
  ProgressInitializationOptions 
} from '@/types/pattern-progress';

/**
 * Pattern Progress Context
 */
const PatternProgressContext = createContext<PatternProgressContextType | null>(null);

interface PatternProgressProviderProps {
  /** Child components */
  children: ReactNode;
  /** Session ID for the pattern */
  sessionId: string | null;
  /** Pattern data */
  pattern: AssembledPattern | null;
  /** Progress initialization options */
  options?: ProgressInitializationOptions;
}

/**
 * Pattern Progress Provider Component
 */
export function PatternProgressProvider({
  children,
  sessionId,
  pattern,
  options = {}
}: PatternProgressProviderProps) {
  const progressHook = usePatternProgress(sessionId, pattern, options);

  return (
    <PatternProgressContext.Provider value={progressHook}>
      {children}
    </PatternProgressContext.Provider>
  );
}

/**
 * Hook to use pattern progress context
 */
export function usePatternProgressContext(): PatternProgressContextType | null {
  return useContext(PatternProgressContext);
}

/**
 * Hook to use pattern progress context with error handling
 */
export function usePatternProgressContextRequired(): PatternProgressContextType {
  const context = useContext(PatternProgressContext);
  
  if (!context) {
    throw new Error(
      'usePatternProgressContextRequired must be used within a PatternProgressProvider'
    );
  }
  
  return context;
}

/**
 * Higher-order component for pattern progress
 */
export function withPatternProgress<P extends object>(
  Component: React.ComponentType<P>,
  options?: ProgressInitializationOptions
) {
  return function WithPatternProgressComponent(
    props: P & {
      sessionId: string | null;
      pattern: AssembledPattern | null;
    }
  ) {
    const { sessionId, pattern, ...componentProps } = props;
    
    return (
      <PatternProgressProvider
        sessionId={sessionId}
        pattern={pattern}
        options={options}
      >
        <Component {...(componentProps as P)} />
      </PatternProgressProvider>
    );
  };
} 