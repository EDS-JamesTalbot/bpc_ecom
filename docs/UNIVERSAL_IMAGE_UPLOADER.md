# Universal Image Uploader - Documentation

## 🎉 Overview

The **UniversalImageUploader** component provides flexible image management with **4 different sources**:

1. **Any URL** - Paste any image URL from any website
2. **Cloudinary CDN** - Upload to Cloudinary for global CDN delivery
3. **Local Server** - Upload to your own server (stored in `/public/uploads`)
4. **Embed (Base64)** - Store directly in database (no external hosting needed)

All 4 methods support browsing your **entire computer** (not just the public folder) when uploading files.

---

## 🚀 Quick Start

### Basic Usage

Replace your existing `ImageUploader` with `UniversalImageUploader`:

```tsx
import { UniversalImageUploader } from '@/app/components/UniversalImageUploader';

export default function MyForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <UniversalImageUploader 
      value={imageUrl}
      onChange={setImageUrl}
      label="Product Image"
    />
  );
}
```

---

## 📋 Features by Tab

### Tab 1: Any URL (Paste Image Link)
**What it does:**
- Accept any image URL from any website
- No upload required - just paste and go

**Best for:**
- Existing images on Cloudinary, Unsplash, Imgur, etc.
- Quick testing with external images
- Linking to images hosted elsewhere

**Example URLs:**
```
https://res.cloudinary.com/demo/image/upload/sample.jpg
https://images.unsplash.com/photo-123456789
https://i.imgur.com/abc123.jpg
https://yourwebsite.com/images/product.jpg
```

---

### Tab 2: Cloudinary CDN (Cloud Upload)
**What it does:**
- Browse your entire computer (any folder, any drive)
- Upload to Cloudinary CDN
- Automatic optimization & global delivery
- Admin-only (secure)

**Best for:**
- Production websites
- Images that need global fast delivery
- Automatic format conversion (WebP, AVIF)

**Requirements:**
- Admin role in Clerk
- Cloudinary credentials in `.env`

**File limits:**
- Max size: 10MB
- Formats: JPG, PNG, GIF, WebP, SVG

---

### Tab 3: Local Server (Self-Hosted)
**What it does:**
- Browse your entire computer (any folder, any drive)
- Upload to your server's `/public/uploads` folder
- No third-party dependencies
- Admin-only (secure)

**Best for:**
- Development/testing
- Small projects
- When you want full control
- Avoiding third-party costs

**Requirements:**
- Admin role in Clerk
- Server write permissions

**File limits:**
- Max size: 10MB
- Formats: JPG, PNG, GIF, WebP, SVG

**Storage location:**
```
BPC_Ecom/
└── public/
    └── uploads/
        ├── 1234567890-image1.jpg
        ├── 1234567891-image2.png
        └── ...
```

**Generated URLs:**
```
/uploads/1234567890-image.jpg
```

---

### Tab 4: Embed (Base64)
**What it does:**
- Browse your entire computer (any folder, any drive)
- Convert image to base64 string
- Store directly in database
- No upload API call needed

**Best for:**
- Small images (icons, logos)
- Offline applications
- Reducing external dependencies

**⚠️ Important:**
- Recommended max: 1MB
- Base64 is ~33% larger than original
- Increases database size
- Slower page loads (no CDN caching)

**Generated format:**
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
```

---

## 🔧 Configuration

### Environment Variables

Add to `.env`:

```bash
# Cloudinary (required for Tab 2)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Clerk (required for admin checks)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### Next.js Configuration

Already configured in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    { protocol: 'https', hostname: '**' }, // Allow any HTTPS image
  ],
}
```

---

## 🔒 Security

### Admin-Only Uploads
Both Cloudinary and Local Server uploads require:
1. User authentication (Clerk)
2. Admin role in user metadata

**Non-admin users will see:**
- "Forbidden: Admin access required" error

### File Validation
All uploads are validated:
- ✅ File type: Must be an image
- ✅ File size: Max 10MB (Cloudinary/Local), 1MB (Base64)
- ✅ Sanitized filenames (local uploads)

### .gitignore Protection
User-uploaded images in `/public/uploads` are **not committed to git**:

```gitignore
/public/uploads/*
!/public/uploads/.gitkeep
```

---

## 💡 Usage Examples

### Example 1: Replace ImageUploader in ShopContent

**Before:**
```tsx
import { ImageUploader } from '@/app/components/ImageUploader';

<ImageUploader 
  value={editValues.image}
  onChange={(url) => setEditValues({ ...editValues, image: url })}
  label="Product Image"
/>
```

**After:**
```tsx
import { UniversalImageUploader } from '@/app/components/UniversalImageUploader';

<UniversalImageUploader 
  value={editValues.image}
  onChange={(url) => setEditValues({ ...editValues, image: url })}
  label="Product Image"
/>
```

### Example 2: In a Form

```tsx
'use client';
import { useState } from 'react';
import { UniversalImageUploader } from '@/app/components/UniversalImageUploader';
import { Button } from '@/components/ui/button';

export default function ProductForm() {
  const [productImage, setProductImage] = useState('');
  const [productName, setProductName] = useState('');

  const handleSubmit = async () => {
    const product = {
      name: productName,
      image: productImage, // Can be any URL, Cloudinary, local, or base64
    };
    
    // Save to database...
  };

  return (
    <form>
      <input 
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Product Name"
      />
      
      <UniversalImageUploader 
        value={productImage}
        onChange={setProductImage}
        label="Product Image"
      />
      
      <Button onClick={handleSubmit}>
        Create Product
      </Button>
    </form>
  );
}
```

---

## 🎨 Customization

### Change Default Tab

Edit `defaultValue` in the component:

```tsx
<Tabs defaultValue="cloudinary" className="w-full">
  {/* Starts on Cloudinary tab */}
</Tabs>
```

### Disable Specific Tabs

Remove tab triggers and content you don't need:

```tsx
// Only show URL and Local tabs
<TabsList className="grid w-full grid-cols-2">
  <TabsTrigger value="url">URL</TabsTrigger>
  <TabsTrigger value="local">Local</TabsTrigger>
</TabsList>
```

### Adjust File Size Limits

Edit in the component or API routes:

```typescript
// For larger files (20MB)
if (file.size > 20 * 1024 * 1024) {
  setUploadError('Image must be less than 20MB');
  return;
}
```

---

## 📊 Comparison: Which Tab Should I Use?

| Feature | Any URL | Cloudinary | Local Server | Base64 |
|---------|---------|------------|--------------|--------|
| **Upload needed?** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **CDN delivery?** | Depends | ✅ Yes | ❌ No | ❌ No |
| **Auto-optimization?** | Depends | ✅ Yes | ❌ No | ❌ No |
| **Third-party cost?** | Free | Free tier | Free | Free |
| **Max file size** | N/A | 10MB | 10MB | 1MB rec. |
| **Database size impact** | Low | Low | Low | High |
| **Admin only?** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Offline support?** | ❌ No | ❌ No | ❌ No | ✅ Yes |

**Recommendations:**
- **Production**: Use Cloudinary (Tab 2)
- **Development**: Use Local Server (Tab 3)
- **External images**: Use Any URL (Tab 1)
- **Small images/icons**: Use Base64 (Tab 4)

---

## 🐛 Troubleshooting

### "Unauthorized" Error
**Problem:** User not signed in

**Solution:** Ensure user is authenticated with Clerk

### "Forbidden: Admin access required"
**Problem:** User doesn't have admin role

**Solution:** 
1. Go to Clerk Dashboard
2. Find user
3. Set `publicMetadata.role = "admin"`

### "Failed to get upload signature" (Cloudinary)
**Problem:** Cloudinary credentials missing or invalid

**Solution:**
1. Check `.env` file has all Cloudinary variables
2. Verify credentials at Cloudinary Dashboard
3. Restart dev server after updating `.env`

### "Upload failed" (Local Server)
**Problem:** Server can't write to `/public/uploads`

**Solution:**
1. Check folder exists: `public/uploads/`
2. Check write permissions
3. On Windows: Right-click folder → Properties → Security

### Images not displaying
**Problem:** Next.js image domains not configured

**Solution:**
Already configured in `next.config.ts` to allow all HTTPS domains. Restart dev server if needed.

---

## 🚀 Migration Guide

### From Old ImageUploader

**Step 1:** Import new component
```tsx
// Old
import { ImageUploader } from '@/app/components/ImageUploader';

// New
import { UniversalImageUploader } from '@/app/components/UniversalImageUploader';
```

**Step 2:** Replace component (props are identical)
```tsx
// Old
<ImageUploader value={img} onChange={setImg} />

// New
<UniversalImageUploader value={img} onChange={setImg} />
```

**Step 3:** Test all 4 tabs
- Verify URL paste works
- Test Cloudinary upload
- Test local upload
- Test base64 conversion

---

## 📝 API Routes

### `/api/upload` (Cloudinary)
**Method:** POST  
**Authentication:** Admin only  
**Returns:** Cloudinary signed upload parameters

### `/api/upload-local` (Local Server)
**Method:** POST  
**Authentication:** Admin only  
**Body:** FormData with `file`  
**Returns:** 
```json
{
  "success": true,
  "url": "/uploads/1234567890-image.jpg",
  "filename": "1234567890-image.jpg",
  "size": 123456,
  "type": "image/jpeg"
}
```

---

## ✅ Summary

You now have **4 flexible ways** to add images:

1. ✅ **Any URL** - No upload, paste any link
2. ✅ **Cloudinary** - Browse PC → Upload to CDN
3. ✅ **Local Server** - Browse PC → Upload to your server
4. ✅ **Base64** - Browse PC → Embed in database

**All methods allow browsing your entire computer** - not limited to any specific folder!

**Next Steps:**
1. Try all 4 tabs in your application
2. Choose your preferred method for production
3. Update existing image uploads to use `UniversalImageUploader`

For questions or issues, refer to the Troubleshooting section above.
