# passwordcards

[![Latest Version](https://img.shields.io/github/release/cjemorton/passwordcards.svg?style=flat-square)](https://github.com/cjemorton/passwordcards/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

This tool allows you to generate customized password cards with complete privacy - all processing happens in your browser.

## Version 2.0.0 - Modern UI Release 🚀

This major release introduces a completely rewritten client-side application with a modern React + Material-UI interface.

### Key Features

- **🔒 100% Client-Side**: All card generation, encryption, and export happens in your browser - no server required
- **🎨 Modern Material-UI**: Beautiful, responsive interface with dark mode as default
- **👁️ Live Preview**: See your password card update in real-time as you change settings
- **📦 Multiple Export Formats**: Export as PDF, PNG, or JPG
- **📱 QR Code Support**: Generate QR codes with your card settings for easy restoration
- **💾 Settings Management**: Import/export settings, persistent preferences via localStorage
- **♿ Accessibility**: Enhanced keyboard navigation, ARIA labels, and screen reader support
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Modern vs Legacy

This repository now contains two versions:

1. **Modern Version** (default): React-based client-side application
2. **Legacy Version**: Original PHP-based server-side application (in `/legacy` directory)

The modern version is recommended for all users due to enhanced privacy (no server communication) and better features.

## Getting Started

### Modern UI (Recommended)

#### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

#### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready to be served by any static file server.

### Legacy Version

To access the legacy PHP-based version during development:

```
http://localhost:3000/?legacy=true
```

Or directly access `/resources/index.html` (requires PHP server).

See [legacy/README.md](legacy/README.md) for more details about the legacy implementation.

## Project Status and History

This project is a **modernized fork** that has diverged significantly from the [original passwordcards project](https://github.com/raphiz/passwordcards) (now archived). While inspired by the original work and the concept pioneered by [Qwertycards.com](https://www.qwertycards.com), this version has evolved into an **independent project** with its own development direction and feature set.

### What's New in Version 2.0

- **Complete rewrite with React and TypeScript**: Modern component architecture
- **Client-side only**: No PHP backend required - everything runs in the browser
- **Material-UI framework**: Professional, accessible UI components
- **Enhanced privacy**: No data ever leaves your browser
- **Live preview**: See your card before exporting
- **Multiple export formats**: PDF, PNG, and JPG support
- **QR code with settings**: Scan to restore your card configuration
- **Settings persistence**: Your preferences are saved locally
- **Dark mode**: Eye-friendly default theme
- **Improved accessibility**: WCAG compliant with keyboard navigation

### Credits and Acknowledgments

- **Original Project**: [raphiz/passwordcards](https://github.com/raphiz/passwordcards) - The foundation upon which this fork was built
- **Inspiration**: [Qwertycards.com](https://www.qwertycards.com) - The commercial service that pioneered the password card concept
- **Current Maintainer**: This fork is maintained independently with its own roadmap and goals

This project maintains the MIT license from the original work while pursuing its own vision for password card generation.

## Technology Stack

### Modern UI
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Material-UI (MUI) v7** - Component library
- **Vite** - Build tool and dev server
- **jsPDF** - Client-side PDF generation
- **html2canvas** - Canvas-based image export
- **qrcode** - QR code generation

### Legacy (for reference)
- **PHP 7+** - Server-side logic
- **TCPDF** - PDF generation
- **jQuery** - DOM manipulation
- **RainTPL** - Template engine

## Docker Deployment

This application can be deployed using Docker and docker-compose. 

### Environment Configuration

The application supports several environment variables for configuration. You can set these in a `.env` file or directly in `docker-compose.yml`.

#### Creating a .env File

Copy the example configuration:

```bash
cp .env.example .env
```

Then edit `.env` to customize the values:

```bash
# Apache .htaccess mode: 'dev' for development, 'prod' for production
HTACCESS_MODE=dev

# Bypass password for rate limiting
BYPASS_PASSWORD=letmein

# Card generation limit (number of cards before timeout)
CARD_GENERATION_LIMIT=5

# Card generation timeout (in seconds)
CARD_GENERATION_TIMEOUT=300
```

#### Environment Variables

- **`HTACCESS_MODE`** (default: `dev`): Controls Apache .htaccess configuration
  - `dev`: Relaxed rules for local development (no HTTPS, no path restrictions)
  - `prod`: Strict security rules for production (HTTPS enforced, HSTS enabled, path restrictions)

- **`BYPASS_PASSWORD`** (default: `letmein`): Password to bypass rate limiting
  - When users hit the rate limit, they can enter this password to continue generating cards immediately

- **`CARD_GENERATION_LIMIT`** (default: `5`): Number of cards that can be generated before rate limiting kicks in

- **`CARD_GENERATION_TIMEOUT`** (default: `300`): Time in seconds users must wait after hitting the rate limit (300 = 5 minutes)

### Rate Limiting & Bypass

The application includes rate limiting to prevent spam:
- Users can generate up to `CARD_GENERATION_LIMIT` cards (default: 5)
- After reaching the limit, they must wait `CARD_GENERATION_TIMEOUT` seconds (default: 5 minutes)
- Users can bypass the wait by entering the `BYPASS_PASSWORD` when prompted

### Usage

#### Local Development

For local development, use the default `dev` mode:

```bash
docker-compose up -d
```

Or explicitly set it in `docker-compose.yml`:

```yaml
services:
  web:
    environment:
      - HTACCESS_MODE=dev
```

Access the application at: http://localhost:8080

#### Production Deployment

For production, set `HTACCESS_MODE=prod`:

```yaml
services:
  web:
    environment:
      - HTACCESS_MODE=prod
```

Or via command line:

```bash
HTACCESS_MODE=prod docker-compose up -d
```

Alternatively, you can create a `.env` file:

```bash
echo "HTACCESS_MODE=prod" > .env
docker-compose up -d
```

**Important**: When using production mode, ensure:
- Your domain has a valid SSL certificate configured
- Your reverse proxy or load balancer handles HTTPS termination, OR
- Apache is configured with SSL certificates

### Recommendations

- **Always use `prod` mode for internet-facing deployments** to ensure proper security
- **Use `dev` mode only for local development** where HTTPS is not configured
- **Change the default `BYPASS_PASSWORD`** in production to a secure value
- The mode can be changed at any time by updating the environment variable and restarting the container

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email mister.norbert ät gmail.com instead of using the issue tracker.


## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
