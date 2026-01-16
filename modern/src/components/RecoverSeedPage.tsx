import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Alert,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import { Search as SearchIcon, Stop as StopIcon } from '@mui/icons-material';
import { CardCreator } from '../lib/CardCreator';
import { Configuration } from '../lib/Configuration';
import { hashSeed } from '../lib/SeededRandom';
import CardPreviewWithOverlay from './CardPreviewWithOverlay';

interface RecoveryConfig {
  keyboardLayout: 'qwerty' | 'qwertz';
  pattern: string;
  spaceBarSize: number;
  hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
}

interface CardMapping {
  keys: string[];
  values: string[];
  spacebar: string;
}

export default function RecoverSeedPage() {
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic');
  const [config, setConfig] = useState<RecoveryConfig>({
    keyboardLayout: 'qwerty',
    pattern: 'a-zA-Z0-9*-*',
    spaceBarSize: 8,
    hashAlgorithm: 'sha256',
  });
  
  // Card data inputs - array-based for overlay input fields
  const [keyValues, setKeyValues] = useState<string[]>(new Array(26).fill(''));
  const [spacebarCode, setSpacebarCode] = useState('');
  
  // Search parameters
  const [startSeed, setStartSeed] = useState('0');
  const [endSeed, setEndSeed] = useState('10000');
  const [stringPrefix, setStringPrefix] = useState('');
  const [stringLength, setStringLength] = useState('8');
  const [stringCharset, setStringCharset] = useState('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
  
  // Search state
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSeed, setCurrentSeed] = useState('');
  const [results, setResults] = useState<Array<{ seed: string; type: 'numeric' | 'string' }>>([]);
  const [searchStats, setSearchStats] = useState({ tested: 0, rate: 0 });
  
  // Worker reference
  const [worker, setWorker] = useState<Worker | null>(null);

  /**
   * Get key mapping as array, filtering out empty values
   * This supports the new array-based state from overlay inputs
   */
  const getKeyMapping = (): string[] => {
    return keyValues.filter(v => v.length > 0);
  };

  const verifyCard = (seed: number | bigint, type: 'numeric' | 'string'): boolean => {
    try {
      const cardConfig = new Configuration({
        seed,
        pattern: config.pattern,
        keys: config.keyboardLayout,
        spaceBarSize: config.spaceBarSize,
        hashAlgorithm: config.hashAlgorithm,
      });
      
      const creator = new CardCreator(cardConfig);
      const card = creator.generateCard();
      
      const expectedKeys = getKeyMapping();
      const expectedSpacebar = spacebarCode.trim();
      
      // Verify key mapping matches
      // Compare non-empty key values with their corresponding positions
      if (expectedKeys.length > 0) {
        let keyIndex = 0;
        for (let i = 0; i < keyValues.length && keyIndex < expectedKeys.length; i++) {
          if (keyValues[i]) {
            // This position has a value, verify it matches
            if (card.values[i] !== keyValues[i]) {
              return false;
            }
            keyIndex++;
          }
        }
      }
      
      // Verify spacebar matches
      if (expectedSpacebar && card.spacebar !== expectedSpacebar) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying card:', error);
      return false;
    }
  };

  const startBasicSearch = async () => {
    setSearching(true);
    setResults([]);
    setProgress(0);
    setSearchStats({ tested: 0, rate: 0 });
    
    const start = parseInt(startSeed);
    const end = parseInt(endSeed);
    const total = end - start + 1;
    
    if (isNaN(start) || isNaN(end) || start > end) {
      alert('Invalid seed range');
      setSearching(false);
      return;
    }
    
    const startTime = Date.now();
    let tested = 0;
    
    for (let seed = start; seed <= end; seed++) {
      if (!searching) break;
      
      setCurrentSeed(seed.toString());
      
      if (verifyCard(seed, 'numeric')) {
        setResults(prev => [...prev, { seed: seed.toString(), type: 'numeric' }]);
      }
      
      tested++;
      
      // Update progress every 100 iterations
      if (tested % 100 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = Math.floor(tested / elapsed);
        setProgress((tested / total) * 100);
        setSearchStats({ tested, rate });
      }
    }
    
    setSearching(false);
    setProgress(100);
  };

  const startAdvancedSearch = async () => {
    setSearching(true);
    setResults([]);
    setProgress(0);
    setSearchStats({ tested: 0, rate: 0 });
    
    // Create web worker for advanced search
    const newWorker = new Worker(
      new URL('../workers/seedRecovery.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    setWorker(newWorker);
    
    newWorker.onmessage = (e) => {
      const { type, data } = e.data;
      
      switch (type) {
        case 'progress':
          setProgress(data.progress);
          setCurrentSeed(data.currentSeed);
          setSearchStats({ tested: data.tested, rate: data.rate });
          break;
          
        case 'found':
          setResults(prev => [...prev, { seed: data.seed, type: 'string' }]);
          break;
          
        case 'complete':
          setSearching(false);
          setProgress(100);
          setWorker(null);
          break;
          
        case 'error':
          alert('Search error: ' + data.message);
          setSearching(false);
          setWorker(null);
          break;
      }
    };
    
    // Send search parameters to worker
    // For worker, we need the full key mapping array with values at correct positions
    newWorker.postMessage({
      config,
      keyMapping: keyValues, // Send full array with positions preserved
      spacebar: spacebarCode.trim(),
      prefix: stringPrefix,
      length: parseInt(stringLength),
      charset: stringCharset,
    });
  };

  const stopSearch = () => {
    setSearching(false);
    if (worker) {
      worker.terminate();
      setWorker(null);
    }
  };

  const handleSearch = () => {
    if (mode === 'basic') {
      startBasicSearch();
    } else {
      startAdvancedSearch();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Lost Seed Recovery
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Recover your password card seed by providing the card's configuration and actual character mapping.
          This tool will brute-force search for the seed that produces the matching card.
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>Warning:</strong> Advanced mode with string seeds can be computationally intensive. 
          The search time increases exponentially with string length. Use realistic constraints to avoid 
          excessive computation time.
        </Alert>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Mode
        </Typography>
        <Tabs value={mode} onChange={(_, v) => setMode(v)} sx={{ mb: 3 }}>
          <Tab label="Basic (Numeric Seeds)" value="basic" />
          <Tab label="Advanced (String Seeds)" value="advanced" />
        </Tabs>

        {mode === 'basic' ? (
          <Box>
            <Typography variant="body2" paragraph>
              Brute-force numeric seeds within a specified range. Best for integer-based seeds.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Start Seed"
                type="number"
                value={startSeed}
                onChange={(e) => setStartSeed(e.target.value)}
                disabled={searching}
              />
              <TextField
                fullWidth
                label="End Seed"
                type="number"
                value={endSeed}
                onChange={(e) => setEndSeed(e.target.value)}
                disabled={searching}
              />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" paragraph>
              Brute-force string seeds with constraints. Uses Web Workers for multi-threaded search.
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="String Prefix (optional)"
                value={stringPrefix}
                onChange={(e) => setStringPrefix(e.target.value)}
                disabled={searching}
                helperText="If you remember part of your seed, enter it here"
              />
              <TextField
                fullWidth
                label="String Length"
                type="number"
                value={stringLength}
                onChange={(e) => setStringLength(e.target.value)}
                disabled={searching}
                inputProps={{ min: 1, max: 20 }}
              />
              <TextField
                fullWidth
                label="Character Set"
                value={stringCharset}
                onChange={(e) => setStringCharset(e.target.value)}
                disabled={searching}
                helperText="Characters to try in the seed string"
                multiline
                rows={2}
              />
            </Stack>
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Card Configuration
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Keyboard Layout</InputLabel>
            <Select
              value={config.keyboardLayout}
              label="Keyboard Layout"
              onChange={(e) => setConfig({ ...config, keyboardLayout: e.target.value as 'qwerty' | 'qwertz' })}
              disabled={searching}
            >
              <MenuItem value="qwerty">QWERTY</MenuItem>
              <MenuItem value="qwertz">QWERTZ</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Character Pattern"
            value={config.pattern}
            onChange={(e) => setConfig({ ...config, pattern: e.target.value })}
            disabled={searching}
            helperText="e.g., a-zA-Z0-9*-* (default pattern)"
          />
          
          <TextField
            fullWidth
            label="Spacebar Size"
            type="number"
            value={config.spaceBarSize}
            onChange={(e) => setConfig({ ...config, spaceBarSize: parseInt(e.target.value) || 8 })}
            disabled={searching}
            inputProps={{ min: 1, max: 20 }}
          />
          
          <FormControl fullWidth>
            <InputLabel>Hash Algorithm</InputLabel>
            <Select
              value={config.hashAlgorithm}
              label="Hash Algorithm"
              onChange={(e) => setConfig({ ...config, hashAlgorithm: e.target.value as any })}
              disabled={searching}
            >
              <MenuItem value="sha256">SHA-256</MenuItem>
              <MenuItem value="sha1">SHA-1</MenuItem>
              <MenuItem value="sha512">SHA-512</MenuItem>
              <MenuItem value="md5">MD5</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Transcribe Your Physical Card
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Enter the configuration settings that match your physical card, then click on each key 
          position below to enter the corresponding character from your card. This interactive method 
          reduces transcription errors compared to typing a long list of characters.
        </Typography>
        <CardPreviewWithOverlay
          keyboardLayout={config.keyboardLayout}
          pattern={config.pattern}
          spaceBarSize={config.spaceBarSize}
          hashAlgorithm={config.hashAlgorithm}
          keyValues={keyValues}
          spacebarValue={spacebarCode}
          onKeyValuesChange={setKeyValues}
          onSpacebarValueChange={setSpacebarCode}
          disabled={searching}
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {!searching ? (
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={getKeyMapping().length === 0 && !spacebarCode}
            >
              Start Search
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopSearch}
            >
              Stop Search
            </Button>
          )}
        </Stack>

        {searching && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Current seed: {currentSeed} | Tested: {searchStats.tested.toLocaleString()} | 
              Rate: {searchStats.rate.toLocaleString()} seeds/sec
            </Typography>
          </Box>
        )}
      </Paper>

      {results.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Found Seeds ({results.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            {results.map((result, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={result.type === 'numeric' ? 'Numeric' : 'String'} 
                  size="small" 
                  color={result.type === 'numeric' ? 'primary' : 'secondary'}
                />
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {result.seed}
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigator.clipboard.writeText(result.seed)}
                >
                  Copy
                </Button>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Container>
  );
}
