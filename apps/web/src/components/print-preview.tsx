'use client';

import html2canvas from 'html2canvas';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PrintPreviewProps {
  croppedImages: string[];
  onPrint: () => void;
}

export function PrintPreview({ croppedImages, onPrint }: PrintPreviewProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!printAreaRef.current) {
      return;
    }

    try {
      const canvas = await html2canvas(printAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: 'white',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });

      const link = document.createElement('a');
      link.download = 'samfundet-member-cards.png';
      link.href = canvas.toDataURL();
      link.click();

      window.print();
      onPrint();
    } catch (_error) {
      // Handle print error silently
    }
  };

  // Calculate grid layout - 8 photos per row, multiple rows
  const photosPerRow = 8;
  const rows = Math.ceil(croppedImages.length / photosPerRow);

  return (
    <Card className="mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-lg">Print Preview</h2>
          <p className="text-muted-foreground text-sm">
            Preview of how your member card photos will appear on A4 paper
            <br />
            Each photo is sized for 2.5cm × 3cm when printed
          </p>
        </div>

        <div
          className="relative mx-auto overflow-hidden border-2 border-gray-300 bg-white print:border-0"
          ref={printAreaRef}
          style={{
            width: '210mm', // A4 width
            height: '297mm', // A4 height
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

        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={croppedImages.length === 0}
            onClick={handlePrint}
          >
            Print A4 Sheet ({croppedImages.length} photos)
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            Browser Print
          </Button>
        </div>

        {croppedImages.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            No photos to print. Crop some photos first!
          </p>
        )}
      </div>
    </Card>
  );
}
