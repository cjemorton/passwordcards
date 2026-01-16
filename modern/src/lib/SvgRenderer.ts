/**
 * SVG Renderer - Renders password cards using legacy SVG templates
 * 
 * This module loads the legacy SVG templates and replaces placeholders
 * to generate pixel-perfect cards that match the legacy layout exactly.
 */

import { CardData } from './CardCreator';

export class SvgRenderer {
  private frontTemplate: string = '';
  private backTemplate: string = '';
  private loaded: boolean = false;

  /**
   * Load SVG templates from public directory
   */
  async loadTemplates(): Promise<void> {
    if (this.loaded) return;

    try {
      const [frontResponse, backResponse] = await Promise.all([
        fetch('/templates/simple_front.svg'),
        fetch('/templates/simple_back.svg'),
      ]);

      if (!frontResponse.ok || !backResponse.ok) {
        throw new Error('Failed to load SVG templates');
      }

      this.frontTemplate = await frontResponse.text();
      this.backTemplate = await backResponse.text();
      this.loaded = true;
    } catch (error) {
      console.error('Error loading SVG templates:', error);
      throw error;
    }
  }

  /**
   * Escape special characters for SVG/XML
   */
  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Calculate appropriate font size for watermark URL to prevent clipping
   * (Ported from PHP CardCreator)
   */
  private calculateWatermarkFontSize(length: number): number {
    if (length <= 30) return 10;
    if (length <= 50) return 9;
    if (length <= 70) return 8;
    if (length <= 100) return 7;
    if (length <= 130) return 6;
    if (length <= 160) return 5;
    return 4;
  }

  /**
   * Render the front card SVG
   */
  renderFront(cardData: CardData): string {
    if (!this.loaded) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }

    let svg = this.frontTemplate;

    // Replace key characters and their values
    for (let i = 0; i < cardData.keys.length; i++) {
      const keyIndex = i + 1;
      const value = cardData.values[i] || '';
      
      // Replace the value ($1$, $2$, etc.)
      svg = svg.replace(`$${keyIndex}$`, this.escape(value));
      
      // Replace the key label ($k1$, $k2$, etc.)
      svg = svg.replace(`$k${keyIndex}$`, this.escape(cardData.keys[i]));
    }

    // Replace spacebar
    svg = svg.replace('$SPACE$', this.escape(cardData.spacebar));

    // Replace colors
    svg = svg.replace(/\$PRIMARY\$/g, cardData.primaryColor);
    svg = svg.replace(/\$SECONDARY\$/g, cardData.secondaryColor);

    return svg;
  }

  /**
   * Render the back card SVG
   */
  renderBack(cardData: CardData): string {
    if (!this.loaded) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }

    let svg = this.backTemplate;

    // Replace seed display
    svg = svg.replace('$SEED_DISPLAY$', this.escape(cardData.seedDisplay));

    // Legacy format: /seed/pattern/hash_algorithm/
    const legacySeedFormat = `/${this.escape(String(cardData.seed))}/${this.escape(cardData.pattern)}/${this.escape(cardData.hashAlgorithm)}/`;
    svg = svg.replace('$SEED$/$PATTERN$/$HASH_ALGORITHM$/', legacySeedFormat);

    // Replace individual values for compatibility (with escaping)
    svg = svg.replace(/\$SEED\$/g, this.escape(String(cardData.seed)));
    svg = svg.replace(/\$PATTERN\$/g, this.escape(cardData.pattern));
    svg = svg.replace(/\$HASH_ALGORITHM\$/g, this.escape(cardData.hashAlgorithm));

    // Replace text annotation
    svg = svg.replace('$TEXT$', this.escape(cardData.text));

    // Replace watermark URL
    svg = svg.replace('$WATERMARK_URL$', this.escape(cardData.watermarkUrl));

    // Calculate and replace watermark font size
    const watermarkFontSize = this.calculateWatermarkFontSize(cardData.watermarkUrl.length);
    svg = svg.replace('$WATERMARK_FONT_SIZE$', String(watermarkFontSize));

    // Replace colors
    svg = svg.replace(/\$PRIMARY\$/g, cardData.primaryColor);
    svg = svg.replace(/\$SECONDARY\$/g, cardData.secondaryColor);

    return svg;
  }

  /**
   * Render both front and back cards
   */
  renderBoth(cardData: CardData): { front: string; back: string } {
    return {
      front: this.renderFront(cardData),
      back: this.renderBack(cardData),
    };
  }
}
