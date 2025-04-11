'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon } from './icons';
import { X as XIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
  className?: string;
}

export function ImageUpload({ onImageUploaded, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      if (onImageUploaded) {
        onImageUploaded(data.url);
      }
    } catch (error) {
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative rounded-md overflow-hidden">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-auto max-h-56 object-contain bg-secondary/20"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-1.5"
            onClick={clearImage}
          >
            <XIcon size={16} />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2 w-full"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <ImageIcon size={16} />
              <span>Upload Image</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
