import {
  Paper,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { AppSettings, generatePattern } from '../utils/settings';
import { Configuration } from '../lib/Configuration';
import { CardCreator, CardData } from '../lib/CardCreator';
import { hashSeed } from '../lib/SeededRandom';
import { SvgRenderer } from '../lib/SvgRenderer';
import { ExportUtils, ExportFormat } from '../lib/ExportUtils';

interface Props {
  settings: AppSettings;
}

// Create a singleton SVG renderer
const svgRenderer = new SvgRenderer();

export default function ExportPanel({ settings }: Props) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [svgFront, setSvgFront] = useState<string>('');
  const [svgBack, setSvgBack] = useState<string>('');

  // Generate card data when settings change
  useEffect(() => {
    generateCardData();
  }, [settings]);

  async function generateCardData() {
    try {
      // Load SVG templates first
      await svgRenderer.loadTemplates();

      // Parse seed
      let numericSeed: number | bigint | undefined;
      if (settings.seed) {
        if (/^\d+$/.test(settings.seed)) {
          numericSeed = parseInt(settings.seed, 10);
        } else {
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
        cardOutputSize: settings.cardOutputSize,
      });

      // Generate card data
      const creator = new CardCreator(config);
      const data = creator.generateCard();
      
      // Render SVGs
      const { front, back } = svgRenderer.renderBoth(data);
      
      setCardData(data);
      setSvgFront(front);
      setSvgBack(back);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error generating card:', err);
    }
  }

  const handleExport = async () => {
    if (!cardData || !svgFront || !svgBack) {
      setError('Card data not ready. Please wait...');
      return;
    }

    setExporting(true);
    setError(null);
    
    try {
      await ExportUtils.export(exportFormat, svgFront, svgBack, cardData, settings.cardsPerPage);
    } catch (err) {
      setError((err as Error).message);
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export Card
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        All export operations happen in your browser. No data is sent to any server.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Export Format</InputLabel>
          <Select
            value={exportFormat}
            label="Export Format"
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            disabled={exporting}
          >
            <MenuItem value="pdf">PDF (Recommended - Includes Documentation)</MenuItem>
            <MenuItem value="png">PNG Image</MenuItem>
            <MenuItem value="jpg">JPG Image</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleExport}
          disabled={exporting || !cardData}
          startIcon={exporting ? <CircularProgress size={20} /> : (exportFormat === 'pdf' ? <PdfIcon /> : <ImageIcon />)}
        >
          {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {exportFormat === 'pdf' 
            ? `PDF export includes ${settings.cardsPerPage} card${settings.cardsPerPage > 1 ? 's' : ''} per page with text on left, keyboard on right, fold lines, and a documentation page for card recovery.`
            : 'Image export includes both front and back cards stacked vertically.'}
        </Typography>
      </Stack>
    </Paper>
  );
}
