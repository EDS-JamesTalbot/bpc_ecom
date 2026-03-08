/**
 * Returns whether a checkout/payment transaction is in progress.
 * Used by AdminButton to block admin login during customer payments.
 */

import { isCheckoutPending } from '@/lib/checkout-pending';
import { NextResponse } from 'next/server';

export async function GET() {
  const pending = await isCheckoutPending();
  return NextResponse.json({ pending });
}
