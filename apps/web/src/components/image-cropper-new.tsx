'use client';

import { CropIcon, Trash2Icon } from 'lucide-react';
import React, { type SyntheticEvent } from 'react';
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
  type PixelCrop,
} from 'react-image-crop';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import 'react-image-crop/dist/ReactCrop.css';

export type FileWithPreview = File & {
  preview: string;
};

interface ImageCropperProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: FileWithPreview | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  onCropComplete: (croppedImage: string) => void;
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

export function ImageCropper({
  dialogOpen,
  setDialogOpen,
  selectedFile,
  setSelectedFile,
  onCropComplete,
}: ImageCropperProps) {
  const aspect = 2.5 / 3; // 2.5cm width, 3cm height for member cards

  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('');

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  function onCropCompleteHandler(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    if (ctx) {
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  const handleCropSave = () => {
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      setDialogOpen(false);
    }
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setCroppedImageUrl('');
    setDialogOpen(false);
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <div className="relative cursor-pointer">
          <Avatar className="h-24 w-24 border-2 border-gray-300 border-dashed transition-colors hover:border-gray-400">
            <AvatarImage
              alt="Profile"
              className="object-cover"
              src={selectedFile?.preview}
            />
            <AvatarFallback className="bg-gray-50">
              <CropIcon className="h-8 w-8 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          {selectedFile && (
            <div className="-bottom-2 -right-2 absolute rounded-full bg-primary p-1 text-primary-foreground">
              <CropIcon className="h-3 w-3" />
            </div>
          )}
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            Crop Member Card Photo
          </DialogTitle>
          <p className="text-center text-muted-foreground text-sm">
            Adjust the crop area to fit the 2.5cm × 3cm member card dimensions
          </p>
        </DialogHeader>
        <div className="space-y-4">
          {selectedFile && (
            <div className="flex flex-col items-center space-y-4">
              <div className="max-w-md">
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
                    src={selectedFile.preview}
                  />
                </ReactCrop>
              </div>

              {croppedImageUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="font-medium text-sm">Preview:</p>
                  <div
                    className="border-2 border-gray-200 bg-white"
                    style={{
                      width: '50px', // 2.5cm scaled down
                      height: '60px', // 3cm scaled down
                      aspectRatio: '2.5/3',
                    }}
                  >
                    <img
                      alt="Cropped preview"
                      className="h-full w-full object-cover"
                      src={croppedImageUrl}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Actual size: 2.5cm × 3cm
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            className="flex items-center gap-2"
            onClick={handleDelete}
            size="sm"
            variant="destructive"
          >
            <Trash2Icon className="h-4 w-4" />
            Delete
          </Button>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="flex items-center gap-2"
              disabled={!croppedImageUrl}
              onClick={handleCropSave}
            >
              <CropIcon className="h-4 w-4" />
              Crop & Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
