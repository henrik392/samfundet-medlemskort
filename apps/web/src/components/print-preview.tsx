'use client';

import jsPDF from 'jspdf';
import {
  Download,
  ExternalLink,
  Info,
  LogIn,
  MapPin,
  Plus,
  Printer,
  Scissors,
  Shield,
  Trash2,
  Upload,
  Wifi,
} from 'lucide-react';
import NextImage from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
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
  onRemoveImage?: (index: number) => void;
}

export function PrintPreview({
  croppedImages,
  onPrint,
  onAddAnother,
  onRemoveImage,
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

    printWindow.document.open();
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

  // Calculate grid layout - 8 photos per row for printing
  const photosPerRow = 8;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="font-bold text-4xl tracking-tight">Klar for utskrift</h1>
        <p className="text-lg text-muted-foreground">
          {croppedImages.length} bilde{croppedImages.length !== 1 ? 'r' : ''}{' '}
          klare for A4‑utskrift
        </p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <div className="flex flex-wrap justify-center gap-2">
            {croppedImages.map((imageSrc, index) => (
              <div className="group relative p-2" key={imageSrc}>
                <div
                  className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white shadow-sm transition-all group-hover:shadow-md"
                  style={{
                    width: '100px',
                    height: '120px',
                    aspectRatio: '2.5/3',
                  }}
                >
                  <NextImage
                    alt={`Medlemskortbilde ${index + 1}`}
                    className="object-cover"
                    fill
                    sizes="100px"
                    src={imageSrc}
                    unoptimized
                  />
                </div>
                {onRemoveImage && (
                  <button
                    className="-top-1 -right-1 absolute flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    onClick={() => onRemoveImage(index)}
                    type="button"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <p className="mt-2 text-center text-muted-foreground text-xs">
                  Bilde {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden print area for actual printing */}
      <div className="hidden">
        <div
          className="grid gap-2"
          ref={printAreaRef}
          style={{
            gridTemplateColumns: `repeat(${photosPerRow}, 1fr)`,
          }}
        >
          {croppedImages.map((imageSrc, index) => (
            <NextImage
              alt={`Medlemskortbilde ${index + 1}`}
              className="object-cover"
              height={114}
              key={`print-${imageSrc}`}
              src={imageSrc}
              style={{
                width: '25mm',
                height: '30mm',
              }}
              unoptimized
              width={95}
            />
          ))}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button
            className="min-w-[160px] shadow-md transition-shadow hover:shadow-lg"
            onClick={handleDownloadPDF}
            size="lg"
            type="button"
          >
            <Download className="mr-2 h-4 w-4" />
            Last ned PDF
          </Button>
          <Button
            className="min-w-[160px] border-2 transition-colors hover:border-primary/50"
            onClick={handlePrint}
            size="lg"
            type="button"
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" />
            Skriv ut
          </Button>
        </div>

        {/* Visual separator with scroll hint */}
        <div className="flex flex-col items-center space-y-3 pt-2">
          <div className="h-px w-16 bg-border" />
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          {onAddAnother && (
            <Button
              className="min-w-[140px]"
              onClick={onAddAnother}
              size="default"
              type="button"
              variant="secondary"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Legg til bilde
            </Button>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Info className="mr-1.5 h-3.5 w-3.5" />
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
                        <p className="font-medium">
                          Koble enheten til NTNU‑nett
                        </p>
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
                            Standard er svart‑hvitt, tosidig og stifting. Endre
                            ved behov og trykk «Skriv ut».
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
                          Får du ikke logget inn? Sjekk at du er på
                          Eduroam/kablet nett, eller aktiver NTNU VPN.
                        </li>
                        <li>
                          Jobben vises ikke i myPrint? Vent et par sekunder og
                          oppdater siden.
                        </li>
                        <li>
                          Feil utskriftsoppsett? Kontroller
                          farge/tosidig/stifting før du sender jobben.
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Scissors className="mr-1.5 h-3.5 w-3.5" />
                  Klipp og fest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto p-4 sm:max-w-lg sm:p-6 md:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neste steg etter utskrift</DialogTitle>
                  <DialogDescription>
                    Slik klipper du ut og ferdigstiller medlemskortet.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <ol className="list-decimal space-y-3 pl-5">
                    <li className="flex items-start gap-3">
                      <Scissors
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      />
                      <div>
                        <p className="font-medium">Klipp ut bildet</p>
                        <p className="text-muted-foreground text-sm">
                          Klipp nøyaktig langs kantene for å få riktig størrelse
                          (2,5×3 cm).
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-2 border-muted-foreground/40"
                      />
                      <div>
                        <p className="font-medium">Fest bildet</p>
                        <p className="text-muted-foreground text-sm">
                          Bruk transparent teip over bildet eller plastfilm fra
                          Akademika for å beskytte det.
                        </p>
                      </div>
                    </li>
                  </ol>

                  <div className="rounded-md border bg-muted/30 p-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Videoveiledning</p>
                    </div>
                    <p className="mt-2 text-muted-foreground text-sm">
                      Se hvordan du klipper ut og fester bildet riktig i denne
                      videoen:
                    </p>
                    <Button
                      asChild
                      className="mt-2"
                      size="sm"
                      variant="outline"
                    >
                      <a
                        href="https://youtu.be/Nh7hgZABbZk?si=d7iE2zU0IgRnT9A-&t=127"
                        rel="noopener"
                        target="_blank"
                      >
                        Se video (YouTube)
                      </a>
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button asChild variant="link">
                    <a
                      href="https://akademika.no"
                      rel="noopener"
                      target="_blank"
                    >
                      Akademika.no
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
