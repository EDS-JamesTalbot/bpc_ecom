/**
 * Example Integration Test - Product Actions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { getProducts } from '@/app/actions/product-actions';

describe('Product Actions', () => {
  it('fetches all products', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('returns products with required fields', async () => {
    const products = await getProducts();
    
    if (products.length > 0) {
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('image');
    }
  });
});

