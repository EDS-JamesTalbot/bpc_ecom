/**
 * Sends payment confirmation emails (business + customer) after an order is marked paid.
 * Used by both the BPC webhook and the order-confirmation page (verify-on-return).
 */
import { Resend } from 'resend';
import { getOrderWithItems } from '@/src/db/queries/orders';
import {
  generatePaymentConfirmedBusinessEmail,
  generatePaymentConfirmedCustomerEmail,
  type OrderEmailData,
} from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmails(orderId: number): Promise<void> {
  try {
    const fullOrder = await getOrderWithItems(orderId);
    if (!fullOrder) return;

    const fromEmail = process.env.EMAIL_FROM_ADDRESS
      ? `${process.env.EMAIL_FROM_NAME || 'Your Store'} <${process.env.EMAIL_FROM_ADDRESS}>`
      : 'Your Store Orders <onboarding@resend.dev>';
    const businessEmail = process.env.BUSINESS_OWNER_EMAIL;

    const businessEmailData: OrderEmailData = {
      orderId,
      fullName: fullOrder.fullName,
      phoneNumber: fullOrder.phoneNumber,
      email: fullOrder.email,
      shippingAddress: fullOrder.shippingAddress,
      shippingIsland: fullOrder.shippingIsland,
      shippingCountry: fullOrder.shippingCountry,
      totalAmount: fullOrder.totalAmount,
      cardBrand: 'card',
      cardLast4: '****',
    };

    if (businessEmail) {
      await resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: `✅ Payment Confirmed - Order #${orderId}`,
        html: generatePaymentConfirmedBusinessEmail(businessEmailData),
      });
    }

    if (fullOrder.email) {
      const customerEmailData: OrderEmailData = {
        ...businessEmailData,
        items: fullOrder.items,
      };
      await resend.emails.send({
        from: fromEmail,
        to: fullOrder.email,
        subject: `✅ Your Order #${orderId} Confirmation - Your Store`,
        replyTo: businessEmail || undefined,
        html: generatePaymentConfirmedCustomerEmail(customerEmailData),
      });
    }
  } catch (error) {
    console.error('sendPaymentConfirmationEmails failed:', error);
  }
}
