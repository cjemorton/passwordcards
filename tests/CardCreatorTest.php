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



    protected function setUp(): void
    {
        $this->testConfiguration = new Configuration(10, null, null, 8, '', '#000000', '#ffffff');
    }
}
