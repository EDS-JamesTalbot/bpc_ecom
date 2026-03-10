import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getOrderWithItems, updateOrderPaymentStatus } from '@/src/db/queries/orders';
import { clearCheckoutPending } from '@/lib/checkout-pending';
import { getSession } from '@/lib/bpc';
import { sendPaymentConfirmationEmails } from '@/lib/send-payment-confirmation-emails';
import Link from 'next/link';
import { CheckCircle, Package, Mail, Phone, MapPin } from 'lucide-react';
import { ClearCartOnPaid } from '@/app/components/ClearCartOnPaid';

async function OrderConfirmationContent({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderIdParam = searchParams.orderId;

  if (!orderIdParam) {
    redirect('/');
  }

  const orderId = parseInt(orderIdParam);

  if (isNaN(orderId)) {
    redirect('/');
  }

  let order = await getOrderWithItems(orderId);

  if (!order) {
    redirect('/');
  }

  await clearCheckoutPending();

  // Verify-on-return: if order is still pending and we have a BPC session, check session status
  // (allows payment to be confirmed without webhooks, e.g. when testing on localhost)
  if (order.paymentStatus === 'pending' && order.gatewayPaymentId) {
    const session = await getSession(order.gatewayPaymentId, order.tenantId);
    if (session?.paymentStatus === 'paid') {
      await updateOrderPaymentStatus(orderId, {
        paymentStatus: 'paid',
        orderStatus: 'paid',
        gatewayPaymentId: order.gatewayPaymentId,
        paymentGateway: 'bpc',
      }, order.tenantId);
      await sendPaymentConfirmationEmails(orderId);
      order = (await getOrderWithItems(orderId)) ?? order;
    }
  }

  const isPaid = order.paymentStatus === 'paid';
  const isPending = order.paymentStatus === 'pending';
  const isFailed = order.paymentStatus === 'failed';

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F9EF] to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Header + clear cart when paid (e.g. after BPC redirect) */}
          {isPaid && (
            <>
              <ClearCartOnPaid />
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-[#3A4A1E] mb-2">
                  Thank You for Your Order!
                </h1>
                <p className="text-lg text-[#5A6A3E]">
                  Your payment has been confirmed
                </p>
              </div>
            </>
          )}

          {/* Pending Header */}
          {isPending && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <Package className="w-12 h-12 text-yellow-600" />
              </div>
              <h1 className="text-4xl font-bold text-[#3A4A1E] mb-2">
                Order Pending
              </h1>
              <p className="text-lg text-[#5A6A3E]">
                We're processing your payment
              </p>
            </div>
          )}

          {/* Failed Header */}
          {isFailed && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-[#3A4A1E] mb-2">
                Payment Failed
              </h1>
              <p className="text-lg text-[#5A6A3E]">
                There was an issue processing your payment
              </p>
            </div>
          )}

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-[#E8F4D7]">
              <div>
                <h2 className="text-2xl font-semibold text-[#3A4A1E]">
                  Order #{order.id}
                </h2>
                <p className="text-sm text-[#5A6A3E] mt-1">
                  {new Date(order.createdAt).toLocaleDateString('en-NZ', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[#5A6A3E]">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                    isPaid
                      ? 'bg-green-100 text-green-800'
                      : isPending
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isPaid ? 'Paid' : isPending ? 'Pending' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#3A4A1E] mb-4">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[#5A6A3E]">Phone</p>
                    <p className="font-semibold text-[#3A4A1E]">{order.phoneNumber}</p>
                  </div>
                </div>
                {order.email && (
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[#5A6A3E]">Email</p>
                      <p className="font-semibold text-[#3A4A1E]">{order.email}</p>
                    </div>
                  </div>
                )}
                {(order.shippingAddress || order.shippingCountry) && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-[#5A6A3E]">Shipping Address</p>
                      <div className="font-semibold text-[#3A4A1E]">
                        {order.shippingAddress && (
                          <p className="whitespace-pre-wrap">{order.shippingAddress}</p>
                        )}
                        {order.shippingIsland && (
                          <p>{order.shippingIsland}</p>
                        )}
                        {order.shippingCountry && <p>{order.shippingCountry}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#3A4A1E] mb-4">
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-[#E8F4D7] last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-[#3A4A1E]">
                        {item.productName}
                      </p>
                      <p className="text-sm text-[#5A6A3E]">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-primary">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-[#E8F4D7] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-[#3A4A1E]">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${order.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-semibold text-[#3A4A1E] mb-4">
              What's Next?
            </h3>
            {isPaid && (
              <div className="space-y-3 text-[#5A6A3E]">
                <p>
                  ✅ <strong>Payment Confirmed:</strong> We've received your payment
                  successfully.
                </p>
                <p>
                  📞 <strong>Contact Soon:</strong> We'll reach out to you at{' '}
                  <strong>{order.phoneNumber}</strong> to arrange delivery or pickup.
                </p>
                {order.email && (
                  <p>
                    📧 <strong>Check Your Email:</strong> A confirmation email has
                    been sent to <strong>{order.email}</strong>.
                  </p>
                )}
                <p>
                  🧼 <strong>Product Quality:</strong> Your products are prepared with
                  care and attention to detail.
                </p>
              </div>
            )}
            {isPending && (
              <div className="space-y-3 text-[#5A6A3E]">
                <p>
                  ⏳ <strong>Payment Processing:</strong> Your payment is being
                  processed. This usually takes a few minutes.
                </p>
                <p>
                  🔄 <strong>Check Back Soon:</strong> Refresh this page or check your
                  email for updates.
                </p>
                <p>
                  💬 <strong>Need Help?</strong> Contact us if you have any concerns.
                </p>
              </div>
            )}
            {isFailed && (
              <div className="space-y-3 text-[#5A6A3E]">
                <p>
                  ❌ <strong>Payment Declined:</strong> Your payment could not be
                  processed.
                </p>
                <p>
                  🔁 <strong>Try Again:</strong> You can try placing a new order or
                  contact your bank.
                </p>
                <p>
                  💬 <strong>Need Assistance?</strong> Reach out to us for help with
                  your order.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons - Continue Shopping first (default) */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center w-full rounded-full bg-primary hover:bg-primary/90 text-white shadow-md px-6 py-3 font-medium transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center w-full rounded-full border-2 border-primary text-primary hover:bg-[#e0f2fe] px-6 py-3 font-medium transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const resolved = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-[#F5F9EF] to-white flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            <p className="mt-4 text-[#5A6A3E]">Loading order details...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent searchParams={resolved} />
    </Suspense>
  );
}

