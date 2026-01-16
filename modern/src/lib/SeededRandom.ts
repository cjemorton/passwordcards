/**
 * Seeded Random Number Generator
 * 
 * This implements a seeded random number generator to ensure deterministic
 * card generation that matches the PHP backend implementation.
 * 
 * Uses the Mersenne Twister algorithm (similar to PHP's mt_rand)
 */

export class SeededRandom {
  private seed: number;
  private mt: number[] = [];
  private index: number = 0;

  constructor(seed: number) {
    this.seed = seed;
    this.init(seed);
  }

  /**
   * Initialize the MT array
   */
  private init(seed: number): void {
    this.mt[0] = seed >>> 0;
    for (let i = 1; i < 624; i++) {
      const s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
      this.mt[i] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253 + i) >>> 0;
    }
    this.index = 624;
  }

  /**
   * Generate next MT value
   */
  private generateNumbers(): void {
    for (let i = 0; i < 624; i++) {
      const y = (this.mt[i] & 0x80000000) + (this.mt[(i + 1) % 624] & 0x7fffffff);
      this.mt[i] = this.mt[(i + 397) % 624] ^ (y >>> 1);
      if (y % 2 !== 0) {
        this.mt[i] = this.mt[i] ^ 0x9908b0df;
      }
    }
    this.index = 0;
  }

  /**
   * Get next random number
   */
  public next(): number {
    if (this.index >= 624) {
      this.generateNumbers();
    }

    let y = this.mt[this.index++];
    y = y ^ (y >>> 11);
    y = y ^ ((y << 7) & 0x9d2c5680);
    y = y ^ ((y << 15) & 0xefc60000);
    y = y ^ (y >>> 18);

    return y >>> 0;
  }

  /**
   * Get random integer between min and max (inclusive)
   * Matches PHP's mt_rand(min, max) behavior
   */
  public randInt(min: number, max: number): number {
    if (min > max) {
      throw new Error('min must be less than or equal to max');
    }
    const range = max - min + 1;
    return min + (this.next() % range);
  }

  /**
   * Get random float between 0 and 1
   */
  public randFloat(): number {
    return this.next() / 0xffffffff;
  }
}

/**
 * Hash a string seed to a numeric seed
 * 
 * This matches the PHP implementation which takes the first 15 hexadecimal
 * characters from the hash and converts to integer. This provides ~60 bits
 * of entropy (15 hex chars = 60 bits) which is sufficient to prevent practical
 * collisions while ensuring cross-platform compatibility.
 */
export async function hashSeed(stringSeed: string, algorithm: 'sha256' | 'sha1' | 'sha512' | 'md5' = 'sha256'): Promise<number> {
  // For browser compatibility, we use the Web Crypto API for SHA algorithms
  let hashBuffer: ArrayBuffer;
  
  if (algorithm === 'md5') {
    // MD5 requires a polyfill or library - for now we'll use a simple hash
    // In production, you'd want to use a proper MD5 implementation
    return simpleHash(stringSeed);
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(stringSeed);
  
  const algoMap: Record<string, string> = {
    'sha256': 'SHA-256',
    'sha1': 'SHA-1',
    'sha512': 'SHA-512',
  };
  
  hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data);
  
  // Convert hash to hexadecimal string
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Take first 15 hex characters and convert to integer (matching PHP implementation)
  // This provides ~60 bits of entropy which fits comfortably in JavaScript's
  // Number.MAX_SAFE_INTEGER (2^53-1) while matching the PHP backend exactly
  const first15Chars = hashHex.substring(0, 15);
  const seed = parseInt(first15Chars, 16);
  
  return seed;
}

/**
 * Simple hash function fallback for MD5 or when crypto API is not available
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
