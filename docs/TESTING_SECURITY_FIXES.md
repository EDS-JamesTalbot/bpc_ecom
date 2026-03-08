# Testing Security Fixes - Quick Guide

This guide will help you verify that all security fixes are working properly without breaking any functionality.

---

## ✅ Test 1: Admin Can Access Everything (Happy Path)

**Goal:** Verify that admins can still do everything they could before

### Steps:
1. Sign in to Clerk with an admin account
2. Navigate to `/admin/content`
3. Test each feature:

#### Testimonials Management
- ✅ Click "Manage Testimonials"
- ✅ Create a new testimonial
- ✅ Edit an existing testimonial
- ✅ Toggle a testimonial active/inactive
- ✅ Delete a testimonial (be careful!)

#### Page Sections Management
- ✅ Click "Manage Page Sections"
- ✅ Edit a page section (e.g., home_hero)
- ✅ Toggle a section active/inactive

#### Site Settings Management
- ✅ Click "Manage Settings"
- ✅ Update a site setting (e.g., contact_email)
- ✅ Create a new site setting

#### Product Management (Shop)
- ✅ Go to `/shop` page
- ✅ Sign in as admin (if not already)
- ✅ Create a new product
- ✅ Edit an existing product
- ✅ Upload an image (should work)
- ✅ Delete a product

**Expected Result:** ✅ Everything should work exactly as before

---

## 🔒 Test 2: Non-Admin Cannot Access Admin Features

**Goal:** Verify that non-admin users are properly blocked

### Steps:
1. Sign out from your admin account
2. Try to access `/admin/content`

**Expected Result:** ✅ Should redirect to `/shop` page

### Alternative (if you have a non-admin account):
1. Sign in with a non-admin account (no 'role: admin' in publicMetadata)
2. Try to access `/admin/content`

**Expected Result:** ✅ Should redirect to `/shop` page

---

## 🚫 Test 3: Unauthenticated Users Cannot Access Admin Features

**Goal:** Verify that not-signed-in users are blocked

### Steps:
1. Make sure you're signed out (no Clerk session)
2. Try to access these URLs directly:
   - `/admin/content`
   - `/admin/content/testimonials`
   - `/admin/content/page-sections`
   - `/admin/content/site-settings`

**Expected Result:** ✅ All should redirect to `/shop` page

---

## 🔒 Test 4: API Routes Are Protected

**Goal:** Verify that API routes require authentication

### Test Upload API (Chrome DevTools):
1. Sign out from Clerk
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Test upload API
fetch('/api/upload', {
  method: 'POST',
  body: JSON.stringify({}),
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(console.log);
```

**Expected Result:** ✅ Should return `{ error: "Unauthorized: You must be signed in" }`

### Test Cloudinary Images API:
```javascript
// Test cloudinary images API
fetch('/api/cloudinary-images')
.then(r => r.json())
.then(console.log);
```

**Expected Result:** ✅ Should return `{ error: "Unauthorized: You must be signed in" }`

---

## 🧪 Test 5: Server Actions Are Protected

**Goal:** Verify that server actions require authentication

### Test Content Action (Chrome DevTools):
1. Sign out from Clerk
2. Open any page on your site
3. Open Chrome DevTools Console
4. Try to call a server action directly (this won't work as expected in Next.js 15, but it's good to try):

**Expected Behavior:** Server actions should fail with authentication errors if called without proper Clerk session.

---

## ✅ Test 6: Admin Functionality Still Works After Auth

**Goal:** Ensure nothing broke in the content management UI

### Test Complete Workflow:
1. Sign in as admin
2. Go to `/admin/content/testimonials`
3. **Create** a new testimonial:
   - Fill in quote, author name, location
   - Click Save
   - ✅ Should appear in the list
4. **Edit** the testimonial you just created:
   - Click Edit
   - Change the quote
   - Click Save
   - ✅ Changes should be saved
5. **Toggle** the testimonial:
   - Click the toggle button
   - ✅ Status should change
6. **Delete** the test testimonial:
   - Click Delete
   - ✅ Should be removed from list

**Repeat for Page Sections and Site Settings**

---

## 🖼️ Test 7: Image Upload Still Works

**Goal:** Verify image upload for products works for admins

### Steps:
1. Sign in as admin
2. Go to `/shop`
3. Click "Create Product" or "Edit Product"
4. Try to upload an image
5. ✅ Image upload dialog should work
6. ✅ Image should upload successfully
7. ✅ Product should save with the image

---

## 🔍 Test 8: Middleware Protection Works

**Goal:** Verify middleware is blocking routes

### Steps:
1. Sign out completely
2. Try to access:
   - `/admin/content` → Should redirect to `/shop`
   - `/admin/content/testimonials` → Should redirect to `/shop`
   - `/shop` → Should work (public page)
   - `/contact` → Should work (public page)
   - `/testimonials` → Should work (public page)

**Expected Result:** ✅ Admin routes redirect, public routes work

---

## 📊 Test Results Checklist

Mark each test as you complete it:

- [ ] Test 1: Admin can access everything ✅
- [ ] Test 2: Non-admin cannot access admin features ✅
- [ ] Test 3: Unauthenticated users are blocked ✅
- [ ] Test 4: API routes are protected ✅
- [ ] Test 5: Server actions are protected ✅
- [ ] Test 6: Content management still works ✅
- [ ] Test 7: Image upload still works ✅
- [ ] Test 8: Middleware protection works ✅

---

## 🐛 If Something Doesn't Work

### Common Issues & Solutions

#### Issue: "Cannot access admin routes even as admin"
**Solution:** 
- Check that your Clerk user has `role: 'admin'` in publicMetadata
- Go to Clerk Dashboard → Users → Select your user → Metadata → Public Metadata
- Should have: `{ "role": "admin" }`

#### Issue: "Image upload fails"
**Solution:**
- Check that Cloudinary credentials are in `.env`
- Make sure you're signed in as admin
- Check browser console for error messages

#### Issue: "Content actions don't work"
**Solution:**
- Verify you're signed in as admin
- Check browser console for authentication errors
- Verify Clerk session is active

#### Issue: "Middleware redirects all routes"
**Solution:**
- Check that `middleware.ts` is in the root directory (not in `app/`)
- Verify the route matchers are correct
- Restart the dev server: `npm run dev`

---

## 🎉 All Tests Passing?

If all tests pass, your security fixes are working correctly and your website is ready for deployment!

**Next Steps:**
1. ✅ Rotate Cloudinary credentials (optional but recommended)
2. ✅ Deploy to production
3. ✅ Test production environment with same tests

---

## 📞 Need Help?

If any tests fail or you encounter issues, check:
1. Browser console for error messages
2. Terminal where `npm run dev` is running for server errors
3. Clerk Dashboard to verify user roles
4. `.env` file has all required variables

Let me know if you need help debugging any issues!
