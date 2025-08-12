'use client';

import { ImageIcon, Upload } from 'lucide-react';
import NextImage from 'next/image';
import React, { type SyntheticEvent } from 'react';
import { type FileWithPath, useDropzone } from 'react-dropzone';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  type PixelCrop,
} from 'react-image-crop';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import 'react-image-crop/dist/ReactCrop.css';

interface PhotoCropperProps {
  onCropComplete?: (croppedImage: string) => void;
  onFileSelected?: (file: File) => void;
  selectedFile?: File | null;
  showSimpleUpload?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 50,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function PhotoCropper({
  onCropComplete,
  onFileSelected,
  selectedFile,
  showSimpleUpload = false,
}: PhotoCropperProps) {
  const aspect = 2.5 / 3; // 2,5 cm bredde, 3 cm høyde for medlemskort
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('');
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  // Sett opp forhåndsvisnings-URL når valgt fil endres
  React.useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    multiple: false,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      // Only process the first file, ensuring single file upload
      if (acceptedFiles.length > 0 && onFileSelected) {
        onFileSelected(acceptedFiles[0]);
      }
    },
  });

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function onCropCompleteHandler(pixelCrop: PixelCrop) {
    if (imgRef.current && pixelCrop.width && pixelCrop.height) {
      const croppedImage = getCroppedImg(imgRef.current, pixelCrop);
      setCroppedImageUrl(croppedImage);
    }
  }

  function getCroppedImg(
    image: HTMLImageElement,
    pixelCrop: PixelCrop
  ): string {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = pixelCrop.width * pixelRatio * scaleX;
    canvas.height = pixelCrop.height * pixelRatio * scaleY;

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY
      );
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  const handleCropSave = () => {
    if (croppedImageUrl && onCropComplete) {
      onCropComplete(croppedImageUrl);
    }
  };

  const handleRemoveImage = () => {
    // Reset all state and go back to upload stage
    setCrop(undefined);
    setCroppedImageUrl('');
    setPreviewUrl('');

    // Notify parent component to clear the selected file
    if (onFileSelected) {
      onFileSelected(undefined as unknown as File);
    }
  };

  // Enkel opplastingsvisning
  if (showSimpleUpload) {
    return (
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="font-bold text-4xl tracking-tight">
            Medlemskortbilder
          </h1>
          <p className="text-lg text-muted-foreground">
            Velg et bilde som tydelig viser ansiktet ditt
          </p>
        </div>

        <Card className="border-none py-0">
          <div
            {...getRootProps()}
            className={`flex h-full min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-8 text-center">
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-full ${
                  isDragActive ? 'bg-primary/10' : 'bg-gray-100'
                }`}
              >
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>

              <div className="space-y-4">
                <h2 className="font-semibold text-2xl">
                  {isDragActive
                    ? 'Slipp bildet ditt her'
                    : 'Dra og slipp bildet ditt'}
                </h2>
                <p className="text-base text-muted-foreground">
                  eller klikk for å bla gjennom filene dine
                </p>
              </div>

              {!isDragActive && (
                <Button size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Velg bilde
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Beskjæringsvisning
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="space-y-3 text-center">
        <h1 className="font-bold text-4xl tracking-tight">
          Beskjær bildet ditt
        </h1>
        <p className="text-lg text-muted-foreground">
          Juster beskjæringsområdet til medlemskortstørrelse
        </p>
      </div>

      {selectedFile && previewUrl && (
        <div className="flex flex-col items-center space-y-6">
          <div className="max-w-2xl">
            <ReactCrop
              aspect={aspect}
              className="max-h-96"
              crop={crop}
              minHeight={50}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => onCropCompleteHandler(c)}
            >
              {/* biome-ignore lint: react-image-crop requires a plain <img> with onLoad */}
              <img
                alt="Forhåndsvisning av beskjæring"
                className="max-h-96 w-auto"
                onLoad={onImageLoad}
                ref={imgRef}
                src={previewUrl}
              />
            </ReactCrop>
          </div>

          {croppedImageUrl && (
            <div className="flex flex-col items-center space-y-3">
              <p className="font-medium">Forhåndsvisning (2,5 cm × 3 cm):</p>
              <div
                className="relative border-2 border-gray-200 bg-white shadow-sm"
                style={{
                  width: '60px',
                  height: '72px',
                  aspectRatio: '2.5/3',
                }}
              >
                <NextImage
                  alt="Forhåndsvisning av utsnitt"
                  className="object-cover"
                  fill
                  sizes="60px"
                  src={croppedImageUrl}
                  unoptimized
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleRemoveImage} size="lg" variant="outline">
              <ImageIcon className="mr-2 h-4 w-4" />
              Velg annet bilde
            </Button>
            <Button
              disabled={!croppedImageUrl}
              onClick={handleCropSave}
              size="lg"
            >
              Lagre og fortsett
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
