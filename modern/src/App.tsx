import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  FindInPage as RecoverIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import { AppSettings, loadSettings, saveSettings } from './utils/settings';
import CardSettingsPanel from './components/CardSettingsPanel';
import LivePreview from './components/LivePreview';
import ExportPanel from './components/ExportPanel';
import AboutDialog from './components/AboutDialog';
import RecoverSeedPage from './components/RecoverSeedPage';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isDark = settings.theme === 'dark' || (settings.theme === 'custom' && prefersDarkMode);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Show tutorial on first visit
  useEffect(() => {
    if (!settings.hasSeenTutorial) {
      // TODO: Show tutorial
      setSettings(prev => ({ ...prev, hasSeenTutorial: true }));
    }
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: settings.primaryColor,
      },
      secondary: {
        main: settings.secondaryColor,
      },
    },
    typography: {
      fontSize: settings.fontSize,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'all 0.3s ease-in-out',
          },
        },
      },
    },
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Password Card Generator
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, mr: 2 }}>
              <Button
                color="inherit"
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
                variant={location.pathname === '/' ? 'outlined' : 'text'}
              >
                Generator
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/recover-seed"
                startIcon={<RecoverIcon />}
                variant={location.pathname === '/recover-seed' ? 'outlined' : 'text'}
              >
                Recover Seed
              </Button>
            </Box>
            <Typography variant="caption" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              v2.0.0 - Modern UI
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme} aria-label="toggle theme">
              {isDark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                {/* Left Panel - Settings */}
                <Box sx={{ flex: { md: '0 0 400px' }, display: { xs: 'none', md: 'block' } }}>
                  <CardSettingsPanel
                    settings={settings}
                    onUpdate={updateSettings}
                    onReset={resetSettings}
                    onAboutOpen={() => setAboutOpen(true)}
                  />
                </Box>

                {/* Mobile Drawer */}
                <Drawer
                  anchor="left"
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  sx={{ display: { md: 'none' } }}
                >
                  <Box sx={{ width: 320, p: 2 }}>
                    <CardSettingsPanel
                      settings={settings}
                      onUpdate={updateSettings}
                      onReset={resetSettings}
                      onAboutOpen={() => setAboutOpen(true)}
                    />
                  </Box>
                </Drawer>

                {/* Right Panel - Preview & Export */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <LivePreview settings={settings} />
                  <ExportPanel settings={settings} />
                </Box>
              </Box>
            </Container>
          } />
          <Route path="/recover-seed" element={<RecoverSeedPage />} />
        </Routes>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            🔒 All card generation happens in your browser - no data is sent to any server
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <a
              href="https://passwordcards.mrnet.work"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              passwordcards.mrnet.work
            </a>
            {' • '}
            Open source •{' '}
            <a
              href="https://github.com/cjemorton/passwordcards"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'inherit' }}
            >
              GitHub
            </a>
          </Typography>
        </Box>

        {/* About Dialog */}
        <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
