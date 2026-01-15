import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { AppSettings, generatePattern } from '../utils/settings';
import { Configuration } from '../lib/Configuration';
import { CardCreator, CardData } from '../lib/CardCreator';
import { hashSeed } from '../lib/SeededRandom';

interface Props {
  settings: AppSettings;
}

export default function LivePreview({ settings }: Props) {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateCardData();
  }, [settings]);

  async function generateCardData() {
    setLoading(true);
    setError(null);

    try {
      // Parse seed
      let numericSeed: number | undefined;
      if (settings.seed) {
        if (/^\d+$/.test(settings.seed)) {
          // Numeric seed
          numericSeed = parseInt(settings.seed, 10);
        } else {
          // String seed - hash it
          numericSeed = await hashSeed(settings.seed, settings.hashAlgorithm);
        }
      }

      // Create configuration
      const config = new Configuration({
        seed: numericSeed,
        pattern: generatePattern(settings),
        keys: settings.keyboardLayout,
        spaceBarSize: settings.spaceBarSize,
        text: settings.annotation,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        watermarkUrl: settings.watermarkUrl,
        hashAlgorithm: settings.hashAlgorithm,
        originalStringSeed: settings.seed && !/^\d+$/.test(settings.seed) ? settings.seed : null,
        printStringSeed: settings.printStringSeed,
        printNumberSeed: settings.printNumberSeed,
        qrCodeEnabled: settings.qrCodeEnabled,
      });

      // Generate card
      const creator = new CardCreator(config);
      const data = creator.generateCard();
      
      setCardData(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error generating card:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Live Preview
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ color: 'error.main', py: 2 }}>
          <Typography>Error: {error}</Typography>
        </Box>
      )}

      {cardData && !loading && (
        <Box>
          {/* Card Front - Password Grid */}
          <Box
            sx={{
              border: 2,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              mb: 2,
              backgroundColor: cardData.primaryColor,
              color: cardData.secondaryColor,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Card Front
            </Typography>
            
            {/* Grid Layout */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto repeat(8, 1fr)',
                gap: 0.5,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}
            >
              {/* Header Row */}
              <Box></Box>
              {['1', '2', '3', '4', '5', '6', '7', '8'].map((col) => (
                <Box key={col} sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {col}
                </Box>
              ))}

              {/* Data Rows */}
              {cardData.keys.map((key, rowIndex) => (
                <>
                  <Box key={`key-${rowIndex}`} sx={{ fontWeight: 'bold', pr: 1 }}>
                    {key}
                  </Box>
                  {Array.from({ length: 8 }).map((_, colIndex) => {
                    const charIndex = rowIndex * 8 + colIndex;
                    const char = cardData.values[charIndex] || '';
                    return (
                      <Box
                        key={`cell-${rowIndex}-${colIndex}`}
                        sx={{
                          textAlign: 'center',
                          p: 0.5,
                          border: 1,
                          borderColor: 'rgba(255,255,255,0.2)',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                        }}
                      >
                        {char}
                      </Box>
                    );
                  })}
                </>
              ))}

              {/* Spacebar Row */}
              <Box sx={{ fontWeight: 'bold', pr: 1 }}>SPACE</Box>
              <Box
                sx={{
                  gridColumn: 'span 8',
                  textAlign: 'center',
                  p: 0.5,
                  border: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                }}
              >
                {cardData.spacebar}
              </Box>
            </Box>
          </Box>

          {/* Card Back - Info */}
          <Box
            sx={{
              border: 2,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Card Back
            </Typography>
            <Box sx={{ fontSize: '0.9rem' }}>
              {cardData.text && (
                <Typography variant="body2" gutterBottom>
                  <strong>Annotation:</strong> {cardData.text}
                </Typography>
              )}
              {cardData.seedDisplay && (
                <Typography variant="body2" gutterBottom>
                  {cardData.seedDisplay}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                <strong>Pattern:</strong> {cardData.pattern}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Hash Algorithm:</strong> {cardData.hashAlgorithm}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Watermark:</strong> {cardData.watermarkUrl}
              </Typography>
              {cardData.qrCodeEnabled && (
                <Typography variant="body2" color="text.secondary">
                  [QR Code will appear here in PDF export]
                </Typography>
              )}
            </Box>
          </Box>

          {/* Info Message */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
            <Typography variant="caption">
              💡 This is a simplified preview. The actual PDF export will have professional formatting.
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
