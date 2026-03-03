# TC-002 – Web Tables: Pagination Creation, Navigation & Auto-Collapse

---

## 1. Test Case Attributes

| Attribute             | Value                                                      |
|-----------------------|------------------------------------------------------------|
| **Test Case ID**      | TC-002                                                     |
| **Title**             | Web Tables – Add Rows, Paginate, Delete & Verify Collapse  |
| **Module / Feature**  | Web Tables / Pagination                                    |
| **Target Application**| https://demoqa.com/webtables                              |
| **Priority**          | High                                                       |
| **Severity**          | Major                                                      |
| **Test Type**         | Functional / UI Interaction                                |
| **Preconditions**     | Browser opened; Web Tables page loaded; Default 10 rows/page |
| **Postconditions**    | Page returns to first page with single-page pagination     |
| **Author**            | Automation Engineer                                        |
| **Automated By**      | Playwright + TypeScript                                    |
| **Automation Script** | tests/exercise2/ex2-task2-webtables.spec.ts                |

---

## 2. Test Data

Eight rows to be added (see test-data/test-data.json → `webTableRows`):

| # | First Name | Last Name | Age | Email            | Salary | Department  |
|---|------------|-----------|-----|------------------|--------|-------------|
| 1 | Ciara      | Vance     | 28  | ciara@test.com   | 52000  | QA          |
| 2 | Derek      | Mills     | 34  | derek@test.com   | 67000  | Engineering |
| 3 | Elaine     | Parker    | 22  | elaine@test.com  | 41000  | Design      |
| 4 | Frank      | Newton    | 41  | frank@test.com   | 88000  | Management  |
| 5 | Grace      | Huang     | 29  | grace@test.com   | 55000  | DevOps      |
| 6 | Hector     | Ortiz     | 37  | hector@test.com  | 72000  | Sales       |
| 7 | Iris       | Bloom     | 25  | iris@test.com    | 48000  | Marketing   |
| 8 | Julian     | Cross     | 31  | julian@test.com  | 63000  | Finance     |

---

## 3. Test Steps

| Step # | Action                                                                       | Expected Result                                                         |
|--------|------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| 1      | Navigate to https://demoqa.com/webtables                                     | Web Tables page loads with 3 default rows                               |
| 2      | **VERIFY** initial row count is 3                                            | 3 data rows visible in the table                                        |
| 3      | Click "Add" button                                                           | Registration form modal opens                                           |
| 4      | Fill in row #1 data (Ciara Vance, 28, ciara@test.com, 52000, QA)            | All fields populated                                                    |
| 5      | Click "Submit"                                                               | Modal closes; new row appears in the table (4 rows total)               |
| 6      | Repeat steps 3–5 for rows #2 through #8 (7 more additions)                  | After each submit, row count increases; total becomes 11 rows           |
| 7      | **VERIFY** total row count is 11 (3 original + 8 added)                      | 11 rows visible across both pages                                       |
| 8      | **VERIFY** pagination "Next" button is enabled / visible                     | Next button exists and is clickable                                     |
| 9      | Click "Next" button to navigate to page 2                                    | Page 2 is shown; 1 row visible                                          |
| 10     | **VERIFY** current page indicator shows "2"                                  | Page 2 is active                                                        |
| 11     | **VERIFY** exactly 1 row is displayed on page 2                              | Only 1 row visible on page 2                                            |
| 12     | Locate the delete button (🗑) for the row on page 2                          | Delete icon found in the last column                                    |
| 13     | Click the delete button for that row                                         | Row is removed from the table                                           |
| 14     | **VERIFY** pagination automatically returns to page 1                        | Page 1 is now active; page input shows "1"                              |
| 15     | **VERIFY** "Next" button is disabled (only 1 page now exists)                | Next button is disabled or total pages = 1                              |
| 16     | **VERIFY** total row count is now 10 (11 – 1 deleted)                        | 10 rows visible on page 1                                               |

---

## 4. Pass / Fail Criteria

- **PASS**: After deletion, pagination collapses to 1 page and row count equals 10.
- **FAIL**: Pagination does not collapse, or row count is incorrect after deletion.

---

## 5. Linked Automation Script

`tests/exercise2/ex2-task2-webtables.spec.ts`
