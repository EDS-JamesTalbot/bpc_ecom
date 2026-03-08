# Template Customization Checklist

This template has been stripped of all business-specific content and uses generic placeholder text. Follow this checklist to customize it for your business.

## ✅ Required Customizations

### 1. Branding & Business Name
- [ ] Update store name in `app/layout.tsx` (currently "YOUR STORE")
- [ ] Update tagline in `app/layout.tsx` (currently "Your tagline goes here")
- [ ] Replace placeholder logo in `app/layout.tsx` with your actual logo image
- [ ] Update site metadata in `app/layout.tsx` (title and description)

### 2. Content & Text
- [ ] Replace lorem ipsum text on homepage (`app/page.tsx`)
- [ ] Update contact information in `app/contact/page.tsx`:
  - Email address (currently `contact@example.com`)
  - Phone number (currently `+1 (234) 567-890`)
  - Shipping/delivery information
- [ ] Replace testimonials in `app/testimonials/page.tsx` with real customer feedback
- [ ] Update shop page subtitle in `app/shop/ShopContent.tsx`

### 3. Products
- [ ] Remove/update seed data in `src/db/seed.ts` with your actual products
- [ ] Add product images to `public/` folder
- [ ] Remove any old product images from `public/` folder (35461.jpg, 35462.jpg, 35463.jpg, charcoal.jpg, turmeric.jpg, loveysoap.jpeg, eds.png if they exist)
- [ ] Update products via admin panel or database

### 4. Email Notifications
- [ ] Customize email templates in `app/actions/checkout-actions.ts`:
  - Business name (currently "Your Store")
  - Email footer text
  - "Your business tagline or location" text

### 5. Shipping & Regional Settings
- [ ] Update country list in `app/components/CheckoutForm.tsx` for your target markets
- [ ] Configure region/state selector if needed (currently disabled)
- [ ] Update default country in checkout form (currently "United States")
- [ ] Update currency in `app/actions/checkout-actions.ts` (currently USD)

### 6. Environment Variables (.env.local)
The user mentioned they will update the `.env.local` file directly. Required variables:
- Database (Neon PostgreSQL)
- Stripe (publishable and secret keys)
- Resend (for emails)
- Application URLs

See `ENV_SETUP.md` for detailed instructions.

### 7. Styling (Optional)
- [ ] Update color scheme in `app/globals.css` to match your brand
- [ ] Modify Tailwind theme in `tailwind.config.ts` if desired

## 📝 Additional Notes

### What's Already Been Done
✅ All "LoveySoap" references removed  
✅ Lorem ipsum placeholder text added throughout  
✅ Generic testimonials added  
✅ Contact info replaced with placeholders  
✅ Product images references removed  
✅ Logo replaced with simple placeholder  
✅ Email templates genericized  
✅ Database seed file updated with generic products  
✅ Cart storage key made generic  
✅ Currency changed to USD (from NZD)

### Files That Don't Need Changes
- All component UI files in `components/ui/`
- Database schema and queries (unless you need custom fields)
- Stripe integration code
- Admin panel functionality
- Cart and checkout logic

## 🚀 After Customization

1. Run database migrations: `npm run db:push`
2. Seed with your products: `npm run db:seed` (or use admin panel)
3. Test checkout flow with Stripe test cards
4. Verify email notifications are working
5. Test on mobile devices
6. Deploy to Vercel or your hosting platform

## 📞 Support

Refer to the main `README.md` for technical documentation and setup instructions.

