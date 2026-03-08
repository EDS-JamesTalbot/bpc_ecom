/**
 * Example E2E Test - Shop Page
 */

import { test, expect } from '@playwright/test';

test.describe('Shop Page', () => {
  test('displays shop title and products', async ({ page }) => {
    await page.goto('/shop');
    
    // Check page title
    await expect(page.getByText('Our Collection')).toBeVisible();
    
    // Check that products are displayed
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('user can navigate between pages', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products to load
    await page.waitForSelector('article');
    
    // Check pagination exists if there are multiple pages
    const pagination = page.locator('nav[aria-label="pagination"]');
    const paginationExists = await pagination.count() > 0;
    
    if (paginationExists) {
      // Click next page button if it exists and is not disabled
      const nextButton = page.locator('button:has-text("Next")');
      const isDisabled = await nextButton.getAttribute('disabled');
      
      if (!isDisabled) {
        await nextButton.click();
        await page.waitForURL(/page=2/);
        expect(page.url()).toContain('page=2');
      }
    }
  });

  test('user can add product to cart', async ({ page }) => {
    await page.goto('/shop');
    
    // Wait for products to load
    await page.waitForSelector('article');
    
    // Click first "Add to cart" button
    await page.locator('button:has-text("Add to cart")').first().click();
    
    // Cart button should show count
    await expect(page.locator('text=/\\d+/')).toBeVisible();
  });
});

