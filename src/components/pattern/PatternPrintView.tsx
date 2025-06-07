/**
 * Pattern Print View Component (PD_PH6_US004)
 * Print-optimized view for pattern instructions
 */

'use client';

import React from 'react';
import { PatternInstructionGenerationResult } from '@/types/pattern-instruction-generation';

interface PatternPrintViewProps {
  /** Generated pattern instructions and details */
  patternResult: PatternInstructionGenerationResult;
  /** Optional session ID for schematic loading */
  sessionId?: string;
  /** Whether to show schematics */
  showSchematics?: boolean;
}

/**
 * Print-optimized view for pattern instructions
 */
export default function PatternPrintView({
  patternResult,
  sessionId,
  showSchematics = true
}: PatternPrintViewProps) {

  /**
   * Render markdown instructions as HTML for print
   */
  const renderMarkdownInstructions = (markdown: string) => {
    const html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; color: #111827;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 600; margin: 24px 0 12px 0; color: #111827;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 700; margin: 32px 0 16px 0; color: #111827;">$1</h1>')
      .replace(/\n/g, '<br>');

    return html;
  };

  const pieceKeys = patternResult.instructionsByPiece 
    ? Object.keys(patternResult.instructionsByPiece)
    : [];

  return (
    <div className="pattern-print-view">
      <style jsx>{`
        @media print {
          body { 
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000;
            background: #fff;
          }
          
          .pattern-print-view {
            max-width: none;
            margin: 0;
            padding: 0;
          }
          
          .print-page-break {
            page-break-before: always;
          }
          
          .print-no-break {
            page-break-inside: avoid;
          }
          
          .print-header {
            margin-bottom: 20pt;
            padding-bottom: 10pt;
            border-bottom: 1pt solid #000;
          }
          
          .print-section {
            margin-bottom: 20pt;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10pt 0;
          }
          
          .print-table th,
          .print-table td {
            border: 1pt solid #000;
            padding: 4pt;
            text-align: left;
            font-size: 10pt;
          }
          
          .print-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .print-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10pt;
            margin: 10pt 0;
          }
          
          .print-summary-item {
            text-align: center;
            padding: 8pt;
            border: 1pt solid #ccc;
          }
          
          .print-notes {
            background-color: #f9f9f9;
            border: 1pt solid #ddd;
            padding: 8pt;
            margin: 10pt 0;
          }
        }
        
        @media screen {
          .pattern-print-view {
            font-family: 'Times New Roman', serif;
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            min-height: 11in;
          }
        }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 10pt 0', textAlign: 'center' }}>
          Pattern Instructions
        </h1>
        {patternResult.metadata && (
          <div style={{ textAlign: 'center', fontSize: '12pt', color: '#666' }}>
            Generated on {new Date(patternResult.metadata.generatedAt).toLocaleDateString()} • {' '}
            {patternResult.metadata.totalInstructions} instructions
          </div>
        )}
      </div>

      {/* Pattern Introduction */}
      {patternResult.patternIntroduction && (
        <div className="print-section print-no-break">
          <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 10pt 0' }}>
            Pattern Introduction
          </h2>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: renderMarkdownInstructions(patternResult.patternIntroduction) 
            }} 
          />
        </div>
      )}

      {/* Abbreviations */}
      {patternResult.abbreviationsGlossary && (
        <div className="print-section print-no-break">
          <h2 style={{ fontSize: '18pt', fontWeight: 'bold', margin: '0 0 10pt 0' }}>
            Abbreviations
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Abbreviation</th>
                <th style={{ width: '30%' }}>Full Term</th>
                <th style={{ width: '50%' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(patternResult.abbreviationsGlossary.abbreviations).map(
                ([key, abbrev]) => (
                  <tr key={key}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {abbrev.abbreviation}
                    </td>
                    <td>{abbrev.fullTerm}</td>
                    <td>{abbrev.description}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pattern Pieces */}
      {pieceKeys.map((pieceKey, index) => {
        const piece = patternResult.instructionsByPiece![pieceKey];
        
        return (
          <div key={pieceKey} className={`print-section ${index > 0 ? 'print-page-break' : ''}`}>
            {/* Piece Header */}
            <div className="print-no-break">
              <h2 style={{ fontSize: '20pt', fontWeight: 'bold', margin: '0 0 15pt 0' }}>
                {piece.displayName}
              </h2>
              
              {/* Construction Summary */}
              <div className="print-summary-grid">
                <div className="print-summary-item">
                  <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>
                    {piece.constructionSummary.castOnStitches}
                  </div>
                  <div style={{ fontSize: '10pt' }}>Cast-on Stitches</div>
                </div>
                <div className="print-summary-item">
                  <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>
                    {piece.constructionSummary.totalRows}
                  </div>
                  <div style={{ fontSize: '10pt' }}>Total Rows</div>
                </div>
                <div className="print-summary-item">
                  <div style={{ fontSize: '16pt', fontWeight: 'bold' }}>
                    {piece.constructionSummary.finalStitchCount}
                  </div>
                  <div style={{ fontSize: '10pt' }}>Final Stitches</div>
                </div>
                <div className="print-summary-item">
                  <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>
                    {piece.constructionSummary.finishedDimensions.width_cm} × {' '}
                    {piece.constructionSummary.finishedDimensions.length_cm} cm
                  </div>
                  <div style={{ fontSize: '10pt' }}>Dimensions</div>
                </div>
              </div>
            </div>

            {/* Main Instructions */}
            <div style={{ margin: '15pt 0' }}>
              <h3 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 10pt 0' }}>
                Instructions
              </h3>
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderMarkdownInstructions(piece.markdownInstructions) 
                }} 
              />
            </div>

            {/* Row-by-Row Instructions */}
            {piece.instructionSteps.length > 0 && (
              <div style={{ margin: '15pt 0' }}>
                <h3 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 10pt 0' }}>
                  Row-by-Row Instructions ({piece.instructionSteps.length} steps)
                </h3>
                <table className="print-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Row</th>
                      <th style={{ width: '20%' }}>Section</th>
                      <th style={{ width: '55%' }}>Instruction</th>
                      <th style={{ width: '15%' }}>Stitches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piece.instructionSteps.map((step, stepIndex) => (
                      <tr key={stepIndex}>
                        <td style={{ fontWeight: 'bold' }}>{step.rowNumber}</td>
                        <td>{step.section}</td>
                        <td>{step.instructionText}</td>
                        <td style={{ textAlign: 'center' }}>{step.stitchCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Construction Notes */}
            {piece.constructionNotes && piece.constructionNotes.length > 0 && (
              <div className="print-notes">
                <h4 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 8pt 0' }}>
                  Construction Notes
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20pt' }}>
                  {piece.constructionNotes.map((note, noteIndex) => (
                    <li key={noteIndex} style={{ marginBottom: '4pt' }}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      {/* Warnings */}
      {patternResult.warnings && patternResult.warnings.length > 0 && (
        <div className="print-section print-notes">
          <h3 style={{ fontSize: '16pt', fontWeight: 'bold', margin: '0 0 10pt 0' }}>
            Warnings
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20pt' }}>
            {patternResult.warnings.map((warning, index) => (
              <li key={index} style={{ marginBottom: '4pt' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 