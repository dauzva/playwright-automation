import { Page, Locator, expect } from '@playwright/test';

/**
 * DynamicPropertiesPage – Page Object for https://demoqa.com/dynamic-properties
 *
 * Three buttons with time-based DOM changes (all after 5 seconds):
 *   1. #enableAfter   – disabled → enabled
 *   2. #colorChange   – color changes (white → danger/red)
 *   3. #visibleAfter  – hidden → visible
 *
 * Intelligent waits only – no page.waitForTimeout().
 */
export class DynamicPropertiesPage {
  readonly page: Page;

  readonly enableAfterButton: Locator;
  readonly colorChangeButton: Locator;
  readonly visibleAfterButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.enableAfterButton  = page.locator('#enableAfter');
    this.colorChangeButton  = page.locator('#colorChange');
    this.visibleAfterButton = page.locator('#visibleAfter');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://demoqa.com/dynamic-properties');
    await this.page.waitForLoadState('networkidle');
    await this.dismissAds();
  }

  private async dismissAds(): Promise<void> {
    try {
      const adClose = this.page.locator('#close-fixedban');
      if (await adClose.isVisible({ timeout: 2000 })) {
        await adClose.click();
      }
    } catch { /* no ad */ }
  }

  /** Returns true if the "Will enable 5 seconds" button is currently disabled */
  async isEnableAfterDisabled(): Promise<boolean> {
    return await this.enableAfterButton.isDisabled();
  }

  /**
   * Wait (without sleep) until the #enableAfter button transitions to enabled state.
   * Playwright's built-in `waitFor` with state:'enabled' polls the DOM.
   */
  async waitForEnableAfterEnabled(timeout = 15_000): Promise<void> {
    await this.enableAfterButton.waitFor({ state: 'visible', timeout });
    // Wait until not disabled
    await this.page.waitForFunction(
      () => {
        const btn = document.querySelector('#enableAfter') as HTMLButtonElement | null;
        return btn !== null && !btn.disabled;
      },
      undefined,
      { timeout },
    );
  }

  /**
   * Get the computed background or text color of the color-change button.
   * Returns a CSS rgb(...) string.
   */
  async getColorChangeButtonColor(): Promise<string> {
    return await this.page.evaluate(() => {
      const btn = document.querySelector('#colorChange');
      if (!btn) return '';
      return window.getComputedStyle(btn).color;
    });
  }

  /**
   * Wait until the color-change button's color differs from `initialColor`.
   * Uses waitForFunction for intelligent polling.
   */
  async waitForColorChange(initialColor: string, timeout = 15_000): Promise<void> {
    await this.page.waitForFunction(
      (init: string) => {
        const btn = document.querySelector('#colorChange');
        if (!btn) return false;
        const current = window.getComputedStyle(btn).color;
        return current !== init;
      },
      initialColor,
      { timeout },
    );
  }

  /**
   * Wait until the #visibleAfter button is visible in the DOM.
   */
  async waitForVisibleAfterAppears(timeout = 15_000): Promise<void> {
    await this.visibleAfterButton.waitFor({ state: 'visible', timeout });
  }

  /** Assert #enableAfter is disabled */
  async assertEnableAfterIsDisabled(): Promise<void> {
    await expect(this.enableAfterButton).toBeDisabled();
  }

  /** Assert #enableAfter is enabled */
  async assertEnableAfterIsEnabled(): Promise<void> {
    await expect(this.enableAfterButton).toBeEnabled();
  }

  /** Assert #visibleAfter is not visible */
  async assertVisibleAfterIsHidden(): Promise<void> {
    await expect(this.visibleAfterButton).toBeHidden();
  }

  /** Assert #visibleAfter is visible */
  async assertVisibleAfterIsVisible(): Promise<void> {
    await expect(this.visibleAfterButton).toBeVisible();
  }

  /** Click #enableAfter button */
  async clickEnableAfter(): Promise<void> {
    await this.enableAfterButton.click();
  }

  /** Click #visibleAfter button */
  async clickVisibleAfter(): Promise<void> {
    await this.visibleAfterButton.click();
  }
}
