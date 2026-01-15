<?php
namespace raphiz\passwordcards;

require_once 'vendor/autoload.php';
use \Rain\Tpl;

Tpl::configure(
    array(
        "tpl_dir" => __DIR__ . "/resources/",
    )
);

if (!RequestUtils::isPost()) {
    $tpl = new Tpl;
    $tpl->draw('index');
} else {
    // Check if bypass password was provided and is correct
    $bypassValid = RequestUtils::checkBypassPassword();
    
    // If bypass password is valid, clear the rate limit for this IP
    if ($bypassValid) {
        $blacklistfile = RequestUtils::getBlacklistFile();
        if (file_exists($blacklistfile)) {
            file_put_contents($blacklistfile, 0);
        }
    }
    
    $spamPrevention = RequestUtils::preventSpam();
    if ($spamPrevention !== true) {
        $tpl = new Tpl;
        $tpl->assign('seconds', $spamPrevention);
        $tpl->assign('limit', RequestUtils::getCardGenerationLimit());
        $tpl->assign('timeout_minutes', round(RequestUtils::getCardGenerationTimeout() / 60));
        // Pass form data to template so it can be resubmitted with bypass password
        $formData = $_POST;
        // Remove bypass password fields from form data for security
        unset($formData['bypass-password']);
        unset($formData['bypass-attempt']);
        $tpl->assign('formData', $formData);
        $tpl->draw('spam');
    } else {
        // Parse request
        $pattern = RequestUtils::parsePattern();
        $keyboardLayout = RequestUtils::parseKeyboardLayout();
        $seed = RequestUtils::parseSeed();
        $text = RequestUtils::parseText();
        $primary = RequestUtils::parsePrimaryColor();
        $secondary = RequestUtils::parseSecondaryColor();
        $spaceBarSize = RequestUtils::parseSpacebarSize();
        $watermarkUrl = RequestUtils::parseWatermarkUrl();
        $hashAlgorithm = RequestUtils::parseHashAlgorithm();
        $originalStringSeed = RequestUtils::parseOriginalStringSeed();
        $printStringSeed = RequestUtils::parsePrintStringSeed();
        $printNumberSeed = RequestUtils::parsePrintNumberSeed();
    
        // Setup configuration
        $cfg = new Configuration($seed, $pattern, $keyboardLayout, $spaceBarSize, $text, $primary, $secondary, $watermarkUrl, $hashAlgorithm, $originalStringSeed, $printStringSeed, $printNumberSeed);
        $creator = new CardCreator($cfg);
    
        // Load SVG templates
        $front_template = $creator->getSvgTemplate('simple_back');
        $back_template = $creator->getSvgTemplate('simple_front');
    
        // Render SVG into tempfiles
        $front = $creator->renderIntoTempfile($front_template);
        $back = $creator->renderIntoTempfile($back_template);
    
        // Render the PDF
        $doc = PDFRenderer::render($front, $back, $cfg);
    
        // Prepare response PDF file header
        RequestUtils::preparePdfHeader(strlen($doc));
    
        // Ignore user abort to cleanup afterwards
        ignore_user_abort(true);
    
        // Strem the PDF
        echo $doc;
    
        // Cleanup temporary SVG images
        unlink($back);
        unlink($front);
    }
}
