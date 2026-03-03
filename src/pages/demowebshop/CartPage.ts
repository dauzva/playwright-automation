import { Page, Locator, expect } from '@playwright/test';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * CartPage – Page Object for https://demowebshop.tricentis.com/cart
 */
export class CartPage {
  readonly page: Page;

  readonly cartItems: Locator;
  readonly orderTotal: Locator;
  readonly termsCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems       = page.locator('.cart-item-row');
    this.orderTotal      = page.locator('.order-total strong');
    this.termsCheckbox   = page.locator('#termsofservice');
    this.checkoutButton  = page.locator('#checkout');
    this.emptyCartMessage = page.locator('.order-summary-content');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
    await this.page.waitForLoadState('networkidle');
  }

  /** Returns all cart items with parsed price/quantity/subtotal */
  async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const rows = this.cartItems;
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const name     = (await row.locator('.product-name a').textContent())?.trim() ?? '';
      const priceStr = (await row.locator('.unit-price .product-unit-price').textContent()) ?? '0';
      const qtyStr   = (await row.locator('.quantity input').inputValue()) ?? '1';
      const subStr   = (await row.locator('.subtotal .product-subtotal').textContent()) ?? '0';

      items.push({
        name,
        price:    parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0,
        quantity: parseInt(qtyStr, 10) || 1,
        subtotal: parseFloat(subStr.replace(/[^0-9.]/g, '')) || 0,
      });
    }

    return items;
  }

  /** Parses the order total displayed on the cart page */
  async getOrderTotal(): Promise<number> {
    await this.page.waitForSelector('.order-total', { state: 'visible' });
    const text = (await this.orderTotal.textContent()) ?? '0';
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  /** Remove all items from cart (update each qty to 0 and click Update) */
  async emptyCart(): Promise<void> {
    await this.goto();
    // Click all remove buttons
    const removeButtons = this.page.locator('.remove-btn');
    const count = await removeButtons.count();
    for (let i = count - 1; i >= 0; i--) {
      await removeButtons.nth(i).click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /** Accept terms and proceed to checkout */
  async proceedToCheckout(): Promise<void> {
    await this.termsCheckbox.check();
    await expect(this.termsCheckbox).toBeChecked();
    await this.checkoutButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
