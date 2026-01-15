<?php

namespace raphiz\passwordcards;

class PDFRenderer
{
    public static function render($front, $back, $config = null)
    {
        // create new PDF document
        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, 'mm', 'A4', true, 'UTF-8', false);

        // set document information
        $pdf->SetAuthor('Raphael Zimmermann');
        $pdf->SetTitle('Password Card');
        $pdf->SetSubject('Password Card');

        $pdf->SetPrintHeader(false);
        $pdf->SetPrintFooter(false);

        // add a page
        $pdf->AddPage();

        // Mark the position to fold...
        $pdf->Line(95, 10, 95, 13);
        $pdf->Line(95, 72, 95, 75);

        // Add the front svg
        $pdf->ImageSVG(
            $front, // filename
            10, // x
            15, // y
            '85', // width
            '55' // height
        );

        // Add the back svg
        $pdf->ImageSVG(
            $back, // filename
            95, // x
            15, // y
            '85', // width
            '55' // height
        );

        // Add QR code in the corner of the front card (pointing to watermark URL)
        if ($config && $config->watermarkUrl) {
            $style = array(
                'border' => false,
                'vpadding' => 0,
                'hpadding' => 0,
                'fgcolor' => array(0,0,0),
                'bgcolor' => false,
                'module_width' => 1,
                'module_height' => 1
            );
            // Place QR code in top-right corner of front card
            $pdf->write2DBarcode($config->watermarkUrl, 'QRCODE,L', 82, 17, 12, 12, $style, 'N');
        }

        // Add QR code in the corner of the back card
        if ($config && $config->watermarkUrl) {
            $style = array(
                'border' => false,
                'vpadding' => 0,
                'hpadding' => 0,
                'fgcolor' => array(0,0,0),
                'bgcolor' => false,
                'module_width' => 1,
                'module_height' => 1
            );
            // Place QR code in top-right corner of back card
            $pdf->write2DBarcode($config->watermarkUrl, 'QRCODE,L', 167, 17, 12, 12, $style, 'N');
        }

        // Add documentation page
        if ($config) {
            self::addDocumentationPage($pdf, $config);
        }

        //Close and output PDF document
        return $pdf->Output('generated.pdf', 'S');
    }

    private static function addDocumentationPage($pdf, $config)
    {
        $pdf->AddPage();
        
        // Set font
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 10, 'Password Card Information', 0, 1, 'C');
        $pdf->Ln(5);

        // Watermark URL section
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Watermark URL', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 'The watermark URL displayed on your card is: ' . $config->watermarkUrl . "\n\nThis URL is also embedded in the QR code on each card. You can customize this URL when generating your card to point to your preferred password card generator or information page.', 0, 'L');
        $pdf->Ln(5);

        // Card Generation Settings
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Card Generation Settings', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        
        $settings = "Seed: " . $config->seed . "\n";
        $settings .= "Pattern: " . $config->pattern . "\n";
        $settings .= "Keyboard Layout: " . $config->keys . "\n";
        $settings .= "Spacebar Size: " . $config->spaceBarSize . "\n";
        $settings .= "Card Text: " . ($config->text ? $config->text : '(none)') . "\n";
        $settings .= "Primary Color: " . $config->primaryColor . "\n";
        $settings .= "Secondary Color: " . $config->secondaryColor . "\n";
        
        $pdf->MultiCell(0, 5, $settings, 0, 'L');
        $pdf->Ln(5);

        // Usage Instructions
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'How to Use Your Password Card', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 
            "1. Keep this card with you or in a secure location.\n\n" .
            "2. To create a password, choose a starting position on the card and follow a pattern you'll remember.\n\n" .
            "3. You can use the seed value to regenerate this exact card in the future.\n\n" .
            "4. The QR code on the card links to the watermark URL, which can help you regenerate cards or access the generator.\n\n" .
            "5. Never share your seed or pattern with others.\n\n" .
            "6. You can customize the character pattern, colors, and other settings when generating new cards.",
            0, 'L');
    }
}
