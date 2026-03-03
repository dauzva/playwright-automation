import { Page, Locator, expect } from '@playwright/test';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender?: 'Male' | 'Female';
  company?: string;
}

/**
 * RegisterPage – Page Object for https://demowebshop.tricentis.com/register
 */
export class RegisterPage {
  readonly page: Page;

  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly companyInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly resultMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.genderMale           = page.locator('#gender-male');
    this.genderFemale         = page.locator('#gender-female');
    this.firstNameInput       = page.locator('#FirstName');
    this.lastNameInput        = page.locator('#LastName');
    this.emailInput           = page.locator('#Email');
    this.companyInput         = page.locator('#Company');
    this.passwordInput        = page.locator('#Password');
    this.confirmPasswordInput = page.locator('#ConfirmPassword');
    this.registerButton       = page.locator('input[value="Register"]');
    this.resultMessage        = page.locator('.result');
    this.validationErrors     = page.locator('.validation-summary-errors');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Complete the registration form and submit.
   * Generates a unique email by appending a timestamp to avoid conflicts
   * across test runs.
   */
  async register(data: RegistrationData): Promise<string> {
    await this.goto();

    // Gender
    if (data.gender === 'Female') {
      await this.genderFemale.click();
    } else {
      await this.genderMale.click();
    }

    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);

    if (data.company) {
      await this.companyInput.fill(data.company);
    }

    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.password);
    await this.registerButton.click();
    await this.page.waitForLoadState('networkidle');

    return data.email;
  }

  /** Assert registration was successful */
  async assertRegistrationSuccess(): Promise<void> {
    await expect(this.resultMessage).toBeVisible();
    await expect(this.resultMessage).toContainText('Your registration completed');
  }

  /**
   * Generate a unique email for each test run by appending a timestamp.
   */
  static generateUniqueEmail(base: string): string {
    const ts = Date.now();
    const [name, domain] = base.split('@');
    return `${name}_${ts}@${domain}`;
  }
}
