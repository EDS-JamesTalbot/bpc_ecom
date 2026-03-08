# Admin Content Management System

This website includes a comprehensive content management system (CMS) that allows administrators to edit page content, testimonials, and site settings without touching code.

## Overview

The CMS follows a **hybrid approach**: page structure stays in code (developer-controlled), while content is database-driven and admin-editable through a dashboard.

### What Can Be Managed

✅ **Testimonials** - Customer reviews displayed on the website
✅ **Page Sections** - Content for home, testimonials, and contact pages  
✅ **Site Settings** - Contact information, social links, and global settings

## Database Schema

Three new tables power the CMS:

### 1. `testimonials`
Stores customer testimonials with the following fields:
- `id` - Auto-incrementing primary key
- `quote` - The testimonial text
- `location` - Customer location (optional)
- `authorName` - Customer name (optional)
- `isActive` - Show/hide on website
- `sortOrder` - Manual ordering
- `createdAt`, `updatedAt` - Timestamps

### 2. `page_sections`
Stores editable content sections for pages:
- `id` - Auto-incrementing primary key
- `sectionKey` - Unique identifier (e.g., `home_hero`, `contact_header`)
- `page` - Page this section belongs to (`home`, `testimonials`, `contact`)
- `title` - Human-readable admin title
- `content` - JSON content (flexible structure based on section)
- `isActive` - Show/hide section
- `createdAt`, `updatedAt` - Timestamps

### 3. `site_settings`
Stores global site settings:
- `id` - Auto-incrementing primary key
- `settingKey` - Unique identifier (e.g., `contact_email`)
- `settingValue` - The setting value
- `description` - Optional admin description
- `category` - Groups settings (`contact`, `social`, `general`)
- `updatedAt` - Timestamp

## Setup Instructions

### Step 1: Generate Database Migration

After pulling these changes, generate the migration for the new tables:

```bash
npm run db:generate
```

This creates migration files in the `drizzle/` directory.

### Step 2: Apply Migration

Push the schema changes to your database:

```bash
npm run db:push
```

Or if using migrations:

```bash
npm run db:migrate
```

### Step 3: Seed Initial Content

Populate the database with initial content from the existing hardcoded data:

```bash
npm run db:seed:content
```

This will create:
- 7 sample testimonials
- 9 page sections (home, testimonials, contact)
- 3 site settings (contact email, phone, business name)

### Step 4: Access Admin Dashboard

Visit the following URLs to manage content:

- **Dashboard**: `/admin/content`
- **Testimonials**: `/admin/content/testimonials`
- **Page Sections**: `/admin/content/page-sections`
- **Site Settings**: `/admin/content/site-settings`

## Admin Pages

### Testimonials Manager (`/admin/content/testimonials`)

**Features:**
- ✅ Create new testimonials
- ✅ Edit existing testimonials
- ✅ Toggle active/inactive (hide without deleting)
- ✅ Set sort order for display order
- ✅ Delete testimonials
- ✅ Add optional author name and location

**Fields:**
- **Quote** (required) - The testimonial text
- **Author Name** (optional) - Customer name
- **Location** (optional) - Customer location
- **Sort Order** - Controls display order (lower = first)
- **Active** - Toggle visibility on website

### Page Sections Manager (`/admin/content/page-sections`)

**Features:**
- ✅ Edit existing page sections
- ✅ Create new sections
- ✅ Toggle active/inactive
- ✅ Filter by page
- ✅ JSON content validation
- ✅ Delete sections

**Fields:**
- **Page** (required) - Which page this section belongs to
- **Section Key** (required) - Unique identifier (cannot change after creation)
- **Title** (required) - Admin display name
- **Content** (required) - JSON content (structure varies by section)
- **Active** - Toggle visibility on website

**Current Page Sections:**

**Home Page:**
- `home_hero` - Hero section with heading, subheading, button
- `home_about` - About section with heading and paragraphs
- `home_why_choose` - Features section with icons and descriptions
- `home_cta` - Call-to-action section

**Testimonials Page:**
- `testimonials_hero` - Hero section with heading and subheading

**Contact Page:**
- `contact_header` - Header banner
- `contact_bulk_orders` - Bulk orders information
- `contact_shipping` - Shipping options
- `contact_international` - International shipping info

### Site Settings Manager (`/admin/content/site-settings`)

**Features:**
- ✅ Edit existing settings
- ✅ Create new settings
- ✅ Group by category
- ✅ Filter by category
- ✅ Delete settings

**Fields:**
- **Setting Key** (required) - Unique identifier (cannot change after creation)
- **Setting Value** (required) - The actual value
- **Category** (required) - Groups settings (`contact`, `social`, `general`, `business`)
- **Description** (optional) - Admin note about this setting

**Current Settings:**
- `contact_email` - Primary contact email
- `contact_phone` - Primary contact phone
- `business_name` - Business name

## Content JSON Structures

### Home Hero Section (`home_hero`)
```json
{
  "heading": "Welcome to Our Store",
  "subheading": "Your one-stop shop for everything",
  "buttonText": "Shop Now",
  "buttonLink": "/shop"
}
```

### Home About Section (`home_about`)
```json
{
  "heading": "Our Story",
  "paragraphs": [
    "First paragraph of your story...",
    "Second paragraph..."
  ]
}
```

### Home Why Choose Section (`home_why_choose`)
```json
{
  "heading": "Why Customers Choose Us",
  "features": [
    {
      "icon": "🌿",
      "title": "Feature One",
      "description": "Description of feature one..."
    },
    {
      "icon": "✨",
      "title": "Feature Two",
      "description": "Description of feature two..."
    }
  ]
}
```

### Home CTA Section (`home_cta`)
```json
{
  "heading": "Ready to Get Started?",
  "text": "Join thousands of happy customers today",
  "buttonText": "Shop Now",
  "buttonLink": "/shop"
}
```

### Testimonials Hero (`testimonials_hero`)
```json
{
  "heading": "What Our Customers Say",
  "subheading": "Real reviews from real customers"
}
```

### Contact Header (`contact_header`)
```json
{
  "heading": "Contact & Ordering Information",
  "subheading": "Get in touch with us today"
}
```

### Contact Sections (Bulk Orders, Shipping, International)
```json
{
  "heading": "Section Heading",
  "text": "Section content text goes here..."
}
```

## How Pages Fetch Content

Pages are now **Server Components** that fetch content from the database on each request:

```typescript
// Example: Home page fetching hero section
import { getPageSectionByKey } from '@/db/queries/page-sections';

export default async function Home() {
  const heroSection = await getPageSectionByKey('home_hero');
  
  let heroContent = { /* defaults */ };
  
  if (heroSection?.content) {
    try {
      heroContent = JSON.parse(heroSection.content);
    } catch {
      // Use defaults if JSON parsing fails
    }
  }
  
  return (
    <h1>{heroContent.heading}</h1>
    // ... rest of component
  );
}
```

## Server Actions

All mutations (create, update, delete) use Server Actions with Zod validation:

- `createTestimonialAction`
- `updateTestimonialAction`
- `deleteTestimonialAction`
- `toggleTestimonialActiveAction`
- `upsertPageSectionAction`
- `updatePageSectionAction`
- `deletePageSectionAction`
- `togglePageSectionActiveAction`
- `upsertSiteSettingAction`
- `updateSiteSettingAction`
- `deleteSiteSettingAction`

Located in: `app/actions/content-actions.ts`

## Query Helpers

All database operations are abstracted into query helpers:

**Testimonials** (`src/db/queries/testimonials.ts`):
- `getActiveTestimonials()` - Get all active testimonials
- `getAllTestimonials()` - Get all (for admin)
- `getTestimonialById(id)`
- `createTestimonial(data)`
- `updateTestimonial(id, data)`
- `deleteTestimonial(id)`
- `toggleTestimonialActive(id)`

**Page Sections** (`src/db/queries/page-sections.ts`):
- `getPageSections(page)` - Get active sections for a page
- `getPageSectionByKey(sectionKey)`
- `getAllPageSections()` - Get all (for admin)
- `upsertPageSection(sectionKey, data)`
- `updatePageSection(id, data)`
- `deletePageSection(id)`
- `togglePageSectionActive(id)`

**Site Settings** (`src/db/queries/site-settings.ts`):
- `getAllSiteSettings()`
- `getSiteSettingByKey(settingKey)`
- `getSiteSettingsByCategory(category)`
- `upsertSiteSetting(key, value, category, description)`
- `updateSiteSetting(id, data)`
- `deleteSiteSetting(id)`

## Architecture

The system follows a **three-layer architecture**:

1. **Presentation Layer** (React Components)
   - Server Components fetch data via query helpers
   - Client Components trigger Server Actions for mutations

2. **Business Logic Layer** (Server Actions)
   - Validate input with Zod schemas
   - Call query helpers for database operations
   - Revalidate cache paths

3. **Data Access Layer** (Query Helpers)
   - Pure database operations with Drizzle ORM
   - No validation or business logic
   - Return null/empty arrays for not found

## Adding New Page Sections

To add a new editable section:

1. **Add to the database** via admin UI or seed script
2. **Update the page component** to fetch and use the section:

```typescript
const newSection = await getPageSectionByKey('page_new_section');

let newContent = { /* defaults */ };

if (newSection?.content) {
  try {
    newContent = JSON.parse(newSection.content);
  } catch {
    // Use defaults
  }
}

// Use newContent in JSX
```

3. **Document the JSON structure** in this file

## Best Practices

### JSON Content
- ✅ Always provide fallback defaults if JSON parsing fails
- ✅ Use clear, nested structures for complex content
- ✅ Include examples in admin descriptions
- ❌ Don't store HTML in JSON (use plain text)

### Testimonials
- ✅ Use `sortOrder` to manually arrange testimonials
- ✅ Use `isActive` to hide without deleting
- ✅ Keep quotes concise (under 1000 characters)
- ❌ Don't delete testimonials that are referenced elsewhere

### Page Sections
- ✅ Use descriptive `sectionKey` names (e.g., `home_hero`, not `section1`)
- ✅ Group related sections by page
- ✅ Keep JSON structures consistent for similar sections
- ❌ Don't change `sectionKey` after creation (it breaks references)

### Site Settings
- ✅ Use clear `settingKey` names (e.g., `contact_email`)
- ✅ Group by category for organization
- ✅ Add descriptions for complex settings
- ❌ Don't store sensitive data (use environment variables)

## Troubleshooting

### "Page not found" when accessing admin pages

Make sure you've:
1. Run `npm run db:push` to create tables
2. Restarted your dev server
3. Accessed the correct URL (`/admin/content/testimonials`, not `/admin/testimonials`)

### "No testimonials/sections found"

Run the seed script:
```bash
npm run db:seed:content
```

### JSON parsing errors

Validate your JSON at [jsonlint.com](https://jsonlint.com) before saving. The admin UI validates JSON on submit, but check for:
- Missing quotes around keys/strings
- Trailing commas
- Unclosed brackets/braces

### Changes not appearing on website

Server Actions automatically call `revalidatePath()`, but if changes aren't showing:
1. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
2. Restart the dev server
3. Check that the section/testimonial is marked as `active`

## Security Considerations

⚠️ **Important**: The admin pages currently have NO authentication. Before deploying to production:

1. **Add authentication** (recommend using Clerk or NextAuth.js)
2. **Protect admin routes** with middleware
3. **Add authorization checks** in Server Actions
4. **Consider adding an audit log** for content changes

Example middleware protection:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check authentication here
    const isAuthenticated = checkAuth(request);
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}

export const config = {
  matcher: '/admin/:path*',
};
```

## Future Enhancements

Potential improvements to consider:

- [ ] Add image upload support for testimonials (customer photos)
- [ ] Add rich text editor for page section content
- [ ] Add version history/audit log
- [ ] Add content scheduling (publish at specific date/time)
- [ ] Add multi-language support
- [ ] Add preview mode (see changes before publishing)
- [ ] Add bulk actions (activate/deactivate multiple items)
- [ ] Add drag-and-drop sorting for testimonials

## Support

For questions or issues with the CMS:
1. Check this documentation
2. Review the code in `app/admin/content/`
3. Check query helpers in `src/db/queries/`
4. Review server actions in `app/actions/content-actions.ts`

## Summary

The Admin Content Management System provides a flexible, database-driven approach to managing website content. It follows Next.js best practices with Server Components, Server Actions, and proper data validation. The hybrid approach keeps page structure in code while making content easily editable through an admin dashboard.

