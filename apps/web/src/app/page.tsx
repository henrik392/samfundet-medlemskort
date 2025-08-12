'use client';

import { useState } from 'react';
import { PhotoCropper } from '@/components/photo-cropper';
import { PrintPreview } from '@/components/print-preview';

type AppState = 'upload' | 'crop' | 'print';

export default function Home() {
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setCurrentState('crop');
  };

  const handleCropComplete = (croppedImage: string) => {
    setCroppedImages((prev) => [...prev, croppedImage]);
    setSelectedFile(null);
    setCurrentState('print');
  };

  const handleAddAnother = () => {
    setCurrentState('upload');
  };

  const handlePrint = () => {
    // Print completed - could reset or stay on print view
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className={`flex ${currentState === 'print' ? 'justify-center' : 'min-h-[calc(100vh-7rem)] items-center justify-center'}`}>
        {currentState === 'upload' && (
          <PhotoCropper
            onFileSelected={handleFileSelected}
            showSimpleUpload={true}
          />
        )}

        {currentState === 'crop' && selectedFile && (
          <PhotoCropper
            onCropComplete={handleCropComplete}
            selectedFile={selectedFile}
            showSimpleUpload={false}
          />
        )}

        {currentState === 'print' && croppedImages.length > 0 && (
          <PrintPreview
            croppedImages={croppedImages}
            onAddAnother={handleAddAnother}
            onPrint={handlePrint}
          />
        )}
      </div>
    </main>
  );
}
