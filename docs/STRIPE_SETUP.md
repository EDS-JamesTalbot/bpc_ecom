# Stripe Payment Integration Setup

This template uses **Stripe** for payment processing. Follow this guide to set up Stripe payments for your e-commerce website.

## Prerequisites

1. A Stripe account ([Sign up at stripe.com](https://stripe.com))
2. Stripe API keys (available in your Stripe Dashboard)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...                    # Your Stripe Secret Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe Publishable Key
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook signing secret (for production)

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000       # Your application URL

# Email Configuration (Resend)
RESEND_API_KEY=re_...                            # Your Resend API key
EMAIL_FROM_ADDRESS=orders@yourdomain.com         # Sender email address
EMAIL_FROM_NAME=Your Business Name               # Sender name
BUSINESS_OWNER_EMAIL=owner@yourdomain.com        # Where to receive order notifications

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgresql://...                     # Your Neon database connection string
```

## Getting Your Stripe Keys

### Test Mode (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. Add them to your `.env.local` file

### Live Mode (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Toggle to **Live mode** in the top right
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)
5. Add them to your production environment variables

## Payment Flow

### 1. Customer Checkout

The checkout process happens in two steps:

1. **Customer Information** (`CheckoutForm.tsx`)
   - Customer enters name, phone, email (optional)
   - Customer enters shipping address (optional)
   - Order is created in database with `pending` status

2. **Payment** (`PaymentForm.tsx`)
   - Stripe Payment Element is displayed
   - Customer enters card details securely
   - Payment is processed through Stripe
   - Order status is updated to `paid` on success

### 2. Server Actions

**File:** `app/actions/checkout-actions.ts`

- `processCheckout()` - Creates order and Stripe Payment Intent
- `confirmPayment()` - Verifies payment and updates order status
- `handleStripeWebhook()` - Handles Stripe webhook events (optional)

### 3. Database Schema

Orders are stored with the following Stripe-related fields:

```typescript
{
  stripePaymentIntentId: string;  // Stripe Payment Intent ID
  stripeChargeId: string;         // Stripe Charge ID
  paymentStatus: string;          // 'pending' | 'paid' | 'failed'
  paymentGateway: string;         // 'stripe'
}
```

## Testing Payments

Stripe provides test card numbers for development:

### Successful Payment
- **Card Number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

### Declined Payment
- **Card Number:** `4000 0000 0000 0002`
- **Expiry:** Any future date
- **CVC:** Any 3 digits

### Requires Authentication (3D Secure)
- **Card Number:** `4000 0025 0000 3155`
- **Expiry:** Any future date
- **CVC:** Any 3 digits

[Full list of test cards](https://stripe.com/docs/testing#cards)

## Email Notifications

The system sends two types of emails:

### 1. Business Owner Notification
Sent to `BUSINESS_OWNER_EMAIL` when:
- Order is created (payment pending)
- Payment is confirmed (payment successful)

### 2. Customer Confirmation
Sent to customer's email (if provided) when:
- Payment is confirmed

## Webhooks (Production Only)

For production, set up a webhook endpoint to handle payment events:

### 1. Create Webhook Endpoint

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### 2. Webhook Handler

The webhook handler is already implemented in `checkout-actions.ts`:

```typescript
export async function handleStripeWebhook(payload: string, signature: string)
```

You'll need to create an API route at `app/api/webhooks/stripe/route.ts` to receive webhook events:

```typescript
import { handleStripeWebhook } from '@/app/actions/checkout-actions';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';
  
  const result = await handleStripeWebhook(body, signature);
  
  if (result.success) {
    return new Response('Webhook processed', { status: 200 });
  } else {
    return new Response('Webhook processing failed', { status: 400 });
  }
}
```

## Currency

By default, the template uses **NZD (New Zealand Dollar)**. To change the currency:

1. Open `app/actions/checkout-actions.ts`
2. Find the `processCheckout` function
3. Change the `currency` parameter:

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(validated.totalAmount * 100),
  currency: 'usd', // Change to your currency code (e.g., 'usd', 'eur', 'gbp')
  // ...
});
```

[Supported currencies](https://stripe.com/docs/currencies)

## Security Best Practices

1. **Never expose your Secret Key** - Keep it in environment variables only
2. **Use HTTPS in production** - Stripe requires secure connections
3. **Validate webhook signatures** - Always verify webhook events
4. **Use Stripe's latest API version** - Keep your integration up to date
5. **Enable Stripe Radar** - Automatic fraud protection

## Troubleshooting

### Payment Intent Creation Fails

- Check that `STRIPE_SECRET_KEY` is set correctly
- Verify the amount is at least $0.50 (or equivalent in your currency)
- Check Stripe Dashboard logs for detailed error messages

### Webhooks Not Working

- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook endpoint is publicly accessible
- Review webhook logs in Stripe Dashboard

### Email Notifications Not Sending

- Verify `RESEND_API_KEY` is set
- Check `EMAIL_FROM_ADDRESS` and `BUSINESS_OWNER_EMAIL` are valid
- Review Resend dashboard for delivery logs

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Payment Intents API](https://stripe.com/docs/payments/payment-intents)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Resend Documentation](https://resend.com/docs)

## Support

For Stripe-specific issues, contact [Stripe Support](https://support.stripe.com/).

For template-related questions, refer to the main README.md file.

