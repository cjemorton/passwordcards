<?php
/**
 * Simple test to verify deterministic card generation
 * Run with: php tests/manual_determinism_test.php
 */

require_once __DIR__ . '/../vendor/autoload.php';

use raphiz\passwordcards\Configuration;
use raphiz\passwordcards\CardCreator;

echo "Testing Deterministic Card Generation\n";
echo "=====================================\n\n";

// Test 1: Same seed produces same output
echo "Test 1: Same seed produces same output\n";
$seed = 12345;
$pattern = 'a-zA-Z0-9';
$keys = 'qwerty';
$spaceBarSize = 8;
$text = 'Test';
$primaryColor = '#1ABC9C';
$secondaryColor = '#ffffff';
$watermarkUrl = 'https://test.com/';

// Generate first card
$config1 = new Configuration($seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $watermarkUrl);
$creator1 = new CardCreator($config1);
$svg1 = $creator1->getSvgTemplate('simple_front');
$output1 = $creator1->render($svg1);

// Generate second card with same parameters
$config2 = new Configuration($seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $watermarkUrl);
$creator2 = new CardCreator($config2);
$svg2 = $creator2->getSvgTemplate('simple_front');
$output2 = $creator2->render($svg2);

if ($output1 === $output2) {
    echo "✓ PASS: Same seed produces identical output\n";
} else {
    echo "✗ FAIL: Same seed produces different output\n";
    exit(1);
}

// Test 2: Different seed produces different output
echo "\nTest 2: Different seed produces different output\n";
$config3 = new Configuration(54321, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $watermarkUrl);
$creator3 = new CardCreator($config3);
$svg3 = $creator3->getSvgTemplate('simple_front');
$output3 = $creator3->render($svg3);

if ($output1 !== $output3) {
    echo "✓ PASS: Different seed produces different output\n";
} else {
    echo "✗ FAIL: Different seed produces same output\n";
    exit(1);
}

// Test 3: Verify watermark font size calculation
echo "\nTest 3: Watermark font size calculation\n";

// Short URL
$shortConfig = new Configuration($seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, 'https://short.url/');
$shortCreator = new CardCreator($shortConfig);
$shortSvg = $shortCreator->render($shortCreator->getSvgTemplate('simple_back'));
if (strpos($shortSvg, 'font-size:10px') !== false) {
    echo "✓ PASS: Short URL uses larger font size\n";
} else {
    echo "✗ FAIL: Short URL font size incorrect\n";
    exit(1);
}

// Long URL (119 characters - should result in 7px according to breakpoints)
$longUrl = 'https://verylongdomainname.example.com/path/to/very/long/url/that/should/trigger/smaller/font/size/for/proper/display';
if (strlen($longUrl) != 119) {
    echo "Warning: Test URL length is " . strlen($longUrl) . " chars, expected 119\n";
}
$longConfig = new Configuration($seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $longUrl);
$longCreator = new CardCreator($longConfig);
$longSvg = $longCreator->render($longCreator->getSvgTemplate('simple_back'));

// Extract font size from SVG
preg_match('/font-size:(\d+)px/', $longSvg, $matches);
if (isset($matches[1])) {
    $fontSize = (int)$matches[1];
    // Long URL should have smaller font (< 10px)
    if ($fontSize < 10) {
        echo "✓ PASS: Long URL uses smaller font size ({$fontSize}px)\n";
    } else {
        echo "✗ FAIL: Long URL should use smaller font, got {$fontSize}px\n";
        exit(1);
    }
} else {
    echo "✗ FAIL: Could not extract font size from SVG\n";
    exit(1);
}

echo "\n=====================================\n";
echo "All tests passed! ✓\n";
echo "\nDeterministic generation is working correctly.\n";
echo "Same seed + same parameters = identical card\n";
