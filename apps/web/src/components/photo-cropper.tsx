'use client';

import { ImageIcon, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import { type FileWithPath, useDropzone } from 'react-dropzone';
import {
  type FileWithPreview,
  ImageCropper,
} from '@/components/image-cropper-new';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PhotoCropperProps {
  onCropComplete: (croppedImage: string) => void;
}

export function PhotoCropper({ onCropComplete }: PhotoCropperProps) {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const fileWithPreview: FileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        setSelectedFile(fileWithPreview);
        setIsDialogOpen(true);
      }
    },
  });

  const handleCropComplete = (croppedImage: string) => {
    onCropComplete(croppedImage);
    setCroppedImages((prev) => [...prev, croppedImage]);
    setSelectedFile(null);
  };

  const handleAddAnother = () => {
    setSelectedFile(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-lg">
          Upload Photos for Member Cards
        </h2>
        <p className="mb-4 text-muted-foreground text-sm">
          Upload photos and crop them to fit the member card dimensions (2.5cm ×
          3cm)
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <div
          {...getRootProps()}
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${isDragActive ? 'bg-primary/10' : 'bg-gray-100'}
            `}
            >
              {isDragActive ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-lg">
                {isDragActive
                  ? 'Drop your image here'
                  : 'Upload Photo for Member Card'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isDragActive
                  ? 'Release to upload'
                  : 'Drag & drop an image here, or click to browse'}
              </p>
              <p className="text-muted-foreground text-xs">
                Supported formats: JPG, PNG, GIF (max 10MB)
              </p>
            </div>

            {!isDragActive && (
              <Button className="mt-4" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Cropped Images Preview */}
      {croppedImages.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  Cropped Photos ({croppedImages.length})
                </h3>
                <p className="text-muted-foreground text-sm">
                  Photos ready for printing on member cards
                </p>
              </div>
              <Button
                className="flex items-center gap-2"
                onClick={handleAddAnother}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Add Another
              </Button>
            </div>

            <div className="grid grid-cols-6 gap-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {croppedImages.map((imageSrc, index) => (
                <div
                  className="aspect-[2.5/3] overflow-hidden rounded border-2 border-gray-200 bg-white shadow-sm"
                  key={index}
                >
                  <img
                    alt={`Cropped photo ${index + 1}`}
                    className="h-full w-full object-cover"
                    src={imageSrc}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Image Cropper Dialog */}
      <ImageCropper
        dialogOpen={isDialogOpen}
        onCropComplete={handleCropComplete}
        selectedFile={selectedFile}
        setDialogOpen={setIsDialogOpen}
        setSelectedFile={setSelectedFile}
      />
    </div>
  );
}
