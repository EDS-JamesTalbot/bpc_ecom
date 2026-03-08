'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { createOrder, updateOrderGatewayPaymentId } from '@/src/db/queries/orders';
import { createCustomer, getCustomerByEmail } from '@/src/db/queries/customers';
import { getCustomerSession } from '@/lib/customer-auth';
import { createSession } from '@/lib/bpc';
import { Resend } from 'resend';
import { PAYMENT } from '@/lib/constants';
import { setCheckoutPending } from '@/lib/checkout-pending';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import {
  generateOrderCreatedEmail,
  type OrderEmailData,
} from '@/lib/email-templates';
import bcrypt from 'bcryptjs';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiter: Allow 3 checkout attempts per 5 minutes per IP
const checkoutLimiter = rateLimit({
  interval: 5 * 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const checkoutItemSchema = z.object({
  productId: z.number(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  image: z.string(),
});

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(5, 'Phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  shippingCountry: z.string().optional(),
  shippingIsland: z.string().optional(),
  shippingAddress: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, 'Cart must have at least one item'),
  totalAmount: z.number().min(PAYMENT.MINIMUM_CHARGE_AMOUNT, `Order must be at least $${PAYMENT.MINIMUM_CHARGE_AMOUNT}`),
  createAccount: z.boolean().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  newsletterOptIn: z.boolean().optional(),
});

type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Process Checkout (BPC Redirect)
 * Creates an order, creates a BPC payment session, returns paymentUrl for redirect.
 */
export async function processCheckout(input: CheckoutInput) {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);
    const rateLimitResult = checkoutLimiter.check(ip, 3);
    if (!rateLimitResult.success) {
      console.warn(`⚠️ Checkout rate limit exceeded for IP: ${ip}`);
      return {
        success: false,
        error: 'Too many orders submitted. Please wait a few minutes before trying again.',
      };
    }

    const validated = checkoutSchema.parse(input);

    let customerId: number | null = null;
    const existingSession = await getCustomerSession();

    if (existingSession) {
      customerId = existingSession.customerId;
    } else if (validated.createAccount && validated.password && validated.email) {
      const existingCustomer = await getCustomerByEmail(validated.email);
      if (existingCustomer) {
        return {
          success: false,
          error: 'An account with this email already exists. Please use guest checkout or sign in.',
        };
      }
      const passwordHash = await bcrypt.hash(validated.password, 10);
      const newCustomer = await createCustomer({
        email: validated.email,
        fullName: validated.fullName,
        phoneNumber: validated.phoneNumber || null,
        passwordHash,
        dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null,
        gender: validated.gender || null,
        newsletterOptIn: validated.newsletterOptIn || false,
        marketingOptIn: validated.newsletterOptIn || false,
        defaultShippingCountry: validated.shippingCountry || null,
        defaultShippingIsland: validated.shippingIsland || null,
        defaultShippingAddress: validated.shippingAddress || null,
      });
      customerId = newCustomer.id;
    }

    const { order, orderItems } = await createOrder(
      {
        customerId: customerId || undefined,
        fullName: validated.fullName,
        phoneNumber: validated.phoneNumber,
        email: validated.email || undefined,
        shippingCountry: validated.shippingCountry || undefined,
        shippingIsland: validated.shippingIsland || undefined,
        shippingAddress: validated.shippingAddress || undefined,
        totalAmount: validated.totalAmount.toFixed(2),
      },
      validated.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.image,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    if (!order) {
      throw new Error('Failed to create order in database');
    }

    // Order-created email to business
    try {
      const fromEmail = process.env.EMAIL_FROM_ADDRESS
        ? `${process.env.EMAIL_FROM_NAME || 'Your Store'} <${process.env.EMAIL_FROM_ADDRESS}>`
        : 'Your Store Orders <onboarding@resend.dev>';
      const businessEmail = process.env.BUSINESS_OWNER_EMAIL;
      if (businessEmail) {
        const emailData: OrderEmailData = {
          orderId: order.id,
          fullName: validated.fullName,
          phoneNumber: validated.phoneNumber,
          email: validated.email || undefined,
          shippingAddress: validated.shippingAddress || undefined,
          shippingIsland: validated.shippingIsland || undefined,
          shippingCountry: validated.shippingCountry || undefined,
          totalAmount: validated.totalAmount.toFixed(2),
          items: validated.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price.toString(),
          })),
        };
        await resend.emails.send({
          from: fromEmail,
          to: businessEmail,
          subject: `🛒 New Order #${order.id} - $${validated.totalAmount.toFixed(2)}`,
          html: generateOrderCreatedEmail(emailData),
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send order notification email:', emailError);
    }

    // Base URL for redirect return URLs
    // Use BPC_REDIRECT_BASE_URL if set (e.g. ngrok URL when BPC rejects localhost)
    const redirectBase = process.env.BPC_REDIRECT_BASE_URL?.replace(/\/$/, '');
    const baseUrl = redirectBase ?? (() => {
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      return `${protocol}://${host}`;
    })();

    const sessionResult = await createSession({
      amount: Math.round(validated.totalAmount * PAYMENT.CENTS_PER_DOLLAR),
      currency: PAYMENT.CURRENCY,
      successUrl: `${baseUrl}/order-confirmation?orderId=${order.id}`,
      failureUrl: `${baseUrl}/payment-failed?orderId=${order.id}`,
      merchantReferenceId: order.id.toString(),
    });

    if (!sessionResult.success) {
      return {
        success: false,
        error: sessionResult.error,
      };
    }

    const { session } = sessionResult;
    await updateOrderGatewayPaymentId(order.id, session.id);
    await setCheckoutPending();

    return {
      success: true,
      orderId: order.id,
      paymentUrl: session.paymentUrl,
      message: 'Order created. Redirect to payment.',
    };
  } catch (error) {
    console.error('Checkout error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }
    return {
      success: false,
      error: 'Failed to process checkout. Please try again.',
    };
  }
}
