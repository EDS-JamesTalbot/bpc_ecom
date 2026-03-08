/**
 * Email Templates Security & Functionality Tests
 * 
 * These tests verify:
 * 1. XSS protection - All user input is properly escaped
 * 2. Input validation - Invalid data is handled gracefully
 * 3. Email generation - All templates render correctly
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrderCreatedEmail,
  generatePaymentConfirmedBusinessEmail,
  generatePaymentConfirmedCustomerEmail,
  type OrderEmailData,
} from '../../lib/email-templates';

describe('Email Templates - XSS Protection', () => {
  const maliciousData: OrderEmailData = {
    orderId: 123,
    fullName: '<script>alert("XSS")</script>',
    phoneNumber: '<img src=x onerror="alert(1)">',
    email: '"><script>alert("XSS")</script>',
    shippingAddress: '<svg onload="alert(1)">',
    shippingIsland: '<iframe src="evil.com"></iframe>',
    shippingCountry: 'javascript:alert(1)',
    totalAmount: '100.00',
    items: [
      {
        productName: '<script>steal_cookies()</script>',
        quantity: 1,
        price: '50.00',
      },
    ],
    cardBrand: '<b>visa</b>',
    cardLast4: '1234<script>',
  };

  it('should escape HTML in order created email', () => {
    const email = generateOrderCreatedEmail(maliciousData);
    
    // Should NOT contain raw script tags
    expect(email).not.toContain('<script>');
    expect(email).not.toContain('onerror=');
    expect(email).not.toContain('<iframe');
    expect(email).not.toContain('javascript:');
    
    // Should contain escaped versions
    expect(email).toContain('&lt;script&gt;');
    expect(email).toContain('&lt;img');
    expect(email).toContain('&lt;svg');
    expect(email).toContain('&lt;iframe');
  });

  it('should escape HTML in payment confirmed business email', () => {
    const email = generatePaymentConfirmedBusinessEmail(maliciousData);
    
    // Should NOT contain raw script tags
    expect(email).not.toContain('<script>');
    expect(email).not.toContain('onerror=');
    
    // Should contain escaped versions
    expect(email).toContain('&lt;script&gt;');
  });

  it('should escape HTML in payment confirmed customer email', () => {
    const email = generatePaymentConfirmedCustomerEmail(maliciousData);
    
    // Should NOT contain raw script tags
    expect(email).not.toContain('<script>');
    expect(email).not.toContain('onerror=');
    expect(email).not.toContain('<b>visa</b>'); // Card brand should be escaped
    
    // Should contain escaped versions
    expect(email).toContain('&lt;script&gt;');
    expect(email).toContain('&lt;b&gt;'); // Escaped card brand
  });

  it('should escape product names in all emails', () => {
    const emails = [
      generateOrderCreatedEmail(maliciousData),
      generatePaymentConfirmedCustomerEmail(maliciousData),
    ];

    emails.forEach(email => {
      expect(email).not.toContain('steal_cookies()');
      expect(email).toContain('&lt;script&gt;');
    });
  });

  it('should escape special characters in addresses', () => {
    const email = generatePaymentConfirmedCustomerEmail(maliciousData);
    
    // SVG tag should be escaped
    expect(email).not.toContain('<svg onload=');
    expect(email).toContain('&lt;svg');
  });
});

describe('Email Templates - Input Validation', () => {
  it('should handle invalid prices gracefully', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'John Doe',
      phoneNumber: '555-0123',
      totalAmount: '100.00',
      items: [
        {
          productName: 'Valid Product',
          quantity: 2,
          price: 'invalid' as any, // Invalid price
        },
      ],
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toContain('Invalid price');
  });

  it('should handle invalid quantities gracefully', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'John Doe',
      phoneNumber: '555-0123',
      totalAmount: '100.00',
      items: [
        {
          productName: 'Valid Product',
          quantity: -1, // Invalid quantity
          price: '50.00',
        },
      ],
    };

    const email = generatePaymentConfirmedCustomerEmail(data);
    expect(email).toContain('Invalid quantity');
  });

  it('should handle negative prices', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'John Doe',
      phoneNumber: '555-0123',
      totalAmount: '100.00',
      items: [
        {
          productName: 'Product',
          quantity: 1,
          price: '-50.00',
        },
      ],
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toContain('Invalid price');
  });

  it('should handle fractional quantities', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'John Doe',
      phoneNumber: '555-0123',
      totalAmount: '100.00',
      items: [
        {
          productName: 'Product',
          quantity: 1.5, // Fractional quantity
          price: '50.00',
        },
      ],
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toContain('Invalid quantity');
  });
});

describe('Email Templates - Functional Tests', () => {
  const validData: OrderEmailData = {
    orderId: 12345,
    fullName: 'Jane Smith',
    phoneNumber: '+1-555-123-4567',
    email: 'jane@example.com',
    shippingAddress: '123 Main St\nApt 4B',
    shippingIsland: 'Manhattan',
    shippingCountry: 'United States',
    totalAmount: '249.99',
    items: [
      {
        productName: 'Premium Widget',
        quantity: 2,
        price: '99.99',
      },
      {
        productName: 'Basic Gadget',
        quantity: 1,
        price: '50.01',
      },
    ],
    cardBrand: 'visa',
    cardLast4: '4242',
  };

  it('should generate order created email with all details', () => {
    const email = generateOrderCreatedEmail(validData);
    
    expect(email).toContain('Order #12345');
    expect(email).toContain('Jane Smith');
    expect(email).toContain('+1-555-123-4567');
    expect(email).toContain('jane@example.com');
    expect(email).toContain('Premium Widget');
    expect(email).toContain('Basic Gadget');
    expect(email).toContain('$249.99');
  });

  it('should generate payment confirmed business email', () => {
    const email = generatePaymentConfirmedBusinessEmail(validData);
    
    expect(email).toContain('Payment Confirmed!');
    expect(email).toContain('Order #12345');
    expect(email).toContain('Jane Smith');
    expect(email).toContain('jane@example.com');
    expect(email).toContain('visa');
    expect(email).toContain('4242');
  });

  it('should generate payment confirmed customer email', () => {
    const email = generatePaymentConfirmedCustomerEmail(validData);
    
    expect(email).toContain('Thank You for Your Order!');
    expect(email).toContain('Order #12345');
    expect(email).toContain('Premium Widget');
    expect(email).toContain('$249.99');
    expect(email).toContain('+1-555-123-4567');
  });

  it('should handle missing email gracefully', () => {
    const dataWithoutEmail: OrderEmailData = {
      ...validData,
      email: null,
    };

    const email = generatePaymentConfirmedBusinessEmail(dataWithoutEmail);
    expect(email).toContain('Not provided');
    expect(email).toContain('did not provide an email address');
  });

  it('should handle missing shipping address gracefully', () => {
    const dataWithoutShipping: OrderEmailData = {
      ...validData,
      shippingAddress: null,
      shippingIsland: null,
      shippingCountry: null,
    };

    const email = generatePaymentConfirmedCustomerEmail(dataWithoutShipping);
    expect(email).not.toContain('Delivery Address');
  });

  it('should handle missing items gracefully', () => {
    const dataWithoutItems: OrderEmailData = {
      ...validData,
      items: undefined,
    };

    const email = generateOrderCreatedEmail(dataWithoutItems);
    expect(email).toContain('Order #12345');
    expect(email).not.toContain('Order Items:');
  });

  it('should calculate item totals correctly', () => {
    const email = generateOrderCreatedEmail(validData);
    
    // Premium Widget: 2 × $99.99 = $199.98
    expect(email).toContain('$199.98');
    
    // Basic Gadget: 1 × $50.01 = $50.01
    expect(email).toContain('$50.01');
  });

  it('should format addresses with line breaks', () => {
    const email = generatePaymentConfirmedCustomerEmail(validData);
    
    // Newlines should be converted to <br> tags
    expect(email).toContain('123 Main St<br>Apt 4B');
  });

  it('should capitalize card brand in customer email', () => {
    const email = generatePaymentConfirmedCustomerEmail(validData);
    
    // 'visa' should be capitalized to 'Visa'
    expect(email).toContain('Visa ending in');
  });
});

describe('Email Templates - Edge Cases', () => {
  it('should handle empty string values', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: '',
      phoneNumber: '',
      email: '',
      totalAmount: '0.00',
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toBeDefined();
    expect(email.length).toBeGreaterThan(0);
  });

  it('should handle very long product names', () => {
    const longName = 'A'.repeat(1000);
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'Test User',
      phoneNumber: '555-0123',
      totalAmount: '100.00',
      items: [
        {
          productName: longName,
          quantity: 1,
          price: '100.00',
        },
      ],
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toContain('A'.repeat(100)); // Should contain part of the name
  });

  it('should handle special characters in addresses', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'Test User',
      phoneNumber: '555-0123',
      shippingAddress: 'Café & Restaurant\n"The Best" Place\n\'Special\' Address',
      totalAmount: '100.00',
    };

    const email = generatePaymentConfirmedCustomerEmail(data);
    
    // Special characters should be escaped
    expect(email).toContain('&amp;');
    expect(email).toContain('&quot;');
    expect(email).toContain('&#039;');
  });

  it('should handle zero prices', () => {
    const data: OrderEmailData = {
      orderId: 123,
      fullName: 'Test User',
      phoneNumber: '555-0123',
      totalAmount: '0.00',
      items: [
        {
          productName: 'Free Item',
          quantity: 1,
          price: '0.00',
        },
      ],
    };

    const email = generateOrderCreatedEmail(data);
    expect(email).toContain('$0.00');
  });
});
