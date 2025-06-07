/**
 * Pattern Navigation Tabs Component (PD_PH6_US004)
 * Navigation component for switching between pattern pieces
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { PatternInstructionsByPiece } from '@/types/pattern-instruction-generation';

interface PatternNavigationTabsProps {
  /** Available piece keys */
  pieceKeys: string[];
  /** Instructions by piece for display names */
  instructionsByPiece: PatternInstructionsByPiece;
  /** Currently selected piece key */
  selectedPieceKey: string | null;
  /** Callback when piece is selected */
  onPieceSelect: (pieceKey: string) => void;
  /** Compact display mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation tabs for pattern pieces
 */
export default function PatternNavigationTabs({
  pieceKeys,
  instructionsByPiece,
  selectedPieceKey,
  onPieceSelect,
  compact = false,
  className = ''
}: PatternNavigationTabsProps) {
  const { t } = useTranslation();

  if (pieceKeys.length <= 1) {
    return null; // No need for tabs if only one piece
  }

  return (
    <div className={`pattern-navigation-tabs border-b border-gray-200 bg-white ${className}`}>
      <div className="px-6">
        <nav className="-mb-px flex space-x-8" aria-label="Pattern pieces">
          {pieceKeys.map((pieceKey) => {
            const piece = instructionsByPiece[pieceKey];
            const isSelected = pieceKey === selectedPieceKey;
            
            return (
              <button
                key={pieceKey}
                onClick={() => onPieceSelect(pieceKey)}
                className={`
                  group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                  ${isSelected
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${compact ? 'py-2 text-xs' : 'py-4 text-sm'}
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t
                `}
                aria-current={isSelected ? 'page' : undefined}
              >
                {/* Piece name */}
                <span>
                  {piece?.displayName || t(`patternDisplay.pieces.${pieceKey}`, pieceKey)}
                </span>
                
                {/* Instruction count indicator */}
                {piece && !compact && (
                  <span className={`
                    ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${isSelected
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }
                  `}>
                    {piece.instructionSteps.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 