/**
 * Sends payment confirmation emails (business + customer) after an order is marked paid.
 * Used by both the BPC webhook and the order-confirmation page (verify-on-return).
 * Uses tenant-specific email config when available.
 */
import { Resend } from 'resend';
import { getOrderWithItems } from '@/src/db/queries/orders';
import { getTenantEmailConfig } from '@/lib/tenant-email-config';
import {
  generatePaymentConfirmedBusinessEmail,
  generatePaymentConfirmedCustomerEmail,
  type OrderEmailData,
} from '@/lib/email-templates';

export async function sendPaymentConfirmationEmails(orderId: number): Promise<void> {
  try {
    const fullOrder = await getOrderWithItems(orderId);
    if (!fullOrder) return;

    const emailConfig = await getTenantEmailConfig(fullOrder.tenantId);
    const resend = new Resend(emailConfig.resendApiKey);
    const fromEmail = emailConfig.fromAddress
      ? `${emailConfig.fromName} <${emailConfig.fromAddress}>`
      : 'Your Store Orders <onboarding@resend.dev>';
    const businessEmail = emailConfig.businessOwnerEmail;

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

    if (businessEmail && emailConfig.resendApiKey) {
      await resend.emails.send({
        from: fromEmail,
        to: businessEmail,
        subject: `✅ Payment Confirmed - Order #${orderId}`,
        html: generatePaymentConfirmedBusinessEmail(businessEmailData),
      });
    }

    if (fullOrder.email && emailConfig.resendApiKey) {
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
