# passwordcards

[![Latest Version](https://img.shields.io/github/release/cjemorton/passwordcards.svg?style=flat-square)](https://github.com/cjemorton/passwordcards/releases)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

**🌐 Project Website:** [https://passwordcards.mrnet.work](https://passwordcards.mrnet.work)

This tool allows you to generate customized password cards with complete privacy - all processing happens in your browser.

## Overview

Password Card Generator is a privacy-first tool for creating deterministic password cards. The repository contains two implementations:

- **Modern React App** (recommended): 100% client-side with React 19 + Material-UI v7
- **Legacy PHP App**: Original server-side implementation

Both versions generate secure, reproducible password cards that can be regenerated using a seed value, providing a physical password management solution without storing passwords digitally.

## Version 2.0.0 - Modern UI Release 🚀

This major release introduces a completely rewritten client-side application with a modern React + Material-UI interface.

### Key Features

- **🔒 100% Client-Side**: All card generation, encryption, and export happens in your browser - no server required
- **🎯 Deterministic Generation**: Same seed + settings = identical card, enabling reproducible password cards
- **🎨 Modern Material-UI**: Beautiful, responsive interface with dark mode as default
- **👁️ Live Preview**: See your password card update in real-time as you change settings
- **📦 Multiple Export Formats**: Export as PDF, PNG, or JPG
- **📱 QR Code Support**: Generate QR codes with your card settings for easy restoration
- **💾 Settings Management**: Import/export settings, persistent preferences via localStorage
- **♿ Accessibility**: Enhanced keyboard navigation, ARIA labels, and screen reader support
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔐 Privacy-First**: No tracking, no cookies, no data ever leaves your browser

## Repository Structure

This repository contains two independent implementations for password card generation:

```
passwordcards/
├── modern/          # Modern React + Material-UI app (recommended)
├── legacy/          # Original PHP-based app
├── docker/          # Docker configurations for both apps
├── docker-compose.yml
└── README.md
```

### Modern Version (Recommended)

Located in `/modern` - A React-based client-side application with enhanced privacy and features.

- **Technology**: React 19, TypeScript, Material-UI v7, Vite
- **Architecture**: 100% client-side - no server communication
- **Privacy**: All operations happen in your browser
- **Access**: http://localhost:3000 (via Docker Compose)

See [modern/README.md](modern/README.md) for detailed information.

### Legacy Version

Located in `/legacy` - The original PHP-based server-side application.

- **Technology**: PHP 8.2, Apache, TCPDF
- **Architecture**: Server-side PDF generation
- **Access**: http://localhost:3001 (via Docker Compose)

See [legacy/README.md](legacy/README.md) for detailed information.

## Getting Started with Docker Compose

The easiest way to run both applications is using Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Quick Start

Build and run both applications:

```bash
docker-compose up -d --build
```

This will start:
- **Modern app** at http://localhost:3000
- **Legacy app** at http://localhost:3001

### Stop Applications

```bash
docker-compose down
```

### Environment Configuration

You can configure the legacy app using environment variables. Copy the example:

```bash
cp .env.example .env
```

Available environment variables:

- **`HTACCESS_MODE`** (default: `dev`): `dev` for development, `prod` for production
- **`BYPASS_PASSWORD`**: Password to bypass rate limiting
- **`CARD_GENERATION_LIMIT`** (default: `5`): Cards before rate limiting
- **`CARD_GENERATION_TIMEOUT`** (default: `300`): Timeout in seconds

### Development Mode

For local development without Docker:

#### Modern App

```bash
cd modern
npm install
npm run dev
```

#### Legacy App

Requires PHP 8.2+ and Composer:

```bash
cd legacy
composer install
php -S localhost:8080
```

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

### Modern App
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Material-UI (MUI) v7** - Component library
- **Vite** - Build tool and dev server
- **jsPDF** - Client-side PDF generation
- **html2canvas** - Canvas-based image export
- **qrcode** - QR code generation

### Legacy App
- **PHP 8.2** - Server-side logic
- **TCPDF** - PDF generation
- **jQuery** - DOM manipulation
- **RainTPL** - Template engine

## Security & Privacy

**Modern App:**
- 100% client-side processing - no data ever sent to servers
- No tracking, analytics, or cookies
- Deterministic generation ensures reproducibility with seed values
- Open-source code available for audit

**Legacy App:**
- Server-side generation - no seeds or data are stored
- Rate limiting to prevent abuse
- Open-source for transparency

For security audits, see the [GitHub repository](https://github.com/cjemorton/passwordcards) to review algorithms and implementation.

## Contributing

Please see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email mister.norbert ät gmail.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
