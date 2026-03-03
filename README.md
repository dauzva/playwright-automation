# 🎭 Playwright TypeScript Test Automation Suite

> Complete automated test suite covering UI automation, synchronization,  
> data-driven testing, and scheduled test orchestration.

---

## 📂 Project Structure

```
playwright-automation/
├── .github/
│   └── workflows/
│       └── scheduled-tests.yml       # GitHub Actions – Task 4.2 (scheduled CI)
├── src/
│   ├── pages/
│   │   ├── demowebshop/
│   │   │   ├── LoginPage.ts          # Login page object
│   │   │   ├── RegisterPage.ts       # Registration page object
│   │   │   ├── ProductListPage.ts    # Category browsing + price filter
│   │   │   ├── ProductDetailPage.ts  # Product detail + add to cart
│   │   │   ├── CartPage.ts           # Cart management + arithmetic check
│   │   │   └── CheckoutPage.ts       # Multi-step checkout
│   │   └── demoqa/
│   │       ├── WebTablesPage.ts      # Web Tables + pagination
│   │       ├── ProgressBarPage.ts    # Progress bar + conditional waits
│   │       └── DynamicPropertiesPage.ts # Dynamic DOM + waitForFunction
│   └── utils/
│       └── DataReader.ts             # JSON + CSV reader utility
├── test-cases/
│   ├── TC001-ECommerce-Workflow.md   # Formal test case (≥10 attrs, ≥20 steps)
│   ├── TC002-Web-Tables.md
│   ├── TC003-Progress-Bar.md
│   └── TC004-Dynamic-Properties.md
├── test-data/
│   ├── test-data.json                # Main data file (users, address, threshold)
│   └── users.csv                     # CSV for data-driven tests (Task 4.1)
├── tests/
│   ├── exercise1/
│   │   └── ex1-setup.spec.ts         # Task 1.2 – Environment setup
│   ├── exercise2/
│   │   ├── ex2-task1-ecommerce.spec.ts  # Task 2.1 – E-commerce workflow
│   │   └── ex2-task2-webtables.spec.ts  # Task 2.2 – Web Tables pagination
│   ├── exercise3/
│   │   ├── ex3-task1-progressbar.spec.ts   # Task 3.1 – Progress Bar
│   │   └── ex3-task2-dynamicprops.spec.ts  # Task 3.2 – Dynamic Properties
│   └── exercise4/
│       ├── ex4-task1-datadriven.spec.ts    # Task 4.1 – Data-driven
│       └── ex4-task2-scheduler.ts          # Task 4.2 – Local scheduler
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (https://nodejs.org)
- Git

### 2. Install dependencies
```bash
npm install
npx playwright install chromium
```

### 3. Run all tests
```bash
npm test
```

### 4. Run individual exercises
```bash
npm run test:exercise1   # Environment setup
npm run test:exercise2   # E-commerce + Web Tables
npm run test:exercise3   # Progress Bar + Dynamic Properties
npm run test:exercise4   # Data-driven tests
```

### 5. Run headed (see the browser)
```bash
PWHEADED=1 npm test
```

### 6. View HTML report
```bash
npm run report
```

---

## 🧪 Test Coverage

### Exercise 1 – Environment Setup
| Script | Target | Description |
|--------|--------|-------------|
| `ex1-setup.spec.ts` | demowebshop | Verifies homepage loads, logo, nav, cart visible |

### Exercise 2 – E-Commerce Automation
| Script | Target | Description |
|--------|--------|-------------|
| `ex2-task1-ecommerce.spec.ts` | demowebshop | Register → Login → Find products > $900 → Add to cart → Arithmetic verify → Checkout → Order |
| `ex2-task2-webtables.spec.ts` | demoqa | Add 8 rows → 2 pages → navigate page 2 → delete → verify collapse to 1 page |

### Exercise 3 – Widgets & Dynamic DOM
| Script | Target | Description |
|--------|--------|-------------|
| `ex3-task1-progressbar.spec.ts` | demoqa | Start → Stop at 25% (waitForFunction) → Resume → 100% → Reset |
| `ex3-task2-dynamicprops.spec.ts` | demoqa | Verify disabled/hidden state → waitForFunction until enabled/visible/color-changed |

### Exercise 4 – Data-Driven & Scheduled
| Script | Target | Description |
|--------|--------|-------------|
| `ex4-task1-datadriven.spec.ts` | demowebshop | Parametrized over users.csv; reads all inputs from external files; explicit pre/postconditions |
| `ex4-task2-scheduler.ts` | – | node-cron daily scheduler; logs runs; archives reports |
| `.github/workflows/scheduled-tests.yml` | – | GitHub Actions cron (08:00 UTC + 20:00 weekdays) |

---

## ✅ Verification Summary

| # | Verification | Type | Location |
|---|-------------|------|---------|
| V1 | Registration success message shown | Functional | Task 2.1 |
| V2 | Logged-in user email visible in header | Functional | Task 2.1 |
| V3 | Cart is not empty after adds | Functional | Task 2.1 |
| V4 | **All cart items have price > $900** | **Arithmetic** | Task 2.1 |
| V5 | **Σ(price × qty) == displayed subtotal** | **Arithmetic** | Task 2.1 |
| V6 | Order confirmation + order number present | Functional | Task 2.1 |
| V7 | Initial web table row count = 3 | Functional | Task 2.2 |
| V8 | "Next" enabled after adds | Functional | Task 2.2 |
| V9 | Pagination collapses after delete | Functional | Task 2.2 |
| V10 | Progress bar initial value = 0 | Functional | Task 3.1 |
| V11 | Progress stops in range [25, 40] | Boundary | Task 3.1 |
| V12 | Progress reaches 100 | Functional | Task 3.1 |
| V13 | Reset returns to 0 | Functional | Task 3.1 |
| V14 | #enableAfter disabled on load | Functional | Task 3.2 |
| V15 | #visibleAfter hidden on load | Functional | Task 3.2 |
| V16 | #enableAfter enabled after ~5s | Dynamic DOM | Task 3.2 |
| V17 | #visibleAfter visible after ~5s | Dynamic DOM | Task 3.2 |
| V18 | #colorChange color changed after ~5s | Dynamic DOM | Task 3.2 |

---

## 📅 Scheduled Execution (Task 4.2)

### Option A – GitHub Actions (Recommended for CI/CD)
The workflow at `.github/workflows/scheduled-tests.yml`:
- Runs **daily at 08:00 UTC** automatically
- Runs **weeknights at 20:00 UTC**
- Also triggers on push to `main`
- Stores HTML report as a **GitHub Actions artifact** (proof of execution)
- Allows manual trigger via `workflow_dispatch`

To use: Push this project to a GitHub repository. The schedule activates automatically.

### Option B – Local node-cron Scheduler
```bash
# Start scheduler (runs every day at 08:00)
npm run schedule

# Run tests immediately AND keep scheduler alive
npm run schedule -- --run-now --keep-alive

# Run tests immediately, then exit
npm run schedule -- --run-now
```
Logs and archived reports are saved in `./scheduled-run-logs/`.

---

## 🚫 No Sleep / No Thread-Wait Policy

All tests strictly use intelligent Playwright waits:

| Scenario | Technique Used |
|----------|---------------|
| Wait for element to appear | `locator.waitFor({ state: 'visible' })` |
| Wait for element to be enabled | `page.waitForFunction()` polling DOM |
| Wait for progress value | `page.waitForFunction()` polling aria-valuenow |
| Wait for color change | `page.waitForFunction()` comparing computed style |
| Wait for navigation | `page.waitForLoadState('networkidle')` |
| Wait for notification | `page.waitForSelector()` |

**`page.waitForTimeout()` is NEVER used.**

---

## 📁 External Data Files

### test-data/test-data.json
```json
{
  "users": [...],           // User credentials
  "shippingAddress": {...}, // Checkout address
  "priceThreshold": 900,    // Products must cost > this
  "categories": [...],      // Pages to scan for expensive products
  "webTableRows": [...]     // 8 rows for pagination test
}
```

### test-data/users.csv
```csv
id,firstName,lastName,email,password,gender,company
user_001,Alice,Tester,alice@...,Secure@1234,Female,TestCorp
```

---

## 🔧 Configuration

Edit `playwright.config.ts` to adjust:
- `timeout` – per-test timeout (default: 120s)
- `retries` – retry count on CI (default: 1)
- `headless` – browser visibility
- `reporter` – output formats (html, list, json)
