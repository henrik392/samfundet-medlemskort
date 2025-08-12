'use client';

import { useState } from 'react';
import { PhotoCropper } from '@/components/photo-cropper';
import { PrintPreview } from '@/components/print-preview';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'crop' | 'preview'>('crop');

  const handleCropComplete = (croppedImage: string) => {
    setCroppedImages((prev) => [...prev, croppedImage]);
  };

  const handleClearAll = () => {
    setCroppedImages([]);
    setCurrentView('crop');
  };

  const handlePrint = () => {
    // Print completed
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="font-bold text-4xl tracking-tight lg:text-6xl">
              Samfundet
              <span className="text-primary"> Member Card</span> Photos
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl leading-relaxed">
              Crop your photos to the perfect size for Samfundet member cards.
              Upload, crop to 2.5cm × 3cm, and print on A4 paper.
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => setCurrentView('crop')}
              size="lg"
              variant={currentView === 'crop' ? 'default' : 'outline'}
            >
              Crop Photos ({croppedImages.length})
            </Button>
            <Button
              disabled={croppedImages.length === 0}
              onClick={() => setCurrentView('preview')}
              size="lg"
              variant={currentView === 'preview' ? 'default' : 'outline'}
            >
              Print Preview
            </Button>
            {croppedImages.length > 0 && (
              <Button onClick={handleClearAll} size="lg" variant="destructive">
                Clear All
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12 lg:px-6">
        {currentView === 'crop' ? (
          <PhotoCropper onCropComplete={handleCropComplete} />
        ) : (
          <PrintPreview croppedImages={croppedImages} onPrint={handlePrint} />
        )}
      </section>

      {/* Instructions */}
      <section className="container mx-auto bg-muted/30 px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 space-y-4 text-center">
            <h2 className="font-bold text-2xl tracking-tight lg:text-3xl">
              How to use
            </h2>
            <p className="text-muted-foreground">
              Follow these simple steps to create perfect member card photos
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="font-bold text-primary">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-lg">Upload Photo</h3>
              <p className="text-muted-foreground text-sm">
                Choose a clear photo of your face from your device
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="font-bold text-primary">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-lg">Crop to Size</h3>
              <p className="text-muted-foreground text-sm">
                Adjust the crop area to fit the 2.5cm × 3cm member card
                dimensions
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="font-bold text-primary">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-lg">Print on A4</h3>
              <p className="text-muted-foreground text-sm">
                Preview and print multiple photos perfectly sized on A4 paper
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
