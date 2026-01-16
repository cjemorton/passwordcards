<?php

namespace raphiz\passwordcards;

class CardCreator
{
    private $configuration = null;

    public function __construct($configuration)
    {
        if ($configuration === null) {
            throw new \Exception('The given $configuration is null!');
        }

        if ($configuration instanceof Configuration === false) {
            throw new \Exception(
                'The given $configuration is not a valid ' .
                'Configuration object.'
            );
        }

        $this->configuration = $configuration;
    }

    public function getSvgFilePath($template_name)
    {
        return __DIR__ . "/../templates/$template_name.svg";
    }

    public function getSvgTemplate($template_name)
    {
        return file_get_contents($this->getSvgFilePath($template_name));
    }

    public function render($svg)
    {
        // Get and count available characters
        $chars = $this->configuration->getPatternCharacters();
        $char_count = count($chars);

        // Seed the random number generator for deterministic card generation.
        // When the same seed is used with identical configuration parameters,
        // the exact same card will be generated every time. This allows users
        // to regenerate lost cards using their seed value.
        $seed = $this->configuration->seed;
        mt_srand($seed);

        // Generate random characters for each key position using seeded RNG
        $number_of_keys = strlen($this->configuration->keys);
        for ($i = 0; $i < $number_of_keys; $i++) {
            // Use mt_rand() which respects the seed set by mt_srand()
            $equivalent = $chars[mt_rand(0, $char_count-1)];

            $equivalent = $this->escape($equivalent);

            // Replace the equivalent on the "keyboard"
            $svg = str_replace('$' . ($i+1) . '$', $equivalent, $svg);

            $svg = str_replace('$k' . ($i+1) . '$', $this->configuration->keys[$i], $svg);

        }

        // Generate random characters for spacebar using seeded RNG
        $space_lenght = $this->configuration->spaceBarSize;
        $space = '';
        for ($i = 0; $i < $space_lenght; $i++) {
            // Use mt_rand() which respects the seed set by mt_srand()
            $space .= $this->escape($chars[mt_rand(0, $char_count-1)]);
        }

        $svg = str_replace('$SPACE$', $space, $svg);

        $svg = str_replace('$SEED$', $seed, $svg);

        $svg = str_replace('$PRIMARY$', $this->configuration->primaryColor, $svg);

        $svg = str_replace('$SECONDARY$', $this->configuration->secondaryColor, $svg);

        // Handle metadata string
        $metadataString = '/' . $this->escape($seed) . '/' . $this->escape($this->configuration->pattern) . '/' . $this->escape(strtoupper($this->configuration->hashAlgorithm)) . '/';
        
        // Show metadata in the selected position, hide the others
        if ($this->configuration->showMetadata) {
            if ($this->configuration->metadataPosition === 'spine') {
                // Place metadata at the fold edges (1 unit from center fold on each side)
                // Left panel: metadata at right edge, 1 unit left of center fold (x≈149.59)
                // Right panel: metadata at left edge, 1 unit right of center fold (x≈151.59)
                // This ensures visibility when the card is folded, with metadata along the fold line
                $svg = str_replace('$METADATA_BOTTOM$', '', $svg);
                $svg = str_replace('$METADATA_SPINE_LEFT$', $metadataString, $svg);
                $svg = str_replace('$METADATA_SPINE_RIGHT$', $metadataString, $svg);
            } else {
                // bottom position (default)
                $svg = str_replace('$METADATA_BOTTOM$', $metadataString, $svg);
                $svg = str_replace('$METADATA_SPINE_LEFT$', '', $svg);
                $svg = str_replace('$METADATA_SPINE_RIGHT$', '', $svg);
            }
        } else {
            // Hide metadata entirely
            $svg = str_replace('$METADATA_BOTTOM$', '', $svg);
            $svg = str_replace('$METADATA_SPINE_LEFT$', '', $svg);
            $svg = str_replace('$METADATA_SPINE_RIGHT$', '', $svg);
        }


        // Handle multi-line text annotation
        $textLines = explode("\n", $this->configuration->text);
        $textMultiline = '';
        if (count($textLines) > 0 && trim($this->configuration->text) !== '') {
            $baseY = 947.46991;
            $lineHeight = $this->configuration->annotationFontSize * 1.25; // 125% line height
            $totalHeight = (count($textLines) - 1) * $lineHeight;
            $startY = $baseY - ($totalHeight / 2); // Center the text block vertically
            
            foreach ($textLines as $index => $line) {
                $y = $startY + ($index * $lineHeight);
                $textMultiline .= '<tspan
         id="tspan3812_' . $index . '"
         style="font-weight:bold;-inkscape-font-specification:\'Open Sans Bold\';text-align:center;text-anchor:middle;fill:' . $this->configuration->secondaryColor . ';fill-opacity:1"
         y="' . $y . '"
         x="150.53195"
         sodipodi:role="line">' . $this->escape($line) . '</tspan>';
            }
        }
        $svg = str_replace('$TEXT_MULTILINE$', $textMultiline, $svg);
        
        // Replace annotation font size
        $svg = str_replace('$ANNOTATION_FONT_SIZE$', $this->configuration->annotationFontSize, $svg);

        $svg = str_replace('$PATTERN$', $this->escape($this->configuration->pattern), $svg);

        $svg = str_replace('$HASH_ALGORITHM$', $this->escape(strtoupper($this->configuration->hashAlgorithm)), $svg);

        $svg = str_replace('$WATERMARK_URL$', $this->escape($this->configuration->watermarkUrl), $svg);

        // Calculate appropriate font size for watermark URL to prevent clipping
        $watermarkLength = strlen($this->configuration->watermarkUrl);
        $watermarkFontSize = $this->calculateWatermarkFontSize($watermarkLength);
        $svg = str_replace('$WATERMARK_FONT_SIZE$', $watermarkFontSize, $svg);

        // Build seed display string based on user preferences
        $seedDisplay = $this->buildSeedDisplay();
        $svg = str_replace('$SEED_DISPLAY$', $this->escape($seedDisplay), $svg);

        return $svg;
    }

    /**
     * Build the seed display string based on user's print preferences.
     * Display format: string seed immediately left of number seed, no labels.
     * 
     * @return string The formatted seed display string
     */
    private function buildSeedDisplay()
    {
        $parts = [];
        
        // Add string seed if requested and available (no label)
        if ($this->configuration->printStringSeed && $this->configuration->originalStringSeed !== null) {
            $parts[] = $this->configuration->originalStringSeed;
        }
        
        // Add number seed if requested (no label)
        if ($this->configuration->printNumberSeed) {
            $parts[] = $this->configuration->seed;
        }
        
        // Join with space - string seed immediately left of number seed
        return implode(' ', $parts);
    }
    private function escape($str)
    {
        return htmlentities(mb_convert_encoding($str, 'UTF-8', 'ISO-8859-1'), ENT_XML1);
    }

    /**
     * Calculate appropriate font size for watermark URL to prevent clipping.
     * The watermark is displayed in an area approximately 65mm wide.
     * Font size dynamically scales based on URL length.
     * 
     * @param int $length Length of the watermark URL
     * @return int Font size in pixels
     */
    private function calculateWatermarkFontSize($length)
    {
        // Base font size for short URLs (up to 30 chars)
        if ($length <= 30) {
            return 10;
        }
        // Scale down font size for longer URLs
        if ($length <= 50) {
            return 9;
        }
        if ($length <= 70) {
            return 8;
        }
        if ($length <= 100) {
            return 7;
        }
        if ($length <= 130) {
            return 6;
        }
        if ($length <= 160) {
            return 5;
        }
        // For very long URLs (up to 200 chars max)
        return 4;
    }


    public function renderIntoTempfile($svg)
    {
        $uri = tempnam("/tmp", "php");
        file_put_contents($uri, $this->render($svg));
        return $uri;
    }
}
