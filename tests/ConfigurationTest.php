<?php
namespace raphiz\passwordcards;

use PHPUnit\Framework\TestCase;

class ConfigurationTest extends TestCase
{

    public function testEvalSeedReturnsGivenNonNullSeed()
    {
        // Verify that if a seed is given, it's returned properly
        $this->assertEquals(1, Configuration::evalSeed(1));
        $this->assertEquals(99, Configuration::evalSeed(99));
    }

    public function testEvalSeedGeneratesSeedIfNullGiven()
    {
        $seed1 = Configuration::evalSeed(null);
        $seed2 = Configuration::evalSeed(null);

        // Not null?
        $this->assertNotNull($seed1);
        $this->assertNotNull($seed2);

        // Is integer (after PHP 8.2 fix)?
        $this->assertIsInt($seed1);
        $this->assertIsInt($seed2);

        // The seeds shall not be equal!
        $this->assertFalse($seed1 == $seed2);
    }

    public function testEvalPatternReturnsGivenNonNullPattern()
    {
        $this->assertEquals('a-zA-Z', Configuration::evalPattern('a-zA-Z'));
        $this->assertEquals('a-z', Configuration::evalPattern('a-z'));
    }

    public function testEvalPatternReturnsDefaultIfNull()
    {
        $this->assertEquals('a-zA-Z0-9~*-*', Configuration::evalPattern(null));
    }

    public function testCompletePatterAcceptsShortForms()
    {
        $this->assertEquals(
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            Configuration::completePattern('A-Z')
        );
        $this->assertEquals(
            '0123456789',
            Configuration::completePattern('0-9')
        );
        $this->assertEquals(
            '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
            Configuration::completePattern('*-*')
        );

        # Combination
        $this->assertEquals(
            'abcdefghijklmnopqrstuvwxyz0123456789',
            Configuration::completePattern('a-z0-9')
        );

    }

    public function testGetPatternCharactersHappyPath()
    {
        //$seed, $pattern, $keys, $spaceBarSize, $text, $primaryColor, $secondaryColor, $watermarkUrl, $hashAlgorithm
        $cfg = new Configuration(null, 'a0-', null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256');
        $chars = $cfg->getPatternCharacters();
        $this->assertEquals('a', $chars[0]);
        $this->assertEquals('0', $chars[1]);
        $this->assertEquals('-', $chars[2]);
    }

}
