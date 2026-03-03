import { test, expect } from '@playwright/test';

/**
 * Exercise 1 – Task 1.2
 * Verify the test automation environment is set up correctly
 * and the target application homepage opens successfully.
 */
test.describe('Exercise 1 – Environment Setup', () => {
  test('TC-ENV-01: demowebshop.tricentis.com homepage loads correctly', async ({ page }) => {
    // ── Step 1: Navigate to the homepage ──────────────────────────────────
    await page.goto('https://demowebshop.tricentis.com/');
    await page.waitForLoadState('networkidle');

    // ── Step 2: Verify page title ─────────────────────────────────────────
    await expect(page).toHaveTitle(/Demo Web Shop/i);

    // ── Step 3: Verify site logo is visible ───────────────────────────────
    const logo = page.locator('.header-logo img');
    await expect(logo).toBeVisible();

    // ── Step 4: Verify main navigation is present ─────────────────────────
    const topNav = page.locator('.top-menu');
    await expect(topNav).toBeVisible();

    // ── Step 5: Verify "Register" link is visible ─────────────────────────
    const registerLink = page.locator('.header-links a[href="/register"]');
    await expect(registerLink).toBeVisible();

    // ── Step 6: Verify "Log in" link is visible ───────────────────────────
    const loginLink = page.locator('.header-links a[href="/login"]');
    await expect(loginLink).toBeVisible();

    // ── Step 7: Verify the shopping cart widget is present ────────────────
    const cartWidget = page.locator('#topcartlink');
    await expect(cartWidget).toBeVisible();

    // ── Step 8: Verify featured products section renders ─────────────────
    const featuredProducts = page.locator('.product-grid');
    await expect(featuredProducts.first()).toBeVisible();

    // ── Step 9: Verify footer is rendered ────────────────────────────────
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    // ── Step 10: Verify URL is correct ───────────────────────────────────
    expect(page.url()).toContain('demowebshop.tricentis.com');

    console.log('✅ Environment setup verified – homepage loaded successfully.');
  });
});
