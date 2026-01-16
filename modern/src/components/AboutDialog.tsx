import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AboutDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        About Password Card Generator
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Version */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="h6">Version 2.0.0</Typography>
          <Chip label="Modern UI" color="primary" size="small" />
          <Chip label="Client-Side" color="success" size="small" />
        </Box>

        {/* Privacy & Security */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">🔒 Privacy & Security</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>100% Client-Side:</strong> All card generation, encryption, and export
              operations happen entirely in your browser. No data is ever sent to any server.
            </Typography>
            <Typography paragraph>
              <strong>No Tracking:</strong> We don't use analytics, cookies, or any tracking
              mechanisms. Your settings are stored only in your browser's local storage.
            </Typography>
            <Typography paragraph>
              <strong>Deterministic Generation:</strong> Using a seed ensures you can regenerate
              the exact same card anytime, anywhere, as long as you remember your seed and settings.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* How It Works */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">⚙️ How It Works</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              <strong>With a Seed:</strong> Enter a memorable word or number as your seed. The
              same seed with the same settings will always generate the identical card. Save your
              seed and settings to regenerate your card later.
            </Typography>
            <Typography paragraph>
              <strong>Without a Seed:</strong> The app generates a random, unique card that cannot
              be reproduced. Perfect for one-time use or when you don't need to regenerate the card.
            </Typography>
            <Typography paragraph>
              <strong>Hash Algorithms:</strong> String seeds are converted to numeric seeds using
              cryptographic hash functions (SHA-256, SHA-1, SHA-512, or MD5). The algorithm choice
              must be remembered for card regeneration.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Features */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">✨ Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography component="div">
              <ul>
                <li>Modern Material-UI interface with dark mode</li>
                <li>Live preview of your password card (matches legacy pixel-perfect layout)</li>
                <li>Export as PDF, PNG, or JPG with all settings preserved</li>
                <li>Two card output sizes: self-laminating (66mm × 100mm) or credit card (85.6mm × 53.98mm)</li>
                <li>Cut and fold guidelines with dimensions for physical card production</li>
                <li>QR code with encoded settings (scan to restore configuration)</li>
                <li>Customizable colors, keyboard layouts, and character sets</li>
                <li>Multi-line card annotations with adjustable font size</li>
                <li>Toggleable metadata display with spine/bottom placement options</li>
                <li>Settings import/export for backup</li>
                <li>Persistent preferences in browser storage</li>
                <li>Fully responsive design for mobile and desktop</li>
              </ul>
            </Typography>
            <Typography paragraph sx={{ mt: 2 }}>
              <strong>About Exports:</strong> The preview matches the legacy card layout pixel-perfect.
              When you export to PDF, PNG, or JPG, all your settings (including metadata visibility,
              position, annotation font size, and other preferences) are preserved in the output.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Changelog */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">📜 Changelog</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom>
              Version 2.1.0 (2026-01-16)
            </Typography>
            <Typography component="div" paragraph>
              <ul>
                <li>Added toggleable metadata string display (show/hide //seed/pattern/hash//)</li>
                <li>Added metadata spine placement option (display on fold line or bottom)</li>
                <li>Multi-line card annotation support with textarea input</li>
                <li>Adjustable annotation font size (5 size options from small to huge)</li>
                <li>Two card output sizes: self-laminating (66mm × 100mm) or credit card standard</li>
                <li>Cut and fold guidelines with dimension markers for card production</li>
                <li>Improved mobile responsiveness for card preview</li>
                <li>Moved export information to About dialog for cleaner UI</li>
              </ul>
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Version 2.0.0 (2026-01-15)
            </Typography>
            <Typography component="div" paragraph>
              <ul>
                <li>Complete UI rewrite with React and Material-UI</li>
                <li>All operations now happen client-side in the browser</li>
                <li>Added dark mode as default theme</li>
                <li>Live card preview</li>
                <li>QR code with settings encoding</li>
                <li>Export to PNG and JPG in addition to PDF</li>
                <li>Settings import/export</li>
                <li>Improved accessibility and responsive design</li>
              </ul>
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Version 1.0.0 (2015-03-16)
            </Typography>
            <Typography paragraph>
              Initial release with PHP backend and jQuery frontend
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Credits */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">👥 Credits & License</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              This project is inspired by the original{' '}
              <Link href="https://github.com/raphiz/passwordcards" target="_blank">
                passwordcards project
              </Link>{' '}
              and{' '}
              <Link href="https://www.qwertycards.com" target="_blank">
                Qwertycards.com
              </Link>
              .
            </Typography>
            <Typography paragraph>
              This modernized fork has diverged significantly with enhanced features, a new UI,
              and client-side architecture. It is maintained as an independent open-source project.
            </Typography>
            <Typography paragraph>
              <strong>License:</strong> MIT License
              <br />
              <strong>Repository:</strong>{' '}
              <Link href="https://github.com/cjemorton/passwordcards" target="_blank">
                github.com/cjemorton/passwordcards
              </Link>
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Open Source */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">💻 Open Source & Audit</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography paragraph>
              This application is fully open source. You can review the code, algorithms, and
              security implementations:
            </Typography>
            <Typography component="div">
              <ul>
                <li>
                  <Link
                    href="https://github.com/cjemorton/passwordcards/tree/master/modern/src/lib"
                    target="_blank"
                  >
                    Card Generation Algorithm
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/cjemorton/passwordcards/tree/master/modern/src/components"
                    target="_blank"
                  >
                    React Components
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/cjemorton/passwordcards"
                    target="_blank"
                  >
                    Full Repository
                  </Link>
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
