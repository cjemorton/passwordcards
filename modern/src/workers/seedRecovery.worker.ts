/**
 * Web Worker for advanced seed recovery
 * Handles brute-force search of string seeds with hashing
 */

import { CardCreator } from '../lib/CardCreator';
import { Configuration } from '../lib/Configuration';
import { hashSeed } from '../lib/SeededRandom';

interface SearchParams {
  config: {
    keyboardLayout: 'qwerty' | 'qwertz';
    pattern: string;
    spaceBarSize: number;
    hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
  };
  keyMapping: string[];
  spacebar: string;
  prefix: string;
  length: number;
  charset: string;
}

let shouldStop = false;

self.onmessage = async (e: MessageEvent<SearchParams>) => {
  const { config, keyMapping, spacebar, prefix, length, charset } = e.data;
  
  shouldStop = false;
  
  try {
    await searchStringSeeds(config, keyMapping, spacebar, prefix, length, charset);
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: { message: (error as Error).message },
    });
  }
};

async function searchStringSeeds(
  config: SearchParams['config'],
  keyMapping: string[],
  spacebar: string,
  prefix: string,
  length: number,
  charset: string
) {
  const startTime = Date.now();
  let tested = 0;
  const updateInterval = 100; // Update progress every 100 tests
  
  // Calculate remaining length after prefix
  const remainingLength = length - prefix.length;
  
  if (remainingLength < 0) {
    throw new Error('Prefix is longer than specified length');
  }
  
  if (remainingLength === 0) {
    // Only test the prefix itself
    await testStringSeed(prefix, config, keyMapping, spacebar);
    tested++;
  } else {
    // Generate all combinations of the remaining characters
    await generateCombinations(
      prefix,
      remainingLength,
      charset,
      async (candidate) => {
        if (shouldStop) return false;
        
        const found = await testStringSeed(candidate, config, keyMapping, spacebar);
        tested++;
        
        if (found) {
          self.postMessage({
            type: 'found',
            data: { seed: candidate },
          });
        }
        
        // Update progress
        if (tested % updateInterval === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = Math.floor(tested / elapsed);
          const totalCombinations = Math.pow(charset.length, remainingLength);
          const progress = (tested / totalCombinations) * 100;
          
          self.postMessage({
            type: 'progress',
            data: {
              progress: Math.min(progress, 100),
              currentSeed: candidate,
              tested,
              rate,
            },
          });
        }
        
        return true; // Continue
      }
    );
  }
  
  self.postMessage({ type: 'complete' });
}

async function testStringSeed(
  stringSeed: string,
  config: SearchParams['config'],
  keyMapping: string[],
  spacebar: string
): Promise<boolean> {
  try {
    // Hash the string seed to get numeric seed
    const numericSeed = await hashSeed(stringSeed, config.hashAlgorithm);
    
    // Create card with this seed
    const cardConfig = new Configuration({
      seed: numericSeed,
      pattern: config.pattern,
      keys: config.keyboardLayout,
      spaceBarSize: config.spaceBarSize,
      hashAlgorithm: config.hashAlgorithm,
    });
    
    const creator = new CardCreator(cardConfig);
    const card = creator.generateCard();
    
    // Verify key mapping matches
    // keyMapping is now an array where index corresponds to position
    // Empty strings mean that position wasn't specified
    if (keyMapping.length > 0) {
      for (let i = 0; i < Math.min(keyMapping.length, card.values.length); i++) {
        // Only verify non-empty positions
        if (keyMapping[i] && card.values[i] !== keyMapping[i]) {
          return false;
        }
      }
    }
    
    // Verify spacebar matches
    if (spacebar && card.spacebar !== spacebar) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error testing seed:', error);
    return false;
  }
}

async function generateCombinations(
  prefix: string,
  length: number,
  charset: string,
  callback: (combination: string) => Promise<boolean>
): Promise<void> {
  if (length === 0) {
    await callback(prefix);
    return;
  }
  
  for (let i = 0; i < charset.length; i++) {
    if (shouldStop) break;
    
    const char = charset[i];
    const shouldContinue = await generateCombinations(
      prefix + char,
      length - 1,
      charset,
      callback
    );
    
    if (!shouldContinue) break;
  }
}

// Handle worker termination
self.addEventListener('beforeunload', () => {
  shouldStop = true;
});
