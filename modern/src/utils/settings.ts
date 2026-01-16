/**
 * Settings management with localStorage persistence
 */

export interface AppSettings {
  // Card settings
  withNumbers: boolean;
  withLower: boolean;
  withUpper: boolean;
  withSymbols: boolean;
  withSpace: boolean;
  withOther: boolean;
  otherChars: string;
  keyboardLayout: 'qwerty' | 'qwertz';
  annotation: string;
  watermarkUrl: string;
  primaryColor: string;
  secondaryColor: string;
  seed: string;
  hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
  printStringSeed: boolean;
  printNumberSeed: boolean;
  qrCodeEnabled: boolean;
  spaceBarSize: number;
  showMetadata: boolean;
  metadataPosition: 'bottom' | 'spine';
  annotationFontSize: number;
  cardOutputSize: 'laminating' | 'credit-card';
  
  // UI settings
  theme: 'light' | 'dark' | 'custom';
  fontSize: number;
  
  // Advanced settings
  cardSize: 'standard' | 'credit' | 'custom';
  customWidth: number;
  customHeight: number;
  cardsPerPage: number;
  showSeedOnCard: boolean;
  
  // Tutorial
  hasSeenTutorial: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  withNumbers: true,
  withLower: true,
  withUpper: true,
  withSymbols: true,
  withSpace: false,
  withOther: false,
  otherChars: '',
  keyboardLayout: 'qwerty',
  annotation: '',
  watermarkUrl: 'https://passwordcards.mrnet.work/',
  primaryColor: '#1ABC9C',
  secondaryColor: '#ffffff',
  seed: '',
  hashAlgorithm: 'sha256',
  printStringSeed: false,
  printNumberSeed: false,
  qrCodeEnabled: false,
  spaceBarSize: 8,
  showMetadata: true,
  metadataPosition: 'bottom',
  annotationFontSize: 20,
  cardOutputSize: 'laminating',
  theme: 'dark',
  fontSize: 14,
  cardSize: 'standard',
  customWidth: 3.375,
  customHeight: 2.125,
  cardsPerPage: 3,
  showSeedOnCard: false,
  hasSeenTutorial: false,
};

const STORAGE_KEY = 'passwordcard-settings-v2';

/**
 * Load settings from localStorage
 */
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

/**
 * Clear all settings
 */
export function clearSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export settings to JSON file
 */
export function exportSettings(settings: AppSettings): void {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `passwordcard-settings-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Import settings from JSON file
 */
export async function importSettings(file: File): Promise<AppSettings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const settings = { ...DEFAULT_SETTINGS, ...parsed };
        resolve(settings);
      } catch (error) {
        reject(new Error('Invalid settings file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Generate pattern string from settings
 */
export function generatePattern(settings: AppSettings): string {
  const parts: string[] = [];
  
  // Order matches legacy PHP implementation: numbers, lowercase, uppercase, symbols, space, other
  // No separators between parts (legacy concatenates directly)
  if (settings.withNumbers) parts.push('0-9');
  if (settings.withLower) parts.push('a-z');
  if (settings.withUpper) parts.push('A-Z');
  if (settings.withSymbols) parts.push('*-*');
  if (settings.withSpace) parts.push(' ');
  if (settings.withOther && settings.otherChars) parts.push(settings.otherChars);
  
  // Join without separator to match PHP implementation
  return parts.join('') || 'a-zA-Z0-9*-*';
}

/**
 * Encode settings to URL query string
 */
export function encodeSettingsToUrl(settings: AppSettings): string {
  const params = new URLSearchParams();
  
  // Only encode the essential card generation settings, not UI preferences
  params.set('p', generatePattern(settings));
  params.set('k', settings.keyboardLayout);
  params.set('a', settings.annotation);
  params.set('pc', settings.primaryColor);
  params.set('sc', settings.secondaryColor);
  params.set('ha', settings.hashAlgorithm);
  params.set('sb', settings.spaceBarSize.toString());
  params.set('qr', settings.qrCodeEnabled ? '1' : '0');
  
  return params.toString();
}

/**
 * Decode settings from URL query string
 */
export function decodeSettingsFromUrl(queryString: string): Partial<AppSettings> {
  const params = new URLSearchParams(queryString);
  const settings: Partial<AppSettings> = {};
  
  // TODO: Implement pattern parsing back to individual settings
  if (params.has('k')) {
    const keyValue = params.get('k');
    if (keyValue === 'qwerty' || keyValue === 'qwertz') {
      settings.keyboardLayout = keyValue;
    }
  }
  if (params.has('a')) settings.annotation = params.get('a') || '';
  if (params.has('pc')) settings.primaryColor = params.get('pc') || '';
  if (params.has('sc')) settings.secondaryColor = params.get('sc') || '';
  if (params.has('ha')) {
    const hashValue = params.get('ha');
    if (hashValue === 'sha256' || hashValue === 'sha1' || hashValue === 'sha512' || hashValue === 'md5') {
      settings.hashAlgorithm = hashValue;
    }
  }
  if (params.has('sb')) settings.spaceBarSize = parseInt(params.get('sb') || '8');
  if (params.has('qr')) settings.qrCodeEnabled = params.get('qr') === '1';
  
  return settings;
}
