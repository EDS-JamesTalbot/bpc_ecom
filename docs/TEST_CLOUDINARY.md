# 🧪 Test Cloudinary Connection

Your Cloudinary credentials from `.env`:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxqrfaqux
CLOUDINARY_API_KEY=753982799626469
CLOUDINARY_API_SECRET=iiOpfhzihcixO9-V6cvpPqIzobI
```

## 🔍 Debugging Steps:

1. **Check Browser Console** (F12 → Console tab)
   - Look for the actual error message from Cloudinary
   - Should show more details than "Failed to upload image"

2. **Verify Cloudinary Credentials**
   - Go to: https://console.cloudinary.com
   - Sign in with your account
   - Go to Settings → Access Keys
   - Verify the credentials match

3. **Check Cloudinary Account Status**
   - Make sure your account is active
   - Check if you've hit any upload limits
   - Verify you have free storage space

## 🐛 Common Issues:

### Issue 1: Invalid Signature
**Symptom**: "Invalid signature" error
**Fix**: Credentials might be wrong or expired

### Issue 2: Upload Quota Exceeded  
**Symptom**: "Quota exceeded" error
**Fix**: Upgrade Cloudinary plan or delete old images

### Issue 3: Invalid Folder
**Symptom**: "Invalid folder" error
**Fix**: The folder might need to be created first

## 🔧 Quick Test:

Open Browser Console (F12) and run:
```javascript
// Check what error Cloudinary returns
fetch('/api/upload', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

Should return:
```json
{
  "signature": "...",
  "timestamp": 1234567890,
  "folder": "websitetemplate/products",
  "cloudName": "dxqrfaqux",
  "apiKey": "753982799626469"
}
```

---

## 🚀 Alternative: Use Server or URL Upload

Since Cloudinary is failing, you can use:

**Server Tab** (✅ Working):
- Upload to your own server
- No external dependencies
- Files saved in `/public/uploads/`

**URL Tab** (✅ Working):
- Paste any image URL
- No upload needed
- Works with any external image

Would you like me to make the **Server** tab the default instead of Cloudinary?
