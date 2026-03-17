import { Page, Locator } from '@playwright/test';

/**
 * ProductDetailPage – handles a single product's detail page.
 * Used when a product requires viewing its detail page before
 * adding to cart (e.g. configurable products).
 */
export class ProductDetailPage {
  readonly page: Page;

  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly addToCartButton: Locator;
  readonly attributeSelectors: Locator;
  readonly successNotification: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productName        = page.locator('.product-name h1');
    this.productPrice       = page.locator('.product-price span');
    this.addToCartButton    = page.locator('#add-to-cart-button-\\d+, input[value="Add to cart"]').first();
	this.attributeSelectors = page.locator('.attributes').last();
    this.successNotification = page.locator('.bar-notification.success');
  }

  /** Navigate to a product detail page */
  async goto(productUrl: string): Promise<void> {
    const url = productUrl.startsWith('http')
      ? productUrl
      : `https://demowebshop.tricentis.com${productUrl}`;
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /** Get the product's displayed price as a number */
  async getPrice(): Promise<number> {
    const text = (await this.productPrice.first().textContent()) ?? '0';
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  /** Get the product name */
  async getName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  /**
   * Add the product to the cart.
   * Handles both simple products (direct button) and products that might
   * show a qty input. For configurable products (Build-Your-Own),
   * the first available button is clicked with default selections.
   */
  async addToCart(): Promise<void> {
	if (await this.attributeSelectors.isVisible()) {
	  // If product has required attributes, we need to configure it first
	  await this.configureProduct();
	}
    // Click the first visible "Add to cart" button
    const btn = this.page.locator('input[value="Add to cart"]').first();
    await btn.waitFor({ state: 'visible' });
    await btn.click();

    // Wait for the green success bar to appear and then disappear
    await this.successNotification.waitFor({ state: 'visible', timeout: 10_000 });
    await this.successNotification.waitFor({ state: 'hidden', timeout: 15_000 });
  }

  /**
   * Check if the product needs special configuration (has required
   * option groups). Returns true if required radio/select groups exist.
   */
  async needsConfiguration(): Promise<boolean> {
    const requiredOptions = this.page.locator('.required-options-warning');
    return await requiredOptions.isVisible();
  }

  async configureProduct(): Promise<void> {
	const attributeGroups = this.attributeSelectors.locator('dd');
	const count = await attributeGroups.count();
	for (let i = 0; i < count; i++) {
	  const group = attributeGroups.nth(i);
	  const firstOption = group.locator('input[type="radio"], select').first();
	  if (await firstOption.isVisible()) {
		const tag = await firstOption.evaluate(el => el.tagName.toLowerCase());
		if (tag === 'input') {
		  await firstOption.check();
		} else if (tag === 'select') {
		  await firstOption.selectOption({ index: 1 });
		}
	  }
	}
  }
  
}
