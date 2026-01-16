/**
 * Configuration for password card generation
 * 
 * This maintains compatibility with the PHP backend implementation
 * while running entirely in the browser for privacy.
 */

export interface CardConfiguration {
  seed: number | bigint;
  pattern: string;
  keys: string;
  spaceBarSize: number;
  text: string;
  primaryColor: string;
  secondaryColor: string;
  watermarkUrl: string;
  hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
  originalStringSeed: string | null;
  printStringSeed: boolean;
  printNumberSeed: boolean;
  qrCodeEnabled: boolean;
  showSeedOnCard: boolean;
  showMetadata: boolean;
  metadataPosition: 'bottom' | 'spine';
  annotationFontSize: number;
}

export class Configuration {
  static readonly DEFAULT_PATTERN = 'a-zA-Z0-9~*-*';
  static readonly LOWER = 'abcdefghijklmnopqrstuvwxyz';
  static readonly UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  static readonly NUMBERS = '0123456789';
  static readonly SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  public seed: number | bigint;
  public pattern: string;
  public keys: string;
  public spaceBarSize: number;
  public text: string;
  public primaryColor: string;
  public secondaryColor: string;
  public watermarkUrl: string;
  public hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
  public originalStringSeed: string | null;
  public printStringSeed: boolean;
  public printNumberSeed: boolean;
  public qrCodeEnabled: boolean;
  public showSeedOnCard: boolean;
  public showMetadata: boolean;
  public metadataPosition: 'bottom' | 'spine';
  public annotationFontSize: number;

  constructor(config: Partial<CardConfiguration>) {
    this.seed = Configuration.evalSeed(config.seed);
    this.pattern = Configuration.evalPattern(config.pattern);
    this.keys = Configuration.evalKeys(config.keys);
    this.spaceBarSize = config.spaceBarSize ?? 8;
    this.text = config.text ?? '';
    this.primaryColor = config.primaryColor ?? '#1ABC9C';
    this.secondaryColor = config.secondaryColor ?? '#ffffff';
    this.watermarkUrl = config.watermarkUrl ?? 'https://passwordcards.mrnet.work/';
    this.hashAlgorithm = config.hashAlgorithm ?? 'sha256';
    this.originalStringSeed = config.originalStringSeed ?? null;
    this.printStringSeed = config.printStringSeed ?? false;
    this.printNumberSeed = config.printNumberSeed ?? false;
    this.qrCodeEnabled = config.qrCodeEnabled ?? false;
    this.showSeedOnCard = config.showSeedOnCard ?? false;
    this.showMetadata = config.showMetadata ?? true;
    this.metadataPosition = config.metadataPosition ?? 'bottom';
    this.annotationFontSize = config.annotationFontSize ?? 20;
  }

  /**
   * Get pattern characters as an array
   */
  public getPatternCharacters(): string[] {
    return Configuration.completePattern(this.pattern).split('');
  }

  /**
   * Complete pattern by replacing shortcuts with actual characters
   */
  public static completePattern(pattern: string): string {
    let result = pattern;
    result = result.replace('a-z', Configuration.LOWER);
    result = result.replace('A-Z', Configuration.UPPER);
    result = result.replace('0-9', Configuration.NUMBERS);
    result = result.replace('*-*', Configuration.SYMBOLS);
    return result;
  }

  /**
   * Evaluate and generate seed if needed
   * 
   * DETERMINISTIC GENERATION:
   * The seed value is the key to deterministic card generation. When a specific
   * seed is provided (integer value or bigint), the card generation becomes deterministic,
   * meaning the exact same card will be generated every time with that seed and
   * the same configuration parameters.
   * 
   * If no seed is provided (undefined), a random seed is generated based on the 
   * current timestamp, resulting in a unique, non-reproducible card.
   */
  public static evalSeed(seed: number | bigint | undefined): number | bigint {
    if (seed === undefined || (typeof seed === 'number' && !Number.isFinite(seed))) {
      // Generate random seed based on timestamp (similar to PHP microtime)
      const now = performance.now();
      // Use modulo 2^31-1 to ensure positive signed 32-bit integer
      return Math.floor(now * 100000) % 2147483647;
    }
    if (typeof seed === 'bigint') {
      return seed;
    }
    return Math.floor(seed);
  }

  /**
   * Evaluate pattern, return default if not provided
   */
  public static evalPattern(pattern: string | undefined): string {
    return pattern ?? Configuration.DEFAULT_PATTERN;
  }

  /**
   * Evaluate keyboard layout
   */
  public static evalKeys(keys: string | undefined): string {
    if (keys?.toLowerCase() === 'qwertz') {
      return 'QWERTZUIOPASDFGHJKLYXCVBNM';
    }
    return 'QWERTYUIOPASDFGHJKLZXCVBNM'; // Default QWERTY
  }
}
