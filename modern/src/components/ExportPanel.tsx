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
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { AppSettings } from '../utils/settings';

interface Props {
  settings: AppSettings;
}

export default function ExportPanel({ settings }: Props) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // TODO: Implement actual export logic with jsPDF and html2canvas
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Export as ${exportFormat.toUpperCase()} will be implemented soon`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error as Error).message);
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

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel>Export Format</InputLabel>
          <Select
            value={exportFormat}
            label="Export Format"
            onChange={(e) => setExportFormat(e.target.value as any)}
          >
            <MenuItem value="pdf">PDF (Recommended)</MenuItem>
            <MenuItem value="png">PNG Image</MenuItem>
            <MenuItem value="jpg">JPG Image</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Card Size</InputLabel>
          <Select
            value={settings.cardSize}
            label="Card Size"
            disabled
          >
            <MenuItem value="standard">Standard (Credit Card Size)</MenuItem>
            <MenuItem value="credit">Credit Card</MenuItem>
            <MenuItem value="custom">Custom Size</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleExport}
          disabled={exporting}
          startIcon={exportFormat === 'pdf' ? <PdfIcon /> : <ImageIcon />}
        >
          {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Note: PDF export maintains the highest quality and includes all card details.
        </Typography>
      </Stack>
    </Paper>
  );
}
