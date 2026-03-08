import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getOrderWithItems } from '@/src/db/queries/orders';
import { clearCheckoutPending } from '@/lib/checkout-pending';
import Link from 'next/link';
import { XCircle, RefreshCw, Home, HelpCircle, ShoppingCart } from 'lucide-react';

async function PaymentFailedContent({
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

  const order = await getOrderWithItems(orderId);

  if (!order) {
    redirect('/');
  }

  await clearCheckoutPending();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F5F9EF] to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-[#3A4A1E] mb-2">
              Payment Failed
            </h1>
            <p className="text-lg text-[#5A6A3E]">
              We couldn't process your payment for Order #{order.id}
            </p>
          </div>

          {/* Error Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-semibold text-[#3A4A1E] mb-4 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-primary" />
              What Happened?
            </h3>
            <div className="space-y-3 text-[#5A6A3E] mb-6">
              <p>
                Your payment could not be completed. This can happen for several reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Insufficient funds in your account</li>
                <li>Card details were entered incorrectly</li>
                <li>Your bank declined the transaction</li>
                <li>The payment session expired</li>
                <li>Network or technical issues</li>
              </ul>
            </div>

            {/* Order Summary */}
            <div className="bg-[#F5F9EF] rounded-xl p-6 mb-6">
              <h4 className="font-semibold text-[#3A4A1E] mb-3">Your Order Summary</h4>
              <div className="space-y-2">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-[#5A6A3E]">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-semibold text-[#3A4A1E]">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-primary/20 pt-2 mt-2 flex justify-between items-center">
                  <span className="font-semibold text-[#3A4A1E]">Total</span>
                  <span className="text-xl font-bold text-primary">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* What to Do Next */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-3">
                📌 What You Can Do
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                <strong>Your cart is unchanged.</strong> Use &quot;Back to Cart&quot; to try again with the same items or change payment method.
              </p>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>
                  <strong>Back to Cart:</strong> Your items are still there — try checkout again with a different card or payment method
                </li>
                <li>
                  <strong>Check Your Card:</strong> Verify your card details and
                  available balance
                </li>
                <li>
                  <strong>Contact Your Bank:</strong> Ask why the payment was declined
                </li>
                <li>
                  <strong>Contact Us:</strong> Reach out if you need assistance with
                  your order
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h3 className="text-xl font-semibold text-[#3A4A1E] mb-4">
              Need Help?
            </h3>
            <p className="text-[#5A6A3E] mb-4">
              If you're having trouble completing your order or have questions,
              please don't hesitate to contact us:
            </p>
            <div className="space-y-2 text-[#5A6A3E]">
              <p>
                <strong className="text-[#3A4A1E]">Your Contact:</strong>{' '}
                {order.phoneNumber}
              </p>
              {order.email && (
                <p>
                  <strong className="text-[#3A4A1E]">Email:</strong> {order.email}
                </p>
              )}
            </div>
            <p className="mt-4 text-sm text-[#5A6A3E]">
              We'll be happy to assist you in completing your purchase.
            </p>
          </div>

          {/* Action Buttons - Back to cart first (your cart is still there) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/shop?openCart=1"
              className="inline-flex items-center justify-center w-full rounded-full bg-primary hover:bg-primary/90 text-white shadow-md px-6 py-3 font-medium transition-colors"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Back to Cart
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center w-full rounded-full border-2 border-primary text-primary hover:bg-[#e0f2fe] px-6 py-3 font-medium transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full rounded-full border-2 border-primary/50 text-[#5A6A3E] hover:bg-[#e0f2fe] px-6 py-3 font-medium transition-colors sm:col-span-2"
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#5A6A3E]">
              <strong>Note:</strong> No charges have been made to your account for
              this failed transaction.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function PaymentFailedPage({
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
            <p className="mt-4 text-[#5A6A3E]">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentFailedContent searchParams={resolved} />
    </Suspense>
  );
}

