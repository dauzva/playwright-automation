# TC-004 – Dynamic Properties: Time-Based State Verification

---

## 1. Test Case Attributes

| Attribute             | Value                                                      |
|-----------------------|------------------------------------------------------------|
| **Test Case ID**      | TC-004                                                     |
| **Title**             | Dynamic Properties – Enable, Color Change & Visibility     |
| **Module / Feature**  | Dynamic Properties / Dynamic DOM                           |
| **Target Application**| https://demoqa.com/dynamic-properties                     |
| **Priority**          | Medium                                                     |
| **Severity**          | Major                                                      |
| **Test Type**         | Functional / Dynamic DOM / Synchronization                 |
| **Preconditions**     | Page loaded; all 3 buttons in initial state                |
| **Postconditions**    | No state change needed                                     |
| **Author**            | Automation Engineer                                        |
| **Automated By**      | Playwright + TypeScript (conditional waits only)           |
| **Automation Script** | tests/exercise3/ex3-task2-dynamicprops.spec.ts             |

---

## 2. Dynamic Properties Under Test

| Element ID       | Initial State | State After 5 s    | Wait Technique                          |
|------------------|---------------|--------------------|-----------------------------------------|
| `#enableAfter`   | disabled      | enabled            | `locator.waitFor({ state: 'enabled' })` |
| `#colorChange`   | blue text     | orange/red text    | `waitForFunction` checking CSS color    |
| `#visibleAfter`  | hidden        | visible            | `locator.waitFor({ state: 'visible' })` |

---

## 3. Test Steps

| Step # | Action                                                                       | Expected Result                                                           |
|--------|------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| 1      | Navigate to https://demoqa.com/dynamic-properties                            | Dynamic Properties page loads; 3 buttons visible (some may be hidden)     |
| 2      | **VERIFY** "Will enable 5 seconds" button is disabled on page load           | Button has `disabled` attribute; is not interactable                      |
| 3      | **VERIFY** "Visible After 5 Seconds" button is NOT present/visible initially | Button locator has `hidden` or count = 0 before 5 seconds                 |
| 4      | Record the initial CSS color of the "Color Change" button                    | Color captured (typically rgb(255,255,255) or blue class)                  |
| 5      | Wait (conditional wait) until "Will enable 5 seconds" button is enabled      | `disabled` attribute removed; button becomes interactable                 |
| 6      | **VERIFY** "Will enable 5 seconds" button is now enabled                    | Button is interactable; `disabled` attribute absent                       |
| 7      | Click the now-enabled "Will enable 5 seconds" button                        | Button responds to click (no error thrown)                                |
| 8      | Wait (conditional wait) until "Visible After 5 Seconds" button is visible   | Button transitions from hidden to visible in DOM                          |
| 9      | **VERIFY** "Visible After 5 Seconds" button is now visible                  | Button is in viewport; `display` is not none                              |
| 10     | Wait (conditional wait) until "Color Change" button changes color           | CSS class or computed color property changes from initial value           |
| 11     | **VERIFY** "Color Change" button has a different color than initial          | Computed color differs from value captured in step 4                      |
| 12     | Click "Visible After 5 Seconds" button                                      | Button responds to click without errors                                   |

---

## 4. Pass / Fail Criteria

- **PASS**: Both verifications on enable state pass; color change detected; visibility change confirmed.
- **FAIL**: Any element does not change state within 10 seconds, or any assertion fails.

---

## 5. Linked Automation Script

`tests/exercise3/ex3-task2-dynamicprops.spec.ts`
