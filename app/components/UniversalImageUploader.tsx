"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Link as LinkIcon, Cloud, Database, HardDrive, FolderSearch } from 'lucide-react';
import { useTenantSlug } from '@/app/hooks/useTenantSlug';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type UniversalImageUploaderProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

type CloudinaryImage = {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  format: string;
};

export function UniversalImageUploader({ 
  value, 
  onChange, 
  label = "Product Image" 
}: UniversalImageUploaderProps) {
  const tenantSlug = useTenantSlug();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [cloudinaryImages, setCloudinaryImages] = useState<CloudinaryImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [hasLoadedImages, setHasLoadedImages] = useState(false);
  const fileInputCloudinaryRef = useRef<HTMLInputElement>(null);
  const fileInputLocalRef = useRef<HTMLInputElement>(null);
  const fileInputDataUrlRef = useRef<HTMLInputElement>(null);

  // Handle Cloudinary upload
  const handleCloudinaryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get signed upload parameters (pass tenant for tenant-specific Cloudinary)
      const headers: Record<string, string> = {};
      if (tenantSlug) headers['X-Tenant-Slug'] = tenantSlug;
      const signResponse = await fetch('/api/upload', {
        method: 'POST',
        headers,
      });

      if (!signResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, timestamp, folder, cloudName, apiKey } = await signResponse.json();

      // Upload to Cloudinary
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
        const errorData = await uploadResponse.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Failed to upload to Cloudinary';
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      onChange(uploadData.secure_url);
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputCloudinaryRef.current) {
        fileInputCloudinaryRef.current.value = '';
      }
    }
  };

  // Handle local server upload
  const handleLocalUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-local', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { url } = await response.json();
      onChange(url);
    } catch (error) {
      console.error('Local upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputLocalRef.current) {
        fileInputLocalRef.current.value = '';
      }
    }
  };

  // Handle data URL (base64) conversion
  const handleDataUrlConversion = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Recommend smaller file size for base64 (2MB limit to account for 33% base64 expansion)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('For base64 embedding, please use images under 2MB (current: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onChange(dataUrl);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Data URL conversion error:', error);
      setUploadError(error instanceof Error ? error.message : 'Conversion failed');
      setIsUploading(false);
    } finally {
      if (fileInputDataUrlRef.current) {
        fileInputDataUrlRef.current.value = '';
      }
    }
  };

  // Handle manual URL input
  const handleManualUrl = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl('');
      setUploadError(null);
    }
  };

  // Handle remove image
  const handleRemove = () => {
    onChange('');
    setManualUrl('');
    setUploadError(null);
  };

  // Fetch Cloudinary images
  const fetchCloudinaryImages = async () => {
    if (hasLoadedImages) return; // Already loaded
    
    setIsLoadingImages(true);
    setUploadError(null);
    
    try {
      const headers: Record<string, string> = {};
      if (tenantSlug) headers['X-Tenant-Slug'] = tenantSlug;
      const response = await fetch('/api/cloudinary-images', { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data = await response.json();
      setCloudinaryImages(data.images);
      setHasLoadedImages(true);
    } catch (error) {
      console.error('Error fetching Cloudinary images:', error);
      setUploadError('Failed to load Cloudinary images. Please try again.');
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Handle selecting a Cloudinary image
  const handleSelectCloudinaryImage = (imageUrl: string) => {
    onChange(imageUrl);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[#0c4a6e] font-semibold">{label}</Label>
      
      {/* Show image preview if exists */}
      {value && (
        <div className="space-y-2 mb-4">
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
            variant="outline"
            className="w-full border-[#1DA1F9] text-[#1DA1F9] hover:bg-[#1DA1F9] hover:text-white"
            type="button"
          >
            <X className="h-4 w-4 mr-2" />
            Change Image
          </Button>
        </div>
      )}

      {/* Upload tabs - only show if no image */}
      {!value && (
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="url" className="gap-1">
              <LinkIcon className="h-3 w-3" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-1">
              <FolderSearch className="h-3 w-3" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="cloudinary" className="gap-1">
              <Cloud className="h-3 w-3" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="local" className="gap-1">
              <HardDrive className="h-3 w-3" />
              <span className="hidden sm:inline">Server</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-1">
              <Database className="h-3 w-3" />
              <span className="hidden sm:inline">Embed</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Paste any URL */}
          <TabsContent value="url" className="space-y-3 pt-4">
            <div>
              <Label className="text-sm text-[#0c4a6e]">Paste Image URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white border-2 border-[#1DA1F9] focus:border-[#0c4a6e] focus:ring-[#1DA1F9]/20"
                />
                <Button 
                  onClick={handleManualUrl} 
                  disabled={!manualUrl.trim()}
                  className="!bg-[#1DA1F9] !text-white hover:!bg-[#0c4a6e] hover:!text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#64748b]">
              Works with any image URL from Cloudinary, Unsplash, Imgur, or any website
            </p>
          </TabsContent>

          {/* Tab 2: Browse Cloudinary Library */}
          <TabsContent value="browse" className="space-y-3 pt-4">
            {!hasLoadedImages ? (
              <div className="border-2 border-dashed border-[#1DA1F9] rounded-lg p-6 text-center bg-white">
                <Button
                  onClick={fetchCloudinaryImages}
                  type="button"
                  disabled={isLoadingImages}
                  className="bg-[#1DA1F9] hover:bg-[#0c4a6e] text-white gap-2"
                >
                  {isLoadingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading Images...
                    </>
                  ) : (
                    <>
                      <FolderSearch className="h-4 w-4" />
                      Browse Cloudinary Images
                    </>
                  )}
                </Button>
                <p className="text-xs text-[#64748b] mt-2">
                  Load your existing Cloudinary images
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#0c4a6e]">
                    Select an image ({cloudinaryImages.length} available)
                  </p>
                  <Button
                    onClick={() => {
                      setHasLoadedImages(false);
                      setCloudinaryImages([]);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Refresh
                  </Button>
                </div>
                
                <div className="border-2 border-[#1DA1F9] rounded-lg p-4 bg-white max-h-[400px] overflow-y-auto">
                  {cloudinaryImages.length === 0 ? (
                    <p className="text-sm text-[#64748b] text-center py-8">
                      No images found in your Cloudinary account
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {cloudinaryImages.map((img) => (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => handleSelectCloudinaryImage(img.url)}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#1DA1F9] transition-all group cursor-pointer"
                        >
                          <Image
                            src={img.thumbnail}
                            alt={img.id}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 150px"
                          />
                          <div className="absolute inset-0 bg-transparent group-hover:bg-[#1DA1F9]/60 transition-all flex items-center justify-center">
                            <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100">
                              Select
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-[#64748b]">
                  Click an image to select it
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Upload to Cloudinary */}
          <TabsContent value="cloudinary" className="space-y-3 pt-4">
            <div className="border-2 border-dashed border-[#1DA1F9] rounded-lg p-6 text-center bg-white hover:bg-[#e0f2fe]/30 transition-colors">
              <input
                ref={fileInputCloudinaryRef}
                type="file"
                accept="image/*"
                onChange={handleCloudinaryUpload}
                className="hidden"
                id="cloudinary-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="cloudinary-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-[#1DA1F9] animate-spin" />
                ) : (
                  <Cloud className="h-10 w-10 text-[#1DA1F9]" />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0c4a6e]">
                    {isUploading ? 'Uploading to Cloudinary...' : 'Click to browse your computer'}
                  </p>
                  <p className="text-xs text-[#64748b] mt-1">
                    Upload to Cloudinary CDN (up to 10MB)
                  </p>
                </div>
              </label>
            </div>
            <p className="text-xs text-[#64748b]">
              Fast global delivery with automatic optimization
            </p>
          </TabsContent>

          {/* Tab 4: Upload to local server */}
          <TabsContent value="local" className="space-y-3 pt-4">
            <div className="border-2 border-dashed border-[#1DA1F9] rounded-lg p-6 text-center bg-white hover:bg-[#e0f2fe]/30 transition-colors">
              <input
                ref={fileInputLocalRef}
                type="file"
                accept="image/*"
                onChange={handleLocalUpload}
                className="hidden"
                id="local-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="local-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-[#1DA1F9] animate-spin" />
                ) : (
                  <HardDrive className="h-10 w-10 text-[#1DA1F9]" />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0c4a6e]">
                    {isUploading ? 'Uploading to server...' : 'Click to browse your computer'}
                  </p>
                  <p className="text-xs text-[#64748b] mt-1">
                    Store on your server (up to 10MB)
                  </p>
                </div>
              </label>
            </div>
            <p className="text-xs text-[#64748b]">
              Stored in your server's /uploads folder
            </p>
          </TabsContent>

          {/* Tab 5: Convert to base64 */}
          <TabsContent value="embed" className="space-y-3 pt-4">
            <div className="border-2 border-dashed border-[#1DA1F9] rounded-lg p-6 text-center bg-white hover:bg-[#e0f2fe]/30 transition-colors">
              <input
                ref={fileInputDataUrlRef}
                type="file"
                accept="image/*"
                onChange={handleDataUrlConversion}
                className="hidden"
                id="dataurl-upload"
                disabled={isUploading}
              />
              <label 
                htmlFor="dataurl-upload" 
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-10 w-10 text-[#1DA1F9] animate-spin" />
                ) : (
                  <Database className="h-10 w-10 text-[#1DA1F9]" />
                )}
                <div>
                  <p className="text-sm font-semibold text-[#0c4a6e]">
                    {isUploading ? 'Processing...' : 'Click to browse your computer'}
                  </p>
                  <p className="text-xs text-[#64748b] mt-1">
                    Embed in database (up to 2MB)
                  </p>
                </div>
              </label>
            </div>
            <p className="text-xs text-[#64748b]">
              No upload needed - image stored directly in database
            </p>
          </TabsContent>
        </Tabs>
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-sm text-red-600 font-medium">{uploadError}</p>
      )}
    </div>
  );
}
