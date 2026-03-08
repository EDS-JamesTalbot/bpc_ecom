# BPC Payment Gateway Setup

This guide helps you configure the BPC payment integration for the ecom_site_BPC template.

## 1. Create a BPC Account

1. Go to [BPC Developer Portal](https://dev.bpcbt.com/)
2. Click **Log In** (top right)
3. Create an account or sign in at the [BPC Cabinet](https://dev.bpcbt.com/cabinet/index.html#/auth?login)

## 2. Get Your API Key

1. Log in to the [BPC Cabinet](https://dev.bpcbt.com/cabinet/index.html#/)
2. Navigate to **API** or **Integrations** to find your API key
3. Copy the key for the **Sandbox** environment (for testing)

## 3. Environment Variables

Add to your `.env` file:

```env
# BPC Payment Gateway (required)
BPC_API_KEY=your_api_key_here

# Optional - defaults to https://dev.bpcbt.com/api2 for sandbox
BPC_GATEWAY_URL=https://dev.bpcbt.com/api2

# Optional - sandbox automatically uses EUR (required by BPC)
# For production, set to your currency (e.g. NZD, USD)
BPC_CURRENCY=EUR

# Optional - when BPC rejects localhost (412 error), use ngrok or public URL
# BPC_REDIRECT_BASE_URL=https://your-app.ngrok.io

# Optional - for webhook signature verification
BPC_WEBHOOK_SECRET=your_webhook_secret
```

## 4. Sandbox Limitations

The BPC Sandbox ([dev.bpcbt.com](https://dev.bpcbt.com/)) has specific requirements:

- **Currency**: Sandbox **only supports EUR**. The integration automatically uses EUR when connecting to dev.bpcbt.com.
- **Test cards**: Use the test cards from the [BPC docs](https://dev.bpcbt.com/), e.g. `5555 5555 5555 5599`
- **Redirect URLs**: `http://localhost:3000` is accepted for local testing

## 5. Webhooks (Optional for local testing)

For production, configure webhooks in the BPC Cabinet:

- `session.completed` - payment successful
- `session.expired` - session timed out
- `session.created` - session created

Set the webhook URL to: `https://yourdomain.com/api/webhooks/bpc`

For local development, the order-confirmation page verifies payment status on return, so webhooks are not required.

## 6. HTTP 412 - Redirect URLs Rejected

If you get a **412** error, BPC is rejecting your `successUrl`/`failureUrl`. Common causes:

1. **Whitelist required**: Log in to [BPC Cabinet](https://dev.bpcbt.com/cabinet/index.html#/) and add your redirect URLs to the allowed list (Settings → URLs or similar).

2. **Localhost not allowed**: Some BPC accounts don't accept `http://localhost:3000`. Use **ngrok** to expose your local server:
   ```bash
   ngrok http 3000
   ```
   Then add to `.env`:
   ```env
   BPC_REDIRECT_BASE_URL=https://your-ngrok-id.ngrok.io
   ```

3. **HTTPS required**: Production may require HTTPS URLs.

## 7. Troubleshooting

| Error | Solution |
|-------|----------|
| "BPC_API_KEY is not configured" | Add `BPC_API_KEY` to `.env` |
| "Invalid payment gateway credentials" (401) | Verify your API key in the BPC Cabinet |
| "Redirect URLs rejected" (412) | Whitelist URLs in BPC Cabinet, or use `BPC_REDIRECT_BASE_URL` with ngrok |
| "Payment service temporarily unavailable" | Check BPC_GATEWAY_URL and network; ensure EUR for sandbox |
| Currency errors | Sandbox requires EUR - the app auto-switches when using dev.bpcbt.com |

## References

- [BPC Redirect Integration Docs](https://dev.bpcbt.com/en/integration/apiv2/structure/redirect-integration-apiv2.html)
- [BPC Developer Portal](https://dev.bpcbt.com/)
