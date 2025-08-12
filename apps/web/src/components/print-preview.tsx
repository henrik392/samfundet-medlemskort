'use client';

import jsPDF from 'jspdf';
import {
  Download,
  Info,
  LogIn,
  MapPin,
  Plus,
  Printer,
  Shield,
  Upload,
  Wifi,
} from 'lucide-react';
import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [isTroubleshootingOpen, setIsTroubleshootingOpen] = useState(false);

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

      pdf.save('samfundet-medlemskort.pdf');
    } catch (_error) {
      alert('Kunne ikke generere PDF. Prøv igjen.');
    }
  };

  const handlePrint = useCallback(() => {
    // Åpne et nytt vindu for utskrift
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Tillat sprettoppvinduer for å skrive ut');
      return;
    }

    const printContent = printAreaRef.current;
    if (!printContent) {
      printWindow.close();
      return;
    }

    // Lag utskrifts-HTML med nøyaktige mål
    const _photosPerRow = 8;

    let printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Samfundet medlemskort</title>
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

    // Legg til hvert bilde
    croppedImages.forEach((imageSrc, index) => {
      printHTML += `<img class="photo" src="${imageSrc}" alt="Medlemskort ${index + 1}" />`;
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
      if (typeof onPrint === 'function') {
        onPrint();
      }
      printWindow.close();
    }, 1000);
  }, [croppedImages, onPrint]);

  // Overstyr Ctrl+P/Cmd+P for å skrive ut innholdet
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

  // Oppdag om brukeren er på Mac eller PC (for hurtigtaster)
  const _isMac =
    typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac');

  // Calculate grid layout - 8 photos per row, multiple rows
  const photosPerRow = 8;
  const rows = Math.ceil(croppedImages.length / photosPerRow);
  const verticalGuides = Array.from(
    { length: photosPerRow + 1 },
    (_, k) => (k / photosPerRow) * 100
  );
  const horizontalGuides = Array.from(
    { length: rows + 1 },
    (_, k) => (k / rows) * 100
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-xl">Klar for utskrift</h2>
        <p className="text-muted-foreground text-sm">
          {croppedImages.length} bilde{croppedImages.length !== 1 ? 'r' : ''}{' '}
          klare for A4‑utskrift
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
            {/* A4‑papir-simulering */}
            <div className="h-full p-4">
              <div
                className="grid h-full content-start gap-2"
                style={{
                  gridTemplateColumns: `repeat(${photosPerRow}, 1fr)`,
                }}
              >
                {croppedImages.map((imageSrc) => (
                  <div
                    className="overflow-hidden border border-gray-200 bg-white"
                    key={imageSrc}
                    style={{
                      width: '25mm', // 2.5cm
                      height: '30mm', // 3cm
                      aspectRatio: '2.5/3',
                    }}
                  >
                    <div className="relative h-full w-full">
                      <NextImage
                        alt="Medlemskortbilde"
                        className="object-cover"
                        fill
                        sizes="25mm"
                        src={imageSrc}
                        unoptimized
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skjærelinjer */}
              <div className="pointer-events-none absolute inset-0 print:hidden">
                {verticalGuides.map((leftPct) => (
                  <div
                    className="absolute top-0 bottom-0 border-gray-400 border-l border-dashed opacity-30"
                    key={`vertical-${leftPct}`}
                    style={{ left: `${leftPct}%` }}
                  />
                ))}
                {horizontalGuides.map((topPct) => (
                  <div
                    className="absolute right-0 left-0 border-gray-400 border-t border-dashed opacity-30"
                    key={`horizontal-${topPct}`}
                    style={{ top: `${topPct}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {onAddAnother && (
          <Button
            onClick={onAddAnother}
            size="lg"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1 h-4 w-4" />
            Legg til bilde
          </Button>
        )}
        <Button onClick={handleDownloadPDF} size="lg" type="button">
          <Download className="mr-1 h-4 w-4" />
          Last ned PDF
        </Button>
        <Button onClick={handlePrint} size="lg" type="button" variant="outline">
          <Printer className="mr-1 h-4 w-4" />
          Skriv ut
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" type="button" variant="ghost">
              <Info className="mr-1 h-4 w-4" />
              NTNU‑utskriftsguide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto p-4 sm:max-w-lg sm:p-6 md:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Skriv ut på NTNU‑skrivere (myPrint)</DialogTitle>
              <DialogDescription>
                Kort veiledning for å skrive ut via myPrint.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <ol className="list-decimal space-y-3 pl-5">
                <li className="flex items-start gap-3">
                  <Wifi
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium">Koble enheten til NTNU‑nett</p>
                    <p className="text-muted-foreground text-sm">
                      Bruk Eduroam, kablet nett, eller NTNU VPN{' '}
                      <Shield
                        aria-hidden="true"
                        className="ml-1 inline h-3.5 w-3.5 align-[-2px]"
                      />
                      .
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <LogIn
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium">Åpne myPrint og logg inn</p>
                    <p className="text-muted-foreground text-sm">
                      Gå til{' '}
                      <a
                        className="underline"
                        href="https://myprint.ntnu.no"
                        rel="noopener"
                        target="_blank"
                      >
                        myprint.ntnu.no
                      </a>{' '}
                      og logg inn med NTNU‑bruker.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Upload
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium">Last opp dokumentet</p>
                    <p className="text-muted-foreground text-sm">
                      Velg «Bla gjennom» og last opp PDF‑en du nettopp lagde
                      (bruk «Last ned PDF» her hvis du ikke har den).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Printer
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium">
                      Velg innstillinger og skriv ut
                    </p>
                    <div className="text-muted-foreground text-sm">
                      <p>
                        Standard er svart‑hvitt, tosidig og stifting. Endre ved
                        behov og trykk «Skriv ut».
                      </p>
                      <p className="mt-2">
                        <MapPin
                          aria-hidden="true"
                          className="mr-1 inline h-3.5 w-3.5 align-[-2px]"
                        />
                        Finn skrivere i{' '}
                        <a
                          className="underline"
                          href="https://use.mazemap.com"
                          rel="noopener"
                          target="_blank"
                        >
                          MazeMap
                        </a>
                        . På skriveren kan du autentisere med studentkort på
                        kortleseren, eller logge inn med Feide‑bruker på
                        panelet. Velg «Utskriftsjobber» (Ricoh:
                        «Follow‑you‑printing») og skriv ut dokumentet.
                      </p>
                    </div>
                  </div>
                </li>
              </ol>

              {/* Feilsøking (shadcn-stil kollaps) */}
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Feilsøking</p>
                  <Button
                    aria-controls="ntnu-troubleshooting"
                    aria-expanded={isTroubleshootingOpen}
                    onClick={() => setIsTroubleshootingOpen((v) => !v)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    {isTroubleshootingOpen ? 'Skjul' : 'Vis'}
                  </Button>
                </div>
                {isTroubleshootingOpen && (
                  <ul
                    className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground text-sm"
                    id="ntnu-troubleshooting"
                  >
                    <li>
                      Får du ikke logget inn? Sjekk at du er på Eduroam/kablet
                      nett, eller aktiver NTNU VPN.
                    </li>
                    <li>
                      Jobben vises ikke i myPrint? Vent et par sekunder og
                      oppdater siden.
                    </li>
                    <li>
                      Feil utskriftsoppsett? Kontroller farge/tosidig/stifting
                      før du sender jobben.
                    </li>
                    <li>
                      Formatproblemer? Last ned og last opp PDF i stedet for
                      andre filtyper.
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button asChild variant="link">
                <a
                  href="https://myprint.ntnu.no"
                  rel="noopener"
                  target="_blank"
                >
                  Åpne myprint.ntnu.no
                </a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
