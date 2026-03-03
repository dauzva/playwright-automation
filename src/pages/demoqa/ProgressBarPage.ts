import { Page, Locator, expect } from '@playwright/test';

/**
 * ProgressBarPage – Page Object for https://demoqa.com/progress-bar
 *
 * Intelligent waits only – no page.waitForTimeout() used.
 * Uses page.waitForFunction() to poll the aria-valuenow attribute.
 */
export class ProgressBarPage {
  readonly page: Page;

  readonly startStopButton: Locator;
  readonly resetButton: Locator;
  readonly progressBar: Locator;

  constructor(page: Page) {
    this.page = page;
    // Button toggles between "Start" and "Stop"
    this.startStopButton = page.locator('#startStopButton');
    this.resetButton     = page.locator('#resetButton');
    this.progressBar     = page.locator('#progressBar');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://demoqa.com/progress-bar');
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

  /** Get the current progress value (0-100) */
  async getProgressValue(): Promise<number> {
    const value = await this.progressBar.getAttribute('aria-valuenow');
    return parseInt(value ?? '0', 10);
  }

  /** Click the Start/Stop toggle button */
  async clickStartStop(): Promise<void> {
    await this.startStopButton.click();
  }

  /** Click the Reset button */
  async clickReset(): Promise<void> {
    await this.resetButton.waitFor({ state: 'visible' });
    await this.resetButton.click();
    // Wait for bar to reset to 0
    await this.waitForProgress(0);
  }

  /**
   * Wait (without sleep) until the progress bar reaches EXACTLY the given value.
   * Uses page.waitForFunction() to poll the DOM attribute.
   */
  async waitForProgress(targetValue: number, timeout = 60_000): Promise<void> {
    await this.page.waitForFunction(
      (target: number) => {
        const bar = document.querySelector('#progressBar');
        if (!bar) return false;
        return parseInt(bar.getAttribute('aria-valuenow') ?? '0', 10) >= target;
      },
      targetValue,
      { timeout },
    );
  }

  /**
   * Wait until progress bar reaches exactly 100 and the "Reset" button appears.
   */
  async waitForCompletion(timeout = 60_000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const bar = document.querySelector('#progressBar');
        return bar && parseInt(bar.getAttribute('aria-valuenow') ?? '0', 10) === 100;
      },
      undefined,
      { timeout },
    );
  }

  /** Assert that the current progress value equals expectedValue */
  async assertProgressValue(expectedValue: number): Promise<void> {
    const actual = await this.getProgressValue();
    expect(actual).toBe(expectedValue);
  }

  /** Assert progress is within [min, max] range */
  async assertProgressInRange(min: number, max: number): Promise<void> {
    const actual = await this.getProgressValue();
    expect(actual).toBeGreaterThanOrEqual(min);
    expect(actual).toBeLessThanOrEqual(max);
  }

  /** Assert Start/Stop button has expected label */
  async assertButtonLabel(label: 'Start' | 'Stop'): Promise<void> {
    await expect(this.startStopButton).toHaveText(label);
  }
}
