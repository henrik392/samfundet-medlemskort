'use client';

import { useCallback, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface PhotoCropperProps {
  onCropComplete: (croppedImage: string) => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }
    });
  });
};

export function PhotoCropper({ onCropComplete }: PhotoCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteCallback = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleImageSelect = (file: File, dataUrl: string) => {
    setImageSrc(dataUrl);
    // Reset crop settings when new image is selected
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCrop = async () => {
    if (!(imageSrc && croppedAreaPixels)) {
      return;
    }

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (_e) {
      // Handle crop error silently
    }
  };

  const handleClear = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {!imageSrc && (
        <div>
          <h2 className="mb-2 font-semibold text-lg">
            Upload Photo for Member Card
          </h2>
          <p className="mb-4 text-muted-foreground text-sm">
            Upload a photo and crop it to fit the member card dimensions (2.5cm
            × 3cm)
          </p>
          <ImageUpload
            onClear={handleClear}
            onImageSelect={handleImageSelect}
            selectedImage={imageSrc}
          />
        </div>
      )}

      {imageSrc && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Crop Your Photo</h2>
                <p className="text-muted-foreground text-sm">
                  Adjust the crop area to fit the member card dimensions
                </p>
              </div>
              <Button onClick={handleClear} size="sm" variant="outline">
                Choose Different Photo
              </Button>
            </div>

            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-100">
              <Cropper
                aspect={2.5 / 3}
                crop={crop}
                cropShape="rect"
                image={imageSrc}
                onCropChange={setCrop}
                onCropComplete={onCropCompleteCallback}
                onZoomChange={setZoom}
                showGrid={true}
                zoom={zoom}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-medium text-sm" htmlFor="zoom-slider">
                  Zoom: {Math.round(zoom * 100)}%
                </Label>
                <input
                  className="mt-1 w-full"
                  id="zoom-slider"
                  max={3}
                  min={1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  step={0.1}
                  type="range"
                  value={zoom}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={!croppedAreaPixels}
                  onClick={handleCrop}
                >
                  Crop Photo & Add to Collection
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
