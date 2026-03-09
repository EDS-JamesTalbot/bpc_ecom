# Clerk Authentication Setup Guide

This project uses **Clerk** for secure, production-ready authentication with role-based access control.

## ✅ What's Already Configured

The following has been implemented for you:

1. ✅ **@clerk/nextjs** package installed
2. ✅ **Proxy** (`proxy.ts`) protecting admin routes (Next.js 16)
3. ✅ **ClerkProvider** wrapped around the app in `layout.tsx`
4. ✅ **AdminButton** component using Clerk's authentication
5. ✅ **Server Actions** protected with Clerk auth (`product-actions.ts`)
6. ✅ **Role-based access control** (admin role checking)

---

## 🚀 Initial Setup

### Step 1: Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### Step 2: Get Your API Keys

In your Clerk Dashboard:

1. Navigate to **API Keys** in the sidebar
2. Copy your **Publishable Key** (starts with `pk_test_...`)
3. Copy your **Secret Key** (starts with `sk_test_...`)

### Step 3: Update Your `.env` File

Add these variables to your `.env` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Optional but recommended: Fixes session persistence / stale auth
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop
```

> **Session issues?** If users get logged out unexpectedly, see [CLERK_SESSION_TROUBLESHOOTING.md](./CLERK_SESSION_TROUBLESHOOTING.md).

⚠️ **Important:** Never commit your `.env` file to version control!

---

## 👤 Setting Up Admin Users

### How Admin Access Works

- **Regular users** can browse products and make purchases
- **Admin users** can create, edit, and delete products in the shop
- Admin status is controlled by a user's **role** in Clerk's metadata

### Making a User an Admin

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Users** in the sidebar
3. Click on the user you want to make an admin
4. Scroll down to **Metadata** section
5. Click **Edit** on **Public Metadata**
6. Add this JSON:

```json
{
  "role": "admin"
}
```

7. Click **Save**

### Testing Admin Access

1. Sign in to your app with the admin user
2. Navigate to `/shop`
3. You should see:
   - ✅ "Admin" badge in the header
   - ✅ "Add New Product" card
   - ✅ "Edit" and "Delete" buttons on products

---

## 🔒 How Authentication Works

### Public Routes (No Sign-In Required)

These routes are accessible to everyone:

- `/` - Homepage
- `/shop` - Product browsing
- `/contact` - Contact page
- `/testimonials` - Testimonials page
- `/order-confirmation` - After successful purchase
- `/payment-failed` - After failed purchase

### Protected Routes (Sign-In Required)

Admin actions require authentication:

- Creating products
- Editing products
- Deleting products

### Server-Side Protection

All admin actions are protected at the server level in `app/actions/product-actions.ts`:

```typescript
async function requireAdminAuth() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized: You must be signed in');
  }
  
  const userRole = sessionClaims?.metadata?.role;
  
  if (userRole !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
}
```

This means even if someone bypasses the UI, they cannot perform admin actions without proper authentication.

---

## 🎨 UI Components

### AdminButton Component

Location: `app/components/AdminButton.tsx`

**Features:**
- Shows "Admin Login" button when user is not signed in
- Shows user avatar with "Admin" badge for admin users
- Shows user avatar only for regular users
- Integrates Clerk's `<SignInButton>` and `<UserButton>`

### Usage in Your App

The `AdminButton` is automatically rendered in the header on the `/shop` page via `HeaderAdminButton.tsx`.

---

## 🧪 Testing Your Setup

### Test 1: Regular User Flow

1. Visit your app in an incognito/private browser window
2. Navigate to `/shop`
3. Verify you can see products but NO admin controls
4. Try adding items to cart (should work)

### Test 2: Admin User Flow

1. Sign in with an admin user (one with `role: "admin"` in metadata)
2. Navigate to `/shop`
3. Verify you see:
   - "Admin" badge in header
   - "Add New Product" card
   - "Edit" and "Delete" buttons on products
4. Try creating a new product (should work)
5. Try editing a product (should work)
6. Try deleting a product (should work)

### Test 3: Non-Admin User Flow

1. Sign in with a regular user (no admin role in metadata)
2. Navigate to `/shop`
3. Verify you see your user avatar but NO admin controls
4. Try adding items to cart (should work)

---

## 🔧 Customization

### Change Sign-In Appearance

You can customize Clerk's UI appearance in the Clerk Dashboard:

1. Go to **Customization** → **Theme**
2. Adjust colors, fonts, and layouts
3. Changes apply instantly to all Clerk components

### Add More Authentication Methods

Enable additional sign-in methods in Clerk Dashboard:

1. Go to **User & Authentication** → **Social Connections**
2. Enable providers like:
   - Google
   - GitHub
   - Facebook
   - Microsoft
   - And more...

### Customize Redirect URLs

Update the optional environment variables:

```bash
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/welcome
```

---

## 🐛 Troubleshooting

### "Clerk: Missing publishableKey" Error

**Problem:** You're seeing this error in the browser console.

**Solution:** 
1. Verify your `.env` file has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
2. Restart your dev server: `npm run dev`

### "Unauthorized: You must be signed in" Error

**Problem:** Admin actions fail even when signed in.

**Solution:**
1. Verify you're signed in (check for user avatar in header)
2. Verify your Clerk keys are correct in `.env`
3. Check browser console for Clerk errors

### "Forbidden: Admin access required" Error

**Problem:** Signed in but cannot perform admin actions.

**Solution:**
1. Go to Clerk Dashboard → Users
2. Find your user
3. Add `{"role": "admin"}` to **Public Metadata**
4. Sign out and sign back in
5. Verify you see the "Admin" badge in the header

### Admin Controls Not Showing

**Problem:** Signed in as admin but don't see Edit/Delete buttons.

**Solution:**
1. Check that `role` is set in **Public Metadata** (not Private Metadata)
2. Sign out and sign back in to refresh the session
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Metadata Guide](https://clerk.com/docs/users/metadata)
- [Clerk Dashboard](https://dashboard.clerk.com)

---

## 🔐 Security Best Practices

✅ **DO:**
- Store Clerk keys in `.env` (never in code)
- Use Public Metadata for role information
- Always verify authentication server-side
- Test with both admin and non-admin users

❌ **DON'T:**
- Commit `.env` file to version control
- Store sensitive data in Public Metadata
- Rely only on client-side checks
- Share your Secret Key publicly

---

## 🎉 You're All Set!

Your Clerk authentication is now fully configured. Users can sign up, sign in, and admins can manage products securely.

**Next Steps:**
1. Create your first admin user
2. Test the complete flow
3. Customize the appearance in Clerk Dashboard
4. (Optional) Enable additional authentication methods

Happy coding! 🚀

