<?php
namespace raphiz\passwordcards;

use PHPUnit\Framework\TestCase;

class RequestUtilsTest extends TestCase
{
    protected function setUp(): void
    {
        // Clear POST data before each test
        $_POST = [];
    }

    public function testParseHashAlgorithmReturnsDefault()
    {
        // When no algorithm is provided, should default to sha256
        $this->assertEquals('sha256', RequestUtils::parseHashAlgorithm());
    }

    public function testParseHashAlgorithmReturnsValidAlgorithm()
    {
        $_POST['hash-algorithm'] = 'md5';
        $this->assertEquals('md5', RequestUtils::parseHashAlgorithm());

        $_POST['hash-algorithm'] = 'sha1';
        $this->assertEquals('sha1', RequestUtils::parseHashAlgorithm());

        $_POST['hash-algorithm'] = 'SHA256';
        $this->assertEquals('sha256', RequestUtils::parseHashAlgorithm());

        $_POST['hash-algorithm'] = 'sha512';
        $this->assertEquals('sha512', RequestUtils::parseHashAlgorithm());
    }

    public function testParseHashAlgorithmRejectsInvalidAlgorithm()
    {
        $_POST['hash-algorithm'] = 'invalid';
        $this->assertEquals('sha256', RequestUtils::parseHashAlgorithm());

        $_POST['hash-algorithm'] = 'xxhash';
        $this->assertEquals('sha256', RequestUtils::parseHashAlgorithm());
    }

    public function testParseSeedReturnsNullWhenEmpty()
    {
        // No seed provided
        $this->assertNull(RequestUtils::parseSeed());

        // Empty seed
        $_POST['seed'] = '';
        $this->assertNull(RequestUtils::parseSeed());

        // Whitespace only
        $_POST['seed'] = '   ';
        $this->assertNull(RequestUtils::parseSeed());
    }

    public function testParseSeedReturnsNumericSeed()
    {
        $_POST['seed'] = '12345';
        $this->assertEquals(12345, RequestUtils::parseSeed());

        $_POST['seed'] = '999';
        $this->assertEquals(999, RequestUtils::parseSeed());
    }

    public function testParseSeedHashesStringSeed()
    {
        // Test that string seeds are hashed to numeric values
        $_POST['seed'] = 'mypassword';
        $_POST['hash-algorithm'] = 'sha256';
        
        $seed = RequestUtils::parseSeed();
        $this->assertIsInt($seed);
        $this->assertGreaterThan(0, $seed);
    }

    public function testParseSeedReproducibilityWithSHA256()
    {
        // Test that same string seed + same algorithm = same numeric value
        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'sha256';
        
        $seed1 = RequestUtils::parseSeed();
        
        // Reset and test again
        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'sha256';
        
        $seed2 = RequestUtils::parseSeed();
        
        $this->assertEquals($seed1, $seed2, 'Same string seed with same algorithm should produce same numeric seed');
    }

    public function testParseSeedDifferentAlgorithmsProduceDifferentSeeds()
    {
        // Test that different algorithms produce different seeds
        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'sha256';
        $seed256 = RequestUtils::parseSeed();

        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'md5';
        $seedMd5 = RequestUtils::parseSeed();

        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'sha1';
        $seedSha1 = RequestUtils::parseSeed();

        $_POST['seed'] = 'testword';
        $_POST['hash-algorithm'] = 'sha512';
        $seed512 = RequestUtils::parseSeed();

        // All seeds should be different
        $this->assertNotEquals($seed256, $seedMd5, 'SHA-256 and MD5 should produce different seeds');
        $this->assertNotEquals($seed256, $seedSha1, 'SHA-256 and SHA-1 should produce different seeds');
        $this->assertNotEquals($seed256, $seed512, 'SHA-256 and SHA-512 should produce different seeds');
        $this->assertNotEquals($seedMd5, $seedSha1, 'MD5 and SHA-1 should produce different seeds');
    }

    public function testParseSeedDifferentStringsProduceDifferentSeeds()
    {
        // Test that different string seeds produce different numeric values
        $_POST['seed'] = 'password1';
        $_POST['hash-algorithm'] = 'sha256';
        $seed1 = RequestUtils::parseSeed();

        $_POST['seed'] = 'password2';
        $_POST['hash-algorithm'] = 'sha256';
        $seed2 = RequestUtils::parseSeed();

        $this->assertNotEquals($seed1, $seed2, 'Different string seeds should produce different numeric seeds');
    }

    public function testParseOriginalStringSeedReturnsNullForNumeric()
    {
        $_POST['seed'] = '12345';
        $this->assertNull(RequestUtils::parseOriginalStringSeed());
    }

    public function testParseOriginalStringSeedReturnsStringForNonNumeric()
    {
        $_POST['seed'] = 'mypassword';
        $this->assertEquals('mypassword', RequestUtils::parseOriginalStringSeed());

        $_POST['seed'] = 'test phrase';
        $this->assertEquals('test phrase', RequestUtils::parseOriginalStringSeed());
    }

    public function testParseOriginalStringSeedReturnsNullWhenEmpty()
    {
        $this->assertNull(RequestUtils::parseOriginalStringSeed());
        
        $_POST['seed'] = '';
        $this->assertNull(RequestUtils::parseOriginalStringSeed());
    }

    public function testParsePrintStringSeedDefaultsFalse()
    {
        $this->assertFalse(RequestUtils::parsePrintStringSeed());
    }

    public function testParsePrintStringSeedReturnsTrue()
    {
        $_POST['print-string-seed'] = '1';
        $this->assertTrue(RequestUtils::parsePrintStringSeed());
    }

    public function testParsePrintStringSeedReturnsFalseForInvalidValue()
    {
        $_POST['print-string-seed'] = 'on';
        $this->assertFalse(RequestUtils::parsePrintStringSeed());

        $_POST['print-string-seed'] = 'yes';
        $this->assertFalse(RequestUtils::parsePrintStringSeed());
    }

    public function testParsePrintNumberSeedDefaultsFalse()
    {
        $this->assertFalse(RequestUtils::parsePrintNumberSeed());
    }

    public function testParsePrintNumberSeedReturnsTrue()
    {
        $_POST['print-number-seed'] = '1';
        $this->assertTrue(RequestUtils::parsePrintNumberSeed());
    }

    public function testParsePrintNumberSeedReturnsFalseForInvalidValue()
    {
        $_POST['print-number-seed'] = 'on';
        $this->assertFalse(RequestUtils::parsePrintNumberSeed());

        $_POST['print-number-seed'] = 'yes';
        $this->assertFalse(RequestUtils::parsePrintNumberSeed());
    }


    protected function tearDown(): void
    {
        // Clean up POST data after each test
        $_POST = [];
    }
}
