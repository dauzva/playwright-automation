# TC-003 – Progress Bar: Synchronization & State Verification

---

## 1. Test Case Attributes

| Attribute             | Value                                                      |
|-----------------------|------------------------------------------------------------|
| **Test Case ID**      | TC-003                                                     |
| **Title**             | Progress Bar – Start, Stop at Target, Reset, Full Run       |
| **Module / Feature**  | Progress Bar Widget                                        |
| **Target Application**| https://demoqa.com/progress-bar                           |
| **Priority**          | Medium                                                     |
| **Severity**          | Major                                                      |
| **Test Type**         | Functional / Synchronization / Widget                      |
| **Preconditions**     | Progress Bar page loaded; progress at 0%                   |
| **Postconditions**    | Progress Bar is reset to 0%                                |
| **Author**            | Automation Engineer                                        |
| **Automated By**      | Playwright + TypeScript (conditional waits only)           |
| **Automation Script** | tests/exercise3/ex3-task1-progressbar.spec.ts              |

---

## 2. Intelligent Wait Strategy

| Scenario                     | Wait Technique                                       |
|------------------------------|------------------------------------------------------|
| Waiting for progress ≥ 25%   | `page.waitForFunction` polling aria-valuenow ≥ 25    |
| Waiting for progress = 100%  | `page.waitForFunction` polling aria-valuenow == 100  |
| Waiting for Reset button     | `locator.waitFor({ state: 'visible' })`              |

No `page.waitForTimeout()` or `setTimeout()` used anywhere.

---

## 3. Test Steps

| Step # | Action                                                                       | Expected Result                                                          |
|--------|------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| 1      | Navigate to https://demoqa.com/progress-bar                                  | Progress bar page loads; progress = 0%; "Start" button visible           |
| 2      | **VERIFY** initial progress value is 0                                       | `aria-valuenow` attribute equals "0"                                     |
| 3      | **VERIFY** "Start" button is enabled and clickable                           | Button is not disabled                                                   |
| 4      | Click "Start" button                                                         | Progress bar begins filling; button text changes to "Stop"               |
| 5      | Wait (using conditional wait) until progress ≥ 25%                          | `aria-valuenow` reaches 25 without using sleep                           |
| 6      | Click "Stop" button                                                          | Progress bar pauses; button text changes back to "Start"                 |
| 7      | **VERIFY** progress value is between 25 and 35 (tolerance window)           | `aria-valuenow` is in range [25, 35]                                     |
| 8      | Click "Start" button again to resume                                         | Progress bar continues from paused position                              |
| 9      | Wait (using conditional wait) until progress reaches 100%                   | `aria-valuenow` equals 100                                               |
| 10     | **VERIFY** progress bar shows 100%                                           | `aria-valuenow` = "100"; bar visually full                               |
| 11     | **VERIFY** "Reset" button is visible (appears at 100%)                      | "Reset" button is visible on the page                                    |
| 12     | Click "Reset" button                                                         | Progress bar resets; "Start" button returns                              |
| 13     | **VERIFY** progress value is back to 0 after reset                           | `aria-valuenow` equals "0"                                               |

---

## 4. Pass / Fail Criteria

- **PASS**: All 5 verifications pass; bar pauses within tolerance; bar resets to 0.
- **FAIL**: Bar does not pause, or reset does not return to 0, or any verification fails.

---

## 5. Linked Automation Script

`tests/exercise3/ex3-task1-progressbar.spec.ts`
