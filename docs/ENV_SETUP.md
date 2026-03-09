# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```bash
# ===================================
# E-COMMERCE TEMPLATE - ENVIRONMENT VARIABLES
# ===================================
# NEVER commit .env.local to version control!

# -----------------------------------
# DATABASE
# -----------------------------------
# Neon PostgreSQL Database URL
# Get this from: https://neon.tech
DATABASE_URL="postgresql://user:password@host/database"

# -----------------------------------
# STRIPE (Payment Processing)
# -----------------------------------
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Stripe Webhook Secret (for production webhooks)
# Get this from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET="whsec_..."

# -----------------------------------
# RESEND (Email Service)
# -----------------------------------
# Get this from: https://resend.com/api-keys
RESEND_API_KEY="re_..."

# Email Configuration
EMAIL_FROM_ADDRESS="orders@yourdomain.com"
EMAIL_FROM_NAME="Your Business Name"
BUSINESS_OWNER_EMAIL="owner@yourdomain.com"

# -----------------------------------
# CLERK (Admin Authentication)
# -----------------------------------
# Get these from: https://dashboard.clerk.com
# Admin users: Set Public metadata to {"role": "admin"} in Clerk Dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Recommended: Fixes session persistence (see docs/CLERK_SESSION_TROUBLESHOOTING.md)
# NEXT_PUBLIC_CLERK_SIGN_IN_URL=/shop
# NEXT_PUBLIC_CLERK_SIGN_UP_URL=/shop
# NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
# NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop

# -----------------------------------
# NODE ENVIRONMENT
# -----------------------------------
# Development: "development"
# Production: "production"
NODE_ENV="development"

# -----------------------------------
# APPLICATION URL
# -----------------------------------
# Your application's base URL
# Development: http://localhost:3000
# Production: https://yourdomain.com
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Step-by-Step Setup Guide

### 1. Database Setup (Neon PostgreSQL)

1. Go to [https://neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add it to `.env.local` as `DATABASE_URL`

### 2. Stripe Setup (Payment Processing)

#### Test Mode (Development)

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a free account
3. Navigate to **Developers → API keys**
4. Copy your **Test mode** keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)
5. Add them to `.env.local`

#### Live Mode (Production)

1. Complete Stripe account verification
2. Toggle to **Live mode** in Stripe Dashboard
3. Copy your **Live mode** keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)
4. Add them to your production environment

#### Webhooks (Production Only)

1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. Enter: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to production environment as `STRIPE_WEBHOOK_SECRET`

### 3. Resend Setup (Email Service)

1. Go to [https://resend.com](https://resend.com)
2. Create a free account (100 emails/day free)
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key (starts with `re_`)
6. Add it to `.env.local` as `RESEND_API_KEY`

#### Email Configuration

- **EMAIL_FROM_ADDRESS**: Must be a verified domain or use `onboarding@resend.dev` for testing
- **EMAIL_FROM_NAME**: Your business name (appears in email "From" field)
- **BUSINESS_OWNER_EMAIL**: Where order notifications are sent

**To use a custom domain:**

1. Go to **Domains** in Resend dashboard
2. Add your domain
3. Add DNS records to your domain provider
4. Verify domain
5. Use `orders@yourdomain.com` as `EMAIL_FROM_ADDRESS`

### 4. Admin Password

Set a strong password for admin access:

```bash
ADMIN_PASSWORD="your_secure_password_123!"
```

This password is required to:
- Add new products
- Edit existing products
- Delete products
- Toggle product visibility

### 5. Application URL

Set the base URL of your application:

**Development:**
```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Production:**
```bash
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

This is used for:
- Stripe payment redirects
- Email links
- Absolute URLs in metadata

## Environment Variable Checklist

Before running the application, verify you have set:

- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `EMAIL_FROM_ADDRESS` - Sender email address
- [ ] `EMAIL_FROM_NAME` - Sender name
- [ ] `BUSINESS_OWNER_EMAIL` - Order notification recipient
- [ ] `ADMIN_PASSWORD` - Admin panel password
- [ ] `NEXT_PUBLIC_BASE_URL` - Application URL

## Testing Your Setup

### 1. Test Database Connection

```bash
npm run db:push
```

If successful, your database schema will be created.

### 2. Test Stripe Connection

Run the development server and try a test payment:

```bash
npm run dev
```

Use Stripe test card: `4242 4242 4242 4242`

### 3. Test Email Sending

Complete a test order with an email address. Check:
- Your Resend dashboard for sent emails
- Your `BUSINESS_OWNER_EMAIL` inbox for order notification
- Customer email inbox for confirmation

## Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already configured)
- Use strong, unique passwords
- Rotate API keys regularly
- Use test keys in development
- Use live keys only in production

### ❌ DON'T:
- Commit `.env.local` to version control
- Share API keys publicly
- Use production keys in development
- Hardcode secrets in your code
- Use weak admin passwords

## Troubleshooting

### Database Connection Fails

- Verify `DATABASE_URL` is correct
- Check Neon dashboard for database status
- Ensure database is not paused (free tier auto-pauses after inactivity)

### Stripe Payments Fail

- Verify you're using test keys in development
- Check Stripe Dashboard → Logs for error details
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` has `NEXT_PUBLIC_` prefix

### Emails Not Sending

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard → Logs
- Verify `EMAIL_FROM_ADDRESS` is authorized
- Check spam folder for test emails

### Admin Login Fails

- Verify `ADMIN_PASSWORD` is set in `.env.local`
- Restart development server after changing environment variables
- Check browser console for errors

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add all environment variables in your hosting platform
2. Use **live** Stripe keys (starts with `sk_live_` and `pk_live_`)
3. Set `NODE_ENV="production"`
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain
5. Configure Stripe webhooks with your production URL
6. Verify domain in Resend for custom email addresses

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## Support

If you encounter issues:

1. Check this guide again
2. Review error messages in terminal/browser console
3. Check service dashboards (Neon, Stripe, Resend) for status and logs
4. Refer to [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed Stripe configuration
