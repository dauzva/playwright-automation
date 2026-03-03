import { test, expect } from '@playwright/test';
import { ProgressBarPage } from '../../src/pages/demoqa/ProgressBarPage';

/**
 * Exercise 3 – Task 3.1
 * Automates TC-003: Progress Bar – synchronization with conditional waits.
 *
 * ⚠️  ZERO thread-sleep / waitForTimeout calls – only intelligent waits:
 *     • page.waitForFunction()  (polling aria-valuenow)
 *     • locator.waitFor()       (state transitions)
 *
 * Verifications (≥ 2 as required):
 *   V1 – Initial progress is 0
 *   V2 – After Stop, progress is in tolerance range [25, 40]
 *   V3 – After full run, progress is 100
 *   V4 – After Reset, progress is 0 again
 *   V5 – "Reset" button appears only at 100%
 */
test.describe('Exercise 3 Task 3.1 – Progress Bar Synchronization', () => {
  test('TC-003: Start → Stop at ~25% → Resume → 100% → Reset', async ({ page }) => {
    const progressBar = new ProgressBarPage(page);

    // ══════════════════════════════════════════════════════════════════════
    // PRECONDITION: Navigate to progress bar page
    // ══════════════════════════════════════════════════════════════════════
    await progressBar.goto();

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: V1 – Verify initial progress is 0
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.assertProgressValue(0);
    console.log('✅ V1 PASS – Initial progress is 0%');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Verify Start button is enabled
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.assertButtonLabel('Start');
    await expect(progressBar.startStopButton).toBeEnabled();
    console.log('✅ Start button is enabled and visible');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Click START
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.clickStartStop();
    await progressBar.assertButtonLabel('Stop');
    console.log('▶️  Progress bar started – button now shows "Stop"');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 5: INTELLIGENT WAIT – wait until progress ≥ 25%
    // Uses waitForFunction polling aria-valuenow (no sleep!)
    // ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Waiting (conditionally) for progress ≥ 25%...');
    await progressBar.waitForProgress(25);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 6: Click STOP to pause
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.clickStartStop();
    await progressBar.assertButtonLabel('Start');
    console.log('⏸️  Progress bar stopped');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 7: V2 – Verify progress is in tolerance range [25, 40]
    // We allow up to 40 to account for the time between "≥25" detection
    // and the Stop click.
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.assertProgressInRange(25, 40);
    const stoppedAt = await progressBar.getProgressValue();
    console.log(`✅ V2 PASS – Progress stopped at ${stoppedAt}% (expected 25-40%)`);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 8: Resume by clicking START again
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.clickStartStop();
    await progressBar.assertButtonLabel('Stop');
    console.log('▶️  Progress bar resumed');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 9: INTELLIGENT WAIT – wait until progress reaches 100%
    // ─────────────────────────────────────────────────────────────────────
    console.log('⏳ Waiting (conditionally) for progress to reach 100%...');
    await progressBar.waitForCompletion(60_000);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 10: V3 – Verify progress is 100%
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.assertProgressValue(100);
    console.log('✅ V3 PASS – Progress reached 100%');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 11: V5 – Verify Reset button appears at 100%
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.resetButton.waitFor({ state: 'visible', timeout: 5_000 });
    await expect(progressBar.resetButton).toBeVisible();
    console.log('✅ V5 PASS – "Reset" button is visible at 100%');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 12: Click RESET
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.clickReset();
    console.log('🔄 Reset clicked');

    // ─────────────────────────────────────────────────────────────────────
    // STEP 13: V4 – Verify progress is back to 0 after reset
    // ─────────────────────────────────────────────────────────────────────
    await progressBar.assertProgressValue(0);
    console.log('✅ V4 PASS – Progress bar reset to 0%');

    // Verify Start button is available again after reset
    await progressBar.assertButtonLabel('Start');
    console.log('✅ "Start" button restored after reset');
  });
});
