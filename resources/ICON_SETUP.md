# PWA Icon Requirements

To complete the PWA setup, you need to provide the following icon files:

1. **icon-192.png** (192x192 pixels)
   - Purpose: Standard PWA icon
   - Location: `/resources/icon-192.png`

2. **icon-512.png** (512x512 pixels)
   - Purpose: High-resolution PWA icon
   - Location: `/resources/icon-512.png`

These icons should be PNG format and can be created from the existing `favicon.png` by:
- Upscaling to the required sizes
- Ensuring they have a transparent background or appropriate solid color
- Using design tools like GIMP, Photoshop, or online icon generators

The current `favicon.png` is already referenced in the manifest for the 48x48 size.

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
