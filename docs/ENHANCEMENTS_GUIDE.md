# Website Template Enhancements Guide

This guide covers three major enhancements to the website template:
1. 🖼️ **Image CDN** - Cloudinary integration for optimized image storage
2. 🧪 **Testing** - Vitest & Playwright for comprehensive testing
3. 🚀 **CI/CD** - GitHub Actions & Vercel for automated deployments

---

## 1. 🖼️ Image CDN with Cloudinary

### Why Cloudinary?

**Current Problem:**
- Images stored as manual URLs or data URLs
- No optimization or automatic resizing
- Large file sizes slow down the site
- No CDN delivery

**Cloudinary Benefits:**
- ✅ Automatic image optimization
- ✅ On-the-fly resizing and transformations
- ✅ Global CDN delivery
- ✅ Generous free tier (25GB storage, 25GB bandwidth)
- ✅ Built-in image manipulation API

### Setup Instructions

#### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. After signup, go to **Dashboard**
4. Note your credentials:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

#### Step 2: Add Environment Variables

Add to `.env`:

```bash
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

⚠️ **Important:** 
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is public (safe for client-side)
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are private (server-only)

#### Step 3: Install Package

```powershell
cd BPC_Ecom
npm install cloudinary
```

#### Step 4: Files Added

The following files have been created:

1. **`lib/cloudinary.ts`** - Server-side Cloudinary configuration
2. **`lib/cloudinary-client.ts`** - Client-side upload widget integration
3. **`app/components/ImageUploader.tsx`** - Image upload component
4. **`app/api/upload/route.ts`** - API route for signed uploads
5. **`next.config.ts`** - Updated with Cloudinary domain

#### Step 5: Usage

**In Admin Product Form:**

The `ImageUploader` component replaces the manual URL input:

```tsx
<ImageUploader
  value={editValues.image}
  onChange={(url) => setEditValues({ ...editValues, image: url })}
/>
```

**Features:**
- Drag-and-drop or click to upload
- Preview uploaded images
- Automatic optimization
- Secure signed uploads
- Progress indicator

### Image Transformations

Cloudinary URLs support on-the-fly transformations:

```
https://res.cloudinary.com/your-cloud-name/image/upload/
  w_400,h_400,c_fill,q_auto,f_auto/v1234567890/product-image.jpg
```

**Parameters:**
- `w_400,h_400` - Resize to 400x400
- `c_fill` - Crop to fill dimensions
- `q_auto` - Automatic quality optimization
- `f_auto` - Automatic format (WebP for modern browsers)

---

## 2. 🧪 Testing Setup

### Testing Stack

**Vitest** - Unit & Integration Tests
- Fast, modern testing framework
- ESM-native with TypeScript support
- Compatible with Vite/Next.js

**Playwright** - End-to-End Tests
- Cross-browser testing (Chromium, Firefox, WebKit)
- Real browser automation
- Screenshot & video recording

### Setup Instructions

#### Step 1: Install Dependencies

```powershell
cd BPC_Ecom
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom happy-dom
npm install --save-dev playwright @playwright/test
npx playwright install
```

#### Step 2: Configuration Files

**`vitest.config.ts`** - Vitest configuration
**`playwright.config.ts`** - Playwright configuration

#### Step 3: Test Structure

```
BPC_Ecom/
├── __tests__/
│   ├── unit/           # Unit tests (components, utilities)
│   ├── integration/    # Integration tests (actions, API routes)
│   └── e2e/            # Playwright e2e tests
```

#### Step 4: Run Tests

```powershell
# Unit/Integration tests
npm run test          # Run all tests
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report

# E2E tests
npm run test:e2e      # Run Playwright tests
npm run test:e2e:ui   # Open Playwright UI
```

### Example Tests

**Unit Test - Component:**
```typescript
// __tests__/unit/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**Integration Test - Server Action:**
```typescript
// __tests__/integration/product-actions.test.ts
import { describe, it, expect } from 'vitest';
import { getProducts } from '@/app/actions/product-actions';

describe('Product Actions', () => {
  it('fetches all products', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
  });
});
```

**E2E Test - User Flow:**
```typescript
// __tests__/e2e/shop.spec.ts
import { test, expect } from '@playwright/test';

test('user can browse products and add to cart', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByText('Our Collection')).toBeVisible();
  
  await page.getByRole('button', { name: 'Add to cart' }).first().click();
  await expect(page.getByText('Added to cart')).toBeVisible();
});
```

---

## 3. 🚀 CI/CD with GitHub Actions & Vercel

### Why CI/CD?

**Benefits:**
- ✅ Automated testing on every push
- ✅ Prevent broken code from reaching production
- ✅ Automatic deployments to Vercel
- ✅ Preview deployments for pull requests
- ✅ Quality gates and code checks

### Architecture

```
Push to GitHub
    ↓
GitHub Actions Workflow
    ↓
1. Install dependencies
2. Run linter (ESLint)
3. Run type check (TypeScript)
4. Run unit tests (Vitest)
5. Run e2e tests (Playwright)
    ↓
All checks pass?
    ↓
Deploy to Vercel
    ↓
Live on Production
```

### Setup Instructions

#### Step 1: GitHub Repository

1. Create GitHub repository (if not already done)
2. Push your code:
```powershell
git init
git add .
git commit -m "Initial commit with enhancements"
git branch -M main
git remote add origin https://github.com/EDS-JamesTalbot/BPC_Ecom.git
git push -u origin main
```

#### Step 2: Vercel Setup

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Import Project"**
4. Select your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add **Environment Variables** (copy from your `.env`)
7. Click **"Deploy"**

#### Step 3: GitHub Actions Workflow

The workflow file `.github/workflows/ci.yml` handles:
- ✅ Dependency installation
- ✅ TypeScript type checking
- ✅ Linting
- ✅ Unit tests
- ✅ E2E tests
- ✅ Deployment trigger

#### Step 4: GitHub Secrets

Add secrets to your GitHub repository:

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `VERCEL_TOKEN` - From Vercel account settings
   - `VERCEL_ORG_ID` - From Vercel project settings
   - `VERCEL_PROJECT_ID` - From Vercel project settings
   - All environment variables from `.env`

### Workflow Features

**On Push to `main`:**
- Run all tests
- Deploy to production (if tests pass)

**On Pull Request:**
- Run all tests
- Create preview deployment
- Comment PR with preview URL

**Manual Trigger:**
- Can manually trigger workflow from GitHub Actions tab

### Monitoring

**GitHub Actions:**
- View workflow runs in **Actions** tab
- See detailed logs for each step
- Get notifications on failures

**Vercel:**
- View deployments in Vercel dashboard
- Access deployment logs
- Monitor performance metrics

---

## 📊 Enhancement Summary

### Before Enhancements

❌ Manual URL image entry
❌ No image optimization
❌ No automated testing
❌ Manual deployments
❌ No quality gates

### After Enhancements

✅ Cloudinary CDN with automatic optimization
✅ Drag-and-drop image uploads
✅ Comprehensive test coverage
✅ Automated CI/CD pipeline
✅ Preview deployments for PRs
✅ Quality gates prevent broken code

---

## 🔧 Maintenance

### Updating Dependencies

```powershell
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Monitoring

**Cloudinary:**
- Check usage in Cloudinary dashboard
- Monitor bandwidth and storage
- Review transformation analytics

**Testing:**
- Run tests before committing
- Review test coverage reports
- Add tests for new features

**Vercel:**
- Monitor deployment frequency
- Check build times
- Review error logs

---

## 🆘 Troubleshooting

### Cloudinary Upload Fails

**Issue:** Upload returns 401 Unauthorized

**Solution:**
1. Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` in `.env`
2. Check Cloudinary dashboard for correct credentials
3. Ensure environment variables are set in Vercel

### Tests Failing

**Issue:** Tests pass locally but fail in CI

**Solution:**
1. Ensure all environment variables are set in GitHub Secrets
2. Check Node version matches (use `.nvmrc` or specify in workflow)
3. Review GitHub Actions logs for specific errors

### Deployment Fails

**Issue:** Vercel build fails

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for missing dependencies

---

## 📚 Additional Resources

**Cloudinary:**
- [Documentation](https://cloudinary.com/documentation)
- [Next.js Integration](https://cloudinary.com/documentation/next_js_integration)
- [Image Transformations](https://cloudinary.com/documentation/image_transformations)

**Testing:**
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

**CI/CD:**
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**All enhancements are production-ready and follow best practices!** 🚀

