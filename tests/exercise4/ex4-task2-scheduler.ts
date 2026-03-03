import cron from 'node-cron';
import { execSync, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Exercise 4 – Task 4.2: Scheduled Test Execution
 *
 * This scheduler uses node-cron to run the full Playwright test suite
 * automatically at configured times WITHOUT human intervention.
 *
 * Schedule: Every day at 08:00 AM (local time)
 * Cron expression: '0 8 * * *'
 *
 * The scheduler also logs each execution run with a timestamp and
 * archives the HTML report as proof of execution.
 *
 * HOW TO RUN:
 *   npm run schedule
 *   or
 *   npx ts-node tests/exercise4/ex4-task2-scheduler.ts
 */

const LOG_DIR     = path.join(process.cwd(), 'scheduled-run-logs');
const REPORT_DIR  = path.join(process.cwd(), 'playwright-report');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/** Format current timestamp as YYYY-MM-DD_HH-mm-ss */
function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

/** Write a line to the schedule run log file */
function log(message: string): void {
  const ts      = new Date().toISOString();
  const line    = `[${ts}] ${message}`;
  const logFile = path.join(LOG_DIR, 'scheduler.log');
  console.log(line);
  fs.appendFileSync(logFile, line + '\n', 'utf-8');
}

/**
 * Execute the full Playwright test suite and archive the report.
 * Returns the exit code of the test run.
 */
function runTests(): number {
  const runId   = timestamp();
  const runDir  = path.join(LOG_DIR, `run_${runId}`);
  fs.mkdirSync(runDir, { recursive: true });

  log(`=== SCHEDULED RUN STARTED: ${runId} ===`);

  let exitCode = 0;

  try {
    // Run all tests and produce HTML + JSON reports
    execSync('npx playwright test --reporter=html,json,list', {
      cwd:    process.cwd(),
      stdio:  'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_JSON_OUTPUT_NAME: path.join(runDir, 'results.json'),
      },
    });
    log('✅ Test run COMPLETED SUCCESSFULLY');
  } catch (error: unknown) {
    exitCode = (error as { status?: number }).status ?? 1;
    log(`❌ Test run COMPLETED WITH FAILURES (exit code: ${exitCode})`);
  }

  // Archive the HTML report as proof
  const reportArchive = path.join(runDir, 'playwright-report');
  if (fs.existsSync(REPORT_DIR)) {
    copyDirSync(REPORT_DIR, reportArchive);
    log(`📁 HTML report archived to: ${reportArchive}`);
  }

  // Write a run summary JSON
  const summary = {
    runId,
    startTime: new Date().toISOString(),
    exitCode,
    status: exitCode === 0 ? 'PASSED' : 'FAILED',
    reportPath: reportArchive,
  };
  fs.writeFileSync(
    path.join(runDir, 'run-summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8',
  );

  log(`📊 Run summary: ${JSON.stringify(summary)}`);
  log(`=== SCHEDULED RUN ENDED: ${runId} ===\n`);

  return exitCode;
}

/** Recursively copy a directory */
function copyDirSync(src: string, dest: string): void {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cron expressions used:
 *
 * '0 8 * * *'     → Every day at 08:00 AM
 * '0 */6 * * *'   → Every 6 hours
 * '0 8 * * 1-5'   → Weekdays at 08:00 AM
 * '*/1 * * * *'   → Every minute (for quick testing of the scheduler)
 */

const DAILY_AT_8AM   = '0 8 * * *';
const EVERY_WEEKDAY  = '0 8 * * 1-5';

log('🕐 Playwright Test Scheduler starting...');
log(`📅 Scheduled: Daily at 08:00 AM (cron: "${DAILY_AT_8AM}")`);
log('Press Ctrl+C to stop the scheduler.\n');

// Primary schedule: every day at 08:00 AM
cron.schedule(DAILY_AT_8AM, () => {
  log('⏰ Cron triggered – starting scheduled test run...');
  runTests();
}, {
  timezone: 'UTC', // Use UTC for CI/CD consistency
});

// Optional: also run on weekdays
// cron.schedule(EVERY_WEEKDAY, () => { runTests(); }, { timezone: 'UTC' });

// ─────────────────────────────────────────────────────────────────────────────
// IMMEDIATE RUN: Run once immediately on startup (for demonstration/proof)
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--run-now')) {
  log('🚀 --run-now flag detected: executing tests immediately...');
  const code = runTests();
  if (!args.includes('--keep-alive')) {
    process.exit(code);
  }
} else {
  log('💡 Tip: Pass --run-now to execute immediately.');
  log('💡 Tip: Pass --run-now --keep-alive to run now AND keep scheduler alive.\n');
}

// Keep the process alive for the scheduler
log('⌚ Scheduler is running. Waiting for next scheduled time...');
