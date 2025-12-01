# PruebaTecnicaInari

QA project (manual + automation) on https://www.saucedemo.com. Latest report: https://xn0-mm.github.io/PruebaTecnicaInari/

## Automation stack
- Cypress 15 + TypeScript; `baseUrl` set in `cypress.config.ts`.
- Node 18+ recommended.
- Reporter: `cypress-mochawesome-reporter` + `mochawesome-merge` + `marge` (HTML) with always-on screenshots and browser prefix in suite titles.
- Tag filtering with `@cypress/grep`.
- Reusable flows in `cypress/support/actions/*` and custom commands in `cypress/support/commands.ts`.
- Test data in fixtures (`cypress/fixtures/checkout-data.json`).

## Install & run locally
1. `npm install`
2. UI runner: `npm run cy:open`
3. Headless:
   - Default: `npm run cy:run`
   - Smoke: `npm run cy:smoke`
   - Regression: `npm run cy:regression`
   - Cross-browser: add `--browser chrome|firefox|electron` to any script, or use `cy:*:all` for chrome+firefox+electron.
4. Mochawesome reports:
   - JSON: `npm run cy:report:raw`
   - Merge + clean + HTML: `npm run cy:merge-report`
   - All-in-one: `npm run cy:report`
   - Output: JSON under `docs/report/raw`, final HTML at `docs/report/index.html` (includes screenshots).

## Project structure
- `cypress/e2e/full-checkout.cy.ts`: E2E (full checkout + validations) with browser-prefixed suite title.
- `cypress/support/actions/*.ts`: helpers for login, cart, checkout.
- `cypress/support/commands.ts`: commands (`cy.login`, `cy.addProductAndGoToCart`).
- `cypress/support/e2e.ts`: global hooks, grep, mochawesome context, screenshots after each test.
- `cypress/support/selectors.ts`: locators.
- `cypress/fixtures/checkout-data.json`: test data.
- `docs/report`: mochawesome artifacts (HTML + JSON).

## CI/CD (GitHub Actions)
- Workflow: `.github/workflows/e2e-report.yml`.
- Triggers: `push`/`pull_request` to `main` and `develop`, manual dispatch, daily cron 03:00 UTC.
- Jobs:
  - `smoke` (PR only): Chrome, `npm ci`, `npm run cy:smoke -- --browser chrome`.
  - `test` (non-PR): matrix `browser: [chrome, firefox]`, cleans `docs/report`, runs `npm run cy:report:raw`, prefixes JSON with browser, uploads artifacts.
  - `merge`: downloads artifacts, merges all JSON, removes `isRoot`, builds `docs/report/index.html`, uploads for Pages.
  - `deploy` (main only): publishes `docs/report` to GitHub Pages.
- Reports: GitHub Pages hosts the latest merged report; each test shows browser, tags, duration, ENV, and screenshot path.

## Design & quality
- Keep specs readable; move logic to helpers/commands, avoid heavy POMs.
- Centralize selectors; keep data in fixtures.
- Use tags in titles (`@smoke`, `@regression`, `@negative`, etc.) and filter with `grepTags`.
- Always capture screenshots (afterEach) for visual evidence in reports.
- Static quality: use linters/formatters and tools like SonarLint to catch smells/vulnerabilities during editing.

## Part 1 - Manual QA
### Test case table

| Test Case ID | Test Case Name                                        | Precondition                                                                                       | Steps                                                                                                                                                         | Expected Result                                                                                                                                                                      | Priority | Type                               |
|--------------|-------------------------------------------------------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------|
| TC01         | Successful login with valid credentials               | User is on the login page and valid credentials are available (standard_user / secret_sauce).      | 1. Open the demo application login page. 2. Enter `standard_user` in the Username field. 3. Enter `secret_sauce` in the Password field. 4. Click **Login**.    | - User is authenticated. - Redirected to the product listing (inventory) page. - Product list is displayed. - No login error message is shown.                                        | High     | Functional - Positive, Smoke       |
| TC02         | Login with valid username and invalid password        | User is on the login page.                                                                         | 1. Open the demo application login page. 2. Enter `standard_user` in the Username field. 3. Enter an invalid password (e.g. `wrong_password`). 4. Click **Login**. | - Login is rejected. - User remains on the login page. - Error message shown: **“Epic sadface: Username and password do not match any user in this service.”** - User is not redirected to the product listing page. | Medium   | Functional - Negative, Validation  |
| TC03         | Add two products to the cart                          | User is logged in with valid credentials (TC01 passed) and is on the product listing page.         | 1. On the inventory page, identify Product A. 2. Click **Add to cart** for Product A. 3. Identify Product B. 4. Click **Add to cart** for Product B. 5. Check the cart badge. | - Both products are added. - Cart badge shows **2**. - Buttons change to **Remove** for those products. - No error message is displayed.                                               | High     | Functional - Positive              |
| TC04         | Proceed to checkout with customer information entered | User is logged in (standard_user / secret_sauce) and has exactly two products in the cart (TC03).  | 1. Click the cart icon to open the cart page. 2. Verify exactly two products in the cart. 3. Click **Checkout**. 4. Enter First Name. 5. Enter Last Name. 6. Enter Postal Code. 7. Click **Continue**. | - Checkout "your information" form is submitted. - Redirected to checkout overview page with order summary. - No validation errors for First Name, Last Name, or Postal Code. | High     | Functional - Positive, Data Entry  |
| TC05         | Validate total price equals sum of selected products  | User is on the checkout overview page with two selected products displayed (TC04 passed).          | 1. On checkout overview, note price of Product A. 2. Note price of Product B. 3. Calculate their sum. 4. Compare with **Item total**. 5. Note **Tax**. 6. Check **Total**. | - **Item total** equals sum of Product A + Product B. - **Total** equals **Item total + Tax** per app logic.                   | High     | Functional - Business Logic, Calculation |
| TC06         | Complete checkout successfully                        | User is on the checkout overview page with totals already verified (TC05 passed).                  | 1. On checkout overview page, click **Finish**. 2. Wait for navigation. 3. Observe resulting page header and message. 4. Optionally, check cart badge is cleared when returning. | - Checkout completes. - Confirmation/thank-you page shown. - No error messages. - Cart is cleared (no items after completion, if supported).                                          | High     | Functional - Positive, E2E         |

Notes:
- TC01 and TC03-TC06 form the main positive E2E flow from login (`standard_user` / `secret_sauce`) to completed checkout.
- TC02 is a negative/validation test for invalid credentials.

### Gherkin scenarios
```gherkin
Feature: Purchase products on the demo store
  In order to complete a purchase
  As an end user
  I want to log in, add products to the cart, checkout and see the correct total

  @TC01 @P1 @functional @positive @smoke
  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter "standard_user" as the username
    And I enter "secret_sauce" as the password
    And I click the "Login" button
    Then I should be redirected to the product listing page
    And I should see the list of available products
    And no login error message should be displayed

  @TC02 @P2 @functional @negative @validation
  Scenario: Login attempt with valid username and invalid password
    Given I am on the login page
    When I enter "standard_user" as the username
    And I enter an invalid password
    And I click the "Login" button
    Then I should remain on the login page
    And I should see an error message indicating the username and password do not match
    And I should not be redirected to the product listing page

  @TC03 @P1 @functional @positive
  Scenario: Add two products to the cart
    Given I am logged in as a standard user with valid credentials
    And I am on the product listing page
    When I add Product A to the cart
    And I add Product B to the cart
    Then the cart badge should display "2"
    And both Product A and Product B should appear as added to the cart

  @TC04 @P1 @functional @positive @data_entry
  Scenario: Proceed to checkout with customer information entered
    Given I am logged in as a standard user with valid credentials
    And I have exactly two products in the cart
    And I am on the cart page
    When I click on the "Checkout" button
    And I fill the "First Name" field with valid data
    And I fill the "Last Name" field with valid data
    And I fill the "Postal Code" field with valid data
    And I click the "Continue" button
    Then I should be redirected to the checkout overview page
    And no validation error message should be displayed for the customer information

  @TC05 @P1 @functional @business_logic @calculation
  Scenario: Validate that the total price matches the sum of the selected products
    Given I am on the checkout overview page with two selected products
    When I review the price of each selected product
    And I calculate the sum of the product prices
    Then the "Item total" should equal the sum of the product prices
    And the final "Total" should correspond to the "Item total" plus any displayed tax

  @TC06 @P1 @functional @positive @e2e
  Scenario: Complete the checkout successfully
    Given I am on the checkout overview page and the totals have been validated
    When I click the "Finish" button
    Then I should see a confirmation page with a success or thank-you message for the order
    And the cart should be cleared so that there are no remaining items
```

## Part 2 - Automation coverage
- Full buying process (covers TC01, TC03, TC04, TC05, TC06 in one flow): login, add product, assert cart badge and cart contents, continue to checkout info, fill required fields, verify overview (product, payment, shipping), validate price calculation (item total equals sum; total equals item total + tax), finish and assert thank-you page.
- Checkout form required fields: negative validation on the checkout information page (empty, then missing last name, then missing postal code).
- Test data lives in `cypress/fixtures/checkout-data.json`; adjust there to change user or checkout info.

## Additional points

### How to scale the test project
- Cypress-style architecture without heavy POMs: single source of truth for locators (`cypress/support/selectors.ts`) and thin action helpers/custom commands for reusable flows.
- Custom commands for common preconditions (e.g., `cy.login`, `cy.addProductAndGoToCart`) keep specs concise.
- Use env vars/config for credentials and URLs; prefer `CYPRESS_*` env vars in CI.
- Fixtures for static data. Factories/API setup for dynamic data.
- Tagging strategy: keep Gherkin-like tags (`@TCxx`, `@smoke`, `@negative`) in spec titles or via grep to filter runs.

### CI/CD integration
- Current:
  - Triggers: push/PR to `main`/`develop`, manual dispatch, daily cron 03:00 UTC.
  - Jobs: smoke on PRs (Chrome); regression on `main`/`develop` and scheduled (Chrome + Firefox matrix).
  - Artifacts: each browser uploads its mochawesome JSON; merge job downloads all, cleans/merges, builds `docs/report/index.html`, uploads Pages artifact; `main` deploys to GitHub Pages at https://xn0-mm.github.io/PruebaTecnicaInari/.
- Future hardening:
  - Add lint/type-check gates and unit/component tests before E2E.
  - Enforce smoke as required on PRs; block deploy on main/release with full regression matrix.
  - Use retries plus a "quarantine" tag for flakies.
  - Shard specs and parallelize by browser.
  - Publish screenshots/videos as artifacts; auto-comment PRs with failing specs and report link.
  - Slack/Teams alerts on failures; coverage/Sonar gates.
  - `workflow_dispatch` inputs to pick env/suite.
  - Retain historical reports (bucket or longer Pages retention).
