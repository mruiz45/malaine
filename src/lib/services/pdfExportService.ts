/**
 * Service de génération PDF pour les patrons - US_9.2
 * Utilise Puppeteer pour convertir HTML en PDF
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { 
  PdfExportRequest, 
  PdfGenerationResult, 
  PdfExportOptions,
  PdfTemplateData 
} from '@/types/pdf';

export class PdfExportService {
  private static browser: Browser | null = null;

  /**
   * Obtient une instance de navigateur Puppeteer réutilisable
   */
  private static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  /**
   * Ferme le navigateur Puppeteer
   */
  public static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Génère un PDF à partir des données de patron
   * @param request Données du patron et options d'export
   * @returns Résultat de génération avec buffer PDF
   */
  public static async generatePatternPdf(
    request: PdfExportRequest
  ): Promise<PdfGenerationResult> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Configuration des options par défaut
      const options: Required<PdfExportOptions> = {
        includeHeader: true,
        includePageNumbers: true,
        includeSchematics: false,
        pageFormat: 'A4',
        orientation: 'portrait',
        margins: {
          top: 20,
          right: 15,
          bottom: 20,
          left: 15,
        },
        ...request.exportOptions,
      };

      // Préparation des données pour le template
      const templateData: PdfTemplateData = {
        pattern: request.patternData,
        options,
        schematics: request.schematicsData || [],
        metadata: {
          title: request.patternData.title || 'Patron de Tricot',
          generatedAt: new Date().toLocaleDateString('fr-FR'),
          pageNumbers: options.includePageNumbers,
        },
      };

      // URL de la page HTML dédiée au rendu PDF
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const pdfPageUrl = `${baseUrl}/patterns/pdf-render`;

      // Navigation vers la page avec les données en query params
      // Note: Pour de gros volumes de données, on pourrait utiliser POST + session storage
      const encodedData = encodeURIComponent(JSON.stringify(templateData));
      await page.goto(`${pdfPageUrl}?data=${encodedData}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Configuration du viewport pour une meilleure qualité
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2,
      });

      // Attendre que le contenu soit complètement chargé
      await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 10000 });

      // Génération du PDF
      const pdfBuffer = await page.pdf({
        format: options.pageFormat,
        landscape: options.orientation === 'landscape',
        margin: {
          top: `${options.margins.top}mm`,
          right: `${options.margins.right}mm`,
          bottom: `${options.margins.bottom}mm`,
          left: `${options.margins.left}mm`,
        },
        printBackground: true,
        displayHeaderFooter: options.includeHeader || options.includePageNumbers,
        headerTemplate: options.includeHeader ? this.getHeaderTemplate(templateData.metadata.title) : '',
        footerTemplate: options.includePageNumbers ? this.getFooterTemplate() : '',
      });

      // Conversion en Buffer si nécessaire
      const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

      // Métadonnées du résultat
      const metadata = {
        pageCount: await this.estimatePageCount(page),
        fileSize: buffer.length,
        generatedAt: new Date(),
        patternTitle: templateData.metadata.title,
      };

      return {
        buffer,
        metadata,
      };
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      throw new Error(`Échec de la génération PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      await page.close();
    }
  }

  /**
   * Template pour l'en-tête du PDF
   */
  private static getHeaderTemplate(title: string): string {
    return `
      <div style="font-size: 10px; margin: 0 15mm; width: 100%; text-align: center; color: #666;">
        <h3 style="margin: 5px 0; font-weight: bold;">${title}</h3>
      </div>
    `;
  }

  /**
   * Template pour le pied de page du PDF
   */
  private static getFooterTemplate(): string {
    return `
      <div style="font-size: 9px; margin: 0 15mm; width: 100%; text-align: center; color: #666;">
        <span>Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
        <span style="float: right;">Généré par Malaine</span>
      </div>
    `;
  }

  /**
   * Estime le nombre de pages (approximatif)
   */
  private static async estimatePageCount(page: Page): Promise<number> {
    try {
      const contentHeight = await page.evaluate(() => {
        return document.documentElement.scrollHeight;
      });
      // Estimation basée sur la hauteur A4 (≈ 1100px à 96 DPI)
      return Math.ceil(contentHeight / 1100);
    } catch {
      return 1; // Fallback
    }
  }

  /**
   * Valide les données de la requête d'export
   */
  public static validateExportRequest(request: PdfExportRequest): { valid: boolean; error?: string } {
    if (!request.patternData) {
      return { valid: false, error: 'Données du patron manquantes' };
    }

    if (!request.patternData.title) {
      return { valid: false, error: 'Titre du patron manquant' };
    }

    // Validation des options si présentes
    if (request.exportOptions) {
      const { pageFormat, orientation, margins } = request.exportOptions;
      
      if (pageFormat && !['A4', 'Letter'].includes(pageFormat)) {
        return { valid: false, error: 'Format de page non supporté' };
      }

      if (orientation && !['portrait', 'landscape'].includes(orientation)) {
        return { valid: false, error: 'Orientation non supportée' };
      }

      if (margins) {
        const marginValues = Object.values(margins);
        if (marginValues.some(m => m && (m < 0 || m > 50))) {
          return { valid: false, error: 'Marges invalides (0-50mm)' };
        }
      }
    }

    return { valid: true };
  }
} 