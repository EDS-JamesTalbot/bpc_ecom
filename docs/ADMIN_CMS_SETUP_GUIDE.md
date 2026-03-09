# Admin CMS Quick Setup Guide

This guide will help you get the Admin Content Management System up and running in **5 minutes**.

## 🚀 Quick Start

### Step 1: Generate & Apply Database Migration

```bash
npm run db:generate
npm run db:push
```

This creates three new tables:
- `testimonials` - Customer reviews
- `page_sections` - Editable page content  
- `site_settings` - Global site settings

### Step 2: Seed Initial Content

```bash
npm run db:seed:content
```

This populates your database with:
- ✅ 7 sample testimonials
- ✅ 9 page sections (home, testimonials, contact)
- ✅ 3 site settings (contact info)

### Step 3: Access Admin Dashboard

Start your dev server (if not already running):

```bash
npm run dev
```

Then visit:
- **Main Dashboard**: http://localhost:3000/admin/content
- **Testimonials**: http://localhost:3000/admin/content/testimonials
- **Page Sections**: http://localhost:3000/admin/content/page-sections
- **Site Settings**: http://localhost:3000/admin/content/site-settings
- **Theme Editor**: http://localhost:3000/admin/content/theme-editor

> **Note:** Admin access requires Clerk. Set your user's Public metadata to `{"role": "admin"}` in the [Clerk Dashboard](https://dashboard.clerk.com).

## 🎯 What Can You Edit?

### Testimonials
Edit customer reviews displayed on your site:
- Add/edit/delete testimonials
- Toggle active/inactive
- Set display order
- Add customer name and location

### Page Sections
Edit content for:
- **Home page**: Hero, About, Features, CTA sections
- **Testimonials page**: Hero section
- **Contact page**: Header, bulk orders, shipping info

### Site Settings
Update global information:
- Contact email
- Contact phone
- Business name
- Add custom settings as needed

## 📝 Example: Editing the Home Page Hero

1. Go to http://localhost:3000/admin/content/page-sections
2. Find "Home - Hero Section" (or filter by page: "home")
3. Click "Edit"
4. Update the JSON content:

```json
{
  "heading": "Welcome to My Amazing Store",
  "subheading": "The best products at the best prices",
  "buttonText": "Shop Now",
  "buttonLink": "/shop"
}
```

5. Click "Update Section"
6. Visit http://localhost:3000 to see changes live!

## 📝 Example: Adding a Testimonial

1. Go to http://localhost:3000/admin/content/testimonials
2. Click "+ Add New Testimonial"
3. Fill in the form:
   - **Quote**: "This product changed my life!"
   - **Author Name**: John Smith
   - **Location**: New York, USA
   - **Active**: ✅ (checked)
   - **Sort Order**: 1 (to show first)
4. Click "Create Testimonial"
5. Visit http://localhost:3000/testimonials to see it live!

## 📝 Example: Updating Contact Info

1. Go to http://localhost:3000/admin/content/site-settings
2. Find "contact_email" in the Contact category
3. Click "Edit"
4. Change the value to your real email
5. Click "Update Setting"
6. Visit http://localhost:3000/contact to see the change!

## 🏗️ What Was Built

### New Database Tables
- `testimonials` - Stores customer reviews
- `page_sections` - Stores editable page content sections
- `site_settings` - Stores global site settings

### New Admin Pages
- `/admin/content` - Dashboard overview
- `/admin/content/testimonials` - Manage testimonials
- `/admin/content/page-sections` - Edit page content
- `/admin/content/site-settings` - Update site settings
- `/admin/content/theme-editor` - Customize theme colors

### Updated Public Pages
These pages now pull content from the database:
- `/` (Home) - Hero, about, features, CTA sections
- `/testimonials` - Hero and testimonials list
- `/contact` - All sections and contact info

### New Query Helpers
- `src/db/queries/testimonials.ts` - Testimonial database operations
- `src/db/queries/page-sections.ts` - Page section operations
- `src/db/queries/site-settings.ts` - Site settings operations

### New Server Actions
- `app/actions/content-actions.ts` - All content mutation actions with Zod validation

## 🔒 Security Note

Admin pages are protected by **Clerk** authentication. To grant admin access:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Users → Select your user
2. Edit **Public metadata** and add: `{"role": "admin"}`
3. Save. You can now access `/admin/*` routes.

## 📚 Full Documentation

For detailed documentation, see:
- [ADMIN_CONTENT_MANAGEMENT.md](./ADMIN_CONTENT_MANAGEMENT.md) - Complete CMS documentation
- [WEBSITE_OWNER_GUIDE.md](./WEBSITE_OWNER_GUIDE.md) - Original website guide

## 🎨 JSON Content Structures

### Page Section Examples

**Hero Section:**
```json
{
  "heading": "Your Heading Here",
  "subheading": "Your subheading text",
  "buttonText": "Button Label",
  "buttonLink": "/destination"
}
```

**Features Section:**
```json
{
  "heading": "Section Heading",
  "features": [
    {
      "icon": "🌿",
      "title": "Feature Name",
      "description": "Feature description..."
    }
  ]
}
```

**Text Section:**
```json
{
  "heading": "Section Heading",
  "text": "Your paragraph text here..."
}
```

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Admin dashboard loads at `/admin/content`
- [ ] Can view all testimonials at `/admin/content/testimonials`
- [ ] Can create a new testimonial
- [ ] Can edit an existing testimonial
- [ ] Can toggle testimonial active/inactive
- [ ] New testimonial appears on `/testimonials` page
- [ ] Can edit page sections at `/admin/content/page-sections`
- [ ] Can update home hero section
- [ ] Changes appear immediately on `/` (home page)
- [ ] Can edit site settings at `/admin/content/site-settings`
- [ ] Can update contact email
- [ ] New email appears on `/contact` page

## 🚨 Troubleshooting

**Admin pages show 404 error**
- Make sure you ran `npm run db:push`
- Restart your dev server with `npm run dev`

**No content appears on admin pages**
- Run `npm run db:seed:content` to populate initial data

**Changes not showing on public pages**
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check that items are marked as "Active"
- Restart dev server if needed

**JSON validation errors**
- Copy your JSON to [jsonlint.com](https://jsonlint.com) to validate
- Common issues: missing quotes, trailing commas, unmatched brackets

## 🎉 You're Done!

Your admin CMS is now ready to use. You can now manage:
- ✅ Testimonials
- ✅ Page content (home, testimonials, contact)
- ✅ Site settings

Without touching any code!

## 📞 Need Help?

Refer to the full documentation:
- [ADMIN_CONTENT_MANAGEMENT.md](./ADMIN_CONTENT_MANAGEMENT.md)

Or check the implementation files:
- Database schema: `src/db/schema.ts`
- Query helpers: `src/db/queries/`
- Server actions: `app/actions/content-actions.ts`
- Admin pages: `app/admin/content/`

