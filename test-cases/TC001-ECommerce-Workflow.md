# TC-001 – E-Commerce End-to-End Happy Path (Price-Filtered Cart)

---

## 1. Test Case Attributes

| Attribute             | Value                                                      |
|-----------------------|------------------------------------------------------------|
| **Test Case ID**      | TC-001                                                     |
| **Title**             | E-Commerce End-to-End Happy Path – Cart Items > $900       |
| **Module / Feature**  | Registration · Login · Browse · Cart · Checkout · Order    |
| **Target Application**| https://demowebshop.tricentis.com/                        |
| **Priority**          | High                                                       |
| **Severity**          | Critical                                                   |
| **Test Type**         | Functional / End-to-End / Regression                       |
| **Preconditions**     | User account does NOT exist (fresh registration); Cart is empty; Browser cookies cleared |
| **Postconditions**    | Order is placed; User logs out; Cart is empty              |
| **Author**            | Automation Engineer                                        |
| **Automated By**      | Playwright + TypeScript                                    |
| **Automation Script** | tests/exercise2/ex2-task1-ecommerce.spec.ts                |

---

## 2. Test Data

| Field             | Value                                    |
|-------------------|------------------------------------------|
| First Name        | Alice                                    |
| Last Name         | Tester                                   |
| Email             | alice.tester_<timestamp>@mailtest.dev    |
| Password          | Secure@1234                              |
| Shipping Address  | 123 Automation Street, Los Angeles, CA   |
| Price Threshold   | > $900.00 USD                            |
| Payment Method    | Check / Money Order                      |

---

## 3. Test Steps

| Step # | Action                                                                       | Expected Result                                                       |
|--------|------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1      | Navigate to https://demowebshop.tricentis.com/                               | Homepage loads; logo and navigation are visible                       |
| 2      | Click "Register" in the top navigation bar                                   | Registration form page opens                                          |
| 3      | Select "Female" gender radio button                                          | "Female" radio is selected                                            |
| 4      | Enter First Name: "Alice"                                                    | Field populated with "Alice"                                          |
| 5      | Enter Last Name: "Tester"                                                    | Field populated with "Tester"                                         |
| 6      | Enter unique Email (e.g. alice_<ts>@mailtest.dev)                            | Field populated with valid email                                      |
| 7      | Enter Password and Confirm Password: "Secure@1234"                           | Both fields populated; strength indicator shows valid                 |
| 8      | Click "Register" submit button                                               | "Your registration completed" success message displayed               |
| 9      | Navigate to "Computers > Notebooks" category                                 | Notebooks listing page loads with product grid                        |
| 10     | Scan all product prices on the page                                          | Prices extracted as numeric values                                    |
| 11     | For each product with price > $900: note the product name and URL            | At least one product with price > $900 identified                     |
| 12     | Navigate to the product detail page of the first expensive product           | Product detail page loaded with name, price, and Add-to-cart button   |
| 13     | Click "Add to cart" button                                                   | Notification "The product has been added to your shopping cart" shown |
| 14     | Repeat steps 11–13 for all identified products > $900 (if multiple exist)   | All eligible products added to cart; cart count increases             |
| 15     | Navigate to "Computers > Desktops" category and repeat steps 10–14           | Additional expensive desktops (if any) added to cart                  |
| 16     | Click the shopping cart icon / "Shopping cart" link                          | Cart page shows all added items with names, quantities, and prices    |
| 17     | **VERIFY** cart item count matches the number of products added              | Cart count in header == number of added items                         |
| 18     | **VERIFY (ARITHMETIC)** sum of individual item subtotals equals order total  | Σ(unitPrice × qty) == displayed Sub-Total (within $0.01 tolerance)    |
| 19     | **VERIFY** every item in cart has price > $900                               | Each listed price is > 900.00                                         |
| 20     | Check "I agree to the Terms of Service" checkbox                             | Checkbox is checked                                                   |
| 21     | Click "Checkout" button                                                      | Checkout page opens with Billing Address step                         |
| 22     | Fill in billing address (Name, Address, City, State, ZIP, Phone)             | All fields populated                                                  |
| 23     | Select "Ship to same address" option                                         | Shipping address mirrors billing                                      |
| 24     | Click "Continue" on Billing step                                             | Shipping method step expands                                          |
| 25     | Select first available shipping method (e.g. "Ground")                      | Shipping method radio button selected                                 |
| 26     | Click "Continue" on Shipping method step                                     | Payment method step expands                                           |
| 27     | Select "Check / Money Order" payment method                                  | Payment radio button selected                                         |
| 28     | Click "Continue" on Payment method step                                      | Payment information step shown                                        |
| 29     | Click "Continue" on Payment information step                                 | Confirm order step shown with order summary                           |
| 30     | **VERIFY** order summary shows the correct items and total                   | Items and amounts match what was in the cart                          |
| 31     | Click "Confirm" button                                                       | "Thank you – Your order has been successfully processed!" shown       |
| 32     | **VERIFY** order confirmation page contains an order number                  | Order number is non-empty string                                      |
| 33     | Click account name in header and select "Logout"                             | User redirected to homepage; "Log in" link visible in header          |

---

## 4. Pass / Fail Criteria

- **PASS**: All 5 key verifications succeed; Order confirmation page displayed with an order number.
- **FAIL**: Any verification fails, any navigation error, or checkout cannot be completed.

---

## 5. Linked Automation Script

`tests/exercise2/ex2-task1-ecommerce.spec.ts`
