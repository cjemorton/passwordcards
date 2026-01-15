# PWA Icon Requirements

The PWA is currently functional using the existing `favicon.png` file. However, for optimal PWA experience, you should provide larger icon files:

## Recommended Icons (Optional but Recommended)

1. **icon-192.png** (192x192 pixels)
   - Purpose: Standard PWA icon
   - Location: `/resources/icon-192.png`

2. **icon-512.png** (512x512 pixels)
   - Purpose: High-resolution PWA icon
   - Location: `/resources/icon-512.png`

## Current Status

✅ **PWA is functional** - The app currently uses `favicon.png` (48x48) and works as a PWA
⚠️ **Icons recommended** - Adding larger icons will improve the installation experience

## Adding Icons (When Ready)

Once you have created the larger icons, add them to the manifest.json:

```json
"icons": [
  {
    "src": "/resources/favicon.png",
    "sizes": "48x48",
    "type": "image/png"
  },
  {
    "src": "/resources/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/resources/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

These icons should be PNG format and can be created from the existing `favicon.png` by:
- Upscaling to the required sizes
- Ensuring they have a transparent background or appropriate solid color
- Using design tools like GIMP, Photoshop, or online icon generators

## Creating Icons

You can use one of these methods:

1. **ImageMagick** (command line):
   ```bash
   convert resources/favicon.png -resize 192x192 resources/icon-192.png
   convert resources/favicon.png -resize 512x512 resources/icon-512.png
   ```

2. **Online Tools**:
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator

3. **Design the icons from scratch** with the Password Card branding
