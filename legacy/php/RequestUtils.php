<?php
namespace raphiz\passwordcards;

class RequestUtils
{
    public static function isPost()
    {
        return $_SERVER['REQUEST_METHOD'] == "POST";
    }

    public static function getBlacklistFile()
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        return __DIR__ . '/../blacklist/' . $ip;
    }

    public static function preventSpam()
    {
        $blacklistfile = self::getBlacklistFile();
        $count = 0;
        $creationDate = 0;
        $limit = self::getCardGenerationLimit();
        
        if (file_exists($blacklistfile)) {
            $contents = (int)file_get_contents($blacklistfile);
            // If the stored value is big, it's the unix timestamp.
            // Otherwise it's the amount of created cards.
            if ($contents > $limit) {
                $creationDate = $contents;
            } else {
                $count = $contents;
            }
        }


        if ($creationDate > 0) {
            // If blocked time is over, release lock
            if ($creationDate - time() < 0) {
                file_put_contents($blacklistfile, 0);
            } else {
                return $creationDate - time();
            }
        }

        if ($count === $limit) {
            // Get the timeout from environment variable
            $timeout = self::getCardGenerationTimeout();
            // Write unix timestamp into the blacklist file. The
            // ip is blocked till then.
            file_put_contents($blacklistfile, time() + $timeout);
        } else {
            // increment count...
            file_put_contents($blacklistfile, ($count+1));
        }

        return true;
    }

    public static function checkBypassPassword()
    {
        if (
            isset($_POST['bypass-password']) &&
            isset($_POST['bypass-attempt']) &&
            $_POST['bypass-attempt'] === "1"
        ) {
            $providedPassword = $_POST['bypass-password'];
            $correctPassword = getenv('BYPASS_PASSWORD');
            
            // If no password is set in environment, bypass feature is disabled
            if ($correctPassword === false || $correctPassword === '') {
                return false;
            }
            
            // Use hash_equals for timing-safe comparison
            return hash_equals($correctPassword, $providedPassword);
        }
        return false;
    }

    public static function getCardGenerationLimit()
    {
        static $limit = null;
        if ($limit === null) {
            $envLimit = getenv('CARD_GENERATION_LIMIT');
            $limit = ($envLimit !== false && is_numeric($envLimit)) ? (int)$envLimit : 5;
        }
        return $limit;
    }

    public static function getCardGenerationTimeout()
    {
        static $timeout = null;
        if ($timeout === null) {
            $envTimeout = getenv('CARD_GENERATION_TIMEOUT');
            $timeout = ($envTimeout !== false && is_numeric($envTimeout)) ? (int)$envTimeout : 300;
        }
        return $timeout;
    }

    /**
     * Parse and process the seed value from POST data.
     * 
     * SEED PROCESSING:
     * - If seed is numeric, return it directly as an integer
     * - If seed is a non-empty string, hash it using the selected algorithm
     * - Hashing converts the string to a deterministic numeric value
     * - Same string + same algorithm = same numeric seed = reproducible card
     * 
     * @return int|null The numeric seed value or null if no seed provided
     */
    public static function parseSeed()
    {
        if (isset($_POST['seed']) && !empty(trim($_POST['seed']))) {
            $seed = trim($_POST['seed']);
            
            // If seed is numeric, return it directly
            if (is_numeric($seed)) {
                return (int)$seed;
            }
            
            // If seed is a string, hash it to get a numeric value
            // This ensures reproducibility: same string + same algorithm = same card
            $algorithm = self::parseHashAlgorithm();
            $hash = hash($algorithm, $seed);
            
            // Convert the hash to a numeric seed by taking the first 15 hex characters
            // and converting to integer. This provides ~60 bits of entropy (15 hex chars = 60 bits)
            // which is sufficient to prevent practical collisions while keeping the seed manageable.
            // PHP_INT_MAX on 64-bit systems is 2^63-1, so 15 hex chars (2^60) fits comfortably.
            $numericSeed = hexdec(substr($hash, 0, 15));
            
            return $numericSeed;
        }
        return null;
    }
    
    /**
     * Get the original string seed if it was a string, or null if it was numeric or empty.
     * This is used to display the string seed on the card if requested.
     * 
     * @return string|null The original string seed or null
     */
    public static function parseOriginalStringSeed()
    {
        if (isset($_POST['seed']) && !empty(trim($_POST['seed']))) {
            $seed = trim($_POST['seed']);
            
            // Only return the string seed if it's not numeric
            if (!is_numeric($seed)) {
                return $seed;
            }
        }
        return null;
    }
    
    /**
     * Check if user wants to print the string seed on the card.
     * 
     * @return bool True if string seed should be printed
     */
    public static function parsePrintStringSeed()
    {
        return isset($_POST['print-string-seed']) && $_POST['print-string-seed'] === '1';
    }
    
    /**
     * Check if user wants to print the number seed on the card.
     * 
     * @return bool True if number seed should be printed
     */
    public static function parsePrintNumberSeed()
    {
        return isset($_POST['print-number-seed']) && $_POST['print-number-seed'] === '1';
    }
    
    
    /**
     * Parse the hash algorithm selection from POST data.
     * Defaults to SHA-256 for security and reproducibility.
     * 
     * @return string The hash algorithm name (lowercase)
     */
    public static function parseHashAlgorithm()
    {
        $validAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
        
        if (
            isset($_POST['hash-algorithm']) &&
            in_array(strtolower($_POST['hash-algorithm']), $validAlgorithms)
        ) {
            return strtolower($_POST['hash-algorithm']);
        }
        
        // Default to SHA-256 for best security and reproducibility
        return 'sha256';
    }

    public static function parseSpacebarSize()
    {
        if (
            isset($_POST['space-length']) &&
            is_numeric($_POST['space-length']) &&
            $_POST['space-length'] < 8 &&
            $_POST['space-length'] > 0
        ) {
            return $_POST['space-length'];
        }
        return 8;
    }

    public static function parseText()
    {
        if (isset($_POST['msg'])) {
            // Support multi-line annotations, limit to 100 chars
            return substr($_POST['msg'], 0, 100);
        }
        return '';
    }

    public static function parseAnnotationFontSize()
    {
        if (
            isset($_POST['annotation-font-size']) &&
            is_numeric($_POST['annotation-font-size']) &&
            $_POST['annotation-font-size'] >= 12 &&
            $_POST['annotation-font-size'] <= 28
        ) {
            return intval($_POST['annotation-font-size']);
        }
        return 20;
    }

    public static function parseShowMetadata()
    {
        return self::isChecked('show-metadata');
    }

    public static function parseMetadataPosition()
    {
        if (
            isset($_POST['metadata-position']) &&
            in_array($_POST['metadata-position'], ['bottom', 'spine'])
        ) {
            return $_POST['metadata-position'];
        }
        return 'bottom';
    }

    public static function parsePrimaryColor()
    {
        if (
            isset($_POST['primaryColor']) &&
            preg_match("/#[0-9a-zA-Z]{6}/", $_POST['primaryColor'])
        ) {
            return $_POST['primaryColor'];
        }
        return '#1ABC9C';
    }

    public static function parseSecondaryColor()
    {
        if (
            isset($_POST['secondaryColor']) &&
            preg_match("/#[0-9a-zA-Z]{6}/", $_POST['secondaryColor'])
        ) {
            return $_POST['secondaryColor'];
        }
        return '#ffffff';
    }

    public static function parseKeyboardLayout()
    {
        if (
            isset($_POST['keyboardlayout']) &&
            preg_match("/qwerty|qwertz/", $_POST['keyboardlayout'])
        ) {
            return strtolower($_POST['keyboardlayout']);
        }
        return 'qwerty';
    }
    public static function parseWatermarkUrl()
    {
        if (isset($_POST['watermark-url'])) {
            $url = trim($_POST['watermark-url']);
            // Validate URL format
            if (filter_var($url, FILTER_VALIDATE_URL)) {
                return substr($url, 0, 200);
            }
        }
        return 'https://passwordcards.mrnet.work/';
    }

    public static function parseQrCodeEnabled()
    {
        return isset($_POST['qr-code-enabled']) && $_POST['qr-code-enabled'] === '1';
    }

    public static function parsePattern()
    {
         $pattern = "";

        // With numbers?
        if (self::isChecked('with-numbers')) {
            $pattern .= '0-9';
        }

        // With lower?
        if (self::isChecked('with-lower')) {
            $pattern .= 'a-z';
        }

        // With upper?
        if (self::isChecked('with-upper')) {
            $pattern .= 'A-Z';
        }

        // With symbols?
        if (self::isChecked('with-symbols')) {
            $pattern .= '*-*';
        }

        // With space?
        if (self::isChecked('with-space')) {
            $pattern .= ' ';
        }

        // With others?
        if (self::isChecked('with-other')) {
            if (isset($_POST['other-chars'])) {
                $pattern .= substr($_POST['other-chars'], 0, 20);
            }
        }
        return $pattern;
    }

    private static function isChecked($parameter)
    {
        if (
            isset($_POST[$parameter]) &&
            $_POST[$parameter] === "on"
        ) {
            return true;
        }
        return false;
    }

    public static function preparePdfHeader($length)
    {
        header('Content-Description: File Transfer');
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename=passwordcard.pdf');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . $length);
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Expires: 0');
        header('Pragma: public');
    }

}
