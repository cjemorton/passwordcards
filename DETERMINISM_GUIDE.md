# Password Card Generator - Enhanced Features

## Overview
This document describes the new features and improvements made to the password card generator, including deterministic card generation, improved UI/UX, and technical enhancements.

## 1. QR Code Placement

### Change
QR codes are now rendered only on the **left panel** (front card) of the foldable PDF.

### Rationale
- Reduces visual clutter on the back panel
- The QR code on the left panel is sufficient for accessing the watermark URL
- Creates a cleaner design with better use of space

### Technical Implementation
- Modified `PDFRenderer.php` to place QR code at coordinates (82, 17) with size 12x12mm only on the front card
- Removed duplicate QR code from back panel (previously at coordinates 167, 17)

## 2. Dynamic Watermark Text Sizing

### Feature
Watermark URLs now dynamically scale to fit within the designated field, preventing text clipping regardless of URL length.

### How It Works
The system calculates an appropriate font size based on the watermark URL length:

| URL Length | Font Size (px) |
|-----------|----------------|
| ≤ 30 chars | 10 |
| 31-50 chars | 9 |
| 51-70 chars | 8 |
| 71-100 chars | 7 |
| 101-130 chars | 6 |
| 131-160 chars | 5 |
| 161-200 chars | 4 |

### Technical Implementation
- Added `calculateWatermarkFontSize()` method in `CardCreator.php`
- Modified `simple_back.svg` template to use `$WATERMARK_FONT_SIZE$` variable
- Font size is computed during card rendering based on actual URL length

### Testing
Test with various URL lengths to ensure proper scaling:
```
Short: https://test.com/
Medium: https://passwordcards.example.com/generator
Long: https://verylongdomainname.example.com/path/to/generator/with/many/parameters
```

## 3. Deterministic Card Generation

### Overview
The system now fully supports **deterministic, reproducible card generation**. When a seed value is provided, the exact same card can be regenerated at any time using the same parameters.

### Key Concepts

#### Seeded Mode (Deterministic)
- User provides a numeric seed value
- Same seed + same parameters = identical card every time
- Enables card recovery if physical card is lost
- All randomness is controlled by the seed

#### Unseeded Mode (Random)
- No seed provided by user
- System generates random seed based on microtime
- Produces unique, non-reproducible cards
- Suitable for one-time use cases

### Parameters Required for Reproduction

To regenerate an identical card, you need ALL of these parameters:

1. **Seed** - The numeric seed value
2. **Pattern** - Character pattern (e.g., "a-zA-Z0-9*-*")
3. **Keyboard Layout** - QWERTY or QWERTZ
4. **Spacebar Size** - Number of characters (1-8)
5. **Card Text** - Custom text on back of card
6. **Primary Color** - Hex color code (e.g., #1ABC9C)
7. **Secondary Color** - Hex color code (e.g., #ffffff)
8. **Watermark URL** - URL displayed on card

### Technical Implementation

#### Seeding Mechanism
```php
// In CardCreator.php
$seed = $this->configration->seed;
mt_srand($seed);  // Seeds the Mersenne Twister RNG

// All subsequent mt_rand() calls use this seed
$equivalent = $chars[mt_rand(0, $char_count-1)];
```

#### Seed Generation (when not provided)
```php
// In Configuration.php
if ($seed === null || !is_numeric($seed)) {
    list($usec, $sec) = explode(' ', microtime());
    $seed = (int) ((float) $sec + ((float) $usec * 100000));
}
```

### Usage Instructions

#### For End Users

**Creating a Reproducible Card:**
1. Enter a numeric seed value in the "Seed" field (e.g., 123456789)
2. Configure all other settings as desired
3. Generate the PDF
4. **Important:** Save the seed and all settings from the PDF documentation page

**Recovering a Lost Card:**
1. Access the generator URL (from QR code or documentation)
2. Enter your saved seed value
3. Configure all settings exactly as shown in your documentation page
4. Generate the PDF - your card will be identical to the original

**Creating a Random Card:**
- Leave the seed field empty
- System will generate a random seed
- Card cannot be reproduced (unless you save the auto-generated seed from the PDF)

### PDF Documentation Page

Each generated PDF includes a comprehensive documentation page with:

1. **Deterministic Generation Explanation** - How the feature works
2. **Card Generation Settings** - All parameters used (including seed)
3. **Loss Recovery Process** - Step-by-step instructions to regenerate the card
4. **Watermark URL** - Generator access information
5. **Usage Instructions** - How to use the password card

## 4. Code Documentation

### Inline Comments
All randomness-related code now includes detailed comments explaining:
- How seeding works
- Why determinism is important
- What mt_rand() does with the seed

### Key Documented Areas
- `CardCreator::render()` - Seeding and random character generation
- `Configuration::evalSeed()` - Seed evaluation and generation
- `PDFRenderer::addDocumentationPage()` - Recovery instructions

## 5. UI/UX Modernization

### Visual Improvements

#### Header Section
- Modern gradient background (purple to violet)
- Improved typography and spacing
- Rounded corners and subtle shadows
- Better contrast for readability

#### Information Box
- Prominent blue info box explaining deterministic generation
- Key points highlighted with bullet list
- Helpful tip with emoji for visual appeal
- Clear explanation of seeded vs unseeded modes

#### Form Sections
- Grouped related fields in styled containers
- Light gray backgrounds for form sections
- Improved spacing and padding
- Better visual hierarchy

#### Buttons
- Gradient submit button with hover effects
- Selected state for character type buttons with shadow
- Smooth transitions and animations
- Better accessibility and touch targets

#### Advanced Options
- Clearer labeling for seed field
- Better placeholder text with instructions
- Improved toggle animation

#### Footer
- Separated footer links section
- Better styling for external links
- Consistent color scheme

### Responsive Design
- Mobile-friendly layout with media queries
- Flexible form sections that stack on small screens
- Proper touch targets for mobile users
- Readable text at all screen sizes

### Accessibility
- Improved color contrast ratios
- Clear focus states for interactive elements
- Semantic HTML structure
- Descriptive labels and placeholders

### CSS Improvements
- Modern flexbox-based layouts
- Smooth transitions and hover effects
- Consistent spacing using design system principles
- Better organization with logical grouping

## Testing

### Determinism Test
Run the included test to verify deterministic behavior:

```bash
cd /home/runner/work/passwordcards/passwordcards
php tests/manual_determinism_test.php
```

Expected output:
```
Test 1: Same seed produces same output
✓ PASS: Same seed produces identical output

Test 2: Different seed produces different output
✓ PASS: Different seed produces different output

Test 3: Watermark font size calculation
✓ PASS: Short URL uses larger font size
✓ PASS: Long URL uses smaller font size

All tests passed! ✓
```

### Manual Testing Checklist

1. **QR Code Placement**
   - [ ] Generate a PDF
   - [ ] Verify QR code appears only on left panel
   - [ ] Scan QR code to verify it contains watermark URL

2. **Watermark Sizing**
   - [ ] Test with short URL (< 30 chars)
   - [ ] Test with medium URL (50-70 chars)
   - [ ] Test with long URL (> 100 chars)
   - [ ] Verify text is not clipped in any case

3. **Deterministic Generation**
   - [ ] Generate card with seed 12345
   - [ ] Generate another card with seed 12345 and same settings
   - [ ] Verify both PDFs are identical
   - [ ] Generate card with seed 54321 and same settings
   - [ ] Verify this PDF is different

4. **UI/UX**
   - [ ] Check header gradient displays correctly
   - [ ] Verify info box is prominent and readable
   - [ ] Test form sections on desktop and mobile
   - [ ] Verify all buttons have proper hover effects
   - [ ] Test advanced options toggle

5. **Documentation**
   - [ ] Generate a PDF
   - [ ] Check documentation page includes all settings
   - [ ] Verify loss recovery instructions are clear
   - [ ] Confirm all parameters are listed

## Security Considerations

### Seed Security
- Seeds should be treated as sensitive information
- Same seed always produces same card, so seed is essentially a key
- Users should store seeds securely (password manager, encrypted storage)
- Documentation page should be stored separately from physical card

### Random Number Generation
- Uses PHP's Mersenne Twister (`mt_rand`) for deterministic RNG
- When seeded, provides cryptographically adequate randomness for this use case
- For unseeded cards, uses microtime-based seed for unpredictability

## Migration Notes

### Breaking Changes
None. All changes are backward compatible.

### Database/Storage
No database changes required. All parameters are stored in the generated PDF.

### API Changes
No API changes. All existing functionality remains intact.

## Future Enhancements

Potential areas for future improvement:

1. **QR Code Options** - Allow users to choose QR code placement (left only, right only, both, none)
2. **Export Settings** - JSON export/import of card generation settings
3. **Seed Generation Helper** - Random seed generator with copy-to-clipboard
4. **Card Preview** - Live preview of card before PDF generation
5. **Multiple Card Generation** - Batch generate multiple cards with different seeds
6. **Blockchain/Hash Verification** - Store hash of card parameters for verification

## Support

For issues or questions:
- GitHub Issues: https://github.com/raphiz/passwordcards/issues
- Original Author: Raphael Zimmermann
- License: MIT

## Changelog

### Version: Current (PR)
- Added QR code placement optimization (left panel only)
- Implemented dynamic watermark text sizing
- Enhanced deterministic generation documentation
- Added comprehensive PDF documentation page
- Modernized UI with gradient design and info boxes
- Improved form layout and styling
- Added responsive design improvements
- Created determinism test suite
- Added inline code documentation
