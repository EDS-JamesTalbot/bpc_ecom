"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export function ImageUploader({ value, onChange, label = "Product Image" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 1. Get signed upload parameters from our API
      const signResponse = await fetch('/api/upload', {
        method: 'POST',
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, folder, cloudName, apiKey } = await signResponse.json();

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', folder);
      formData.append('api_key', apiKey);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      
      // 3. Return the secure URL
      onChange(uploadData.secure_url);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[#0c4a6e] font-semibold">{label}</Label>
      
      {/* Upload Button */}
      {!value && (
        <div className="border-2 border-dashed border-[#1DA1F9] rounded-lg p-8 text-center bg-white hover:bg-[#e0f2fe]/30 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label 
            htmlFor="image-upload" 
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            {isUploading ? (
              <Loader2 className="h-12 w-12 text-[#1DA1F9] animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-[#1DA1F9]" />
            )}
            <div>
              <p className="text-[#0c4a6e] font-semibold">
                {isUploading ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="text-sm text-[#64748b] mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="relative h-48 bg-white rounded-lg overflow-hidden border-2 border-[#1DA1F9]">
            <Image
              src={value}
              alt="Product preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            onClick={handleRemove}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-sm text-red-600 font-medium">{uploadError}</p>
      )}

      {/* Manual URL Input (Fallback) */}
      {!value && !isUploading && (
        <div className="pt-2">
          <p className="text-xs text-[#64748b] text-center mb-2">Or paste image URL:</p>
          <input
            type="url"
            value=""
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border-2 border-[#1DA1F9] rounded-lg focus:border-[#0c4a6e] focus:outline-none focus:ring-2 focus:ring-[#1DA1F9]/20 bg-white text-[#0c4a6e]"
          />
        </div>
      )}
    </div>
  );
}

