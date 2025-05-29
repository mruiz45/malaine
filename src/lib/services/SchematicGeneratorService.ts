/**
 * Schematic Generator Service (US_9.3)
 * Server-side service for generating SVG schematic diagrams
 */

import {
  SchematicDiagram,
  SchematicGenerationConfig,
  ComponentDimensions,
  DimensionLabel,
  Point,
  SchematicShape
} from '@/types/schematics';

/**
 * Service for generating SVG schematic diagrams
 */
export class SchematicGeneratorService {
  private defaultConfig = {
    canvasSize: {
      width: 400,
      height: 300,
      padding: 40
    },
    style: {
      strokeWidth: 2,
      strokeColor: '#374151', // gray-700
      fillColor: 'none',
      fontSize: 12,
      fontFamily: 'Arial, sans-serif'
    }
  };

  /**
   * Generates a schematic diagram for a component
   */
  generateSchematic(config: SchematicGenerationConfig): SchematicDiagram {
    const finalConfig = this.mergeConfig(config);
    
    let svgContent: string;
    
    switch (finalConfig.shape) {
      case 'rectangle':
        svgContent = this.generateRectangleSchematic(finalConfig);
        break;
      case 'trapezoid':
        svgContent = this.generateTrapezoidSchematic(finalConfig);
        break;
      case 'sleeve':
        svgContent = this.generateSleeveSchematic(finalConfig);
        break;
      default:
        svgContent = this.generateRectangleSchematic(finalConfig); // fallback
    }

    return {
      id: `schematic-${finalConfig.componentName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      componentName: finalConfig.componentName,
      shape: finalConfig.shape,
      svgContent,
      viewBox: {
        width: finalConfig.canvasSize!.width,
        height: finalConfig.canvasSize!.height
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generates multiple schematics for different components
   */
  generateMultipleSchematics(configs: SchematicGenerationConfig[]): SchematicDiagram[] {
    return configs.map(config => this.generateSchematic(config));
  }

  /**
   * Determines the appropriate shape for a component based on its dimensions
   */
  determineOptimalShape(componentName: string, dimensions: ComponentDimensions): SchematicShape {
    const name = componentName.toLowerCase();
    
    // Sleeve detection
    if (name.includes('sleeve') || name.includes('manche')) {
      return 'sleeve';
    }
    
    // Trapezoid for tapered pieces
    const widthDifference = Math.abs(dimensions.topWidth - dimensions.bottomWidth);
    const widthVariance = widthDifference / Math.max(dimensions.topWidth, dimensions.bottomWidth);
    
    if (widthVariance > 0.1) { // 10% difference
      return 'trapezoid';
    }
    
    // Default to rectangle
    return 'rectangle';
  }

  /**
   * Generates a rectangular schematic
   */
  private generateRectangleSchematic(config: SchematicGenerationConfig): string {
    const { dimensions, canvasSize, style } = config;
    const { width, height, padding } = canvasSize!;
    
    // Calculate scaled dimensions maintaining aspect ratio
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    const aspectRatio = dimensions.length / dimensions.bottomWidth;
    let rectWidth = availableWidth * 0.6; // Use 60% of available width
    let rectHeight = rectWidth * aspectRatio;
    
    // Adjust if height exceeds available space
    if (rectHeight > availableHeight * 0.6) {
      rectHeight = availableHeight * 0.6;
      rectWidth = rectHeight / aspectRatio;
    }
    
    // Center the rectangle
    const rectX = (width - rectWidth) / 2;
    const rectY = (height - rectHeight) / 2;
    
    // Generate dimension labels
    const labels = this.generateRectangleLabels(
      { x: rectX, y: rectY }, 
      rectWidth, 
      rectHeight, 
      dimensions, 
      style!
    );
    
    return this.buildSVG(width, height, [
      // Main rectangle
      `<rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" 
        stroke="${style!.strokeColor}" stroke-width="${style!.strokeWidth}" fill="${style!.fillColor}"/>`,
      
      // Dimension lines and labels
      ...this.generateDimensionLines(
        { x: rectX, y: rectY }, 
        rectWidth, 
        rectHeight, 
        'rectangle',
        style!
      ),
      ...labels
    ]);
  }

  /**
   * Generates a trapezoidal schematic
   */
  private generateTrapezoidSchematic(config: SchematicGenerationConfig): string {
    const { dimensions, canvasSize, style } = config;
    const { width, height, padding } = canvasSize!;
    
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // Calculate scaled dimensions
    const maxWidth = Math.max(dimensions.bottomWidth, dimensions.topWidth);
    const aspectRatio = dimensions.length / maxWidth;
    
    let shapeWidth = availableWidth * 0.6;
    let shapeHeight = shapeWidth * aspectRatio;
    
    if (shapeHeight > availableHeight * 0.6) {
      shapeHeight = availableHeight * 0.6;
      shapeWidth = shapeHeight / aspectRatio;
    }
    
    // Calculate trapezoid coordinates
    const centerX = width / 2;
    const topY = (height - shapeHeight) / 2;
    const bottomY = topY + shapeHeight;
    
    const bottomWidthScaled = (dimensions.bottomWidth / maxWidth) * shapeWidth;
    const topWidthScaled = (dimensions.topWidth / maxWidth) * shapeWidth;
    
    const bottomLeft = centerX - bottomWidthScaled / 2;
    const bottomRight = centerX + bottomWidthScaled / 2;
    const topLeft = centerX - topWidthScaled / 2;
    const topRight = centerX + topWidthScaled / 2;
    
    // Generate labels
    const labels = this.generateTrapezoidLabels(
      { 
        bottomLeft: { x: bottomLeft, y: bottomY },
        bottomRight: { x: bottomRight, y: bottomY },
        topLeft: { x: topLeft, y: topY },
        topRight: { x: topRight, y: topY }
      },
      dimensions,
      style!
    );
    
    return this.buildSVG(width, height, [
      // Trapezoid path
      `<path d="M ${bottomLeft} ${bottomY} L ${bottomRight} ${bottomY} L ${topRight} ${topY} L ${topLeft} ${topY} Z" 
        stroke="${style!.strokeColor}" stroke-width="${style!.strokeWidth}" fill="${style!.fillColor}"/>`,
      
      // Dimension lines
      ...this.generateTrapezoidDimensionLines(
        { bottomLeft: { x: bottomLeft, y: bottomY }, bottomRight: { x: bottomRight, y: bottomY },
          topLeft: { x: topLeft, y: topY }, topRight: { x: topRight, y: topY } },
        style!
      ),
      ...labels
    ]);
  }

  /**
   * Generates a sleeve schematic (specialized trapezoid)
   */
  private generateSleeveSchematic(config: SchematicGenerationConfig): string {
    // For now, use trapezoid logic but could be enhanced for sleeve-specific features
    return this.generateTrapezoidSchematic(config);
  }

  /**
   * Generates dimension labels for rectangle
   */
  private generateRectangleLabels(
    origin: Point, 
    rectWidth: number, 
    rectHeight: number, 
    dimensions: ComponentDimensions, 
    style: any
  ): string[] {
    return [
      // Width label (bottom)
      `<text x="${origin.x + rectWidth / 2}" y="${origin.y + rectHeight + 20}" 
        text-anchor="middle" font-size="${style.fontSize}" font-family="${style.fontFamily}" 
        fill="${style.strokeColor}">${dimensions.bottomWidth} cm</text>`,
      
      // Height label (right side)
      `<text x="${origin.x + rectWidth + 20}" y="${origin.y + rectHeight / 2}" 
        text-anchor="middle" font-size="${style.fontSize}" font-family="${style.fontFamily}" 
        fill="${style.strokeColor}" transform="rotate(90, ${origin.x + rectWidth + 20}, ${origin.y + rectHeight / 2})">${dimensions.length} cm</text>`
    ];
  }

  /**
   * Generates dimension labels for trapezoid
   */
  private generateTrapezoidLabels(
    coordinates: { bottomLeft: Point; bottomRight: Point; topLeft: Point; topRight: Point },
    dimensions: ComponentDimensions,
    style: any
  ): string[] {
    const { bottomLeft, bottomRight, topLeft, topRight } = coordinates;
    
    return [
      // Bottom width
      `<text x="${(bottomLeft.x + bottomRight.x) / 2}" y="${bottomLeft.y + 20}" 
        text-anchor="middle" font-size="${style.fontSize}" font-family="${style.fontFamily}" 
        fill="${style.strokeColor}">${dimensions.bottomWidth} cm</text>`,
      
      // Top width
      `<text x="${(topLeft.x + topRight.x) / 2}" y="${topLeft.y - 10}" 
        text-anchor="middle" font-size="${style.fontSize}" font-family="${style.fontFamily}" 
        fill="${style.strokeColor}">${dimensions.topWidth} cm</text>`,
      
      // Height (left side)
      `<text x="${bottomLeft.x - 20}" y="${(bottomLeft.y + topLeft.y) / 2}" 
        text-anchor="middle" font-size="${style.fontSize}" font-family="${style.fontFamily}" 
        fill="${style.strokeColor}" transform="rotate(-90, ${bottomLeft.x - 20}, ${(bottomLeft.y + topLeft.y) / 2})">${dimensions.length} cm</text>`
    ];
  }

  /**
   * Generates dimension lines for rectangle
   */
  private generateDimensionLines(
    origin: Point, 
    width: number, 
    height: number, 
    shape: string,
    style: any
  ): string[] {
    const lines: string[] = [];
    const offset = 15;
    
    // Bottom width dimension line
    lines.push(
      `<line x1="${origin.x}" y1="${origin.y + height + offset}" x2="${origin.x + width}" y2="${origin.y + height + offset}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${origin.x}" y1="${origin.y + height + offset - 5}" x2="${origin.x}" y2="${origin.y + height + offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${origin.x + width}" y1="${origin.y + height + offset - 5}" x2="${origin.x + width}" y2="${origin.y + height + offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`
    );
    
    // Right height dimension line
    lines.push(
      `<line x1="${origin.x + width + offset}" y1="${origin.y}" x2="${origin.x + width + offset}" y2="${origin.y + height}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${origin.x + width + offset - 5}" y1="${origin.y}" x2="${origin.x + width + offset + 5}" y2="${origin.y}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${origin.x + width + offset - 5}" y1="${origin.y + height}" x2="${origin.x + width + offset + 5}" y2="${origin.y + height}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`
    );
    
    return lines;
  }

  /**
   * Generates dimension lines for trapezoid
   */
  private generateTrapezoidDimensionLines(
    coordinates: { bottomLeft: Point; bottomRight: Point; topLeft: Point; topRight: Point },
    style: any
  ): string[] {
    const { bottomLeft, bottomRight, topLeft, topRight } = coordinates;
    const offset = 15;
    
    return [
      // Bottom width dimension line
      `<line x1="${bottomLeft.x}" y1="${bottomLeft.y + offset}" x2="${bottomRight.x}" y2="${bottomRight.y + offset}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${bottomLeft.x}" y1="${bottomLeft.y + offset - 5}" x2="${bottomLeft.x}" y2="${bottomLeft.y + offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${bottomRight.x}" y1="${bottomRight.y + offset - 5}" x2="${bottomRight.x}" y2="${bottomRight.y + offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      
      // Top width dimension line
      `<line x1="${topLeft.x}" y1="${topLeft.y - offset}" x2="${topRight.x}" y2="${topRight.y - offset}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${topLeft.x}" y1="${topLeft.y - offset - 5}" x2="${topLeft.x}" y2="${topLeft.y - offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${topRight.x}" y1="${topRight.y - offset - 5}" x2="${topRight.x}" y2="${topRight.y - offset + 5}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      
      // Height dimension line (left side)
      `<line x1="${bottomLeft.x - offset}" y1="${bottomLeft.y}" x2="${topLeft.x - offset}" y2="${topLeft.y}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${bottomLeft.x - offset - 5}" y1="${bottomLeft.y}" x2="${bottomLeft.x - offset + 5}" y2="${bottomLeft.y}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`,
      `<line x1="${topLeft.x - offset - 5}" y1="${topLeft.y}" x2="${topLeft.x - offset + 5}" y2="${topLeft.y}" 
        stroke="${style.strokeColor}" stroke-width="1"/>`
    ];
  }

  /**
   * Builds the complete SVG string
   */
  private buildSVG(width: number, height: number, elements: string[]): string {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${elements.join('\n')}
    </svg>`;
  }

  /**
   * Merges user config with default config
   */
  private mergeConfig(config: SchematicGenerationConfig): Required<SchematicGenerationConfig> {
    return {
      ...config,
      canvasSize: { ...this.defaultConfig.canvasSize, ...config.canvasSize },
      style: { ...this.defaultConfig.style, ...config.style }
    };
  }
}

/**
 * Default service instance
 */
export const schematicGeneratorService = new SchematicGeneratorService(); 