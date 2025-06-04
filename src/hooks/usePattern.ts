import { useContext } from 'react';
import { PatternContext } from '@/contexts/PatternContext';
import { PatternContextValue } from '@/types/pattern';

/**
 * Custom hook to access Pattern Context
 * Provides type-safe access to pattern state and actions
 * 
 * @throws {Error} If used outside of PatternProvider
 * @returns {PatternContextValue} Pattern context value with state and actions
 * 
 * @example
 * ```tsx
 * function GaugeForm() {
 *   const { state, updateGauge } = usePattern();
 *   
 *   const handleGaugeChange = (stitches: number) => {
 *     updateGauge({ stitchesPer10cm: stitches });
 *   };
 *   
 *   return (
 *     <div>
 *       <input 
 *         value={state.gauge.stitchesPer10cm || ''} 
 *         onChange={(e) => handleGaugeChange(Number(e.target.value))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const usePattern = (): PatternContextValue => {
  const context = useContext(PatternContext);
  
  if (context === undefined) {
    throw new Error(
      'usePattern must be used within a PatternProvider. ' +
      'Wrap your component tree with <PatternProvider> to use this hook.'
    );
  }
  
  return context;
};

/**
 * Utility hook to check if pattern context is available
 * Useful for conditional rendering or optional pattern functionality
 * 
 * @returns {boolean} True if pattern context is available
 * 
 * @example
 * ```tsx
 * function OptionalPatternFeature() {
 *   const hasPattern = usePatternAvailable();
 *   
 *   if (!hasPattern) {
 *     return <div>Pattern context not available</div>;
 *   }
 *   
 *   const { state } = usePattern();
 *   return <div>Current garment: {state.garmentType}</div>;
 * }
 * ```
 */
export const usePatternAvailable = (): boolean => {
  const context = useContext(PatternContext);
  return context !== undefined;
}; 