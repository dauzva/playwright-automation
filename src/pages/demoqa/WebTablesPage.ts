import { Page, Locator, expect } from '@playwright/test';

export interface TableRow {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  salary: number;
  department: string;
}

/**
 * WebTablesPage – Page Object for https://demoqa.com/webtables
 */
export class WebTablesPage {
  readonly page: Page;

  readonly addButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly ageInput: Locator;
  readonly emailInput: Locator;
  readonly salaryInput: Locator;
  readonly departmentInput: Locator;
  readonly submitButton: Locator;
  readonly tableRows: Locator;
  readonly nextPageBtn: Locator;
  readonly previousPageBtn: Locator;
  readonly pageJumpInput: Locator;
  readonly totalPages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton       = page.locator('#addNewRecordButton');
    this.firstNameInput  = page.locator('#firstName');
    this.lastNameInput   = page.locator('#lastName');
    this.ageInput        = page.locator('#age');
    this.emailInput      = page.locator('#userEmail');
    this.salaryInput     = page.locator('#salary');
    this.departmentInput = page.locator('#department');
    this.submitButton    = page.locator('#submit');

    // React Table pagination elements
    this.tableRows      = page.locator('.rt-tbody .rt-tr:not(.-padRow)');
    this.nextPageBtn    = page.locator('.-next button');
    this.previousPageBtn = page.locator('.-previous button');
    this.pageJumpInput  = page.locator('.-pageJump input');
    this.totalPages     = page.locator('.-totalPages');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://demoqa.com/webtables');
    await this.page.waitForLoadState('networkidle');
    // Dismiss any overlays/ads that might appear
    await this.dismissAds();
  }

  /** Dismiss common ad overlays on demoqa */
  private async dismissAds(): Promise<void> {
    try {
      const adClose = this.page.locator('#close-fixedban');
      if (await adClose.isVisible({ timeout: 2000 })) {
        await adClose.click();
      }
    } catch {
      // No ad overlay present
    }
  }

  /** Add a single row to the table */
  async addRow(row: TableRow): Promise<void> {
    await this.addButton.click();
    // Wait for modal to open
    await this.page.locator('.modal-content').waitFor({ state: 'visible' });

    await this.firstNameInput.fill(row.firstName);
    await this.lastNameInput.fill(row.lastName);
    await this.ageInput.fill(String(row.age));
    await this.emailInput.fill(row.email);
    await this.salaryInput.fill(String(row.salary));
    await this.departmentInput.fill(row.department);

    await this.submitButton.click();
    // Wait for modal to close
    await this.page.locator('.modal-content').waitFor({ state: 'hidden' });
  }

  /** Add multiple rows */
  async addRows(rows: TableRow[]): Promise<void> {
    for (const row of rows) {
      await this.addRow(row);
    }
  }

  /**
   * Count non-padding rows visible on the current page.
   * The react-table renders padding rows to fill the display; we exclude them.
   */
  async getVisibleRowCount(): Promise<number> {
    const rows = this.page.locator('.rt-tbody .rt-tr:not(.-padRow)');
    const count = await rows.count();
    // Only count rows that have actual data (first cell not empty)
    let dataCount = 0;
    for (let i = 0; i < count; i++) {
      const firstCell = await rows.nth(i).locator('.rt-td').first().textContent();
      if (firstCell && firstCell.trim() !== '') {
        dataCount++;
      }
    }
    return dataCount;
  }

  /** Get total number of pages from pagination */
  async getTotalPages(): Promise<number> {
    const text = (await this.totalPages.textContent()) ?? '1';
    return parseInt(text.trim(), 10) || 1;
  }

  /** Get current page number */
  async getCurrentPage(): Promise<number> {
    const value = await this.pageJumpInput.inputValue();
    return parseInt(value, 10) || 1;
  }

  /** Navigate to next page */
  async goToNextPage(): Promise<void> {
    await expect(this.nextPageBtn).toBeEnabled();
    await this.nextPageBtn.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Is the Next button disabled? */
  async isNextDisabled(): Promise<boolean> {
    return await this.nextPageBtn.isDisabled();
  }

  /** Delete the row at position `rowIndex` (0-based) on the current page */
  async deleteRow(rowIndex: number): Promise<void> {
    const deleteBtn = this.page.locator(
      `.rt-tbody .rt-tr:not(.-padRow) span[title="Delete"]`,
    ).nth(rowIndex);
    await deleteBtn.waitFor({ state: 'visible' });
    await deleteBtn.click();
    // Brief wait for DOM update
    await this.page.waitForLoadState('domcontentloaded');
  }
}
