'use client';

import { ImageIcon, Upload } from 'lucide-react';
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
  const aspect = 2.5 / 3; // 2.5cm width, 3cm height for member cards

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('');
  const [previewUrl, setPreviewUrl] = React.useState<string>('');

  // Set up preview URL when selectedFile changes
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
    onDrop: (acceptedFiles: FileWithPath[]) => {
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

  // Simple upload view
  if (showSimpleUpload) {
    return (
      <div className="w-full max-w-2xl space-y-4">
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-3xl">Member Card Photos</h1>
          <p className="text-muted-foreground">
            Drop your photo to get started
          </p>
        </div>

        <Card>
          <div
            {...getRootProps()}
            className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-6 text-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full ${
                  isDragActive ? 'bg-primary/10' : 'bg-gray-100'
                }`}
              >
                {isDragActive ? (
                  <Upload className="h-10 w-10 text-primary" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-xl">
                  {isDragActive
                    ? 'Drop your photo here'
                    : 'Drag & drop your photo'}
                </h3>
                <p className="text-muted-foreground">
                  or click to browse your files
                </p>
              </div>

              {!isDragActive && (
                <Button size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Photo
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Crop view
  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-bold text-2xl">Crop Your Photo</h2>
        <p className="text-muted-foreground">
          Adjust the crop area to fit member card size
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
              <img
                alt="Crop preview"
                className="max-h-96 w-auto"
                onLoad={onImageLoad}
                ref={imgRef}
                src={previewUrl}
              />
            </ReactCrop>
          </div>

          {croppedImageUrl && (
            <div className="flex flex-col items-center space-y-3">
              <p className="font-medium">Preview (2.5cm × 3cm):</p>
              <div
                className="border-2 border-gray-200 bg-white shadow-sm"
                style={{
                  width: '60px',
                  height: '72px',
                  aspectRatio: '2.5/3',
                }}
              >
                <img
                  alt="Cropped preview"
                  className="h-full w-full object-cover"
                  src={croppedImageUrl}
                />
              </div>
            </div>
          )}

          <Button
            disabled={!croppedImageUrl}
            onClick={handleCropSave}
            size="lg"
          >
            Save & Continue
          </Button>
        </div>
      )}
    </div>
  );
}
