<?php

namespace raphiz\passwordcards;

class PDFRenderer
{
    private static function getQRCodeStyle()
    {
        return array(
            'border' => false,
            'vpadding' => 0,
            'hpadding' => 0,
            'fgcolor' => array(0,0,0),
            'bgcolor' => false,
            'module_width' => 1,
            'module_height' => 1
        );
    }

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

        // Add QR code only on the left panel (front card) pointing to watermark URL
        if ($config && !empty($config->watermarkUrl)) {
            // Place QR code in top-right corner of front card (left panel)
            $pdf->write2DBarcode($config->watermarkUrl, 'QRCODE,L', 82, 17, 12, 12, self::getQRCodeStyle(), 'N');
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

        // Deterministic Generation Section
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Deterministic Card Generation', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 
            "This card was generated using deterministic generation. This means that using the same parameters below, you can regenerate this EXACT card at any time.\n\n" .
            "IMPORTANT: Save these parameters in a secure location. If you lose your card, you can recreate it using these exact settings.",
            0, 'L');
        $pdf->Ln(3);

        // Card Generation Settings
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Card Generation Settings', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        
        $settings = "Seed: " . $config->seed . "\n";
        $settings .= "Hash Algorithm: " . strtoupper($config->hashAlgorithm) . " (CRITICAL for string seed recovery)\n";
        $settings .= "Pattern: " . $config->pattern . "\n";
        $settings .= "Keyboard Layout: " . $config->keys . "\n";
        $settings .= "Spacebar Size: " . $config->spaceBarSize . "\n";
        $settings .= "Card Text: " . ($config->text ? $config->text : '(none)') . "\n";
        $settings .= "Primary Color: " . $config->primaryColor . "\n";
        $settings .= "Secondary Color: " . $config->secondaryColor . "\n";
        $settings .= "Watermark URL: " . $config->watermarkUrl . "\n";
        
        $pdf->MultiCell(0, 5, $settings, 0, 'L');
        $pdf->Ln(3);

        // Loss Recovery Instructions
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Card Loss Recovery Process', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 
            "If you lose your physical card:\n\n" .
            "1. Access the password card generator at the watermark URL shown below\n" .
            "2. Enter your seed value (" . $config->seed . ") in the seed field\n" .
            "3. Select the hash algorithm (" . strtoupper($config->hashAlgorithm) . ") from the dropdown\n" .
            "4. Configure all other settings exactly as shown in the 'Card Generation Settings' section above\n" .
            "5. Generate the PDF - your card will be identical to this one\n\n" .
            "CRITICAL: If you used a string seed, you MUST select the correct hash algorithm. The hash algorithm converts your string seed into a number, and different algorithms produce different cards. Same seed + same algorithm + same parameters = identical card.",
            0, 'L');
        $pdf->Ln(3);

        // Watermark URL section
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'Watermark URL', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 'Generator URL: ' . $config->watermarkUrl . "\n\nThis URL is displayed on your card and embedded in the QR code on the left panel. Scan the QR code with your phone to quickly access the generator.", 0, 'L');
        $pdf->Ln(3);

        // Usage Instructions
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, 'How to Use Your Password Card', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->MultiCell(0, 5, 
            "1. Keep this card with you or in a secure location.\n\n" .
            "2. To create a password, choose a starting position on the card and follow a pattern you will remember.\n\n" .
            "3. Never share your seed, pattern, or starting positions with others.\n\n" .
            "4. Store a copy of this documentation page securely (separate from the card) to enable card recovery.\n\n" .
            "5. The QR code on the left panel links to the generator for easy access.",
            0, 'L');
    }
}
