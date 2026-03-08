import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getOrderByGatewayPaymentId,
  updateOrderPaymentStatus,
} from '@/src/db/queries/orders';
import { sendPaymentConfirmationEmails } from '@/lib/send-payment-confirmation-emails';
import { clearCheckoutPending } from '@/lib/checkout-pending';

/**
 * Verify BPC webhook signature (HMAC SHA-256).
 * X-Signature format: t=timestamp,v1=signature
 * signed_payload = body + '.' + timestamp
 */
function verifySignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader || !secret) return false;
  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {} as Record<string, string>);
  const timestamp = parts['t'];
  const sig = parts['v1'];
  if (!timestamp || !sig) return false;
  const signedPayload = `${payload}.${timestamp}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  let sigBuf: Buffer;
  let expBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, 'hex');
    expBuf = Buffer.from(expected, 'hex');
  } catch {
    return false;
  }
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') ?? request.headers.get('X-Signature');
    const secret = process.env.BPC_WEBHOOK_SECRET || '';

    if (!verifySignature(rawBody, signature, secret)) {
      console.warn('BPC webhook: invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as {
      type?: string;
      data?: { object?: { id?: string; paymentStatus?: string; status?: string } };
    };
    const eventType = event.type;
    const sessionId = event.data?.object?.id;
    const paymentStatus = event.data?.object?.paymentStatus;

    if (!sessionId) {
      return NextResponse.json({ received: true });
    }

    const order = await getOrderByGatewayPaymentId(sessionId);
    if (!order) {
      console.warn('BPC webhook: order not found for session', sessionId);
      return NextResponse.json({ received: true });
    }

    if (eventType === 'session.completed' && paymentStatus === 'paid') {
      await updateOrderPaymentStatus(order.id, {
        paymentStatus: 'paid',
        orderStatus: 'paid',
        gatewayPaymentId: sessionId,
        paymentGateway: 'bpc',
      }, order.tenantId);
      await sendPaymentConfirmationEmails(order.id);
      await clearCheckoutPending();
    } else if (eventType === 'session.expired') {
      await updateOrderPaymentStatus(order.id, {
        paymentStatus: 'failed',
        orderStatus: 'cancelled',
        paymentGateway: 'bpc',
      }, order.tenantId);
      await clearCheckoutPending();
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('BPC webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
