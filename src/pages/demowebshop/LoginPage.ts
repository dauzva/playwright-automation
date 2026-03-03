import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage – Page Object for https://demowebshop.tricentis.com/login
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly validationSummary: Locator;
  readonly accountLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput       = page.locator('#Email');
    this.passwordInput    = page.locator('#Password');
    this.loginButton      = page.locator('input[value="Log in"]');
    this.validationSummary = page.locator('.validation-summary-errors');
    this.accountLink      = page.locator('.account');
  }

  /** Navigate directly to the login page */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Login with given credentials.
   * @returns the account email text shown in header on success
   */
  async login(email: string, password: string): Promise<void> {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Wait for navigation after login
    await this.page.waitForLoadState('networkidle');
  }

  /** Verify the user is logged in by checking header account link */
  async assertLoggedIn(expectedEmail: string): Promise<void> {
    await expect(this.accountLink).toBeVisible();
    await expect(this.accountLink).toContainText(expectedEmail);
  }

  /** Check if login failed (validation errors shown) */
  async hasLoginError(): Promise<boolean> {
    return await this.validationSummary.isVisible();
  }

  /** Logout via account dropdown */
  async logout(): Promise<void> {
    await this.page.goto('/logout');
    await this.page.waitForLoadState('networkidle');
  }
}
