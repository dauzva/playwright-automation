import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../src/pages/demowebshop/RegisterPage';
import { LoginPage }    from '../../src/pages/demowebshop/LoginPage';
import { ProductListPage }   from '../../src/pages/demowebshop/ProductListPage';
import { ProductDetailPage } from '../../src/pages/demowebshop/ProductDetailPage';
import { CartPage }      from '../../src/pages/demowebshop/CartPage';
import { CheckoutPage }  from '../../src/pages/demowebshop/CheckoutPage';
import { DataReader }    from '../../src/utils/DataReader';

/**
 * Exercise 2 – Task 2.1
 * Automates TC-001: E-Commerce end-to-end happy path with dynamic
 * price-based product selection (no site filter/sort used).
 *
 * Verifications present (≥ 5):
 *  V1 – Registration success message
 *  V2 – User is logged in (header contains email)
 *  V3 – Cart is not empty after adding expensive products
 *  V4 – All cart items have price > $900 (ARITHMETIC: every item price > 900)
 *  V5 – ARITHMETIC: sum of (price × qty) == displayed sub-total (within $0.01)
 *  V6 – Order confirmation page shows an order number
 */
test.describe('Exercise 2 Task 2.1 – E-Commerce Workflow (Price > $900)', () => {
  const testData    = DataReader.loadTestData();
  const userData    = testData.users[0];
  const address     = testData.shippingAddress;
  const PRICE_LIMIT = testData.priceThreshold; // 900

  // Generate a unique email per run to avoid "already registered" conflicts
  const uniqueEmail = RegisterPage.generateUniqueEmail(userData.email);

  // Track added product count for arithmetic verification
  let expectedCartCount = 0;

  test('TC-001: Full e-commerce end-to-end happy path', async ({ page }) => {
    const registerPage     = new RegisterPage(page);
    const loginPage        = new LoginPage(page);
    const productListPage  = new ProductListPage(page);
    const productDetailPage = new ProductDetailPage(page);
    const cartPage         = new CartPage(page);
    const checkoutPage     = new CheckoutPage(page);

    // ══════════════════════════════════════════════════════════════════════
    // PRECONDITION: Start on the homepage
    // ══════════════════════════════════════════════════════════════════════
    await page.goto('https://demowebshop.tricentis.com/');
    await page.waitForLoadState('networkidle');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 1-8: REGISTRATION
    // ─────────────────────────────────────────────────────────────────────
    await registerPage.register({
      firstName: userData.firstName,
      lastName:  userData.lastName,
      email:     uniqueEmail,
      password:  userData.password,
      gender:    userData.gender as 'Male' | 'Female',
      company:   userData.company,
    });

    // ── V1: Registration success ──────────────────────────────────────────
    await registerPage.assertRegistrationSuccess();
    console.log('✅ V1 PASS – Registration completed for:', uniqueEmail);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 9: LOGIN (we are already logged in after registration, but
    //         explicitly verify the header shows our account)
    // ─────────────────────────────────────────────────────────────────────
    // After registration on demowebshop, the user is auto-logged-in.
    // Confirm the account link shows our email.
    const accountLink = page.locator('.account');
    await expect(accountLink).toBeVisible();

    // ── V2: Logged in verification ────────────────────────────────────────
    await expect(accountLink).toContainText(uniqueEmail);
    console.log('✅ V2 PASS – User is logged in:', uniqueEmail);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 10-15: FIND PRODUCTS WITH PRICE > $900 ACROSS CATEGORIES
    // We manually scan each category page without using any site filter UI
    // ─────────────────────────────────────────────────────────────────────
    console.log(`🔍 Scanning categories for products > $${PRICE_LIMIT}...`);

    const expensiveProducts = await productListPage.findExpensiveProductsAcrossCategories(
      testData.categories,
      PRICE_LIMIT,
    );

    console.log(`Found ${expensiveProducts.length} product(s) above $${PRICE_LIMIT}:`);
    expensiveProducts.forEach((p) =>
      console.log(`  • ${p.name} – $${p.price} (${p.url})`),
    );

    // Ensure we found at least one expensive product
    expect(
      expensiveProducts.length,
      `Expected at least 1 product above $${PRICE_LIMIT} but found none.`,
    ).toBeGreaterThan(0);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 16-18: ADD EXPENSIVE PRODUCTS TO CART
    // Navigate to each product detail page and add to cart
    // ─────────────────────────────────────────────────────────────────────
    for (const product of expensiveProducts) {
      console.log(`🛒 Adding to cart: ${product.name} ($${product.price})`);
      await productDetailPage.goto(product.url);

      const actualPrice = await productDetailPage.getPrice();
      // Double-check the price on the detail page
      expect(actualPrice).toBeGreaterThan(PRICE_LIMIT);

      await productDetailPage.addToCart();
      expectedCartCount++;
      console.log(`  Added. Cart count should now be: ${expectedCartCount}`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // STEP 19: GO TO CART AND VERIFY
    // ─────────────────────────────────────────────────────────────────────
    await cartPage.goto();

    const cartItems = await cartPage.getCartItems();

    // ── V3: Cart is not empty ─────────────────────────────────────────────
    expect(cartItems.length, 'Cart should not be empty after adding products').toBeGreaterThan(0);
    console.log('✅ V3 PASS – Cart has', cartItems.length, 'item(s)');

    // ── V4: Every item has price > $900 (ARITHMETIC check) ───────────────
    for (const item of cartItems) {
      expect(
        item.price,
        `Item "${item.name}" has price $${item.price} which is NOT > $${PRICE_LIMIT}`,
      ).toBeGreaterThan(PRICE_LIMIT);
    }
    console.log('✅ V4 PASS – All cart items have price > $' + PRICE_LIMIT);

    // ── V5: ARITHMETIC – sum of subtotals equals order total ─────────────
    const computedSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const displayedTotal = await cartPage.getOrderTotal();

    // Allow $0.01 floating-point tolerance
    expect(
      Math.abs(computedSubtotal - displayedTotal),
      `Arithmetic mismatch: computed subtotal $${computedSubtotal.toFixed(2)} ≠ displayed $${displayedTotal.toFixed(2)}`,
    ).toBeLessThanOrEqual(0.01);
    console.log(
      `✅ V5 PASS – Arithmetic: computed $${computedSubtotal.toFixed(2)} == displayed $${displayedTotal.toFixed(2)}`,
    );

    // ─────────────────────────────────────────────────────────────────────
    // STEP 20-32: CHECKOUT FLOW
    // ─────────────────────────────────────────────────────────────────────
    await cartPage.proceedToCheckout();

    // Fill billing address
    await checkoutPage.fillBillingAddress({
      firstName: address.firstName,
      lastName:  address.lastName,
      email:     uniqueEmail,
      company:   address.company,
      country:   address.country,
      city:      address.city,
      address1:  address.address1,
      zip:       address.zip,
      phone:     address.phone,
    });

    // Continue shipping (use same address)
    await checkoutPage.continueShipping();

    // Select shipping method
    await checkoutPage.selectShippingMethod();

    // Select payment method
    await checkoutPage.selectPaymentMethod();

    // Continue through payment info
    await checkoutPage.continuePaymentInfo();

    // Confirm order
    await checkoutPage.confirmOrder();

    // ── V6: Order confirmation ────────────────────────────────────────────
    const orderNumber = await checkoutPage.assertOrderCompleted();
    expect(orderNumber.length, 'Order number should be non-empty').toBeGreaterThan(0);
    console.log('✅ V6 PASS – Order placed! Order number:', orderNumber);

    // ══════════════════════════════════════════════════════════════════════
    // POSTCONDITION: Logout
    // ══════════════════════════════════════════════════════════════════════
    await loginPage.logout();
    // Verify logout
    const loginLinkAfter = page.locator('.header-links a[href="/login"]');
    await expect(loginLinkAfter).toBeVisible();
    console.log('✅ POSTCONDITION – User logged out successfully.');
  });
});
