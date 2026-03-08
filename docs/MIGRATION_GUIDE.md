# Migration Guide - Security & Performance Updates

This guide helps you transition from the old codebase to the new secure version.

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Copy these from your existing setup
DATABASE_URL="your_existing_database_url"
STRIPE_SECRET_KEY="your_stripe_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_public_key"
RESEND_API_KEY="your_resend_key"

# NEW - Add these required variables
ADMIN_PASSWORD="your_new_secure_password"
BUSINESS_OWNER_EMAIL="eds.raro@gmail.com"

# Optional - for custom email branding
EMAIL_FROM_ADDRESS="orders@loveysoap.com"
EMAIL_FROM_NAME="Lovey's Soap"
```

### Step 2: Install Dependencies (if needed)

```powershell
npm install
```

### Step 3: Run Database Migrations

Apply the new performance indexes:

```powershell
npm run db:generate
npm run db:migrate
```

### Step 4: Test Admin Login

1. Start the development server: `npm run dev`
2. Go to `/shop`
3. Click the "Admin" button
4. Enter your new `ADMIN_PASSWORD`
5. Try editing a product

---

## 🔄 Breaking Changes

### 1. Admin Password Authentication

**Old Behavior:**
- Password hardcoded in client code
- Anyone could see password in browser dev tools

**New Behavior:**
- Password stored in environment variable
- Server-side verification only
- You must set `ADMIN_PASSWORD` in `.env.local`

**Action Required:**
✅ Set `ADMIN_PASSWORD` environment variable  
✅ Update your admin password (don't reuse the old one)

---

### 2. Product Action Signatures Changed

**Old Signature:**
```typescript
updateProduct(productId: number, data: {...})
createProduct(data: {...})
deleteProduct(productId: number)
```

**New Signature:**
```typescript
updateProduct({
  adminPassword: string,
  productId: number,
  name?: string,
  price?: number,
  description?: string,
  image?: string
})

createProduct({
  adminPassword: string,
  name: string,
  price: number,
  description?: string,
  image: string
})

deleteProduct({
  adminPassword: string,
  productId: number
})
```

**Action Required:**
✅ No action - `ShopContent.tsx` already updated to use new signatures

---

### 3. Email Configuration

**Old Behavior:**
- Email addresses hardcoded as fallbacks

**New Behavior:**
- `BUSINESS_OWNER_EMAIL` is required
- Application will throw error if not set

**Action Required:**
✅ Set `BUSINESS_OWNER_EMAIL` in `.env.local`

---

## 🎯 New Features You Can Use

### 1. Persistent Shopping Cart

Cart items are now saved to browser localStorage:
- Users don't lose cart on refresh
- Cart persists across sessions
- Automatically cleared on successful checkout

**No action required** - works automatically!

---

### 2. Optimized Images

All images now served in modern formats (WebP/AVIF):
- Faster page loads
- Reduced bandwidth usage
- Automatic responsive sizing

**No action required** - works automatically!

---

### 3. Faster Database Queries

New indexes added for:
- Order lookups by Stripe ID
- Filtering orders by status
- Fetching order items
- Product sales analytics

**Action Required:**
✅ Run `npm run db:migrate` (see Step 3 above)

---

## 🧪 Testing Checklist

After migration, test these critical flows:

### Public User Flow
- [ ] Browse products on `/shop`
- [ ] Add items to cart
- [ ] Refresh page - cart should persist
- [ ] Checkout with valid payment details
- [ ] Verify order confirmation emails received

### Admin Flow
- [ ] Log in with admin password
- [ ] Edit a product (name, price, description, image)
- [ ] Changes should appear immediately
- [ ] Create a new product
- [ ] Delete a test product
- [ ] Log out (password should be required to log back in)

### Email Flow
- [ ] Place test order
- [ ] Verify business owner receives notification email
- [ ] Complete payment
- [ ] Verify business owner receives confirmation email
- [ ] If customer email provided, verify they receive confirmation

---

## 🐛 Troubleshooting

### Issue: "ADMIN_PASSWORD environment variable not set"

**Solution:** Add `ADMIN_PASSWORD="your_password"` to `.env.local`

---

### Issue: "BUSINESS_OWNER_EMAIL environment variable is not set"

**Solution:** Add `BUSINESS_OWNER_EMAIL="your@email.com"` to `.env.local`

---

### Issue: Admin login not working

**Possible Causes:**
1. Wrong password in `.env.local`
2. Need to restart dev server after changing `.env.local`
3. Typo in environment variable name

**Solution:**
```powershell
# Stop the dev server (Ctrl+C)
# Double-check .env.local for typos
# Restart the dev server
npm run dev
```

---

### Issue: Cart not persisting

**Possible Causes:**
1. Browser localStorage disabled
2. Browser in incognito/private mode
3. localStorage quota exceeded

**Solution:**
- Works automatically in normal browser mode
- If in incognito, cart will work but not persist
- If quota exceeded, clear browser data

---

### Issue: Images not optimizing

**Possible Causes:**
1. Using external image URLs without HTTPS
2. Image format not supported

**Solution:**
- Ensure all image URLs use HTTPS
- Supported formats: JPEG, PNG, WebP, AVIF, GIF, SVG

---

## 📞 Support

For issues or questions:

1. Check `ENV_SETUP.md` for environment variable setup
2. Check `SECURITY_AND_PERFORMANCE_AUDIT.md` for detailed changes
3. Review the terminal output for specific error messages

---

## ✅ Post-Migration Checklist

After completing migration:

- [ ] All environment variables set in `.env.local`
- [ ] Database migrations run successfully
- [ ] Admin login works with new password
- [ ] Test order placed successfully
- [ ] Confirmation emails received
- [ ] Cart persists after page refresh
- [ ] No console errors in browser dev tools
- [ ] Images loading and optimized

---

## 🎉 You're Done!

Your Lovey's Soap application is now:
- ✅ Secure with server-side admin authentication
- ✅ Faster with database indexes and image optimization
- ✅ Better UX with persistent cart
- ✅ Production-ready!

**Enjoy your upgraded, secure, and performant e-commerce platform!** 🛍️

