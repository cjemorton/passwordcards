import { Configuration } from './Configuration';
import { SeededRandom } from './SeededRandom';

/**
 * Card Creator - Core password card generation logic
 * 
 * This is a direct port of the PHP CardCreator class to TypeScript,
 * maintaining identical deterministic behavior for card generation.
 */

export interface CardData {
  keys: string[];
  values: string[];
  spacebar: string;
  seed: number;
  primaryColor: string;
  secondaryColor: string;
  text: string;
  pattern: string;
  hashAlgorithm: string;
  watermarkUrl: string;
  seedDisplay: string;
  qrCodeEnabled: boolean;
}

export class CardCreator {
  private config: Configuration;

  constructor(config: Configuration) {
    this.config = config;
  }

  /**
   * Generate card data
   * 
   * DETERMINISTIC GENERATION:
   * Uses seeded random number generator to ensure that the same seed
   * with identical configuration parameters always produces the same card.
   */
  public generateCard(): CardData {
    // Get available characters from pattern
    const chars = this.config.getPatternCharacters();
    const charCount = chars.length;

    if (charCount === 0) {
      throw new Error('Pattern must contain at least one character');
    }

    // Initialize seeded random number generator
    const random = new SeededRandom(this.config.seed);

    // Generate random characters for each key position
    const keys: string[] = [];
    const values: string[] = [];
    
    for (let i = 0; i < this.config.keys.length; i++) {
      keys.push(this.config.keys[i]);
      const randomIndex = random.randInt(0, charCount - 1);
      values.push(chars[randomIndex]);
    }

    // Generate random characters for spacebar
    let spacebar = '';
    for (let i = 0; i < this.config.spaceBarSize; i++) {
      const randomIndex = random.randInt(0, charCount - 1);
      spacebar += chars[randomIndex];
    }

    // Build seed display string
    const seedDisplay = this.buildSeedDisplay();

    return {
      keys,
      values,
      spacebar,
      seed: this.config.seed,
      primaryColor: this.config.primaryColor,
      secondaryColor: this.config.secondaryColor,
      text: this.config.text,
      pattern: this.config.pattern,
      hashAlgorithm: this.config.hashAlgorithm.toUpperCase(),
      watermarkUrl: this.config.watermarkUrl,
      seedDisplay,
      qrCodeEnabled: this.config.qrCodeEnabled,
    };
  }

  /**
   * Build the seed display string based on user preferences
   */
  private buildSeedDisplay(): string {
    const parts: string[] = [];

    if (this.config.printStringSeed && this.config.originalStringSeed) {
      parts.push(`Seed: ${this.config.originalStringSeed}`);
    }

    if (this.config.printNumberSeed) {
      parts.push(`Number: ${this.config.seed}`);
    }

    return parts.join(' | ');
  }

  /**
   * Escape special characters for SVG/HTML
   */
  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
