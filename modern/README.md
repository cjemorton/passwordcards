# Modern Password Cards - React + Material-UI

This is the modern, client-side only version of the Password Cards application.

## Features

- 🔒 **100% Client-Side**: All card generation, encryption, and export happens in your browser
- 🎨 **Modern Material-UI**: Beautiful, responsive interface with dark mode
- 👁️ **Live Preview**: See your password card update in real-time
- 📦 **Multiple Export Formats**: Export as PDF, PNG, or JPG
- 📱 **QR Code Support**: Generate QR codes with your card settings
- 💾 **Settings Management**: Import/export settings, persistent preferences
- ♿ **Accessibility**: Enhanced keyboard navigation and screen reader support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Development

### Prerequisites

- Node.js 20+ 
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Technology Stack

- React 19
- TypeScript
- Material-UI (MUI) v7
- Vite
- jsPDF (client-side PDF generation)
- html2canvas (canvas-based image export)
- qrcode (QR code generation)

## Docker

This app is configured to be built and served via Docker. See the root `docker-compose.yml` for details.

The modern app is served on port 3000 when using docker-compose.
