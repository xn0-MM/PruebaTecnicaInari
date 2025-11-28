# PruebaTecnicaInari

QA technical test (manual + automation) on https://www.saucedemo.com.

## Stack (automation)
- Cypress 15 + TypeScript; baseUrl set to `https://www.saucedemo.com` in `cypress.config.ts`.
- Node 18+ recommended.
- Custom commands and action helpers centralize flows (`cypress/support/commands.ts`, `cypress/support/actions/*`).
- Fixtures hold test data (`cypress/fixtures/checkout-data.json`).
- Reporter: `cypress-mochawesome-reporter` outputs raw JSON to `docs/report/raw`; merged HTML is produced with `mochawesome-merge` + `marge` into `docs/report` (ready for GitHub Pages).

### Install and run
1) `npm install`
2) UI runner: `npm run cy:open`
3) Headless: `npm run cy:run`
4) Headless + HTML report (merged in `docs/report`): `npm run cy:report`
- Smoke only: `npm run cy:smoke`
- Regression only: `npm run cy:regression`
- Smoke all (Chrome + Firefox + Electron): `npm run cy:smoke:all`
- Regression all (Chrome + Firefox + Electron): `npm run cy:regression:all`
- Cross-browser locally: add `--browser chrome|firefox` to `cy:report:raw` (for example, `npm run cy:report:raw -- --browser firefox`) and then merge with `npm run cy:merge-report`.
  - Note: Cypress supports Chrome-family, Firefox, and Electron; Safari/WebKit is not supported.

### Project layout (automation)
- `cypress/e2e/full-checkout.cy.ts`: automated scenarios (happy path checkout + checkout form validation).
- `cypress/support/actions/*.ts`: reusable interactions for login, cart, and checkout.
- `cypress/support/commands.ts`: custom commands (`cy.login`, `cy.addProductAndGoToCart`).
- `cypress/support/selectors.ts`: central locators.
- `cypress/support/utils.ts`: helpers (amount parsing).
- `cypress/fixtures/checkout-data.json`: input data.
- `cypress.config.ts`: Cypress configuration.
- `docs/report/raw`: raw JSON reports from Cypress runs.
- `docs/report`: merged HTML report output (inline assets) when running `npm run cy:report`.

## Design philosophy
- Follow Cypress guidance: avoid heavy Page Object Models; keep selectors centralized and expose behaviors via lightweight action helpers and custom commands when logic repeats across tests.
- Keep specs readable and intention-revealing; assertions stay close to the actions they verify.
- Use fixtures for deterministic data; prefer configuration/env vars over hardcoded secrets.

## Part 1 - Manual QA
### Test case table

| Test Case ID | Test Case Name                                        | Precondition                                                                                       | Steps                                                                                                                                                         | Expected Result                                                                                                                                                                      | Priority | Type                               |
|--------------|-------------------------------------------------------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------|
| TC01         | Successful login with valid credentials               | User is on the login page and valid credentials are available (standard_user / secret_sauce).      | 1. Open the demo application login page. 2. Enter `standard_user` in the Username field. 3. Enter `secret_sauce` in the Password field. 4. Click **Login**.    | - User is authenticated. - Redirected to the product listing (inventory) page. - Product list is displayed. - No login error message is shown.                                        | High     | Functional - Positive, Smoke       |
| TC02         | Login with valid username and invalid password        | User is on the login page.                                                                         | 1. Open the demo application login page. 2. Enter `standard_user` in the Username field. 3. Enter an invalid password (e.g. `wrong_password`). 4. Click **Login**. | - Login is rejected. - User remains on the login page. - Error message shown indicating username and password do not match. - User is not redirected to the product listing page.      | Medium   | Functional - Negative, Validation  |
| TC03         | Add two products to the cart                          | User is logged in with valid credentials (TC01 passed) and is on the product listing page.         | 1. On the inventory page, identify Product A. 2. Click **Add to cart** for Product A. 3. Identify Product B. 4. Click **Add to cart** for Product B. 5. Check the cart badge. | - Both products are added. - Cart badge shows **2**. - Buttons change to **Remove** for those products. - No error message is displayed.                                               | High     | Functional - Positive              |
| TC04         | Proceed to checkout with customer information entered | User is logged in (standard_user / secret_sauce) and has exactly two products in the cart (TC03).  | 1. Click the cart icon to open the cart page. 2. Verify exactly two products in the cart. 3. Click **Checkout**. 4. Enter First Name. 5. Enter Last Name. 6. Enter Postal Code. 7. Click **Continue**. | - Checkout "your information" form is submitted. - Redirected to checkout overview page with order summary. - No validation errors for First Name, Last Name, or Postal Code. | High     | Functional - Positive, Data Entry  |
| TC05         | Validate total price equals sum of selected products  | User is on the checkout overview page with two selected products displayed (TC04 passed).          | 1. On checkout overview, note price of Product A. 2. Note price of Product B. 3. Calculate their sum. 4. Compare with **Item total**. 5. Note **Tax**. 6. Check **Total**. | - **Item total** equals sum of Product A + Product B. - **Total** equals **Item total + Tax** per app logic. - No hidden items or unexpected extra charges.                             | High     | Functional - Business Logic, Calculation |
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

## How to scale the test project
- Cypress-style architecture without POMs: single source of truth for locators (`cypress/support/selectors.ts`) and thin action helpers/custom commands to reuse flows (e.g., login, add to cart, checkout info) across specs.
- Custom commands for common preconditions (e.g., `cy.login`, `cy.addProductAndGoToCart`) keep specs concise and reduce duplication.
- Environment variables for credentials/base URLs; use Cypress config files or `CYPRESS_*` env vars for secrets in CI.
- Test data strategy: fixtures for static data; factories or API setup for dynamic data if the app allows it.
- Tagging strategy: keep Gherkin-like tags (`@TCxx`, `@smoke`, `@negative`) in spec titles or via Cypress grep plugins to filter runs (smoke vs full regression).
- Quality gates: lint, type-check, fast smoke suite per PR; full suite on main/nightly.

## CI/CD integration (example)
- Goal: pipeline fails when tests fail and produces a publishable report.
- Strategy:
  - PRs: fast smoke in Chrome (`npm run cy:smoke -- --browser chrome`), no Pages publication.
  - `main`/schedule: regression suite runs in parallel per browser (Chrome + Firefox), reports merged and published to GitHub Pages.
  - Artifacts: HTML report in `docs/report/index.html` (inline assets). Screenshots/videos can be enabled in Cypress if desired.
  - Retries: keep low (0-2); fix flakiness instead of hiding it.
- Cache `node_modules` based on `package-lock.json` to speed up.
- Install with `npm ci` in CI.
- Example GitHub Actions workflow:
```yaml
name: e2e-report
on:
  push:
    branches: [main]
  pull_request:
    branches: ["**"]
  schedule:
    - cron: '0 3 * * *' # daily
  workflow_dispatch:
jobs:
  smoke:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run cy:smoke -- --browser chrome

  test:
    if: github.event_name != 'pull_request'
    strategy:
      matrix:
        browser: [chrome, firefox]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: rm -rf docs/report
      - run: npm run cy:report:raw -- --browser ${{ matrix.browser }} -- --env grepTags=@regression
      - name: Upload raw report
        uses: actions/upload-artifact@v4
        with:
          name: report-${{ matrix.browser }}
          path: docs/report/raw

  merge:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: rm -rf docs/report
      - name: Download raw reports
        uses: actions/download-artifact@v4
        with:
          pattern: report-*
          path: docs/report/raw
          merge-multiple: true
      - run: npm run cy:merge-report
      - name: Upload report artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: merge
    permissions:
      pages: write
      id-token: write
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
