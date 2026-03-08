"use client";

import { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

type ImageCropperProps = {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
};

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CroppedAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Helper function to create a cropped image from the source
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CroppedAreaPixels,
  percentCrop: Area,
  forceSvgMode: boolean = false
): Promise<string> {
  const image = await createImage(imageSrc);
  
  // For SVGs or images without natural dimensions, we need to render them first
  let sourceCanvas: HTMLCanvasElement;
  let sourceCtx: CanvasRenderingContext2D;
  let imgWidth: number;
  let imgHeight: number;

  // Check if this is an SVG or needs pre-rendering
  const isSvg = forceSvgMode || imageSrc.toLowerCase().endsWith('.svg') || imageSrc.includes('image/svg');
  const needsPreRender = isSvg || !image.naturalWidth || !image.naturalHeight;

  if (needsPreRender) {
    // SVGs need to be rendered to a canvas first with explicit dimensions
    console.log('Pre-rendering SVG/image to canvas');
    
    // Get base dimensions
    const baseWidth = image.width || image.naturalWidth || 500;
    const baseHeight = image.height || image.naturalHeight || 500;
    
    // For tiny images (like 16x16 icons), scale them up to a reasonable resolution
    // This prevents the cropped output from being too small/blurry
    const MIN_RENDER_SIZE = 800;
    let scaleFactor = 1;
    
    if (baseWidth < MIN_RENDER_SIZE && baseHeight < MIN_RENDER_SIZE) {
      scaleFactor = Math.max(MIN_RENDER_SIZE / baseWidth, MIN_RENDER_SIZE / baseHeight);
      console.log(`Scaling up small image by ${scaleFactor}x for better quality`);
    }
    
    imgWidth = baseWidth * scaleFactor;
    imgHeight = baseHeight * scaleFactor;
    
    sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = imgWidth;
    sourceCanvas.height = imgHeight;
    sourceCtx = sourceCanvas.getContext("2d")!;
    
    if (!sourceCtx) {
      throw new Error("Could not get source canvas context");
    }
    
    // Draw the full image to the source canvas at scaled size
    sourceCtx.drawImage(image, 0, 0, imgWidth, imgHeight);
  } else {
    // For regular images, use natural dimensions
    imgWidth = image.naturalWidth;
    imgHeight = image.naturalHeight;
  }

  console.log('=== CROP DEBUG ===');
  console.log('Image dimensions:', { imgWidth, imgHeight, needsPreRender });
  console.log('Raw pixel crop from react-easy-crop:', pixelCrop);
  console.log('Percent crop from react-easy-crop:', percentCrop);

  // For SVGs, we need to convert percentage crop to actual pixels
  // because pixelCrop is based on display size, not actual image size
  let actualPixelCrop: CroppedAreaPixels;
  
  if (needsPreRender) {
    // Use percentage crop and apply to actual image dimensions
    actualPixelCrop = {
      x: (percentCrop.x / 100) * imgWidth,
      y: (percentCrop.y / 100) * imgHeight,
      width: (percentCrop.width / 100) * imgWidth,
      height: (percentCrop.height / 100) * imgHeight,
    };
    console.log('Converted percent crop to actual pixels:', actualPixelCrop);
  } else {
    // Use pixel crop directly for regular images
    actualPixelCrop = pixelCrop;
  }

  // Ensure pixel crop values are valid and within image bounds
  const safePixelCrop = {
    x: Math.max(0, Math.round(actualPixelCrop.x)),
    y: Math.max(0, Math.round(actualPixelCrop.y)),
    width: Math.min(Math.round(actualPixelCrop.width), imgWidth - Math.max(0, actualPixelCrop.x)),
    height: Math.min(Math.round(actualPixelCrop.height), imgHeight - Math.max(0, actualPixelCrop.y)),
  };

  console.log('Safe pixel crop:', safePixelCrop);
  console.log('==================');

  // Ensure width and height are positive
  if (safePixelCrop.width <= 0 || safePixelCrop.height <= 0) {
    throw new Error(`Invalid crop dimensions: ${safePixelCrop.width}x${safePixelCrop.height}`);
  }

  // Create output canvas for the cropped image
  const outputCanvas = document.createElement("canvas");
  const outputCtx = outputCanvas.getContext("2d");

  if (!outputCtx) {
    throw new Error("Could not get output canvas context");
  }

  outputCanvas.width = safePixelCrop.width;
  outputCanvas.height = safePixelCrop.height;

  // Draw the cropped portion
  if (needsPreRender) {
    // Crop from the pre-rendered canvas
    const imageData = sourceCtx!.getImageData(
      safePixelCrop.x,
      safePixelCrop.y,
      safePixelCrop.width,
      safePixelCrop.height
    );
    outputCtx.putImageData(imageData, 0, 0);
  } else {
    // Crop directly from the image
    outputCtx.drawImage(
      image,
      safePixelCrop.x,
      safePixelCrop.y,
      safePixelCrop.width,
      safePixelCrop.height,
      0,
      0,
      safePixelCrop.width,
      safePixelCrop.height
    );
  }

  // Convert to data URL
  return outputCanvas.toDataURL("image/png", 1.0);
}

/**
 * Helper to create an Image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    // Only enable CORS for external URLs, not local files or data URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const urlObj = new URL(url);
        if (urlObj.origin !== window.location.origin) {
          image.crossOrigin = "anonymous";
        }
      } catch {
        // If URL parsing fails, don't set CORS
      }
    }
    
    image.addEventListener("load", () => {
      console.log('Image loaded:', {
        src: url.substring(0, 50) + '...',
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        width: image.width,
        height: image.height
      });
      
      const hasValidDimensions = 
        (image.naturalWidth > 0 && image.naturalHeight > 0) ||
        (image.width > 0 && image.height > 0);
      
      if (!hasValidDimensions) {
        reject(new Error("Image has invalid dimensions"));
      } else {
        resolve(image);
      }
    });
    
    image.addEventListener("error", (error) => {
      console.error('Image load error:', error);
      reject(new Error("Failed to load image"));
    });
    
    image.src = url;
  });
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(3);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [croppedAreaPercent, setCroppedAreaPercent] = useState<Area | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string>(imageSrc);
  const [isSvgSource, setIsSvgSource] = useState(false);

  // Pre-process images to detect dimensions properly
  useEffect(() => {
    async function processImage() {
      const isSvg = imageSrc.toLowerCase().endsWith('.svg') || imageSrc.includes('image/svg');
      
      console.log('ImageCropper initialized with:', { imageSrc, isSvg });
      setIsSvgSource(isSvg);
      
      // Handle SVG files
      if (isSvg && imageSrc.startsWith('/')) {
        try {
          const response = await fetch(imageSrc);
          const svgText = await response.text();
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');
          
          if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            console.log('SVG viewBox:', viewBox);
            
            if (viewBox) {
              const [, , width, height] = viewBox.split(' ').map(Number);
              // Add explicit width/height to the SVG
              if (width && height) {
                svgElement.setAttribute('width', width.toString());
                svgElement.setAttribute('height', height.toString());
                
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(svgElement);
                const blob = new Blob([svgString], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                
                console.log('✅ Processed SVG with explicit dimensions:', { width, height, blobUrl: url });
                setProcessedImageSrc(url);
                
                // Calculate minZoom for SVG
                const containerHeight = 384;
                const cropAspect = 4 / 3;
                const imageAspect = width / height;
                
                let calculatedMinZoom = 1;
                if (imageAspect >= cropAspect) {
                  calculatedMinZoom = containerHeight / height;
                } else {
                  const cropWidth = containerHeight * cropAspect;
                  calculatedMinZoom = cropWidth / width;
                }
                
                // Don't clamp the upper limit - small images need high zoom!
                calculatedMinZoom = Math.max(0.1, calculatedMinZoom);
                const calculatedMaxZoom = Math.max(3, calculatedMinZoom * 3);
                console.log('📐 SVG minZoom:', calculatedMinZoom, 'maxZoom:', calculatedMaxZoom);
                setMinZoom(calculatedMinZoom);
                setMaxZoom(calculatedMaxZoom);
                setZoom(calculatedMinZoom);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Failed to process SVG:', error);
        }
      }
      
      // Handle regular images (including Cloudinary URLs)
      // Load the image to get its actual dimensions
      try {
        const img = await createImage(imageSrc);
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        
        if (width > 0 && height > 0) {
          console.log('✅ Detected image dimensions:', { width, height, src: imageSrc.substring(0, 50) + '...' });
          
          // Calculate minZoom based on image dimensions
          // Container is h-96 = 384px, aspect is 4:3
          const containerHeight = 384;
          const cropAspect = 4 / 3;
          const imageAspect = width / height;
          
          // Calculate what zoom is needed to fit the image
          let calculatedMinZoom = 1;
          
          // If image is wider than crop aspect, height determines min zoom
          if (imageAspect >= cropAspect) {
            calculatedMinZoom = containerHeight / height;
          } else {
            // If image is taller, width determines min zoom
            const cropWidth = containerHeight * cropAspect;
            calculatedMinZoom = cropWidth / width;
          }
          
          // Only clamp the lower bound - small images need high zoom!
          calculatedMinZoom = Math.max(0.1, calculatedMinZoom);
          const calculatedMaxZoom = Math.max(3, calculatedMinZoom * 3);
          
          console.log('📐 Calculated minZoom:', { imageAspect, cropAspect, calculatedMinZoom, calculatedMaxZoom });
          setMinZoom(calculatedMinZoom);
          setMaxZoom(calculatedMaxZoom);
          setZoom(calculatedMinZoom);
        } else {
          console.warn('⚠️ Image loaded but has invalid dimensions, using defaults');
          setMinZoom(1);
        }
      } catch (error) {
        console.error('❌ Failed to load image for dimension detection:', error);
        setMinZoom(1);
      }
      
      console.log('Using original imageSrc');
      setProcessedImageSrc(imageSrc);
    }
    
    processImage();
  }, [imageSrc]);

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: CroppedAreaPixels) => {
      setCroppedAreaPercent(croppedArea);
      setCroppedAreaPixels(croppedAreaPixels);
      console.log('Crop area (percent):', croppedArea);
      console.log('Crop area (pixels):', croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = useCallback(async () => {
    if (!croppedAreaPixels || !croppedAreaPercent) {
      console.error("No cropped area available");
      return;
    }

    try {
      console.log("Starting crop with processedImageSrc, isSvgSource:", isSvgSource);
      const croppedImageUrl = await getCroppedImg(processedImageSrc, croppedAreaPixels, croppedAreaPercent, isSvgSource);
      console.log("Crop successful, data URL length:", croppedImageUrl.length);
      onCropComplete(croppedImageUrl);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert(`Failed to crop image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [processedImageSrc, croppedAreaPixels, croppedAreaPercent, isSvgSource, onCropComplete]);

  return (
    <div className="space-y-4">
      {/* Cropper Container */}
      <div className="relative h-96 bg-white rounded-lg overflow-hidden border-2 border-primary">
        <Cropper
          image={processedImageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteCallback}
          minZoom={minZoom}
          maxZoom={maxZoom}
          objectFit="contain"
          showGrid={false}
          restrictPosition={false}
          cropSize={{ width: 400, height: 300 }}
        />
      </div>

      {/* Zoom Control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-[#3A4A1E] font-semibold">Zoom</Label>
          <span className="text-sm text-[#5A6A3E]">{zoom.toFixed(1)}x</span>
        </div>
        <Slider
          value={[zoom]}
          onValueChange={(values) => setZoom(values[0] ?? zoom)}
          min={minZoom}
          max={maxZoom}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-[#5A6A3E]">
          <span>Zoom Out</span>
          <span>Zoom In</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="hover:bg-green-100 text-[#3A4A1E]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleApplyCrop}
          className="!bg-primary hover:!bg-secondary-foreground !text-white shadow-md"
        >
          Apply Crop
        </Button>
      </div>
    </div>
  );
}

