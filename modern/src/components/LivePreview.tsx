import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { AppSettings, generatePattern } from '../utils/settings';
import { Configuration } from '../lib/Configuration';
import { CardCreator, CardData } from '../lib/CardCreator';
import { hashSeed } from '../lib/SeededRandom';
import { SvgRenderer } from '../lib/SvgRenderer';

interface Props {
  settings: AppSettings;
}

// Create a singleton SVG renderer
const svgRenderer = new SvgRenderer();

export default function LivePreview({ settings }: Props) {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [svgFront, setSvgFront] = useState<string>('');
  const [svgBack, setSvgBack] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateCardData();
  }, [settings]);

  async function generateCardData() {
    setLoading(true);
    setError(null);

    try {
      // Load SVG templates first
      await svgRenderer.loadTemplates();

      // Parse seed
      let numericSeed: number | bigint | undefined;
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
        showSeedOnCard: settings.showSeedOnCard,
        showMetadata: settings.showMetadata,
        metadataPosition: settings.metadataPosition,
        annotationFontSize: settings.annotationFontSize,
      });

      // Generate card data
      const creator = new CardCreator(config);
      const data = creator.generateCard();
      
      // Render SVGs
      const { front, back } = svgRenderer.renderBoth(data);
      
      setCardData(data);
      setSvgFront(front);
      setSvgBack(back);
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
          {/* Card Front - SVG Display */}
          <Box
            sx={{
              border: 2,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              mb: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Card Front
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& svg': {
                  maxWidth: '100%',
                  height: 'auto',
                },
              }}
              dangerouslySetInnerHTML={{ __html: svgFront }}
            />
          </Box>

          {/* Card Back - SVG Display */}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                '& svg': {
                  maxWidth: '100%',
                  height: 'auto',
                },
              }}
              dangerouslySetInnerHTML={{ __html: svgBack }}
            />
          </Box>

          {/* Info Message */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
            <Typography variant="caption">
              💡 This preview matches the legacy card layout pixel-perfect. Export to PDF, PNG, or JPG below.
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
