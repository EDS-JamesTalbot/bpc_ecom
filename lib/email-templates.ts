/**
 * Email Templates
 * Reusable email template functions for order notifications
 * 
 * Security: All user-provided data is HTML-escaped to prevent XSS attacks
 * Performance: Optimized with reusable helpers to reduce code duplication
 */

export type OrderEmailData = {
  orderId: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  shippingAddress?: string | null;
  shippingIsland?: string | null;
  shippingCountry?: string | null;
  totalAmount: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: string;
  }>;
  cardBrand?: string;
  cardLast4?: string;
};

/**
 * Configuration for email branding
 */
export const EMAIL_CONFIG = {
  storeName: 'Your Store',
  storeTagline: 'Your business tagline or location',
};

/**
 * Security: Escape HTML special characters to prevent XSS attacks
 * This function MUST be used for all user-provided data in email templates
 */
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
}

/**
 * Helper: Render customer details section
 * Security: All user data is HTML-escaped
 */
function renderCustomerDetails(data: OrderEmailData): string {
  return `
    <div style="background: #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0c4a6e; margin-top: 0;">Customer Details:</h3>
      <ul style="list-style: none; padding: 0; color: #0c4a6e;">
        <li><strong>Name:</strong> ${escapeHtml(data.fullName)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(data.phoneNumber)}</li>
        <li><strong>Email:</strong> ${escapeHtml(data.email) || 'Not provided'}</li>
      </ul>
    </div>
  `;
}

/**
 * Helper: Render shipping address section
 * Security: All user data is HTML-escaped
 */
function renderShippingAddress(data: OrderEmailData): string {
  if (!data.shippingAddress && !data.shippingCountry) {
    return '';
  }

  return `
    <div style="background: #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0c4a6e; margin-top: 0;">📦 Shipping Address:</h3>
      <ul style="list-style: none; padding: 0; color: #0c4a6e;">
        ${data.shippingAddress ? `<li>${escapeHtml(data.shippingAddress).replace(/\n/g, '<br>')}</li>` : ''}
        ${data.shippingIsland ? `<li><strong>Region:</strong> ${escapeHtml(data.shippingIsland)}</li>` : ''}
        ${data.shippingCountry ? `<li><strong>Country:</strong> ${escapeHtml(data.shippingCountry)}</li>` : ''}
      </ul>
    </div>
  `;
}

/**
 * Helper: Render shipping address section (Customer email variant with enhanced styling)
 * Security: All user data is HTML-escaped
 */
function renderShippingAddressCustomer(data: OrderEmailData): string {
  if (!data.shippingAddress && !data.shippingCountry) {
    return '';
  }

  return `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #0c4a6e; margin-top: 0; border-bottom: 2px solid #1DA1F9; padding-bottom: 10px;">📦 Delivery Address</h3>
      <div style="color: #0c4a6e; line-height: 1.6;">
        ${data.shippingAddress ? `<p style="margin: 5px 0;">${escapeHtml(data.shippingAddress).replace(/\n/g, '<br>')}</p>` : ''}
        ${data.shippingIsland ? `<p style="margin: 5px 0;"><strong>Region:</strong> ${escapeHtml(data.shippingIsland)}</p>` : ''}
        ${data.shippingCountry ? `<p style="margin: 5px 0;"><strong>Country:</strong> ${escapeHtml(data.shippingCountry)}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Helper: Render order items list (Business email variant)
 * Security: Product names are HTML-escaped, prices are validated
 */
function renderOrderItems(items: Array<{ productName: string; quantity: number; price: string | number }>): string {
  return `
    <h3 style="color: #0c4a6e;">Order Items:</h3>
    <ul style="color: #0c4a6e;">
      ${items.map(item => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        
        // Validation: Ensure price is valid
        if (isNaN(price) || price < 0) {
          console.error('Invalid price for item:', item);
          return `<li>${escapeHtml(item.productName)} × ${item.quantity} - Invalid price</li>`;
        }
        
        // Validation: Ensure quantity is valid
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          console.error('Invalid quantity for item:', item);
          return `<li>${escapeHtml(item.productName)} - Invalid quantity</li>`;
        }
        
        return `<li>${escapeHtml(item.productName)} × ${item.quantity} - $${(price * item.quantity).toFixed(2)}</li>`;
      }).join('')}
    </ul>
  `;
}

/**
 * Helper: Render order items list (Customer email variant with enhanced styling)
 * Security: Product names are HTML-escaped, prices are validated
 */
function renderOrderItemsCustomer(items: Array<{ productName: string; quantity: number; price: string | number }>): string {
  return items.map((item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    
    // Validation: Ensure price is valid
    if (isNaN(price) || price < 0) {
      console.error('Invalid price for item:', item);
      return `
        <li style="padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #0c4a6e;"><strong>${escapeHtml(item.productName)}</strong> x ${item.quantity}</span>
            <span style="color: #dc2626; font-weight: bold;">Invalid price</span>
          </div>
        </li>
      `;
    }
    
    // Validation: Ensure quantity is valid
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      console.error('Invalid quantity for item:', item);
      return `
        <li style="padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #0c4a6e;"><strong>${escapeHtml(item.productName)}</strong></span>
            <span style="color: #dc2626; font-weight: bold;">Invalid quantity</span>
          </div>
        </li>
      `;
    }
    
    return `
      <li style="padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #0c4a6e;"><strong>${escapeHtml(item.productName)}</strong> x ${item.quantity}</span>
          <span style="color: #1DA1F9; font-weight: bold;">$${(price * item.quantity).toFixed(2)}</span>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Helper: Render total amount section
 */
function renderTotal(amount: string): string {
  return `
    <div style="background: #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0; color: #0c4a6e;">Total: $${amount}</h3>
    </div>
  `;
}

/**
 * Helper: Render payment details section
 * Security: Card brand and last 4 digits are HTML-escaped
 */
function renderPaymentDetails(data: OrderEmailData): string {
  if (!data.cardBrand || !data.cardLast4) {
    return '';
  }

  return `
    <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #1DA1F9;">
      <h3 style="margin: 0; color: #0c4a6e;">Payment Successful: $${escapeHtml(data.totalAmount)}</h3>
      <p style="margin: 5px 0 0 0; color: #0c4a6e; font-size: 14px;">
        Paid with ${escapeHtml(data.cardBrand)} ending in ${escapeHtml(data.cardLast4)}
      </p>
    </div>
  `;
}

/**
 * Generate email for business owner when order is created
 * Security: All user data is properly escaped
 */
export function generateOrderCreatedEmail(data: OrderEmailData): string {
  const itemsList = data.items && data.items.length > 0 ? renderOrderItems(data.items) : '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1DA1F9;">New Order Received! 🎉</h2>
      <p style="font-size: 18px;"><strong>Order #${data.orderId}</strong></p>
      
      ${renderCustomerDetails(data)}
      ${renderShippingAddress(data)}
      ${itemsList}
      ${renderTotal(data.totalAmount)}
      
      <p style="color: #0c4a6e; font-size: 14px;">
        Payment is being processed. You'll receive another notification when payment is confirmed.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
      
      <p style="color: #888; font-size: 12px;">
        This is an automated notification from your store order system.
      </p>
    </div>
  `;
}

/**
 * Generate email for business owner when payment is confirmed
 * Security: All user data is properly escaped
 */
export function generatePaymentConfirmedBusinessEmail(data: OrderEmailData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1DA1F9;">Payment Confirmed! ✅</h2>
      <p style="font-size: 18px;"><strong>Order #${data.orderId}</strong></p>
      
      ${renderPaymentDetails(data)}
      ${renderCustomerDetails(data)}
      ${renderShippingAddress(data)}
      
      <p style="color: #0c4a6e; font-size: 16px;">
        <strong>Action Required:</strong> Contact the customer to arrange delivery/pickup.
      </p>
      
      ${data.email ? `
        <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FDB022;">
          <p style="margin: 0; color: #817F7E; font-size: 14px;">
            📧 <strong>Customer Confirmation:</strong> An order confirmation email has been sent to ${escapeHtml(data.email)}. 
            If they don't see it, ask them to check their spam/junk folder.
          </p>
        </div>
      ` : `
        <div style="background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FDB022;">
          <p style="margin: 0; color: #817F7E; font-size: 14px;">
            ℹ️ Customer did not provide an email address. Please contact them via phone.
          </p>
        </div>
      `}
      
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
      
      <p style="color: #888; font-size: 12px;">
        This is an automated notification from your store order system.
      </p>
    </div>
  `;
}

/**
 * Generate email for customer when payment is confirmed
 * Security: All user data is properly escaped using helper functions
 * Performance: Reuses helper functions to eliminate code duplication
 */
export function generatePaymentConfirmedCustomerEmail(data: OrderEmailData): string {
  const itemsList = data.items && data.items.length > 0 ? renderOrderItemsCustomer(data.items) : '';
  
  // Safely format card brand with proper escaping
  const cardBrand = data.cardBrand 
    ? escapeHtml(data.cardBrand.charAt(0).toUpperCase() + data.cardBrand.slice(1)) 
    : 'Card';
  const cardLast4 = escapeHtml(data.cardLast4 || '****');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1DA1F9 0%, #1891E0 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
      </div>
      
      <div style="background: #e0f2fe; padding: 30px;">
        <h2 style="color: #0c4a6e; margin-top: 0;">Order #${data.orderId}</h2>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0; border-bottom: 2px solid #1DA1F9; padding-bottom: 10px;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            ${itemsList}
          </ul>
          
          <div style="background: #bfdbfe; padding: 15px; border-radius: 8px; margin-top: 20px; border: 2px solid #1DA1F9;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="margin: 0; color: #0c4a6e; font-size: 20px;">Total Paid:</h3>
              <h3 style="margin: 0; color: #0c4a6e; font-size: 24px;">$${escapeHtml(data.totalAmount)}</h3>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0; border-bottom: 2px solid #1DA1F9; padding-bottom: 10px;">Payment Information</h3>
          <p style="color: #0c4a6e; margin: 10px 0;">
            <strong>Payment Method:</strong> ${cardBrand} ending in ****${cardLast4}
          </p>
          <p style="color: #0c4a6e; margin: 10px 0;">
            <strong>Payment Status:</strong> <span style="color: #0c4a6e; font-weight: bold;">✅ Paid</span>
          </p>
        </div>
        
        ${renderShippingAddressCustomer(data)}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0c4a6e; margin-top: 0; border-bottom: 2px solid #1DA1F9; padding-bottom: 10px;">What's Next?</h3>
          <p style="color: #0c4a6e; line-height: 1.6;">
            We'll contact you shortly at <strong>${escapeHtml(data.phoneNumber)}</strong> to ${data.shippingAddress ? 'confirm delivery details' : 'arrange delivery or pickup'} of your products.
          </p>
          <p style="color: #0c4a6e; line-height: 1.6;">
            If you have any questions, please don't hesitate to reach out!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
          <p style="color: #0c4a6e; font-size: 16px; margin: 10px 0;">
            <strong>${EMAIL_CONFIG.storeName}</strong>
          </p>
          <p style="color: #0c4a6e; font-size: 14px; margin: 5px 0;">
            ${EMAIL_CONFIG.storeTagline}
          </p>
        </div>
      </div>
      
      <div style="background: #0c4a6e; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #bfdbfe; font-size: 12px; margin: 0;">
          This is an automated confirmation email from ${EMAIL_CONFIG.storeName}.
        </p>
      </div>
    </div>
  `;
}

