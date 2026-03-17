import { test, expect } from '@playwright/test';
import { DynamicPropertiesPage } from '../../src/pages/demoqa/DynamicPropertiesPage';

/**
 * Exercise 3 – Task 3.2
 * Automates TC-004: Dynamic Properties – time-based DOM state changes.
 *
 * Verifications:
 *   V1 – #enableAfter is DISABLED on page load
 *   V2 – #visibleAfter is NOT visible on page load
 *   V3 – #enableAfter transitions to ENABLED after ~5 seconds
 *   V4 – #visibleAfter transitions to VISIBLE after ~5 seconds
 *   V5 – #colorChange button color changes after ~5 seconds
 */
test.describe('Exercise 3 Task 3.2 – Dynamic Properties', () => {
  test('TC-004: Verify time-based enable, color-change, and visibility', async ({ page }) => {

    // ══════════════════════════════════════════════════════════════════════
    // PRECONDITION: Navigate to Dynamic Properties page
    // ══════════════════════════════════════════════════════════════════════
	await page.goto('https://demoqa.com');
	await page.locator('a[href="/elements"]').click();
	await page.locator('.router-link[href="/dynamic-properties"]').click();
	const dynProps = new DynamicPropertiesPage(page);

    console.log('📄 Dynamic Properties page loaded');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: V1 – Verify #enableAfter button is DISABLED on page load
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.assertEnableAfterIsDisabled();
    console.log('✅ V1 PASS – "Will enable 5 seconds" button is DISABLED initially');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: V2 – Verify #visibleAfter is NOT visible on page load
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.assertVisibleAfterIsHidden();
    console.log('✅ V2 PASS – "Visible After 5 Seconds" button is NOT visible initially');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Capture INITIAL color of the Color Change button
    // ─────────────────────────────────────────────────────────────────────
    const initialColor = await dynProps.getColorChangeButtonColor();
    console.log(`🎨 Initial color of #colorChange: ${initialColor}`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: INTELLIGENT WAIT – wait until #enableAfter is ENABLED
    // ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Waiting for #enableAfter to become enabled...');
    await dynProps.waitForEnableAfterEnabled(15_000);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 6: V3 – Verify #enableAfter is now ENABLED
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.assertEnableAfterIsEnabled();
    console.log('✅ V3 PASS – "Will enable 5 seconds" button is now ENABLED');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 7: Click the now-enabled button
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.clickEnableAfter();
    console.log('🖱️  Clicked "Will enable 5 seconds" button successfully');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 8: INTELLIGENT WAIT – wait until #visibleAfter becomes visible
    // ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Waiting for #visibleAfter to appear...');
    await dynProps.waitForVisibleAfterAppears(15_000);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 9: V4 – Verify #visibleAfter is now VISIBLE
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.assertVisibleAfterIsVisible();
    console.log('✅ V4 PASS – "Visible After 5 Seconds" button is now VISIBLE');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 10: INTELLIGENT WAIT – wait for color change on #colorChange
    // ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Waiting for #colorChange button color to change...');
    await dynProps.waitForColorChange(initialColor, 15_000);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 11: V5 – Verify color has changed
    // ─────────────────────────────────────────────────────────────────────
    const newColor = await dynProps.getColorChangeButtonColor();
    expect(newColor).not.toBe(initialColor);
    console.log(`✅ V5 PASS – Color changed: "${initialColor}" → "${newColor}"`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 12: Click #visibleAfter button (it's now interactable)
    // ─────────────────────────────────────────────────────────────────────
    await dynProps.clickVisibleAfter();
    console.log('🖱️  Clicked "Visible After 5 Seconds" button successfully');
  });
});
