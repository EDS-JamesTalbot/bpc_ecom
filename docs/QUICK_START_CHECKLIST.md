# 🚀 Quick Start Checklist - Checkout Setup

Follow these steps to get your checkout system up and running.

## ✅ Phase 1: Database Setup (15 minutes)

### Step 1: Create Neon Database
- [ ] Go to [console.neon.tech](https://console.neon.tech/)
- [ ] Sign up or log in
- [ ] Create a new project named "loveysoap"
- [ ] Copy your connection string (starts with `postgresql://`)

### Step 2: Configure Environment
- [ ] Create `.env.local` in project root
- [ ] Add `DATABASE_URL=your_connection_string`
- [ ] Save the file

### Step 3: Initialize Database
```powershell
cd c:\Users\JamesTalbot\.cursor\loveysoap
npm run db:push
```
- [ ] Run the command above
- [ ] Verify it completes successfully (no errors)

---

## ✅ Phase 2: Stripe Setup (10 minutes)

### Step 4: Get Stripe Keys
- [ ] Go to [dashboard.stripe.com](https://dashboard.stripe.com/)
- [ ] Sign up or log in
- [ ] Click "Developers" → "API keys"
- [ ] Copy your **Publishable key** (starts with `pk_test_`)
- [ ] Copy your **Secret key** (starts with `sk_test_`)

### Step 5: Add Stripe Keys to Environment
Open `.env.local` and add:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```
- [ ] Add publishable key
- [ ] Add secret key
- [ ] Save the file

---

## ✅ Phase 3: Test the Checkout (5 minutes)

### Step 6: Start Development Server
```powershell
npm run dev
```
- [ ] Run the command
- [ ] Open browser to `http://localhost:3000`

### Step 7: Complete Test Order
- [ ] Add a soap product to cart
- [ ] Click cart icon in header
- [ ] Click "Checkout" button
- [ ] Fill in test customer info:
  - **Full Name:** Test Customer
  - **Phone:** +682 12345
  - **Email:** test@example.com
- [ ] Click "Continue to Payment"
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: `12/34`
- [ ] CVC: `123`
- [ ] Click "Pay"
- [ ] See success message ✅

### Step 8: Verify Order in Database
```powershell
npm run db:studio
```
- [ ] Run the command
- [ ] Browser opens to database GUI
- [ ] Click "orders" table
- [ ] See your test order
- [ ] Verify `payment_status` is "paid"

---

## ✅ Phase 4: Taku-Ecommerce API (Optional)

### Step 9: Contact Bank of Cook Islands
- [ ] Email/call BCI technical support
- [ ] Request Taku-Ecommerce API credentials
- [ ] Receive API key and endpoint URL

### Step 10: Add Taku Configuration
Open `.env.local` and add:
```env
TAKU_API_KEY=your_api_key
TAKU_API_URL=https://api.taku.example.com
```
- [ ] Add API key
- [ ] Add API URL
- [ ] Save the file
- [ ] See [TAKU_API_INTEGRATION.md](./TAKU_API_INTEGRATION.md) for integration code

---

## 🎉 You're Done!

Your checkout system is now ready for testing. 

### What You've Accomplished:
✅ Database configured and migrated  
✅ Stripe payment processing integrated  
✅ Orders stored in Neon database  
✅ Tested end-to-end checkout flow  

### Next Steps:
1. **Customize**: Update product images and descriptions
2. **Test More**: Try different test cards and scenarios
3. **Production**: Follow [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) for production deployment
4. **Taku Integration**: Implement Taku-Ecommerce API as needed

---

## 📝 Environment File Summary

Your `.env.local` should now look like this:

```env
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# Taku-Ecommerce (optional)
TAKU_API_KEY=your_key
TAKU_API_URL=https://api.taku.example.com
```

---

## 🆘 Need Help?

### Something Not Working?

**Database Error:**
- Check `DATABASE_URL` is correct
- Ensure Neon database is active
- Try `npm run db:push` again

**Stripe Error:**
- Verify keys are correct (test mode: `pk_test_` and `sk_test_`)
- Check for typos
- Ensure `NEXT_PUBLIC_` prefix on publishable key

**Checkout Button Not Working:**
- Check browser console for errors
- Restart dev server (`Ctrl+C` then `npm run dev`)
- Clear browser cache

### Still Stuck?

1. Check [CHECKOUT_SETUP.md](./CHECKOUT_SETUP.md) for detailed guide
2. Review [Troubleshooting section](./CHECKOUT_SETUP.md#troubleshooting)
3. Check browser developer console (F12)
4. Verify all environment variables are set

---

## 📞 Support Resources

- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Neon Docs:** [neon.tech/docs](https://neon.tech/docs)
- **Drizzle Docs:** [orm.drizzle.team](https://orm.drizzle.team/)

---

**Setup Time:** ~30 minutes total  
**Difficulty:** Beginner-friendly  
**Prerequisites:** Node.js, npm, internet connection

**Last Updated:** December 2, 2025

