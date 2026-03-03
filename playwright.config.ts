import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 * Covers all exercises for demowebshop.tricentis.com and demoqa.com
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests sequentially (some tests share state like cart/session) */
  fullyParallel: false,

  /* Fail the build on CI if test.only is accidentally left in source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,

  /* Single worker to avoid race conditions on demo sites */
  workers: 1,

  /* Reporters: HTML for visual report + list for console */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    /* Base URLs */
    baseURL: 'https://demowebshop.tricentis.com',

    /* Always record traces for debugging */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Reasonable timeout for actions */
    actionTimeout: 15_000,

    /* Navigation timeout */
    navigationTimeout: 30_000,

    /* Headless by default; set PWHEADED=1 to run headed */
    headless: !process.env.PWHEADED,

    /* Viewport */
    viewport: { width: 1280, height: 720 },

    /* Ignore HTTPS errors on demo sites */
    ignoreHTTPSErrors: true,
  },

  /* Global timeout per test */
  timeout: 120_000,

  /* Expect timeout (assertions) */
  expect: { timeout: 10_000 },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
