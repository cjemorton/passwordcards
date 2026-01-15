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
        $limit = getenv('CARD_GENERATION_LIMIT');
        if ($limit === false || !is_numeric($limit)) {
            return 5; // default
        }
        return (int)$limit;
    }

    public static function getCardGenerationTimeout()
    {
        $timeout = getenv('CARD_GENERATION_TIMEOUT');
        if ($timeout === false || !is_numeric($timeout)) {
            return 300; // default (5 minutes)
        }
        return (int)$timeout;
    }

    public static function parseSeed()
    {
        if (
            isset($_POST['seed']) &&
            is_numeric($_POST['seed'])
        ) {
            return $_POST['seed'];
        }
        return null;
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
            return substr($_POST['msg'], 0, 20);
        }
        return '';
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
