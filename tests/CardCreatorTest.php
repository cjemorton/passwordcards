<?php
namespace raphiz\passwordcards;

use PHPUnit\Framework\TestCase;

class CardCreatorTest extends TestCase
{
    public function testConstructorDeclinesNull()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('The given $configuration is null!');
        new CardCreator(null);
    }

    public function testConstructorDeclinesNonConfigurationInstances()
    {
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('The given $configuration is not a valid Configuration object.');
        new CardCreator('fooBaa');
    }

    public function testGetSvgFilePath()
    {
        $creator = new CardCreator($this->testConfiguration);
        $file = $creator->getSvgFilePath('abc');
        $this->assertStringEndsWith('/templates/abc.svg', $file);
    }

    public function testCreateHappyPath()
    {
        $creator = new CardCreator($this->testConfiguration);
        $creator->render($creator->getSvgFilePath('simple_front'));
    }

    public function testSeedDisplayWithStringSeed()
    {
        $cfg = new Configuration(12345, null, null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256', 'mypassword', true, false);
        $creator = new CardCreator($cfg);
        $svg = $creator->render($creator->getSvgTemplate('simple_back'));
        $this->assertStringContainsString('Seed (string): mypassword', $svg);
    }

    public function testSeedDisplayWithNumberSeed()
    {
        $cfg = new Configuration(12345, null, null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256', null, false, true);
        $creator = new CardCreator($cfg);
        $svg = $creator->render($creator->getSvgTemplate('simple_back'));
        $this->assertStringContainsString('Seed (number): 12345', $svg);
    }

    public function testSeedDisplayWithBothSeeds()
    {
        $cfg = new Configuration(12345, null, null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256', 'mypassword', true, true);
        $creator = new CardCreator($cfg);
        $svg = $creator->render($creator->getSvgTemplate('simple_back'));
        $this->assertStringContainsString('Seed (string): mypassword', $svg);
        $this->assertStringContainsString('Seed (number): 12345', $svg);
    }

    public function testSeedDisplayWithNoSeeds()
    {
        $cfg = new Configuration(12345, null, null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256', null, false, false);
        $creator = new CardCreator($cfg);
        $svg = $creator->render($creator->getSvgTemplate('simple_back'));
        // Should not contain seed display when both are false
        $this->assertStringNotContainsString('Seed (string):', $svg);
        $this->assertStringNotContainsString('Seed (number):', $svg);
    }


    protected function setUp(): void
    {
        $this->testConfiguration = new Configuration(10, null, null, 8, '', '#000000', '#ffffff', 'https://passwordcards.mrnet.work/', 'sha256', null, false, false);
    }
}
