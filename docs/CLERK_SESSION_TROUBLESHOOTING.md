# Clerk Session / Password Troubleshooting

If Clerk seems to "forget" passwords or log users out unexpectedly, the issue is usually **session persistence**, not password storage. Clerk stores passwords securely in its backend—your app never sees them.

## Common Causes & Fixes

### 1. Add Your Domain in Clerk Dashboard (Production)

**Symptom:** Sessions work on localhost but not on Vercel/production.

**Fix:** Clerk requires your production domain to be configured. You cannot use `*.vercel.app` for production—you need a custom domain.

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → **Domains**
2. Add your production domain (e.g. `bpc-ecom.yourdomain.com`)
3. Add the DNS records Clerk provides
4. Wait for DNS propagation (up to 48 hours)

If you're still on `bpc-ecom.vercel.app`, sessions may not persist reliably. Consider adding a custom domain.

---

### 2. Use Production Keys in Production

**Symptom:** Works in dev, fails in production.

**Fix:** Production deployments must use production Clerk keys:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → `pk_live_...` (not `pk_test_`)
- `CLERK_SECRET_KEY` → `sk_live_...` (not `sk_test_`)

In Clerk Dashboard: switch to **Production** (top-left), then copy API keys from **API Keys**.

Add these to Vercel: Project → Settings → Environment Variables (Production).

---

### 3. Set Sign-In / Sign-Up URLs (Fixes Stale Auth)

**Symptom:** After signing in, the UI doesn't update until a hard refresh.

**Fix:** Add these to `.env` and Vercel environment variables:

```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/shop
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/shop
```

(We use `/shop` because the sign-in modal opens from the shop page. Adjust if your flow differs.)

---

### 4. Session Token Lifetime (Clerk Dashboard)

**Symptom:** Users get logged out after a short time.

**Fix:** In Clerk Dashboard → **JWT Templates** (or **Session** settings), check the session token lifetime. Default is often 7 days. Increase if users are being logged out too soon.

---

### 5. Cookie / Browser Issues

**Symptom:** Intermittent logouts, works in one browser but not another.

**Checks:**
- Disable browser extensions that block cookies (e.g. strict privacy blockers)
- Ensure the site uses HTTPS in production (required for secure cookies)
- Try in an incognito/private window to rule out corrupted cookies

---

### 6. Different Clerk Instances (Dev vs Prod)

**Symptom:** Users exist in dev but not in prod (or vice versa).

**Fix:** Development and production use separate Clerk instances. Create users in the correct instance:

- **Development** (pk_test_, sk_test_): for localhost and preview deployments
- **Production** (pk_live_, sk_live_): for your live domain

---

## Quick Checklist

- [ ] Production domain added in Clerk Dashboard → Domains
- [ ] Production API keys (`pk_live_`, `sk_live_`) in Vercel for Production env
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and related URLs set in env
- [ ] Session token lifetime acceptable in Clerk Dashboard
- [ ] Site served over HTTPS in production
- [ ] No aggressive cookie-blocking extensions

---

## If Passwords Truly Don't Work

If users set a password and it never works (even immediately after setting it), that points to a Clerk backend issue:

1. In Clerk Dashboard → **User & Authentication** → **Email, Phone, Username**, ensure **Email address** and **Password** are enabled
2. Check Clerk status: [status.clerk.com](https://status.clerk.com)
3. Contact [Clerk Support](https://clerk.com/support) with your instance details
