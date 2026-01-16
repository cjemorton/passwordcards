/**
 * Export Utilities - Handle PDF, PNG, and JPG exports
 * 
 * This module provides export functionality that matches the legacy behavior
 * for PDF exports while adding modern PNG/JPG support.
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { svg2pdf } from 'svg2pdf.js';
import { CardData } from './CardCreator';

export type ExportFormat = 'pdf' | 'png' | 'jpg';

export class ExportUtils {
  /**
   * Export card in the specified format
   */
  static async export(
    format: ExportFormat,
    frontSvg: string,
    backSvg: string,
    cardData: CardData
  ): Promise<void> {
    switch (format) {
      case 'pdf':
        await this.exportPDF(frontSvg, backSvg, cardData);
        break;
      case 'png':
        await this.exportImage(frontSvg, backSvg, 'png');
        break;
      case 'jpg':
        await this.exportImage(frontSvg, backSvg, 'jpeg');
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export as PDF - follows legacy PDFRenderer.php approach
   * Two cards side-by-side on A4, with optional documentation page
   */
  private static async exportPDF(
    frontSvg: string,
    backSvg: string,
    cardData: CardData
  ): Promise<void> {
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set document metadata
    pdf.setProperties({
      title: 'Password Card',
      subject: 'Password Card',
      author: 'Raphael Zimmermann',
      creator: 'Password Card Generator',
    });

    // Add fold lines (matching legacy positions)
    // TCPDF default line width is 0.2mm
    pdf.setLineWidth(0.2);
    pdf.line(95, 10, 95, 13);
    pdf.line(95, 72, 95, 75);

    // Render SVGs directly to PDF using svg2pdf.js
    // SVG dimensions: 301.18109 x 194.88188 pixels
    // Target dimensions: 85mm x 55mm (matching legacy)
    
    // Add front card (left panel)
    const frontSvgElement = this.createSvgElement(frontSvg);
    await svg2pdf(frontSvgElement, pdf, {
      x: 10,
      y: 15,
      width: 85,
      height: 55,
    });

    // Add back card (right panel)
    const backSvgElement = this.createSvgElement(backSvg);
    await svg2pdf(backSvgElement, pdf, {
      x: 95,
      y: 15,
      width: 85,
      height: 55,
    });

    // Add QR code if enabled
    if (cardData.qrCodeEnabled && cardData.watermarkUrl) {
      try {
        const qrDataUrl = await QRCode.toDataURL(cardData.watermarkUrl, {
          errorCorrectionLevel: 'L',
          margin: 0,
          width: 128,
        });
        // Place QR code in top-right corner of front card (matching legacy position)
        pdf.addImage(qrDataUrl, 'PNG', 82, 17, 12, 12);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    // Add documentation page
    this.addDocumentationPage(pdf, cardData);

    // Save the PDF
    pdf.save('password-card.pdf');
  }

  /**
   * Create an SVG element from string
   */
  private static createSvgElement(svgString: string): SVGSVGElement {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      throw new Error('Invalid SVG string');
    }
    return svgElement as SVGSVGElement;
  }

  /**
   * Add documentation page (matching legacy PDFRenderer.php)
   */
  private static addDocumentationPage(pdf: jsPDF, cardData: CardData): void {
    pdf.addPage();

    // Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Password Card Information', 105, 20, { align: 'center' });

    let yPos = 35;

    // Deterministic Generation Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Deterministic Card Generation', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const deterministicText = [
      'This card was generated using deterministic generation. This means that using the same parameters',
      'below, you can regenerate this EXACT card at any time.',
      '',
      'IMPORTANT: Save these parameters in a secure location. If you lose your card, you can recreate it',
      'using these exact settings.',
    ];
    deterministicText.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });
    yPos += 3;

    // Card Generation Settings
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Card Generation Settings', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const settings = [
      `Seed: ${cardData.seed}`,
      `Hash Algorithm: ${cardData.hashAlgorithm.toUpperCase()} (CRITICAL for string seed recovery)`,
      `Pattern: ${cardData.pattern}`,
      `Keyboard Layout: ${cardData.keys.join('')}`,
      `Spacebar Size: ${cardData.spacebar.length}`,
      `Card Text: ${cardData.text || '(none)'}`,
      `Primary Color: ${cardData.primaryColor}`,
      `Secondary Color: ${cardData.secondaryColor}`,
      `Watermark URL: ${cardData.watermarkUrl}`,
    ];
    settings.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });
    yPos += 3;

    // Loss Recovery Instructions
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Card Loss Recovery Process', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const recoveryText = [
      'If you lose your physical card:',
      '',
      '1. Access the password card generator at the watermark URL shown below',
      `2. Enter your seed value (${cardData.seed}) in the seed field`,
      `3. Select the hash algorithm (${cardData.hashAlgorithm.toUpperCase()}) from the dropdown`,
      '4. Configure all other settings exactly as shown in the "Card Generation Settings" section above',
      '5. Generate the PDF - your card will be identical to this one',
      '',
      'CRITICAL: If you used a string seed, you MUST select the correct hash algorithm. The hash',
      'algorithm converts your string seed into a number, and different algorithms produce different cards.',
      'Same seed + same algorithm + same parameters = identical card.',
    ];
    recoveryText.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });
    yPos += 3;

    // Watermark URL section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Watermark URL', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const urlText = [
      `Generator URL: ${cardData.watermarkUrl}`,
      '',
      'This URL is displayed on your card and embedded in the QR code on the left panel.',
      'Scan the QR code with your phone to quickly access the generator.',
    ];
    urlText.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });
    yPos += 3;

    // Usage Instructions
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('How to Use Your Password Card', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const usageText = [
      '1. Keep this card with you or in a secure location.',
      '',
      '2. To create a password, choose a starting position on the card and follow a pattern you will',
      '   remember.',
      '',
      '3. Never share your seed, pattern, or starting positions with others.',
      '',
      '4. Store a copy of this documentation page securely (separate from the card) to enable card',
      '   recovery.',
      '',
      '5. The QR code on the left panel links to the generator for easy access.',
    ];
    usageText.forEach((line) => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });
  }

  /**
   * Export as PNG or JPG image
   */
  private static async exportImage(
    frontSvg: string,
    backSvg: string,
    format: 'png' | 'jpeg'
  ): Promise<void> {
    // Create a temporary container for both cards
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.display = 'flex';
    container.style.gap = '20px';
    container.style.flexDirection = 'column';
    document.body.appendChild(container);

    // Add front card
    const frontDiv = document.createElement('div');
    frontDiv.innerHTML = frontSvg;
    container.appendChild(frontDiv);

    // Add back card
    const backDiv = document.createElement('div');
    backDiv.innerHTML = backSvg;
    container.appendChild(backDiv);

    try {
      // Render to canvas
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `password-card.${format === 'jpeg' ? 'jpg' : 'png'}`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, `image/${format}`);
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }
}
