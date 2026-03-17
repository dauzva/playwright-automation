import { test, expect } from '@playwright/test';
import { RegisterPage }     from '../../src/pages/demowebshop/RegisterPage';
import { LoginPage }        from '../../src/pages/demowebshop/LoginPage';
import { ProductListPage }  from '../../src/pages/demowebshop/ProductListPage';
import { ProductDetailPage } from '../../src/pages/demowebshop/ProductDetailPage';
import { CartPage }         from '../../src/pages/demowebshop/CartPage';
import { CheckoutPage }     from '../../src/pages/demowebshop/CheckoutPage';
import { DataReader }       from '../../src/utils/DataReader';

/**
 * Exercise 4 – Task 4.1
 * DATA-DRIVEN test using external files:
 *   • test-data/test-data.json  – shipping address, price threshold, categories
 *   • test-data/users.csv       – user credentials
 *
 * PRECONDITIONS:
 *   - User is registered (handled in beforeAll)
 *   - User is logged in   (handled in beforeAll)
 *   - Cart is empty       (handled in beforeAll)
 *
 * POSTCONDITIONS:
 *   - User logs out       (handled in afterAll)
 *   - Cart is cleaned up  (handled in afterAll)
 *
 * This test parametrizes across all CSV users, running the full
 * shopping workflow for each user record.
 */

// ── Load test data from external files ────────────────────────────────────────
const testData  = DataReader.loadTestData();           // JSON
const csvUsers  = DataReader.loadUsersFromCSV();       // CSV

console.log(`📂 Loaded ${csvUsers.length} user(s) from CSV`);
console.log(`📂 Price threshold from JSON: $${testData.priceThreshold}`);
console.log(`📂 Categories from JSON: ${testData.categories.join(', ')}`);

// ── Parametrized test – one iteration per CSV user ─────────────────────────

for (const csvUser of csvUsers) {
  /**
   * Generate a unique email per-run so re-runs don't fail on
   * "email already registered" errors.
   */
  const uniqueEmail = RegisterPage.generateUniqueEmail(csvUser.email);

  test.describe(`Data-Driven Test – User: ${csvUser.firstName} ${csvUser.lastName}`, () => {
    let registeredEmail = '';

    // ════════════════════════════════════════════════════════════════════
    // PRECONDITIONS
    // ════════════════════════════════════════════════════════════════════
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page    = await context.newPage();

      const registerPage = new RegisterPage(page);
      const cartPage     = new CartPage(page);

      // PRECONDITION 1: Register the user
      console.log(`\n🔧 [Precondition] Registering user: ${uniqueEmail}`);
      await registerPage.register({
        firstName: csvUser.firstName,
        lastName:  csvUser.lastName,
        email:     uniqueEmail,
        password:  csvUser.password,
        gender:    csvUser.gender,
      });
      await registerPage.assertRegistrationSuccess();
      registeredEmail = uniqueEmail;
      console.log(`✅ [Precondition] Registered: ${registeredEmail}`);

      // PRECONDITION 2: Ensure cart is empty
      console.log('🔧 [Precondition] Ensuring cart is empty...');
      await cartPage.emptyCart();
      console.log('✅ [Precondition] Cart is empty');

      await context.close();
    });

    // ════════════════════════════════════════════════════════════════════
    // TEST BODY
    // ════════════════════════════════════════════════════════════════════
    test(`should complete checkout for user ${csvUser.id}`, async ({ page }) => {
      const loginPage        = new LoginPage(page);
      const productListPage  = new ProductListPage(page);
      const productDetailPage = new ProductDetailPage(page);
      const cartPage         = new CartPage(page);
      const checkoutPage     = new CheckoutPage(page);

      // ── Login using credentials from CSV file ─────────────────────────
      console.log(`\n🔑 [Data from CSV] Logging in as: ${registeredEmail}`);
      await loginPage.login(registeredEmail, csvUser.password);
      await loginPage.assertLoggedIn(registeredEmail);
      console.log('✅ Login successful');

      // ── Find products > threshold using categories from JSON ──────────
      console.log(`🔍 [Data from JSON] Scanning categories for products > $${testData.priceThreshold}`);
      const expensiveProducts = await productListPage.findExpensiveProductsAcrossCategories(
        testData.categories,
        testData.priceThreshold,
      );

      expect(
        expensiveProducts.length,
        `No products found above $${testData.priceThreshold}`,
      ).toBeGreaterThan(0);

      console.log(`Found ${expensiveProducts.length} expensive product(s)`);

      // ── Add each expensive product to cart ────────────────────────────
      for (const product of expensiveProducts) {
        await productDetailPage.goto(product.url);
        const priceOnPage = await productDetailPage.getPrice();
        expect(priceOnPage).toBeGreaterThan(testData.priceThreshold);
        await productDetailPage.addToCart();
        console.log(`🛒 Added: ${product.name} ($${product.price})`);
      }

      // ── Verify cart contents ──────────────────────────────────────────
      await cartPage.goto();
      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBeGreaterThan(0);

	  // ── Logout ─────────────────────
	  await loginPage.logout();
	  console.log('✅ Logged out successfully');

    });

    // ════════════════════════════════════════════════════════════════════
    // POSTCONDITIONS
    // ════════════════════════════════════════════════════════════════════
    test.afterAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page    = await context.newPage();

      const loginPage = new LoginPage(page);
      const cartPage  = new CartPage(page);

      // POSTCONDITION 1: Login to perform cleanup
      await loginPage.login(registeredEmail, csvUser.password);

      // POSTCONDITION 2: Clear the cart (cleanup)
      console.log('🧹 [Postcondition] Clearing cart...');
      await cartPage.emptyCart();
      console.log('✅ [Postcondition] Cart cleared');

      // POSTCONDITION 3: Logout
      console.log('🔒 [Postcondition] Logging out...');
      await loginPage.logout();
      const loginLink = page.locator('.header-links a[href="/login"]');
      await expect(loginLink).toBeVisible();
      console.log('✅ [Postcondition] Logged out successfully');

      await context.close();
    });
  });
}
