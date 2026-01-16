/**
 * Export Utilities - Handle PDF, PNG, and JPG exports
 * 
 * This module provides export functionality that matches the legacy behavior
 * for PDF exports while adding modern PNG/JPG support.
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
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
    cardData: CardData,
    cardsPerPage: number = 3
  ): Promise<void> {
    switch (format) {
      case 'pdf':
        await this.exportPDF(frontSvg, backSvg, cardData, cardsPerPage);
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
   * Export as PDF - Updated to support configurable layout
   * - Text/back card on left, keyboard/front card on right (reversed from legacy)
   * - Configurable cards per page
   * - Toggleable QR code and seed display
   */
  private static async exportPDF(
    frontSvg: string,
    backSvg: string,
    cardData: CardData,
    cardsPerPage: number = 3
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

    // Calculate vertical spacing for cards per page
    // A4 height: 297mm, with margins
    const pageHeight = 297;
    const topMargin = 10;
    const bottomMargin = 10;
    const availableHeight = pageHeight - topMargin - bottomMargin;
    const cardHeight = 55; // mm
    const verticalSpacing = availableHeight / cardsPerPage;
    
    // Card dimensions
    const cardWidth = 85; // mm
    
    // Generate cards based on cardsPerPage setting
    for (let i = 0; i < cardsPerPage; i++) {
      // Calculate Y position for this card
      const yPos = topMargin + (i * verticalSpacing) + ((verticalSpacing - cardHeight) / 2);
      
      // Add fold lines (vertical line between cards)
      pdf.setLineWidth(0.2);
      pdf.line(95, yPos, 95, yPos + 3);
      pdf.line(95, yPos + cardHeight - 3, 95, yPos + cardHeight);
      
      // Convert SVGs to high-resolution images and embed in PDF
      // REVERSED LAYOUT: Back card (text) on left, Front card (keyboard) on right
      
      // Convert SVGs to images (only once for efficiency)
      const backImageData = i === 0 ? await this.svgToImageData(backSvg) : await this.svgToImageData(backSvg);
      const frontImageData = i === 0 ? await this.svgToImageData(frontSvg) : await this.svgToImageData(frontSvg);
      
      // Add back card (LEFT panel) - was previously on the right
      pdf.addImage(backImageData, 'PNG', 10, yPos, cardWidth, cardHeight);
      
      // Add front card (RIGHT panel) - was previously on the left
      pdf.addImage(frontImageData, 'PNG', 95, yPos, cardWidth, cardHeight);
      
      // Add QR code if enabled
      if (cardData.qrCodeEnabled && cardData.watermarkUrl) {
        try {
          const qrDataUrl = await QRCode.toDataURL(cardData.watermarkUrl, {
            errorCorrectionLevel: 'L',
            margin: 0,
            width: 128,
          });
          // Place QR code in top-right corner of back card (left panel)
          pdf.addImage(qrDataUrl, 'PNG', 82, yPos + 2, 12, 12);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
      
      // Add seed display if enabled - positioned vertically along the fold edge
      if (cardData.showSeedOnCard && cardData.seedDisplay) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100); // Gray color
        
        // Position text vertically along the fold line (rotated 90 degrees)
        // X position: at the fold line (95mm)
        // Y position: centered vertically on the card
        const textX = 94; // Just left of the fold line
        const textY = yPos + (cardHeight / 2);
        
        // Save state, rotate, add text, restore
        pdf.saveGraphicsState();
        pdf.text(cardData.seedDisplay, textX, textY, {
          angle: 90, // Rotate 90 degrees for vertical text
          align: 'center',
        });
        pdf.restoreGraphicsState();
      }
    }

    // Add documentation page
    this.addDocumentationPage(pdf, cardData);

    // Save the PDF
    pdf.save('password-card.pdf');
  }

  /**
   * Convert SVG to high-resolution image data for PDF embedding
   * Uses canvas rendering to ensure proper font and styling support
   */
  private static async svgToImageData(svgString: string): Promise<string> {
    // Create a temporary container for the SVG
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    // Parse SVG safely using DOMParser
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    
    if (!svgElement) {
      document.body.removeChild(container);
      throw new Error('Invalid SVG string');
    }

    // Add parsed SVG to container
    container.appendChild(svgElement);

    // Get SVG dimensions
    const svgWidth = parseFloat(svgElement.getAttribute('width') || '301.18109');
    const svgHeight = parseFloat(svgElement.getAttribute('height') || '194.88188');
    
    // Calculate scale for print quality (300 DPI)
    // Target: 85mm = ~1003 pixels at 300 DPI
    // Scale factor: (300 DPI * 85mm / 25.4 mm/inch) / svg_width_pixels
    const PRINT_DPI = 300;
    const TARGET_WIDTH_MM = 85;
    const MM_PER_INCH = 25.4;
    const PRINT_QUALITY_SCALE = (PRINT_DPI * TARGET_WIDTH_MM / MM_PER_INCH) / svgWidth;

    try {
      // Render SVG to canvas at high resolution
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: PRINT_QUALITY_SCALE,
        width: svgWidth,
        height: svgHeight,
        logging: false,
        useCORS: true,
      });

      // Convert canvas to PNG data URL
      const imageData = canvas.toDataURL('image/png');
      return imageData;
    } finally {
      // Clean up
      document.body.removeChild(container);
    }
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
