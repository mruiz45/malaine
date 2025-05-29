/**
 * API Route pour l'export PDF des patrons - US_9.2
 * POST /api/patterns/export/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSessionAppRouter } from '@/lib/getSupabaseSession';
import { PdfExportService } from '@/lib/services/pdfExportService';
import { PdfExportRequest, PdfExportResponse } from '@/types/pdf';

export async function POST(request: NextRequest) {
  try {
    // Récupération de la session utilisateur
    const sessionResult = await getSupabaseSessionAppRouter(request);
    
    if (!sessionResult) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Parsing du body de la requête
    let exportRequest: PdfExportRequest;
    try {
      exportRequest = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Données de requête invalides' },
        { status: 400 }
      );
    }

    // Validation des données de la requête
    const validation = PdfExportService.validateExportRequest(exportRequest);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Génération du PDF
    const result = await PdfExportService.generatePatternPdf(exportRequest);

    // Préparation de la réponse avec le fichier PDF
    const response = new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(result.metadata.patternTitle)}.pdf"`,
        'Content-Length': result.metadata.fileSize.toString(),
        'X-Pattern-Title': result.metadata.patternTitle,
        'X-Page-Count': result.metadata.pageCount.toString(),
        'X-Generated-At': result.metadata.generatedAt.toISOString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Échec de la génération PDF: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

/**
 * Gestion des autres méthodes HTTP
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez POST.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez POST.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée. Utilisez POST.' },
    { status: 405 }
  );
} 