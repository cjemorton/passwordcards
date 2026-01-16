import {
  Paper,
  Typography,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Box,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { AppSettings, exportSettings, importSettings } from '../utils/settings';

interface Props {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => void;
  onReset: () => void;
  onAboutOpen: () => void;
}

export default function CardSettingsPanel({ settings, onUpdate, onReset, onAboutOpen }: Props) {
  const [seedInput, setSeedInput] = useState(settings.seed);

  const handleCopySeed = () => {
    if (seedInput) {
      navigator.clipboard.writeText(seedInput);
      // TODO: Show snackbar notification
    }
  };

  const handleCopyAnnotation = () => {
    if (settings.annotation) {
      navigator.clipboard.writeText(settings.annotation);
    }
  };

  const handleExportSettings = () => {
    exportSettings(settings);
  };

  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imported = await importSettings(file);
        onUpdate(imported);
        // TODO: Show success notification
      } catch (error) {
        alert('Failed to import settings: ' + (error as Error).message);
      }
    }
  };

  return (
    <Stack spacing={2}>
      {/* Header */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Card Settings</Typography>
          <Box>
            <Tooltip title="About & Help">
              <IconButton size="small" onClick={onAboutOpen}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset to Defaults">
              <IconButton size="small" onClick={onReset} color="warning">
                <ResetIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>

      {/* Import/Export Settings */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" gutterBottom>
            Settings Management
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<ExportIcon />}
              onClick={handleExportSettings}
              fullWidth
            >
              Export
            </Button>
            <Button
              size="small"
              startIcon={<ImportIcon />}
              component="label"
              fullWidth
            >
              Import
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportSettings}
              />
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Character Types */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Character Types</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withNumbers}
                  onChange={(e) => onUpdate({ withNumbers: e.target.checked })}
                />
              }
              label="Numbers (0-9)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withLower}
                  onChange={(e) => onUpdate({ withLower: e.target.checked })}
                />
              }
              label="Lowercase (a-z)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withUpper}
                  onChange={(e) => onUpdate({ withUpper: e.target.checked })}
                />
              }
              label="Uppercase (A-Z)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withSymbols}
                  onChange={(e) => onUpdate({ withSymbols: e.target.checked })}
                />
              }
              label="Symbols (!@#$...)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withSpace}
                  onChange={(e) => onUpdate({ withSpace: e.target.checked })}
                />
              }
              label="Space"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.withOther}
                  onChange={(e) => onUpdate({ withOther: e.target.checked })}
                />
              }
              label="Custom Characters"
            />
            {settings.withOther && (
              <TextField
                size="small"
                placeholder="Enter custom characters"
                value={settings.otherChars}
                onChange={(e) => onUpdate({ otherChars: e.target.value })}
                sx={{ mt: 1 }}
              />
            )}
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      {/* Basic Settings */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Basic Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Keyboard Layout</InputLabel>
              <Select
                value={settings.keyboardLayout}
                label="Keyboard Layout"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'qwerty' || value === 'qwertz') {
                    onUpdate({ keyboardLayout: value });
                  }
                }}
              >
                <MenuItem value="qwerty">QWERTY</MenuItem>
                <MenuItem value="qwertz">QWERTZ</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Card Annotation"
              placeholder="For Work, Personal, etc."
              value={settings.annotation}
              onChange={(e) => onUpdate({ annotation: e.target.value })}
              multiline
              minRows={1}
              maxRows={4}
              InputProps={{
                endAdornment: settings.annotation && (
                  <Tooltip title="Copy annotation">
                    <IconButton size="small" onClick={handleCopyAnnotation}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Annotation Font Size</InputLabel>
              <Select
                value={settings.annotationFontSize}
                label="Annotation Font Size"
                onChange={(e) => onUpdate({ annotationFontSize: Number(e.target.value) })}
              >
                <MenuItem value={12}>Small (12px)</MenuItem>
                <MenuItem value={16}>Medium (16px)</MenuItem>
                <MenuItem value={20}>Large (20px)</MenuItem>
                <MenuItem value={24}>Extra Large (24px)</MenuItem>
                <MenuItem value={28}>Huge (28px)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Watermark URL"
              value={settings.watermarkUrl}
              onChange={(e) => onUpdate({ watermarkUrl: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Spacebar Size"
              value={settings.spaceBarSize}
              onChange={(e) => onUpdate({ spaceBarSize: parseInt(e.target.value) || 8 })}
              inputProps={{ min: 1, max: 16 }}
            />

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Cards Per Page (PDF)"
              value={settings.cardsPerPage}
              onChange={(e) => onUpdate({ cardsPerPage: parseInt(e.target.value) || 3 })}
              inputProps={{ min: 1, max: 10 }}
              helperText="Number of cards to print on each PDF page (1-10)"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Advanced Settings */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Advanced Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              label="Seed (Optional)"
              placeholder="Leave empty for random"
              value={seedInput}
              onChange={(e) => {
                setSeedInput(e.target.value);
                onUpdate({ seed: e.target.value });
              }}
              helperText="Use a seed to generate the same card every time"
              InputProps={{
                endAdornment: seedInput && (
                  <Tooltip title="Copy seed">
                    <IconButton size="small" onClick={handleCopySeed}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ),
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Hash Algorithm</InputLabel>
              <Select
                value={settings.hashAlgorithm}
                label="Hash Algorithm"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'sha256' || value === 'sha1' || value === 'sha512' || value === 'md5') {
                    onUpdate({ hashAlgorithm: value });
                  }
                }}
              >
                <MenuItem value="sha256">SHA-256 (Recommended)</MenuItem>
                <MenuItem value="sha1">SHA-1</MenuItem>
                <MenuItem value="sha512">SHA-512</MenuItem>
                <MenuItem value="md5">MD5</MenuItem>
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.printStringSeed}
                    onChange={(e) => onUpdate({ printStringSeed: e.target.checked })}
                  />
                }
                label="Print string seed on card"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.printNumberSeed}
                    onChange={(e) => onUpdate({ printNumberSeed: e.target.checked })}
                  />
                }
                label="Print number seed on card"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showSeedOnCard}
                    onChange={(e) => onUpdate({ showSeedOnCard: e.target.checked })}
                  />
                }
                label="Show seed on card (visible display)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.qrCodeEnabled}
                    onChange={(e) => onUpdate({ qrCodeEnabled: e.target.checked })}
                  />
                }
                label="Include QR code"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showMetadata}
                    onChange={(e) => onUpdate({ showMetadata: e.target.checked })}
                  />
                }
                label={
                  <Box>
                    Show metadata string
                    <Tooltip title="Display the //seed/pattern/hash// metadata on the card">
                      <Typography variant="caption" sx={{ ml: 0.5, cursor: 'help' }}>ⓘ</Typography>
                    </Tooltip>
                  </Box>
                }
              />
            </FormGroup>

            <FormControl fullWidth size="small" disabled={!settings.showMetadata}>
              <InputLabel>Metadata Position</InputLabel>
              <Select
                value={settings.metadataPosition}
                label="Metadata Position"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'bottom' || value === 'spine') {
                    onUpdate({ metadataPosition: value });
                  }
                }}
              >
                <MenuItem value="bottom">Bottom of Card (Current)</MenuItem>
                <MenuItem value="spine">Spine/Fold Line (Center)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Primary Color"
              type="color"
              value={settings.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
            />

            <TextField
              fullWidth
              size="small"
              label="Secondary Color"
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
