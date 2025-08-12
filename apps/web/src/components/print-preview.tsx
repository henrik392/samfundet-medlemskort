'use client';

import jsPDF from 'jspdf';
import { Download, Printer } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PrintPreviewProps {
  croppedImages: string[];
  onPrint: () => void;
  onAddAnother?: () => void;
}

export function PrintPreview({
  croppedImages,
  onPrint,
  onAddAnother,
}: PrintPreviewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Image dimensions in mm (exactly 2.5cm x 3cm)
      const imageWidth = 25; // 2.5cm
      const imageHeight = 30; // 3cm

      // Grid layout - 8 photos per row with margins
      const photosPerRow = 8;
      const marginTop = 10; // 1cm from top
      const marginLeft = 10; // 1cm from left
      const spacing = 2; // 2mm between images

      // Calculate positions
      const availableWidth = 210 - 2 * marginLeft; // A4 width minus margins
      const actualSpacingH =
        (availableWidth - photosPerRow * imageWidth) / (photosPerRow - 1);

      for (let i = 0; i < croppedImages.length; i++) {
        const row = Math.floor(i / photosPerRow);
        const col = i % photosPerRow;

        const x = marginLeft + col * (imageWidth + actualSpacingH);
        const y = marginTop + row * (imageHeight + spacing);

        // Add each image at exact dimensions
        pdf.addImage(
          croppedImages[i],
          'JPEG',
          x,
          y,
          imageWidth,
          imageHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save('samfundet-member-cards.pdf');
    } catch (_error) {
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = useCallback(() => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to enable printing');
      return;
    }

    const printContent = printAreaRef.current;
    if (!printContent) {
      printWindow.close();
      return;
    }

    // Create print HTML with exact dimensions
    const _photosPerRow = 8;

    let printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Samfundet Member Cards</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .print-container {
              width: 190mm; /* A4 width minus 20mm margins */
              display: grid;
              grid-template-columns: repeat(8, 25mm);
              grid-gap: 2mm;
              justify-content: space-between;
            }
            .photo {
              width: 25mm;  /* Exactly 2.5cm */
              height: 30mm; /* Exactly 3cm */
              object-fit: cover;
              border: 1px solid #ddd;
            }
            @media print {
              body { 
                margin: 0; 
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">`;

    // Add each image
    croppedImages.forEach((imageSrc, index) => {
      printHTML += `<img class="photo" src="${imageSrc}" alt="Member card ${index + 1}" />`;
    });

    printHTML += `
          </div>
        </body>
      </html>`;

    printWindow.document.write(printHTML);

    printWindow.document.close();

    // Wait for images to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  }, [croppedImages]);

  // Override Ctrl+P/Cmd+P to print the PDF content
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        handlePrint();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrint]);

  // Detect if user is on Mac or PC for keyboard shortcut display
  const _isMac =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

  // Calculate grid layout - 8 photos per row, multiple rows
  const photosPerRow = 8;
  const rows = Math.ceil(croppedImages.length / photosPerRow);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-xl">Ready to Print</h2>
        <p className="text-muted-foreground text-sm">
          {croppedImages.length} photo{croppedImages.length !== 1 ? 's' : ''}{' '}
          ready for A4 printing
        </p>
      </div>

      <div className="flex justify-center">
        <Card className="w-fit">
          <div
            className="relative mx-auto overflow-hidden bg-white print:border-0"
            ref={printAreaRef}
            style={{
              width: '420px', // A4 width scaled down (~50% of 210mm at 96dpi)
              height: '594px', // A4 height scaled down (~50% of 297mm at 96dpi)
              aspectRatio: '210/297',
            }}
          >
            {/* A4 Paper simulation */}
            <div className="h-full p-4">
              <div
                className="grid h-full content-start gap-2"
                style={{
                  gridTemplateColumns: `repeat(${photosPerRow}, 1fr)`,
                }}
              >
                {croppedImages.map((imageSrc, index) => (
                  <div
                    className="overflow-hidden border border-gray-200 bg-white"
                    key={index}
                    style={{
                      width: '25mm', // 2.5cm
                      height: '30mm', // 3cm
                      aspectRatio: '2.5/3',
                    }}
                  >
                    <img
                      alt={`Member card ${index + 1}`}
                      className="h-full w-full object-cover"
                      src={imageSrc}
                      style={{ imageRendering: 'crisp-edges' }}
                    />
                  </div>
                ))}
              </div>

              {/* Cutting guidelines */}
              <div className="pointer-events-none absolute inset-0 print:hidden">
                {Array.from({ length: photosPerRow + 1 }).map((_, i) => (
                  <div
                    className="absolute top-0 bottom-0 border-gray-400 border-l border-dashed opacity-30"
                    key={`vertical-${i}`}
                    style={{ left: `${(i / photosPerRow) * 100}%` }}
                  />
                ))}
                {Array.from({ length: rows + 1 }).map((_, i) => (
                  <div
                    className="absolute right-0 left-0 border-gray-400 border-t border-dashed opacity-30"
                    key={`horizontal-${i}`}
                    style={{ top: `${(i / rows) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        {onAddAnother && (
          <Button onClick={onAddAnother} size="lg" variant="outline">
            Add Another Photo
          </Button>
        )}
        <Button onClick={handleDownloadPDF} size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={handlePrint} size="lg" variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
