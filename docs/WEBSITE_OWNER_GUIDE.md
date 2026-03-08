# Website Owner's Guide

Welcome! This guide will help you manage your e-commerce website. Everything is designed to be simple and user-friendly - no technical knowledge required.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Products](#managing-products)
3. [Working with Images](#working-with-images)
4. [Product Visibility](#product-visibility)
5. [Understanding Your Services](#understanding-your-services)
6. [Security & Safety](#security--safety)
7. [Quick Reference](#quick-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### Signing In

1. Visit your website's shop page
2. Click the **"Admin Login"** button in the top-right corner
3. Sign in with your admin account credentials
4. Once signed in, you'll see an **"Admin"** badge next to your profile picture

**Note:** Your developer has set up your admin account using a service called **Clerk** (more on this below).

### What You'll See in Admin Mode

When you're signed in as an admin, you'll see extra controls that regular customers don't see:

- ✅ **"Add New Product"** card at the start of your product grid
- ✅ **"Edit"** button on each product
- ✅ **"Delete"** button (trash icon 🗑️) on each product
- ✅ Toggle switches to activate/deactivate products

---

## 📦 Managing Products

### Adding a New Product

1. **Click** the **"Add New Product"** card (has a big plus icon)
2. A dialog box will open where you can enter:
   - **Product Name** - The name customers will see
   - **Product Image** - See [Working with Images](#working-with-images) section
   - **Description** - Details about the product
   - **Price** - Price per item (e.g., 25.99)
   - **Product Status** - Toggle between Active (visible to customers) or Coming Soon (hidden)
3. **Click "Create Product"** to save

Your new product will appear immediately on the shop page!

### Editing an Existing Product

1. **Find the product** you want to edit on the shop page
2. **Click the "Edit"** button on that product card
3. The same dialog will open with all current information filled in
4. **Make your changes** to any field
5. **Click "Save Changes"**

All changes take effect immediately!

### Deleting a Product

⚠️ **Important:** Deleting a product is permanent and cannot be undone!

1. **Click the trash icon (🗑️)** on the product you want to delete
2. A confirmation dialog will appear showing the product name
3. **Click "Delete Product"** to confirm, or **"Cancel"** to keep it

**Tip:** Instead of deleting, consider using the "Coming Soon" status to hide products temporarily.

---

## 🖼️ Working with Images

When adding or editing a product, you have **5 different ways** to add images. Choose the method that works best for you!

### Method 1: URL (Paste a Link) ⭐ Easiest

**Best for:** Using images from anywhere on the internet

1. Select the **"URL"** tab
2. Copy an image link from another website
3. Paste it into the text field
4. Click **"Add"**

**Example URLs:**
- `https://example.com/product-photo.jpg`
- Links from Unsplash, Imgur, or any image host

---

### Method 2: Browse Cloudinary ⭐ Recommended

**Best for:** Reusing images you've already uploaded

1. Select the **"Browse"** tab
2. Click **"Browse Cloudinary Images"**
3. Wait for your image library to load
4. Click on any image to select it

**Tip:** This is the fastest way to add images you've used before!

---

### Method 3: Upload to Cloudinary ⭐ Best Quality

**Best for:** New images that need to load fast for customers

1. Select the **"Upload"** tab
2. Click the upload area
3. Choose an image from your computer (up to 10MB)
4. Wait for the upload to complete

**Why use this?**
- Images are stored on a fast content delivery network (CDN)
- Customers see images load quickly anywhere in the world
- Automatic optimization for web performance

---

### Method 4: Server Upload

**Best for:** Storing images directly on your website's server

1. Select the **"Server"** tab
2. Click the upload area
3. Choose an image from your computer (up to 10MB)
4. Wait for the upload to complete

**Note:** Images are stored in your server's `/uploads` folder.

---

### Method 5: Embed in Database

**Best for:** Small images or icons

1. Select the **"Embed"** tab
2. Click the upload area
3. Choose a small image from your computer (up to 2MB recommended)
4. Wait for processing to complete

**Note:** This embeds the image directly in your database. Only use for small images!

---

### Cropping & Adjusting Images

After adding an image, you can zoom and crop it:

1. Click the **"🔍 Zoom & Crop Image"** button
2. Use the zoom slider to adjust the size
3. Drag the image to reposition it
4. Click **"Apply Crop"** to save, or **"Cancel"** to discard

### Best Practices for Images

✅ **DO:**
- Use clear, high-quality photos
- Use square or landscape orientations (works best)
- Keep file sizes reasonable (under 5MB is ideal)
- Use JPEG for photos, PNG for graphics with text

❌ **AVOID:**
- Blurry or pixelated images
- Extremely large files (slows down your website)
- Portrait orientation images (may not display well)

---

## 👁️ Product Visibility

Every product has two states:

### Active (Visible to Customers)
- ✅ Product appears on the shop page
- ✅ Customers can add it to cart and purchase it
- ✅ Green "Active" label in admin view

**Use when:** Product is ready to sell

### Inactive (Hidden from Customers)
- 🔒 Product is hidden from the shop page
- 🔒 Only you (admin) can see it
- 🔒 Gray "Not Active" label in admin view

**Use when:**
- Product is out of stock temporarily
- You're still setting up the product details
- Product will be available soon but not yet ready

### Changing Product Status

1. Click **"Edit"** on any product
2. Find the **toggle switch** at the bottom of the form
3. Switch it on (Active) or off (Inactive)
4. Click **"Save Changes"**

---

## 🔧 Understanding Your Services

Your website uses several professional services to provide the best experience for you and your customers. Here's what they are and what they do:

### Clerk - User Authentication & Security 🔐

**What is it?**
Clerk is a professional authentication service that handles all user accounts and security.

**What it does for you:**
- Manages your admin login securely
- Protects admin features from unauthorized access
- Handles password security (passwords are never stored in plain text)
- Provides sign-in/sign-out functionality

**Who manages it?**
Your developer has set up your Clerk account and created your admin user. If you need to:
- Reset your password
- Add additional admin users
- Change security settings

Contact your developer.

**Cost:** Free tier available; your developer chose the plan that fits your needs.

---

### Cloudinary - Image Storage & Delivery ☁️

**What is it?**
Cloudinary is a professional image hosting service with a global content delivery network (CDN).

**What it does for you:**
- Stores all your product images securely
- Automatically optimizes images for web
- Delivers images quickly to customers worldwide
- Provides unlimited storage (on paid plans)

**Why is this good?**
When customers visit your website from anywhere in the world, Cloudinary serves images from the server closest to them. This means:
- ⚡ Faster page loading
- 📱 Better experience on mobile devices
- 🌍 Global reach

**Who manages it?**
Your developer has set up your Cloudinary account. You can upload images through the website interface - no need to log in to Cloudinary directly.

**Cost:** Free tier available (good for small shops); paid plans for larger catalogs.

---

### Neon Database - Data Storage 💾

**What is it?**
Neon is a modern PostgreSQL database service that stores all your website data.

**What it stores:**
- All your products (names, descriptions, prices)
- Customer orders
- Order history
- Any embedded images (if using Method 5)

**Who manages it?**
Your **developer manages your database**. This includes:
- Database backups
- Security updates
- Performance monitoring
- Data recovery if needed

**You don't need to worry about:**
- Database maintenance
- Backups (handled automatically)
- Technical database issues

**Your role:** Focus on managing products through the website interface. Your developer handles everything behind the scenes.

**Security:** Your database is protected with enterprise-grade security and is not accessible to the public internet.

---

## 🔒 Security & Safety

Your website has been built with multiple layers of security to protect your business and your customers. Here's what's in place:

### 🛡️ Authentication Security (Clerk)

**What protects you:**
- ✅ **Industry-standard encryption** - All passwords and sensitive data are encrypted
- ✅ **Role-based access control** - Only users with the admin password can manage products
- ✅ **Session security** - Your login sessions are secure and expire after inactivity
- ✅ **Password requirements** - Strong passwords are enforced
- ✅ **No password storage** - Passwords are never stored in plain text

**What this means:**
Only authorized admins (like you) can create, edit, or delete products. Regular customers cannot access these features, even if they try to hack the system.

---

### 💳 Payment Security (Stripe)

**What protects customers:**
- ✅ **PCI-DSS compliant** - Industry standard for payment security
- ✅ **Encrypted transactions** - All payment data is encrypted during transmission
- ✅ **No card storage** - Your website never stores credit card numbers
- ✅ **Fraud detection** - Stripe automatically detects and blocks suspicious transactions
- ✅ **3D Secure support** - Additional authentication for high-value transactions

**What this means:**
Customer payment information is handled entirely by Stripe (a trusted payment processor used by millions of businesses). Your website never sees or stores credit card details.

---

### 🗄️ Database Security (Neon PostgreSQL)

**What protects your data:**
- ✅ **Encrypted storage** - All data is encrypted at rest
- ✅ **Secure connections** - All database connections use SSL/TLS encryption
- ✅ **Access controls** - Only your website application can access the database
- ✅ **Automatic backups** - Daily backups protect against data loss
- ✅ **SQL injection prevention** - Database queries are safely parameterized

**What this means:**
Your product data, customer orders, and business information are stored securely and backed up regularly. Hackers cannot access your database directly.

---

### 🌐 Application Security (Next.js)

**What protects your website:**
- ✅ **Server-side validation** - All data is validated on the server (not just in the browser)
- ✅ **XSS protection** - Prevents malicious scripts from being injected
- ✅ **CSRF protection** - Prevents unauthorized actions from external sources
- ✅ **Rate limiting** - Prevents abuse and spam
- ✅ **Zod validation** - All user inputs are validated before processing

**What this means:**
Your website checks all data twice - once in the browser for convenience, and again on the server for security. This prevents hackers from bypassing client-side checks.

---

### 📧 Email Security (Resend)

**What protects communications:**
- ✅ **SPF/DKIM authentication** - Prevents email spoofing
- ✅ **Secure delivery** - Emails are sent through verified servers
- ✅ **No sensitive data in emails** - Emails never contain payment details

**What this means:**
Order confirmation emails are legitimate and come from your verified domain. Customers can trust emails from your website.

---

### 🔐 Environment Variables Security

**What protects your secrets:**
- ✅ **Never in code** - API keys and secrets are never hardcoded
- ✅ **Server-only access** - Sensitive keys are only available on the server
- ✅ **Not in version control** - Secrets are never committed to Git

**What this means:**
Your API keys for Stripe, Cloudinary, Clerk, and database access are stored securely and never exposed to website visitors.

---

### 🚨 What You Should Do

As a website owner, here's how you can help keep things secure:

✅ **DO:**
- Use a strong, unique password for your admin account
- Never share your admin login credentials
- Sign out when you're done managing products (especially on shared computers)
- Keep your email account secure (used for password resets)
- Contact your developer if you see anything suspicious

❌ **DON'T:**
- Share your admin password with anyone
- Leave yourself signed in on public computers
- Click suspicious links claiming to be from your website services
- Give admin access to people you don't trust

---

### 🛡️ Security Summary

**Your website has enterprise-grade security:**

| Layer | Protection | Result |
|-------|-----------|--------|
| **Authentication** | Clerk with role-based access | Only authorized admins can manage products |
| **Payments** | Stripe PCI-DSS compliance | Customer payment data never touches your website |
| **Database** | Encrypted storage + backups | Business data is safe and recoverable |
| **Application** | Multiple validation layers | Hackers cannot inject malicious code |
| **Communications** | Authenticated email delivery | Customers trust your emails |
| **Secrets** | Environment variables | API keys are never exposed |

**Bottom line:** Your website is built with the same security practices used by major e-commerce companies. Your developer has followed industry best practices throughout.

---

## 📖 Quick Reference

### Common Tasks

| Task | Steps |
|------|-------|
| **Add product** | Click "Add New Product" → Fill form → Click "Create Product" |
| **Edit product** | Click "Edit" on product → Make changes → Click "Save Changes" |
| **Delete product** | Click trash icon (🗑️) → Confirm deletion |
| **Hide product** | Edit product → Toggle switch to "Coming Soon" → Save |
| **Show product** | Edit product → Toggle switch to "Active" → Save |
| **Change image** | Edit product → Click "Change Image" → Choose new image → Save |
| **Crop image** | Edit product → Click "🔍 Zoom & Crop Image" → Adjust → Apply |

### Keyboard Shortcuts

- **Escape key** - Close any open dialog/form
- **Enter key** - Submit form (when filling in product details)

### Image Upload Methods at a Glance

| Method | Best For | File Size | Speed |
|--------|----------|-----------|-------|
| **URL** | Quick links from web | No limit | Instant |
| **Browse** | Reusing existing images | N/A | Instant |
| **Cloudinary** | Best performance | Up to 10MB | Fast (CDN) |
| **Server** | Simple storage | Up to 10MB | Medium |
| **Embed** | Small images/icons | Up to 2MB | Instant |

---

## 🔧 Troubleshooting

### I don't see the "Edit" and "Delete" buttons

**Problem:** You're not signed in as an admin, or your account doesn't have admin privileges.

**Solution:**
1. Check if you see the "Admin" badge in the top-right corner
2. If not, click "Admin Login" and sign in
3. If you still don't see admin controls after signing in, contact your developer to verify your account has admin role

---

### My image won't upload

**Problem:** File size or format issues.

**Solution:**
1. Check the file size:
   - Cloudinary/Server: Must be under 10MB
   - Embed: Must be under 2MB
2. Check the file format: Use JPEG, PNG, GIF, or WEBP
3. Try a different upload method (URL method works with any image online)
4. Make sure the file is actually an image (not a document or video)

---

### Product isn't showing on the shop page

**Problem:** Product is set to "Coming Soon" status.

**Solution:**
1. Click "Edit" on the product
2. Look for the toggle switch at the bottom
3. Make sure it says "Product Active" (switch should be on/green)
4. Click "Save Changes"

---

### Changes aren't saving

**Problem:** Form validation errors or connection issues.

**Solution:**
1. Check that all required fields are filled in:
   - Product name is not empty
   - Image URL is provided
   - Price is a valid number (no negative numbers)
2. Check your internet connection
3. Try clicking "Save Changes" again
4. If it still doesn't work, refresh the page and try again
5. Contact your developer if the issue persists

---

### I deleted a product by accident

**Problem:** Product was deleted and you want it back.

**Solution:**
Unfortunately, deleted products cannot be recovered through the website interface. Contact your developer - they may be able to restore it from a database backup.

**Prevention:** Use "Coming Soon" status instead of deleting products you might need later.

---

### Images are loading slowly

**Problem:** Large file sizes or not using Cloudinary.

**Solution:**
1. Use the **"Upload to Cloudinary"** method for best performance
2. Optimize images before uploading (keep under 5MB when possible)
3. Consider using JPEG format (smaller than PNG for photos)
4. Contact your developer if the entire website is slow

---

### Can't sign in to admin account

**Problem:** Forgotten password or account issues.

**Solution:**
1. Use the "Forgot Password" link on the sign-in page
2. Check your email for reset instructions
3. If you don't receive an email, check your spam folder
4. Contact your developer if you still can't access your account

---

### Website looks broken or strange

**Problem:** Browser cache or temporary glitch.

**Solution:**
1. **Hard refresh** your browser:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
2. Clear your browser cache
3. Try a different browser
4. Contact your developer if the issue persists

---

## 📞 Need More Help?

### Contact Your Developer

For technical issues, account problems, or questions not covered in this guide, contact your developer. They can help with:

- Setting up additional admin users
- Database issues or recovery
- Service configuration (Clerk, Cloudinary, Stripe)
- Custom features or modifications
- Technical troubleshooting

### Service Documentation

If you want to learn more about the services powering your website:

- **Clerk:** [clerk.com/docs](https://clerk.com/docs)
- **Cloudinary:** [cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Stripe:** [stripe.com/docs](https://stripe.com/docs)

---

## 🎉 You're Ready!

You now have everything you need to manage your e-commerce website. Remember:

- ✅ **Adding products** is simple and takes just a minute
- ✅ **Multiple image upload methods** give you flexibility
- ✅ **"Coming Soon" status** lets you hide products temporarily
- ✅ **Security is built-in** - your website is protected
- ✅ **Your developer is here** to help with technical issues

Happy selling! 🚀

---

**Last Updated:** December 2024  
**Website Version:** 1.0  
**For Technical Support:** Contact your developer
