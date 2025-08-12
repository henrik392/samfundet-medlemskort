'use client';

import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { type DragEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  onImageSelect: (file: File, dataUrl: string) => void;
  onClear?: () => void;
  selectedImage?: string | null;
  className?: string;
}

export function ImageUpload({
  onImageSelect,
  onClear,
  selectedImage,
  className = '',
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileSelect(imageFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <Card className={`relative ${className}`}>
      <input
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      {selectedImage ? (
        // Image Preview
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              alt="Photo preview"
              className="h-full w-full object-cover"
              src={selectedImage}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              className="h-8 w-8 p-0"
              onClick={handleClick}
              size="sm"
              variant="secondary"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              className="h-8 w-8 p-0"
              onClick={handleClear}
              size="sm"
              variant="destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <p className="text-center text-muted-foreground text-sm">
              Image ready for cropping. Click upload to change or proceed to
              crop.
            </p>
          </div>
        </div>
      ) : (
        // Upload Area
        <div
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          `}
          onClick={handleClick}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${isDragOver ? 'bg-primary/10' : 'bg-gray-100'}
            `}
            >
              {isDragOver ? (
                <Upload className="h-8 w-8 text-primary" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-2">
              <Label
                className="cursor-pointer font-medium text-lg"
                htmlFor="image-upload"
              >
                {isDragOver
                  ? 'Drop your image here'
                  : 'Upload Photo for Member Card'}
              </Label>
              <p className="text-muted-foreground text-sm">
                {isDragOver
                  ? 'Release to upload'
                  : 'Drag & drop an image here, or click to browse'}
              </p>
              <p className="text-muted-foreground text-xs">
                Supported formats: JPG, PNG, GIF (max 10MB)
              </p>
            </div>

            {!isDragOver && (
              <Button className="mt-4" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
