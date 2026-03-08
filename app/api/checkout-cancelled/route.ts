/**
 * Clears checkout pending state when customer cancels from payment step.
 */

import { clearCheckoutPending } from '@/lib/checkout-pending';
import { NextResponse } from 'next/server';

export async function POST() {
  await clearCheckoutPending();
  return NextResponse.json({ ok: true });
}
