import { test, expect } from '@playwright/test';
import { WebTablesPage } from '../../src/pages/demoqa/WebTablesPage';
import { DataReader }    from '../../src/utils/DataReader';

/**
 * Exercise 2 – Task 2.2
 * Automates TC-002: Web Tables – add rows to create pagination,
 * navigate to page 2, delete a row, verify pagination collapses.
 *
 * Target: https://demoqa.com/webtables
 */
test.describe('Exercise 2 Task 2.2 – Web Tables Pagination', () => {
  const testData = DataReader.loadTestData();

  test('TC-002: Add rows → page 2 exists → delete → verify pagination collapses', async ({
    page,
  }) => {
    // ══════════════════════════════════════════════════════════════════════
    // PRECONDITION: Navigate to Web Tables page
    // ══════════════════════════════════════════════════════════════════════
	await page.goto('https://demoqa.com');
	await page.waitForLoadState('networkidle');
	await page.locator('a[href="/elements"]').click();
	await page.locator('.router-link[href="/webtables"]').click();
	const webTables = new WebTablesPage(page);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Verify initial state – 3 default rows
    // ─────────────────────────────────────────────────────────────────────
    const rows = webTables.tableRows;

	await expect(async () => {
		const count = await rows.count();
		if (count !== 3) {
			throw new Error(`Expected 3 rows (including padding), but found ${count}`);
		}
	}).toPass({ timeout: 10_000 });
	

    const initialCount = await webTables.getVisibleRowCount();
    console.log(`Initial row count: ${initialCount}`);
    // demoqa starts with 3 rows
    expect(initialCount).toBe(3);
    console.log('✅ V1 PASS – Initial row count is 3');

    // ─────────────────────────────────────────────────────────────────────
    // STEPS 3-6: Add 8 rows to reach 11 total (triggers 2-page pagination
    //            with default 10 rows-per-page)
    // ─────────────────────────────────────────────────────────────────────
    const rowsToAdd = testData.webTableRows; // 8 rows from JSON
    console.log(`Adding ${rowsToAdd.length} rows...`);
    await webTables.addRows(rowsToAdd);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 7: Verify total rows are 11 (3 + 8)
    // ─────────────────────────────────────────────────────────────────────
    // Page 1 shows 10 rows; total = 11
    const page1Count = await webTables.getVisibleRowCount();
    console.log(`Rows visible on page 1 after adds: ${page1Count}`);
    expect(page1Count).toBe(10); // 10 rows on page 1
    console.log('✅ V2 PASS – Page 1 shows 10 rows (11 total across 2 pages)');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 8: Verify "Next" button is enabled (page 2 exists)
    // ─────────────────────────────────────────────────────────────────────
    const nextDisabledBefore = await webTables.isNextDisabled();
    expect(nextDisabledBefore).toBe(false);
    console.log('✅ V3 PASS – "Next" button is enabled (page 2 exists)');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 9: Navigate to page 2
    // ─────────────────────────────────────────────────────────────────────
    await webTables.goToNextPage();

    // ─────────────────────────────────────────────────────────────────────
    // STEP 10: Verify current page is 2
    // ─────────────────────────────────────────────────────────────────────
    const currentPage = await webTables.getCurrentPage();
    expect(currentPage).toBe(2);
    console.log(`✅ V4 PASS – Current page is ${currentPage}`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 11: Verify exactly 1 row on page 2
    // ─────────────────────────────────────────────────────────────────────
    const page2Count = await webTables.getVisibleRowCount();
    console.log(`Rows on page 2: ${page2Count}`);
    expect(page2Count).toBe(1);
    console.log('✅ V5 PASS – Page 2 has exactly 1 row');

    // ─────────────────────────────────────────────────────────────────────
    // STEPS 12-13: Delete the row on page 2
    // ─────────────────────────────────────────────────────────────────────
    console.log('🗑 Deleting the row on page 2...');
    await webTables.deleteRow(0); // only one row on page 2, index 0

    // ─────────────────────────────────────────────────────────────────────
    // STEP 14: Verify pagination returns to page 1
    // ─────────────────────────────────────────────────────────────────────
    // After deletion of the only row on page 2, react-table should
    // automatically return to page 1
    const pageAfterDeletion = await webTables.getCurrentPage();
    expect(pageAfterDeletion).toBe(1);
    console.log(`✅ V6 PASS – Automatically returned to page ${pageAfterDeletion}`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 15: Verify "Next" button is now disabled (only 1 page left)
    // ─────────────────────────────────────────────────────────────────────
    const nextDisabledAfter = await webTables.isNextDisabled();
    expect(nextDisabledAfter).toBe(true);
    console.log('✅ V7 PASS – "Next" button is disabled (only 1 page remains)');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 16: Verify row count is reset to 3
    // ─────────────────────────────────────────────────────────────────────
    const finalCount = await webTables.getVisibleRowCount();
    console.log(`Final row count on page 1: ${finalCount}`);
    expect(finalCount).toBe(3);
    console.log('✅ V8 PASS – Final row count is back to original 3');
  });
});
