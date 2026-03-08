# Lovey's Soap - Checkout System

A complete checkout and payment system integrated with Stripe and Neon database for Lovey's Soap e-commerce platform.

## ✨ Features

- ✅ **Customer Information Collection**
  - Full Name (required)
  - Phone Number (required)
  - Email (optional)
  
- ✅ **Secure Payment Processing**
  - Stripe Payment Elements integration
  - PCI compliant card processing
  - Support for multiple payment methods
  
- ✅ **Database Storage**
  - Order tracking with Neon PostgreSQL
  - Customer information storage
  - Order items with product snapshots
  - Payment status tracking
  
- ✅ **User Experience**
  - Multi-step checkout flow
  - Real-time form validation
  - Loading states and error handling
  - Success confirmation
  - Cart persistence

## 🏗️ Architecture

### Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **UI Components:** shadcn/ui, Tailwind CSS
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Payment:** Stripe, Taku-Ecommerce API (Bank of Cook Islands)
- **Validation:** Zod

### File Structure

```
loveysoap/
├── app/
│   ├── actions/
│   │   └── checkout-actions.ts          # Server actions for checkout
│   └── components/
│       ├── CheckoutForm.tsx              # Customer info form
│       ├── CheckoutDialog.tsx            # Multi-step checkout dialog
│       ├── PaymentForm.tsx               # Stripe payment elements
│       ├── CartView.tsx                  # Shopping cart with checkout
│       └── CartContext.tsx               # Cart state management
├── src/
│   └── db/
│       ├── index.ts                      # Database connection
│       ├── schema.ts                     # Database schema (orders, order_items)
│       └── queries/
│           └── orders.ts                 # Order CRUD operations
├── drizzle.config.ts                     # Drizzle ORM configuration
├── .env.local                            # Environment variables (gitignored)
├── CHECKOUT_SETUP.md                     # Setup guide
└── TAKU_API_INTEGRATION.md              # Taku API integration guide
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

Create `.env.local` in the root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Taku-Ecommerce API (optional)
TAKU_API_KEY=your_api_key
TAKU_API_URL=https://api.taku.example.com
```

### 3. Set Up Database

```powershell
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:push
```

### 4. Run Development Server

```powershell
npm run dev
```

Visit `http://localhost:3000` and test the checkout flow.

## 📝 Usage

### Customer Checkout Flow

1. **Browse Products** - Customer views soap products on homepage
2. **Add to Cart** - Click "Add to cart" button
3. **View Cart** - Click cart icon in header
4. **Checkout** - Click "Checkout" button
5. **Enter Info** - Fill in name, phone, and optionally email
6. **Payment** - Enter card details via Stripe Elements
7. **Confirmation** - Receive order confirmation

### Developer Integration

#### Create an Order

```typescript
import { processCheckout } from '@/app/actions/checkout-actions';

const result = await processCheckout({
  fullName: "John Doe",
  phoneNumber: "+682 12345",
  email: "john@example.com",
  items: [
    {
      productId: 1,
      productName: "Lavender Bliss Bar",
      price: 12.00,
      quantity: 2,
      image: "/images/lavender.jpg"
    }
  ],
  totalAmount: 24.00
});

if (result.success) {
  console.log('Order created:', result.orderId);
  console.log('Payment client secret:', result.clientSecret);
}
```

#### Query Orders

```typescript
import { getOrderWithItems } from '@/src/db/queries/orders';

const order = await getOrderWithItems(123);

console.log(order.fullName);
console.log(order.totalAmount);
console.log(order.items); // Array of order items
```

#### Update Payment Status

```typescript
import { updateOrderPaymentStatus } from '@/src/db/queries/orders';

await updateOrderPaymentStatus(orderId, {
  paymentStatus: 'paid',
  orderStatus: 'paid',
  stripePaymentIntentId: 'pi_123',
  stripeChargeId: 'ch_123'
});
```

## 🧪 Testing

### Test Cards (Stripe)

Use these test card numbers:

| Card Number         | Scenario              |
|--------------------|-----------------------|
| 4242 4242 4242 4242 | Success              |
| 4000 0025 0000 3155 | Requires auth        |
| 4000 0000 0000 9995 | Declined             |

**Expiry:** Any future date  
**CVC:** Any 3 digits  
**Postal Code:** Any value

### Test Workflow

1. Add products to cart
2. Click checkout
3. Enter test customer info
4. Use test card `4242 4242 4242 4242`
5. Complete payment
6. Verify order in database using `npm run db:studio`

## 🔒 Security

- ✅ **PCI Compliance** - Stripe handles card data
- ✅ **HTTPS Required** - For production
- ✅ **Input Validation** - Zod schema validation
- ✅ **SQL Injection Protection** - Drizzle ORM parameterized queries
- ✅ **Environment Variables** - Sensitive keys in `.env.local`

## 📊 Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  total_amount DECIMAL(10, 2) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500),
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuration

### Stripe Webhooks

For production, set up webhooks to automatically update order statuses:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Database Commands

```powershell
# Generate migrations from schema changes
npm run db:generate

# Push schema to database (dev)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open database GUI
npm run db:studio
```

## 🌐 Production Deployment

### Environment Setup

1. **Database:** Create production Neon database
2. **Stripe:** Switch to live mode, update API keys
3. **Environment Variables:** Set in hosting platform
4. **Webhooks:** Configure production webhook URLs

### Deployment Checklist

- [ ] Production database created
- [ ] Stripe live mode enabled
- [ ] Environment variables configured
- [ ] Webhooks set up and tested
- [ ] HTTPS enabled
- [ ] Test with real (small) payment
- [ ] Monitor error logs
- [ ] Set up backup strategy

## 📚 Documentation

- [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) - Detailed setup instructions
- [TAKU_API_INTEGRATION.md](./TAKU_API_INTEGRATION.md) - Taku-Ecommerce API guide
- [Stripe Documentation](https://stripe.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: DATABASE_URL is not set
```
Solution: Ensure `.env.local` exists with valid `DATABASE_URL`

**Stripe API Error**
```
Error: Invalid API Key
```
Solution: Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY`

**Payment Fails Silently**
```
Order created but payment status is pending
```
Solution: Check browser console, verify Stripe keys, test with different card

## 📞 Support

- **Stripe Issues:** [Stripe Support](https://support.stripe.com/)
- **Database Issues:** [Neon Support](https://neon.tech/docs)
- **Taku API:** Contact Bank of Cook Islands

## 🔄 Future Enhancements

- [ ] Order confirmation emails
- [ ] Admin dashboard for order management
- [ ] Order tracking for customers
- [ ] Refund processing
- [ ] Inventory management
- [ ] Shipping integration
- [ ] Discount codes
- [ ] Customer accounts

## 📄 License

Private - Lovey's Soap

---

**Created:** December 2, 2025  
**Last Updated:** December 2, 2025  
**Version:** 1.0.0

