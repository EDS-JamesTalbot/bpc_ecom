# E-Commerce Website Template

A modern, full-featured e-commerce website template built with **Next.js 16**, **Stripe/BPC Payments**, **Drizzle ORM**, **Clerk**, and **shadcn/ui**. Perfect for small businesses selling physical products online. Supports multi-tenant deployments and customer account registration.

> **Note:** This is a generic template. Replace all placeholder text, images, and branding with your own content before deploying to production.

## ✨ Features

### 🛍️ E-Commerce Functionality
- **Product Catalog** - Display products with images, descriptions, and prices
- **Shopping Cart** - Add/remove items, adjust quantities, view totals
- **Secure Checkout** - Two-step checkout with customer info and payment (Stripe/BPC)
- **Customer Accounts** - Registration, login, order history, saved addresses
- **Order Management** - Track orders in PostgreSQL database
- **Email Notifications** - Automated order confirmations via Resend

### 🎨 User Interface
- **Responsive Design** - Mobile-first, works on all devices
- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **Universal Image Upload** - URL, Cloudinary CDN, server upload, or base64 embed
- **Admin CMS** - Manage products, page sections, testimonials, site settings, theme
- **Admin Panel** - Clerk-protected; sales dashboard with charts
- **Cart Sidebar** - Slide-out cart with live updates

### 🔧 Technical Features
- **Next.js 16** - App Router, Server Components, Server Actions
- **TypeScript** - Fully typed for better developer experience
- **Drizzle ORM** - Type-safe database queries
- **Neon PostgreSQL** - Serverless Postgres database
- **Clerk** - Admin authentication
- **Stripe/BPC** - Payment processing
- **Resend** - Transactional email service
- **Cloudinary** - Optional CDN for images
- **Zod Validation** - Runtime type checking and validation

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/EDS-JamesTalbot/BPC_Ecom.git
cd BPC_Ecom
npm install
```

> **Important:** After setup, customize the following:
> - Replace "YOUR STORE" branding in `app/layout.tsx`
> - Update all lorem ipsum text throughout the site
> - Replace placeholder logo with your own logo
> - Update contact information in `app/contact/page.tsx`
> - Customize colors in `app/globals.css` if desired

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# Clerk (Admin authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (optional - for Stripe payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM_ADDRESS=orders@yourdomain.com
EMAIL_FROM_NAME=Your Business Name
BUSINESS_OWNER_EMAIL=owner@yourdomain.com

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed setup instructions.

### 3. Set Up Database

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample products
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site!

## 📁 Project Structure

```
BPC_Ecom/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── checkout-actions.ts       # Payment processing (Stripe/BPC)
│   │   ├── product-actions.ts       # Product CRUD operations
│   │   ├── content-actions.ts       # CMS content management
│   │   ├── customer-auth-actions.ts # Customer registration/login
│   │   └── customer-profile-actions.ts
│   ├── admin/                # Admin CMS (Clerk-protected)
│   │   ├── content/          # Page sections, testimonials, site settings
│   │   ├── content/theme-editor/
│   │   └── sales/            # Sales dashboard
│   ├── components/          # React Components
│   │   ├── CartButton.tsx, CartContext.tsx, CartView.tsx
│   │   ├── CheckoutDialog.tsx, CheckoutForm.tsx, PaymentForm.tsx
│   │   ├── UniversalImageUploader.tsx, ImageCropper.tsx
│   │   ├── TenantProvider.tsx, MaintenanceGate.tsx
│   │   └── Navigation.tsx, AdminButton.tsx
│   ├── shop/, contact/, testimonials/
│   ├── my-account/, customer-login/  # Customer account pages
│   ├── order-confirmation/, payment-failed/
│   ├── api/                 # API routes (upload, webhooks, etc.)
│   ├── layout.tsx, page.tsx, globals.css
├── src/db/
│   ├── schema.ts            # Multi-tenant schema (tenants, customers, products, orders, etc.)
│   ├── seed.ts, seed-content.ts
│   └── queries/             # products, orders, customers, page-sections, site-settings, tenants
├── components/ui/           # shadcn/ui components
├── lib/, public/, scripts/
├── drizzle.config.ts, package.json, tsconfig.json
└── next.config.ts
```

## 🎯 Key Features Explained

### Admin Mode

Admin access uses **Clerk** authentication. Set your user's Public metadata to `{"role": "admin"}` in the [Clerk Dashboard](https://dashboard.clerk.com). In admin mode, you can:

- Add new products
- Edit existing products (name, price, description, image)
- Delete products
- Toggle product active status (hide/show in shop)

### Shopping Cart

- Persists in localStorage
- Updates in real-time
- Shows item count badge
- Slide-out sidebar with full cart details
- Adjustable quantities
- Remove items

### Checkout Process

1. **Customer Information**
   - Full name (required)
   - Phone number (required)
   - Email (optional - for confirmation emails)
   - Shipping address (optional - country, island, street address)

2. **Payment**
   - Powered by Stripe Payment Element
   - Supports all major credit cards
   - Automatic payment method detection
   - Secure 3D Secure authentication when required

3. **Confirmation**
   - Success message displayed
   - Email sent to customer (if email provided)
   - Email sent to business owner
   - Order saved in database

### Database Schema

The schema supports **multi-tenant** deployments. Key tables include `tenants`, `tenant_config`, `customers`, `products`, `orders`, `order_items`, `testimonials`, `page_sections`, and `site_settings`.

**Products Table:**
- `id` - Auto-incrementing primary key
- `name` - Product name
- `price` - Decimal price
- `description` - Product description
- `image` - Image URL or data URL
- `isActive` - Whether product is visible in shop
- `createdAt`, `updatedAt` - Timestamps

**Orders Table:**
- `id` - Auto-incrementing primary key
- `fullName`, `phoneNumber`, `email` - Customer info
- `shippingCountry`, `shippingIsland`, `shippingAddress` - Shipping details
- `totalAmount` - Order total
- `orderStatus` - Order status (pending, paid, failed)
- `paymentStatus` - Payment status (pending, paid, failed)
- `stripePaymentIntentId`, `stripeChargeId` - Stripe references
- `paymentGateway` - Payment gateway used (stripe)
- `createdAt`, `updatedAt` - Timestamps

**Order Items Table:**
- `id` - Auto-incrementing primary key
- `orderId` - Foreign key to orders
- `productId`, `productName`, `productImage` - Product snapshot
- `price`, `quantity` - Item details
- `createdAt` - Timestamp

## 🔧 Configuration

### Change Currency

Edit `app/actions/checkout-actions.ts`:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(validated.totalAmount * 100),
  currency: 'usd', // Change to your currency (e.g., 'eur', 'gbp', 'aud')
  // ...
});
```

### Customize Branding

**Required customizations before going live:**

1. **Branding & Text**
   - Replace "YOUR STORE" in `app/layout.tsx` with your business name
   - Replace "Your tagline goes here" with your actual tagline
   - Update all lorem ipsum placeholder text throughout the site:
     - Homepage: `app/page.tsx`
     - Contact: `app/contact/page.tsx`
     - Testimonials: `app/testimonials/page.tsx`
     - Shop: `app/shop/ShopContent.tsx`

2. **Logo & Images**
   - Replace the placeholder logo div in `app/layout.tsx` with your logo image
   - Remove old product images from `public/` folder (if any exist from previous version)
   - Add your own product images to `public/` folder
   - Update product images in the database or admin panel

3. **Contact Information**
   - Update email address in `app/contact/page.tsx`
   - Update phone number in `app/contact/page.tsx`
   - Update shipping information as needed

4. **Email Templates**
   - Customize email templates in `app/actions/checkout-actions.ts`
   - Update sender name and address

5. **Colors & Styling** (optional)
   - Update colors in `app/globals.css` to match your brand
   - Modify Tailwind theme in `tailwind.config.ts`

### Add More Pages

Create new pages in the `app/` directory:

```bash
app/
├── about/
│   └── page.tsx
├── faq/
│   └── page.tsx
└── privacy/
    └── page.tsx
```

## 📚 Documentation

- [STRIPE_SETUP.md](./STRIPE_SETUP.md) - Stripe payment integration guide
- [CLERK_SETUP_GUIDE.md](./CLERK_SETUP_GUIDE.md) - Clerk admin authentication
- [ADMIN_CMS_SETUP_GUIDE.md](./ADMIN_CMS_SETUP_GUIDE.md) - Admin CMS (page sections, testimonials, site settings)
- [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) - Checkout flow documentation
- [MULTI_TENANT.md](./MULTI_TENANT.md) - Multi-tenant architecture
- [CLIENT_ONBOARDING.md](./CLIENT_ONBOARDING.md) - Onboard clients (1 client = 1 tenant)
- [CUSTOMER_REGISTRATION_IMPLEMENTATION.md](../CUSTOMER_REGISTRATION_IMPLEMENTATION.md) - Customer accounts & order history

## 🧪 Testing

### Test Stripe Payments

Use Stripe test cards in development:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

Expiry: Any future date | CVC: Any 3 digits | ZIP: Any 5 digits

### Test Email Notifications

Emails are sent via Resend. In development, check your Resend dashboard for sent emails.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:

- `DATABASE_URL` - Production database URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `STRIPE_SECRET_KEY` - Live Stripe secret key (if using Stripe)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (if using Stripe webhooks)
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM_ADDRESS` - Verified sender email
- `BUSINESS_OWNER_EMAIL` - Where to receive order notifications
- `NEXT_PUBLIC_BASE_URL` - Your production URL

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:generate  # Generate database migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run db:seed      # Seed database with sample products
npm run db:seed:content  # Seed page sections, testimonials, site settings
```

## 🤝 Contributing

This is a template project. Feel free to customize it for your needs!

## 📄 License

MIT License - feel free to use this template for your projects.

## 🆘 Support

- **Stripe Issues:** [Stripe Support](https://support.stripe.com/)
- **Next.js Issues:** [Next.js Documentation](https://nextjs.org/docs)
- **Drizzle ORM:** [Drizzle Documentation](https://orm.drizzle.team/)

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Stripe](https://stripe.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Resend](https://resend.com/)
- [Neon](https://neon.tech/)
