import { Page, Locator, expect } from '@playwright/test';

export interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  country?: string;
  city: string;
  address1: string;
  zip: string;
  phone: string;
}

/**
 * CheckoutPage – handles the multi-step checkout on demowebshop.
 * Steps: Billing → Shipping → Payment Method → Payment Info → Confirm
 */
export class CheckoutPage {
  readonly page: Page;

  // Billing address
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCompany: Locator;
  readonly billingCountry: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZip: Locator;
  readonly billingPhone: Locator;
  readonly billingContinueBtn: Locator;

  // Shipping step
  readonly shippingContinueBtn: Locator;
  readonly shippingMethodContinueBtn: Locator;

  // Payment step
  readonly paymentMethodContinueBtn: Locator;
  readonly paymentInfoContinueBtn: Locator;

  // Confirm
  readonly confirmOrderBtn: Locator;
  readonly orderCompletedTitle: Locator;
  readonly orderNumber: Locator;

  constructor(page: Page) {
    this.page = page;

    this.billingFirstName  = page.locator('#BillingNewAddress_FirstName');
    this.billingLastName   = page.locator('#BillingNewAddress_LastName');
    this.billingEmail      = page.locator('#BillingNewAddress_Email');
    this.billingCompany    = page.locator('#BillingNewAddress_Company');
    this.billingCountry    = page.locator('#BillingNewAddress_CountryId');
    this.billingCity       = page.locator('#BillingNewAddress_City');
    this.billingAddress1   = page.locator('#BillingNewAddress_Address1');
    this.billingZip        = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhone      = page.locator('#BillingNewAddress_PhoneNumber');
    this.billingContinueBtn = page.locator('#billing-buttons-container input[value="Continue"]');

    this.shippingContinueBtn       = page.locator('#shipping-buttons-container input[value="Continue"]');
    this.shippingMethodContinueBtn = page.locator('#shipping-method-buttons-container input[value="Continue"]');
    this.paymentMethodContinueBtn  = page.locator('#payment-method-buttons-container input[value="Continue"]');
    this.paymentInfoContinueBtn    = page.locator('#payment-info-buttons-container input[value="Continue"]');
    this.confirmOrderBtn           = page.locator('input[value="Confirm"]');
    this.orderCompletedTitle       = page.locator('.title strong');
    this.orderNumber               = page.locator('li:has-text("Order number:")');
  }

  /** Fill the billing address form and click Continue */
  async fillBillingAddress(data: AddressData): Promise<void> {
    // If "New Address" dropdown exists, select it
    const newAddressOption = this.page.locator('#billing-address-select');
    if (await newAddressOption.isVisible()) {
      await newAddressOption.selectOption({ label: 'New Address' });
    }

    await this.billingFirstName.fill(data.firstName);
    await this.billingLastName.fill(data.lastName);
    await this.billingEmail.fill(data.email);

    if (data.company) {
      await this.billingCompany.fill(data.company);
    }

    // Select country (United States = value "1")
    if (data.country) {
      await this.billingCountry.selectOption({ label: data.country });
      // Wait for state dropdown to populate
      await this.page.waitForTimeout(500); // small structural wait for dropdown AJAX
    }

    await this.billingCity.fill(data.city);
    await this.billingAddress1.fill(data.address1);
    await this.billingZip.fill(data.zip);
    await this.billingPhone.fill(data.phone);

    await this.billingContinueBtn.click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Click Continue on shipping address step */
  async continueShipping(): Promise<void> {
    const btn = this.page.locator('#shipping-buttons-container input[value="Continue"]');
    await btn.click();
  }

  /** Select the first available shipping method and continue */
  async selectShippingMethod(): Promise<void> {
    const firstOption = this.page.locator('input[name="shippingoption"]').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.check();
    await this.shippingMethodContinueBtn.click();
  }

  /** Select "Check / Money Order" payment method and continue */
  async selectPaymentMethod(): Promise<void> {
    // Select Check/Money Order (value "Payments.CheckMoneyOrder")
    const checkMoneyOrder = this.page.locator(
      'input[value="Payments.CheckMoneyOrder"]',
    );
    if (await checkMoneyOrder.isVisible()) {
      await checkMoneyOrder.check();
    } else {
      // Fall back to first payment option
      await this.page.locator('input[name="paymentmethod"]').first().check();
    }
    await this.paymentMethodContinueBtn.click();
  }

  /** Continue through payment info step */
  async continuePaymentInfo(): Promise<void> {
    await this.paymentInfoContinueBtn.waitFor({ state: 'visible' });
    await this.paymentInfoContinueBtn.click();
  }

  /** Get the order total shown on confirm step */
  async getConfirmOrderTotal(): Promise<number> {
    const totalEl = this.page.locator('.order-total strong');
    const text = (await totalEl.textContent()) ?? '0';
    return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
  }

  /** Submit the order and verify completion */
  async confirmOrder(): Promise<void> {
    await this.confirmOrderBtn.waitFor({ state: 'visible' });
    await this.confirmOrderBtn.click();
  }

  /** Assert order completed and return order number */
  async assertOrderCompleted(): Promise<string> {
	await this.page.waitForSelector('.order-completed', { state: 'visible' });
    await expect(this.orderCompletedTitle).toContainText('Your order has been successfully processed!');
    const orderNumText = (await this.orderNumber.textContent()) ?? '';
    return orderNumText.replace('Order number: ', '').trim();
  }
}
