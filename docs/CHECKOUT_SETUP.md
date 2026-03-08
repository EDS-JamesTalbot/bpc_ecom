# Checkout & Payment Setup Guide

This guide covers setting up the checkout functionality for Lovey's Soap, including Neon database configuration, Stripe integration, and Taku-Ecommerce API integration.

## Table of Contents

1. [Database Setup](#database-setup)
2. [Environment Variables](#environment-variables)
3. [Database Migration](#database-migration)
4. [Stripe Configuration](#stripe-configuration)
5. [Taku-Ecommerce API Integration](#taku-ecommerce-api-integration)
6. [Testing the Checkout Flow](#testing-the-checkout-flow)
7. [Troubleshooting](#troubleshooting)

---

## Database Setup

### 1. Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project or select an existing one
3. Copy your connection string from the dashboard

The connection string will look like:
```
postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Taku-Ecommerce API Configuration (Bank of Cook Islands)
TAKU_API_KEY=your_taku_api_key_here
TAKU_API_URL=https://api.taku.example.com
```

### Getting Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. For webhooks, go to **Developers** → **Webhooks** and create an endpoint

---

## Database Migration

After setting up your environment variables, run the following commands to create your database tables:

```powershell
# Generate migration files
npm run db:generate

# Apply migrations to your database
npm run db:push
```

This will create two tables:

### `orders` Table
Stores customer information and order details:
- `id` - Order ID
- `fullName` - Customer's full name (required)
- `phoneNumber` - Customer's phone number (required)
- `email` - Customer's email (optional)
- `totalAmount` - Order total
- `orderStatus` - Order status (pending, paid, failed, cancelled)
- `paymentStatus` - Payment status (pending, paid, failed)
- `stripePaymentIntentId` - Stripe payment intent ID
- `stripeChargeId` - Stripe charge ID
- `createdAt` - Order creation timestamp
- `updatedAt` - Order update timestamp

### `order_items` Table
Stores individual items in each order:
- `id` - Item ID
- `orderId` - Reference to orders table
- `productId` - Product ID
- `productName` - Product name (snapshot)
- `productImage` - Product image URL (snapshot)
- `price` - Unit price at time of purchase
- `quantity` - Quantity ordered
- `createdAt` - Item creation timestamp

---

## Stripe Configuration

### Test Mode Setup

1. **Enable Test Mode** in your Stripe Dashboard
2. Use test card numbers for testing:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`
   - Use any future expiry date, any 3-digit CVC, and any postal code

### Webhook Configuration (Optional but Recommended)

To automatically update order statuses:

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env.local`

---

## Taku-Ecommerce API Integration

The Bank of Cook Islands' Taku-Ecommerce API is integrated with Stripe for payment processing.

### Configuration Steps

1. **Get API Credentials** from Bank of Cook Islands
   - Contact BCI to obtain your `TAKU_API_KEY`
   - Get the API endpoint URL

2. **Add to Environment Variables**
   ```env
   TAKU_API_KEY=your_api_key_here
   TAKU_API_URL=https://api.taku.example.com
   ```

3. **Update Stripe Integration** (if needed)
   
   The current implementation uses Stripe directly. To integrate Taku-Ecommerce API, you may need to modify `app/actions/checkout-actions.ts`:

   ```typescript
   // Example Taku-Ecommerce API integration
   const takuResponse = await fetch(`${process.env.TAKU_API_URL}/payments`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${process.env.TAKU_API_KEY}`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       amount: validated.totalAmount,
       currency: 'NZD',
       orderId: order.id,
       customer: {
         name: validated.fullName,
         phone: validated.phoneNumber,
         email: validated.email,
       },
     }),
   });
   ```

### Currency

The Cook Islands uses **New Zealand Dollar (NZD)**. The Stripe payment intent is configured to use `'nzd'` as the currency.

---

## Testing the Checkout Flow

### Step-by-Step Testing

1. **Start Development Server**
   ```powershell
   npm run dev
   ```

2. **Add Products to Cart**
   - Navigate to the homepage
   - Add soap products to your cart
   - Click the cart icon in the header

3. **Initiate Checkout**
   - Click the **Checkout** button in the cart
   - Enter customer information:
     - Full Name: `John Doe`
     - Phone Number: `+682 12345`
     - Email: `john@example.com` (optional)
   - Click **Continue to Payment**

4. **Enter Payment Details**
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - Click **Pay**

5. **Verify Order Creation**
   - Check your Neon database to confirm the order was created
   - Verify order status is `paid` and payment status is `paid`

### Database Verification

Use Drizzle Studio to view your orders:

```powershell
npm run db:studio
```

This will open a web interface where you can view all orders and order items.

---

## Troubleshooting

### Common Issues

#### 1. "DATABASE_URL is not set"

**Solution:** Ensure `.env.local` exists and contains your Neon connection string.

#### 2. Stripe: "Invalid API Key"

**Solution:** 
- Verify your API keys are correct
- Ensure you're using the correct keys (test vs. live mode)
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` has the `NEXT_PUBLIC_` prefix

#### 3. Payment Fails with "Network Error"

**Solution:**
- Check your internet connection
- Verify Stripe API keys are correct
- Check browser console for detailed error messages

#### 4. Order Created but Payment Status is "pending"

**Solution:**
- Verify webhook configuration
- Manually update order status using `confirmPayment` action
- Check Stripe Dashboard for payment intent status

#### 5. TypeScript Errors

**Solution:**
- Run `npm install` to ensure all dependencies are installed
- Restart your TypeScript server in VS Code

### Debug Mode

To enable detailed logging, add to your server actions:

```typescript
console.log('Checkout data:', validated);
console.log('Order created:', order);
console.log('Payment intent:', paymentIntent);
```

---

## File Structure

```
loveysoap/
├── app/
│   ├── actions/
│   │   └── checkout-actions.ts      # Server actions for checkout
│   └── components/
│       ├── CheckoutForm.tsx          # Customer info form
│       ├── CheckoutDialog.tsx        # Main checkout dialog
│       ├── PaymentForm.tsx           # Stripe payment form
│       └── CartView.tsx              # Cart with checkout button
├── src/
│   └── db/
│       ├── index.ts                  # Database connection
│       ├── schema.ts                 # Database schema
│       └── queries/
│           └── orders.ts             # Order query helpers
├── drizzle.config.ts                 # Drizzle configuration
├── .env.local                        # Environment variables (DO NOT COMMIT)
└── .env.example                      # Environment template
```

---

## Security Best Practices

1. **Never commit `.env.local`** - It contains sensitive keys
2. **Use HTTPS in production** - Required for Stripe
3. **Validate all inputs** - Already implemented with Zod
4. **Use webhook secrets** - Verify Stripe webhook signatures
5. **Store minimal card data** - Never store full card numbers
6. **Use Stripe's compliance** - Let Stripe handle PCI compliance

---

## Next Steps

1. **Production Setup**
   - Switch from Stripe test mode to live mode
   - Update API keys in production environment
   - Set up production webhooks
   - Test with real (small) payments

2. **Order Management**
   - Create admin dashboard to view orders
   - Add order fulfillment workflow
   - Implement order status emails

3. **Customer Experience**
   - Add order confirmation page
   - Send order confirmation emails
   - Implement order tracking

4. **Taku-Ecommerce Integration**
   - Contact Bank of Cook Islands for API access
   - Implement custom payment flow if required
   - Test integration thoroughly

---

## Support

For issues with:
- **Stripe:** [Stripe Support](https://support.stripe.com/)
- **Neon Database:** [Neon Support](https://neon.tech/docs/introduction)
- **Taku-Ecommerce API:** Contact Bank of Cook Islands

---

**Last Updated:** December 2, 2025

