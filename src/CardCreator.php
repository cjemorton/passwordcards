<?php

namespace raphiz\passwordcards;

class CardCreator
{
    private $configration = null;

    public function __construct($configration)
    {
        if ($configration === null) {
            throw new \Exception('The given $configuration is null!');
        }

        if ($configration instanceof Configuration === false) {
            throw new \Exception(
                'The given $configuration is not a valid ' .
                'Configuration object.'
            );
        }

        $this->configration = $configration;
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
        $chars = $this->configration->getPatternCharacters();
        $char_count = count($chars);

        // Seed the random number generator for deterministic card generation.
        // When the same seed is used with identical configuration parameters,
        // the exact same card will be generated every time. This allows users
        // to regenerate lost cards using their seed value.
        $seed = $this->configration->seed;
        mt_srand($seed);

        // Generate random characters for each key position using seeded RNG
        $number_of_keys = strlen($this->configration->keys);
        for ($i = 0; $i < $number_of_keys; $i++) {
            // Use mt_rand() which respects the seed set by mt_srand()
            $equivalent = $chars[mt_rand(0, $char_count-1)];

            $equivalent = $this->escape($equivalent);

            // Replace the equivalent on the "keyboard"
            $svg = str_replace('$' . ($i+1) . '$', $equivalent, $svg);

            $svg = str_replace('$k' . ($i+1) . '$', $this->configration->keys[$i], $svg);

        }

        // Generate random characters for spacebar using seeded RNG
        $space_lenght = $this->configration->spaceBarSize;
        $space = '';
        for ($i = 0; $i < $space_lenght; $i++) {
            // Use mt_rand() which respects the seed set by mt_srand()
            $space .= $this->escape($chars[mt_rand(0, $char_count-1)]);
        }

        $svg = str_replace('$SPACE$', $space, $svg);

        $svg = str_replace('$SEED$', $seed, $svg);

        $svg = str_replace('$PRIMARY$', $this->configration->primaryColor, $svg);

        $svg = str_replace('$SECONDARY$', $this->configration->secondaryColor, $svg);

        $svg = str_replace('$TEXT$', $this->escape($this->configration->text), $svg);

        $svg = str_replace('$PATTERN$', $this->escape($this->configration->pattern), $svg);

        $svg = str_replace('$HASH_ALGORITHM$', $this->escape(strtoupper($this->configration->hashAlgorithm)), $svg);

        $svg = str_replace('$WATERMARK_URL$', $this->escape($this->configration->watermarkUrl), $svg);

        // Calculate appropriate font size for watermark URL to prevent clipping
        $watermarkLength = strlen($this->configration->watermarkUrl);
        $watermarkFontSize = $this->calculateWatermarkFontSize($watermarkLength);
        $svg = str_replace('$WATERMARK_FONT_SIZE$', $watermarkFontSize, $svg);

        return $svg;
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
