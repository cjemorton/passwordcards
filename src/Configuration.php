<?php

namespace raphiz\passwordcards;

class Configuration
{

    const DEFAULT_PATTERN = 'a-zA-Z0-9~*-*';

    const LOWER = "abcdefghijklmnopqrstuvwxyz";

    const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const NUMBERS = "0123456789";

    const SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

    public $seed = null;

    public $pattern = null;

    public $primaryColor = null;

    public $secondaryColor = null;

    public $text = null;

    public $keys = null;

    public $spaceBarSize = null;

    public $watermarkUrl = null;

    public $hashAlgorithm = null;

    public function __construct($seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $watermarkUrl = 'https://passwordcards.mrnet.work/', $hashAlgorithm = 'sha256')
    {
        $this->seed = self::evalSeed($seed);
        $this->pattern = self::evalPattern($pattern);
        $this->keys = self::evalKeys($keys);
        $this->primaryColor = $primaryColor;
        $this->text = $text;
        $this->spaceBarSize = $spaceBarSize;
        $this->secondaryColor = $secondaryColor;
        $this->watermarkUrl = $watermarkUrl;
        $this->hashAlgorithm = $hashAlgorithm;
    }

    public function getPatternCharacters()
    {
        return str_split(self::completePattern($this->pattern));
    }

    public static function completePattern($pattern)
    {
        $pattern = str_replace('a-z', self::LOWER, $pattern);
        $pattern = str_replace('A-Z', self::UPPER, $pattern);
        $pattern = str_replace('0-9', self::NUMBERS, $pattern);
        $pattern = str_replace('*-*', self::SYMBOLS, $pattern);
        return $pattern;
    }

    /**
     * If no seed is provided, generate one.
     * 
     * DETERMINISTIC GENERATION:
     * The seed value is the key to deterministic card generation. When a specific
     * seed is provided (integer value), the card generation becomes deterministic,
     * meaning the exact same card will be generated every time with that seed and
     * the same configuration parameters.
     * 
     * If no seed is provided (null), a random seed is generated based on the 
     * current microtime, resulting in a unique, non-reproducible card.
     * 
     * Note: This method is called after parseSeed(), which already converts string
     * seeds to numeric values. So this method only receives integers or null.
     * 
     * @param mixed $seed The seed value (integer) or null
     * @return int The seed to use for card generation
     */
    public static function evalSeed($seed)
    {
        // If no seed provided (or defensive check for non-numeric), generate random
        if ($seed === null || !is_numeric($seed)) {
            list($usec, $sec) = explode(' ', microtime());
            $seed = (int) ((float) $sec + ((float) $usec * 100000));
        }
        return $seed;
    }

    /**
    * If no pattern is provided, return the default.
    */
    public static function evalPattern($pattern)
    {
        if ($pattern === null) {
            $pattern = self::DEFAULT_PATTERN;
        }
        return $pattern;
    }

    /**
    * If no keys are provided, use qwerty.
    */
    public static function evalKeys($keys)
    {
        // Return qwertz
        if (strtolower($keys) === 'qwertz') {
            return 'QWERTZUIOPASDFGHJKLYXCVBNM';
        }
        // Return qwerty
        return 'QWERTYUIOPASDFGHJKLZXCVBNM';
    }
}
