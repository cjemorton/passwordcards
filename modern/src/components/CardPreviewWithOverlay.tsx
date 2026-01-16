import { useEffect, useState, useRef } from 'react';
import { Box, TextField, Typography, CircularProgress } from '@mui/material';
import { Configuration } from '../lib/Configuration';
import { CardCreator, CardData } from '../lib/CardCreator';
import { SvgRenderer } from '../lib/SvgRenderer';

interface Props {
  keyboardLayout: 'qwerty' | 'qwertz';
  pattern: string;
  spaceBarSize: number;
  hashAlgorithm: 'sha256' | 'sha1' | 'sha512' | 'md5';
  keyValues: string[];
  spacebarValue: string;
  onKeyValuesChange: (values: string[]) => void;
  onSpacebarValueChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * CardPreviewWithOverlay - Displays a password card with interactive input overlays
 * 
 * This component renders a preview card and overlays editable text fields on each
 * key position, allowing users to directly transcribe their physical card by clicking
 * on each position rather than entering a comma-separated list.
 * 
 * Layout approach:
 * - Uses a reference card with seed=0 to show consistent key positions
 * - Overlays Material-UI TextField components at precise positions
 * - Supports keyboard navigation (Tab) between fields
 * - Mobile-responsive scaling
 * 
 * IMPORTANT: Coordinate calculations depend on the simple_front.svg template structure.
 * If the SVG template changes, the key position coordinates must be recalculated.
 */

// SVG viewBox dimensions from simple_front.svg
// These are used to convert absolute SVG coordinates to percentage positions
const SVG_VIEWBOX_WIDTH = 301.18109;
const SVG_VIEWBOX_HEIGHT = 194.88188;
const SVG_TRANSFORM_Y_OFFSET = 857.4803; // Y-axis transform offset in the SVG

export default function CardPreviewWithOverlay({
  keyboardLayout,
  pattern,
  spaceBarSize,
  hashAlgorithm,
  keyValues,
  spacebarValue,
  onKeyValuesChange,
  onSpacebarValueChange,
  disabled = false,
}: Props) {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [svgFront, setSvgFront] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate a reference card (seed=0) to display key positions
  useEffect(() => {
    generateReferenceCard();
  }, [keyboardLayout, pattern, spaceBarSize, hashAlgorithm]);

  async function generateReferenceCard() {
    setLoading(true);
    setError(null);

    try {
      const svgRenderer = new SvgRenderer();
      await svgRenderer.loadTemplates();

      // Use seed 0 as reference - this gives us consistent key positions
      const config = new Configuration({
        seed: 0,
        pattern,
        keys: keyboardLayout,
        spaceBarSize,
        hashAlgorithm,
        primaryColor: '#1ABC9C',
        secondaryColor: '#ffffff',
        text: '',
        watermarkUrl: 'https://passwordcards.mrnet.work/',
        showMetadata: false,
        showSeedOnCard: false,
      });

      const creator = new CardCreator(config);
      const data = creator.generateCard();
      const { front } = svgRenderer.renderBoth(data);

      setCardData(data);
      setSvgFront(front);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error generating reference card:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyChange = (index: number, value: string) => {
    const newValues = [...keyValues];
    newValues[index] = value;
    onKeyValuesChange(newValues);
  };

  /**
   * Key position coordinates in the SVG (centers of key rectangles)
   * 
   * These coordinates are calculated from the simple_front.svg template rect elements
   * by taking the center point of each key rectangle (x + width/2, y + height/2).
   * 
   * Calculation method:
   * - Row 1 keys: y = 872.80829 + (31.352016/2) = 888.48
   * - Row 2 keys: y = 917.09961 + (31.352016/2) = 932.78
   * - Row 3 keys: y = 961.39093 + (31.352016/2) = 977.07
   * - Key width: 22.493748, spacing between keys: ~28.35
   * - Spacebar: center at (150.59, 1021.36)
   * 
   * SVG coordinate system notes:
   * - Origin (0,0) is at top-left of SVG viewBox
   * - Coordinates are in SVG units (not pixels)
   * - The SVG has a transform of translate(0, -857.4803) applied to the main group
   * - These coordinates are in the transformed space
   * 
   * IMPORTANT: These coordinates are specific to simple_front.svg and must be
   * recalculated if the template changes. The keyboard layout (QWERTY vs QWERTZ)
   * affects which letters appear at these positions, but not the positions themselves.
   * 
   * Coordinates are in SVG units. The SVG viewBox is 301.18109 x 194.88188 units.
   */
  const getKeyPositions = () => {
    // Row 1: Q W E R T Y U I O P (indices 0-9) - y=888.48 (center of rects at y=872.80829)
    const row1Y = 888.48;
    const row1Keys = [
      { x: 23.03, y: row1Y },    // Q (index 0)
      { x: 51.38, y: row1Y },    // W (index 1)
      { x: 79.72, y: row1Y },    // E (index 2)
      { x: 108.07, y: row1Y },   // R (index 3)
      { x: 136.42, y: row1Y },   // T (index 4)
      { x: 164.76, y: row1Y },   // Y (index 5)
      { x: 193.11, y: row1Y },   // U (index 6)
      { x: 221.46, y: row1Y },   // I (index 7)
      { x: 249.80, y: row1Y },   // O (index 8)
      { x: 278.15, y: row1Y },   // P (index 9)
    ];

    // Row 2: A S D F G H J K L (indices 10-18) - y=932.78 (center of rects at y=917.09961)
    const row2Y = 932.78;
    const row2Keys = [
      { x: 37.20, y: row2Y },    // A (index 10)
      { x: 65.55, y: row2Y },    // S (index 11)
      { x: 93.90, y: row2Y },    // D (index 12)
      { x: 122.24, y: row2Y },   // F (index 13)
      { x: 150.59, y: row2Y },   // G (index 14)
      { x: 178.94, y: row2Y },   // H (index 15)
      { x: 207.28, y: row2Y },   // J (index 16)
      { x: 235.63, y: row2Y },   // K (index 17)
      { x: 263.98, y: row2Y },   // L (index 18)
    ];

    // Row 3: Z X C V B N M (indices 19-25) - y=977.07 (center of rects at y=961.39093)
    const row3Y = 977.07;
    const row3Keys = [
      { x: 65.55, y: row3Y },    // Z (index 19)
      { x: 93.90, y: row3Y },    // X (index 20)
      { x: 122.24, y: row3Y },   // C (index 21)
      { x: 150.59, y: row3Y },   // V (index 22)
      { x: 178.94, y: row3Y },   // B (index 23)
      { x: 207.28, y: row3Y },   // N (index 24)
      { x: 235.63, y: row3Y },   // M (index 25)
    ];

    return [...row1Keys, ...row2Keys, ...row3Keys];
  };

  // Spacebar position (center of spacebar rect)
  const spacebarPosition = { x: 150.59, y: 1021.36 };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', py: 2 }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  if (!cardData) {
    return null;
  }

  const keyPositions = getKeyPositions();

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="body2" color="text.secondary" paragraph>
        Click on each key position below and enter the character shown on your physical card.
        Use Tab to navigate between fields quickly.
      </Typography>
      
      {/* Card preview container with overlay inputs */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          border: 2,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          backgroundColor: 'background.paper',
          overflow: 'visible',
          // Make the container maintain aspect ratio
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Wrapper for SVG and overlays to ensure proper layering */}
        <Box sx={{ position: 'relative', width: '100%' }}>
          {/* SVG Card Background */}
          <Box
            sx={{
              width: '100%',
              '& svg': {
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
              },
            }}
            dangerouslySetInnerHTML={{ __html: svgFront }}
          />

          {/* Overlay Input Fields - positioned absolutely over the card */}
          <Box
            sx={{
              position: 'absolute',
              top: '16px', // Account for container padding
              left: '16px', // Account for container padding
              right: '16px',
              bottom: 0,
              pointerEvents: 'none', // Allow clicks to pass through container
            }}
          >
            {/* Key input fields */}
            {cardData.keys.map((keyLabel, index) => {
              const pos = keyPositions[index];
              // Convert SVG coordinates to percentage positions
              const leftPercent = ((pos.x / SVG_VIEWBOX_WIDTH) * 100);
              const topPercent = ((pos.y - SVG_TRANSFORM_Y_OFFSET) / SVG_VIEWBOX_HEIGHT * 100);

              return (
                <TextField
                  key={index}
                  value={keyValues[index] || ''}
                  onChange={(e) => handleKeyChange(index, e.target.value)}
                  disabled={disabled}
                  placeholder={keyLabel}
                  inputProps={{
                    maxLength: 1,
                    'aria-label': `Key ${keyLabel}`,
                    style: {
                      textAlign: 'center',
                      padding: '2px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    },
                  }}
                  sx={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'auto', // Enable clicks on inputs
                    width: '28px',
                    '& .MuiInputBase-root': {
                      height: '28px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid',
                      borderColor: keyValues[index] ? 'success.main' : 'primary.main',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.25)',
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  }}
                />
              );
            })}

            {/* Spacebar input field */}
            <TextField
              value={spacebarValue}
              onChange={(e) => onSpacebarValueChange(e.target.value)}
              disabled={disabled}
              placeholder="Spacebar code"
              inputProps={{
                maxLength: spaceBarSize,
                'aria-label': 'Spacebar code',
                style: {
                  textAlign: 'center',
                  padding: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                },
              }}
              sx={{
                position: 'absolute',
                left: `${(spacebarPosition.x / SVG_VIEWBOX_WIDTH) * 100}%`,
                top: `${((spacebarPosition.y - SVG_TRANSFORM_Y_OFFSET) / SVG_VIEWBOX_HEIGHT) * 100}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                width: '140px',
                '& .MuiInputBase-root': {
                  height: '28px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid',
                  borderColor: spacebarValue ? 'success.main' : 'primary.main',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.25)',
                  },
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Progress indicator */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Progress: {keyValues.filter(v => v).length} of {cardData.keys.length} keys
          {spacebarValue && ' + spacebar'}
        </Typography>
      </Box>
    </Box>
  );
}
