import { Page, Locator } from '@playwright/test';

export interface ProductInfo {
  name: string;
  price: number;
  url: string;
  hasDirectAddToCart: boolean;
}

/**
 * ProductListPage – handles browsing category pages and identifying
 * products that meet price criteria WITHOUT using site filter/sort UI.
 */
export class ProductListPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a category by relative path, e.g. '/computers/notebooks' */
  async navigateTo(categoryPath: string): Promise<void> {
    await this.page.goto(categoryPath);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Scan ALL products on the CURRENT page and return those with price
   * strictly above `threshold`. No site filtering/sorting is used –
   * we manually inspect every rendered price element.
   */
  async getProductsAbovePrice(threshold: number): Promise<ProductInfo[]> {
    const results: ProductInfo[] = [];

    // Each product item on a category listing page
    const productItems = this.page.locator('.product-item');
    const count = await productItems.count();

    for (let i = 0; i < count; i++) {
      const item = productItems.nth(i);

      // Price – demowebshop uses .actual-price or .price.actual-price
      const priceLocator = item.locator('.actual-price');
      if (!(await priceLocator.isVisible())) continue;

      const priceText = (await priceLocator.textContent()) ?? '';
      const price = this.parsePrice(priceText);
      if (price <= threshold) continue;

      // Product name + URL
      const titleAnchor = item.locator('h2.product-title a');
      const name = (await titleAnchor.textContent())?.trim() ?? 'Unknown';
      const href = (await titleAnchor.getAttribute('href')) ?? '';

      // Does this listing item have a direct "Add to cart" button?
	  const addToCartBtn = item.locator('.button-2.product-box-add-to-cart-button');
	  if (!(await addToCartBtn.isVisible())) continue;

      const hasDirectAddToCart = await addToCartBtn.isVisible();

      results.push({ name, price, url: href, hasDirectAddToCart });
    }

    return results;
  }

  /**
   * Scan multiple categories and return all products above the price threshold.
   * This iterates manually – no site filter/sort is used.
   */
  async findExpensiveProductsAcrossCategories(
    categories: string[],
    threshold: number,
  ): Promise<ProductInfo[]> {
    const allExpensive: ProductInfo[] = [];

    for (const cat of categories) {
      await this.navigateTo(cat);
      const found = await this.getProductsAbovePrice(threshold);
      allExpensive.push(...found);
    }

    // Deduplicate by URL
    const seen = new Set<string>();
    return allExpensive.filter((p) => {
      if (seen.has(p.url)) return false;
      seen.add(p.url);
      return true;
    });
  }

  /** Parse a price string like "$1,200.00" or "1200.00" → 1200 */
  parsePrice(text: string): number {
    const cleaned = text.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Add a product to cart directly from the listing page (product has a
   * visible "Add to cart" button without needing to open the detail page).
   */
  async addToCartFromListing(productUrl: string): Promise<void> {
    // Navigate to category page containing the product
    // Then find and click its "Add to cart" button by data-productid or href match
    const addBtn = this.page.locator(
      `.product-item:has(a[href="${productUrl}"]) .button-2.product-box-add-to-cart-button`,
    );
    await addBtn.click();
    // Wait for the notification to appear
    await this.page.waitForSelector('.bar-notification.success', { state: 'visible', timeout: 10_000 });
    // Wait for notification to auto-dismiss
    await this.page.waitForSelector('.bar-notification.success', { state: 'hidden', timeout: 15_000 });
  }

  /** Get the current cart item count from the header */
  async getCartCount(): Promise<number> {
    const countText = await this.page.locator('#topcartlink .cart-qty').textContent();
    // Format is "(3)" so strip parentheses
    const num = (countText ?? '0').replace(/[^0-9]/g, '');
    return parseInt(num, 10) || 0;
  }
}
