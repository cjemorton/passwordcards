# Legacy Code Directory

This directory contains the original PHP-based implementation of the Password Card Generator.

## Contents

- **php/**: PHP source code for server-side card generation
  - `CardCreator.php` - Core card generation logic
  - `Configuration.php` - Configuration and settings management
  - `PDFRenderer.php` - PDF generation using TCPDF
  - `RequestUtils.php` - HTTP request handling and validation

- **frontend/**: Original jQuery-based frontend
  - `index.html` - Main HTML interface
  - `js/` - JavaScript files
  - `css/` - Stylesheets

- **templates/**: SVG templates for card rendering
  - `simple_front.svg` - Card front template
  - `simple_back.svg` - Card back template

## Purpose

This legacy code is preserved for:

1. **Reference**: Developers can compare the old and new implementations
2. **Verification**: The new client-side logic should produce identical results to the PHP version
3. **Testing**: Can be used to verify deterministic card generation parity
4. **Backwards Compatibility**: Allows running the original version if needed

## Accessing Legacy Version

### Development Mode

In development mode, you can access the legacy version by adding `?legacy=true` to the URL:

```
http://localhost:3000/?legacy=true
```

This will redirect to the PHP-based version at `/resources/index.html`.

### Production

The modern React UI is the default. The legacy PHP backend can still be accessed directly at:

```
/resources/index.html
```

## Migration Notes

The modern client-side implementation maintains algorithmic parity with the PHP backend:

- **Seeded Random Number Generation**: Uses Mersenne Twister algorithm (matching PHP's `mt_rand`)
- **Hash Functions**: Uses Web Crypto API for SHA algorithms
- **Pattern Expansion**: Identical character set expansion logic
- **Configuration**: Same default values and validation rules

## Removal Plan

Once the modern implementation is stable and verified, this legacy code can be safely removed:

1. Verify all features are working in the modern UI
2. Run determinism tests to confirm identical output
3. Ensure all users have migrated
4. Remove the `/legacy` directory
5. Clean up any legacy-related configuration

## Important Notes

- The legacy code requires a PHP server to function
- The modern code runs entirely in the browser (no server needed)
- **Privacy Advantage**: The modern version doesn't send any data to servers
- **Security**: Client-side generation eliminates server-side attack vectors

## Questions?

For questions about the legacy code or migration process, see the main README or open an issue on GitHub.
