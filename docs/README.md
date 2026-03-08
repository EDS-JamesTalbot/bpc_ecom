# E-Commerce Website Template

A modern, full-featured e-commerce website template built with **Next.js 15**, **Stripe Payments**, **Drizzle ORM**, and **shadcn/ui**. Perfect for small businesses selling physical products online.

> **Note:** This is a generic template. Replace all placeholder text, images, and branding with your own content before deploying to production.

## ✨ Features

### 🛍️ E-Commerce Functionality
- **Product Catalog** - Display products with images, descriptions, and prices
- **Shopping Cart** - Add/remove items, adjust quantities, view totals
- **Secure Checkout** - Two-step checkout with customer info and payment
- **Stripe Integration** - Accept credit card payments securely
- **Order Management** - Track orders in PostgreSQL database
- **Email Notifications** - Automated order confirmations via Resend

### 🎨 User Interface
- **Responsive Design** - Mobile-first, works on all devices
- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **Image Upload** - Admin can upload product images (with cropping)
- **Admin Panel** - Manage products (add, edit, delete, toggle active status)
- **Cart Sidebar** - Slide-out cart with live updates

### 🔧 Technical Features
- **Next.js 15** - App Router, Server Components, Server Actions
- **TypeScript** - Fully typed for better developer experience
- **Drizzle ORM** - Type-safe database queries
- **Neon PostgreSQL** - Serverless Postgres database
- **Stripe Payments** - Payment Intent API with automatic payment methods
- **Resend** - Transactional email service
- **Zod Validation** - Runtime type checking and validation

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd websitetemplate
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

# Stripe
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
websitetemplate/
├── app/
│   ├── actions/              # Server Actions
│   │   ├── checkout-actions.ts   # Stripe payment processing
│   │   ├── product-actions.ts    # Product CRUD operations
│   │   └── admin-actions.ts      # Admin authentication
│   ├── components/           # React Components
│   │   ├── CartButton.tsx        # Shopping cart button
│   │   ├── CartContext.tsx       # Cart state management
│   │   ├── CartView.tsx          # Cart sidebar
│   │   ├── CheckoutDialog.tsx    # Checkout modal
│   │   ├── CheckoutForm.tsx      # Customer info form
│   │   ├── PaymentForm.tsx       # Stripe payment form
│   │   ├── Navigation.tsx        # Header navigation
│   │   ├── AdminButton.tsx       # Admin mode toggle
│   │   └── ImageCropper.tsx      # Image upload with cropping
│   ├── shop/                 # Shop page
│   │   ├── page.tsx              # Server Component
│   │   └── ShopContent.tsx       # Client Component
│   ├── contact/              # Contact page
│   ├── testimonials/         # Testimonials page
│   ├── order-confirmation/   # Order success page
│   ├── payment-failed/       # Payment failure page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── components/ui/            # shadcn/ui components
├── src/db/
│   ├── schema.ts             # Database schema (Drizzle)
│   ├── index.ts              # Database connection
│   ├── seed.ts               # Sample data seeder
│   └── queries/              # Database query helpers
│       ├── products.ts           # Product queries
│       └── orders.ts             # Order queries
├── lib/
│   └── utils.ts              # Utility functions
├── public/                   # Static assets
├── drizzle.config.ts         # Drizzle configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎯 Key Features Explained

### Admin Mode

Click the "Admin" button in the header to enter admin mode (password: `admin123`). In admin mode, you can:

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
- [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) - Checkout flow documentation
- [DATABASE_PERSISTENCE_IMPLEMENTATION.md](./DATABASE_PERSISTENCE_IMPLEMENTATION.md) - Database architecture

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
- `STRIPE_SECRET_KEY` - Live Stripe secret key (starts with `sk_live_`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Live Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (if using webhooks)
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
