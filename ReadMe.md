# DC Test Automation Framework

A robust, scalable, and maintainable end-to-end test automation framework built with **Playwright** and **TypeScript**. This framework follows industry best practices including the **Page Object Model (POM)** pattern and **Data-Driven Testing (DDT)** approach.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Data-Driven Testing](#data-driven-testing)
- [Page Object Model](#page-object-model)
- [Adding New Tests](#adding-new-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Project Overview

This framework provides automated end-to-end testing capabilities for the DC application. It supports:

- Cross-browser testing (Chromium, Firefox, WebKit)
- Parallel test execution
- Data-driven test cases via JSON files
- Centralized configuration management
- HTML test reports
- GitHub Actions CI/CD integration

## Technology Stack

- **Test Framework:** [Playwright](https://playwright.dev/) v1.58+
- **Language:** TypeScript
- **Package Manager:** npm
- **CI/CD:** GitHub Actions
- **Reporting:** Playwright HTML Reporter

## Project Structure

```
dc-test-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml       # GitHub Actions CI workflow
├── data/
│   ├── login.cases.json         # Login test data
│   ├── tenantCreate.cases.json  # Tenant creation test data
│   └── testTimeout.json         # Timeout configurations
├── src/
│   ├── config/
│   │   ├── browser.config.ts    # Browser viewport & locale settings
│   │   ├── execution.config.ts  # Execution mode settings
│   │   ├── section.filter.config.ts
│   │   ├── timeouts.config.ts   # Timeout loader from JSON
│   │   └── urls.config.ts       # Application URLs
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.ts     # Login page object
│   │   ├── base/
│   │   │   └── BasePage.ts      # Base page with common methods
│   │   └── merchants/
│   │       ├── MerchantPage.ts  # Merchants page object
│   │       └── TenantCreateModal.ts  # Tenant creation modal
│   ├── test-data/
│   │   ├── helpers.ts           # Utility functions
│   │   ├── loaders.ts           # JSON data loaders
│   │   └── types.ts             # TypeScript type definitions
│   └── tests/
│       ├── login.data.spec.ts   # Login test specs
│       └── tenant-create.data.spec.ts  # Tenant creation tests
├── .env                         # Environment variables
├── .env.example                 # Safe template for local env vars
├── .gitignore
├── package.json
├── playwright.config.ts         # Playwright configuration
└── tsconfig.json
```

## Prerequisites

- **Node.js:** v18.x or higher (LTS recommended)
- **npm:** v9.x or higher
- **Git:** For version control

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dc-test-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install --with-deps
   ```

4. **Set up environment variables:**
   Copy `.env.example` to `.env` and set your real credentials locally:
   ```env
   BASE_URL=https://your-app-url.com
   LOGIN_USERNAME=your-login-email@example.com
   LOGIN_PASSWORD=your-secure-password
   ```

## Configuration

### Environment Variables

| Variable         | Description                                 | Default                      |
|------------------|---------------------------------------------|------------------------------|
| `BASE_URL`       | Application base URL                        | `https://backdoor.bbil.org/` |
| `LOGIN_USERNAME` | Valid login username/email for success flow | _required for login tests_   |
| `LOGIN_PASSWORD` | Valid login password for success flow       | _required for login tests_   |
| `CI`             | CI environment flag                         | `undefined`                  |

### Timeout Configuration

Timeouts are configured via `data/testTimeout.json`:

```json
[
  {
    "testTimeout": 7200000,      // Max time per test (2 hours)
    "expectTimeout": 15000,      // Assertion timeout (15 sec)
    "actionTimeout": 30000,      // Action timeout (30 sec)
    "navigationTimeout": 60000   // Navigation timeout (60 sec)
  }
]
```

> `login-admin-valid` pulls credentials from `.env` through `data/login.cases.json` placeholders.
> Keep `.env` untracked (already covered by `.gitignore`) and commit only `.env.example`.

### Browser Configuration

Browser settings in `src/config/browser.config.ts`:

```typescript
export const BROWSER_OPTIONS = {
  viewport: { width: 1440, height: 900 },
  locale: "en-US",
};
```

## Running Tests

### Basic Commands

```bash
# Run all tests (default)
npm test

# Run tests on specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run tests in headed mode (visible browser)
npm run test:chromium:headed
npm run test:firefox:headed
npm run test:webkit:headed

# Run all browsers in parallel
npm run test:all-parallel
npm run test:all-parallel:headed
```

### Playwright CLI Options

```bash
# Run specific test file
npx playwright test src/tests/login.data.spec.ts

# Run tests with specific tag/name pattern
npx playwright test -g "login"

# Run with UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

## Data-Driven Testing

This framework uses **JSON-based data-driven testing** to separate test logic from test data.

### Test Data Structure

#### Login Cases (`data/login.cases.json`)

```json
[
  {
    "id": "login-admin-valid",
    "name": "Admin valid login",
    "username": "${LOGIN_USERNAME}",
    "password": "${LOGIN_PASSWORD}",
    "expected": { "outcome": "success" }
  },
  {
    "id": "login-invalid",
    "name": "Invalid login",
    "username": "wrong@gmail.com",
    "password": "wrongpass",
    "expected": { "outcome": "failure", "messageContains": "User does not exist" }
  }
]
```

#### Tenant Create Cases (`data/tenantCreate.cases.json`)

```json
[
  {
    "id": "tc01-create-tenant-success",
    "name": "TC01 - Create a new tenant (valid details)",
    "loginRefId": "login-admin-valid",
    "input": {
      "storeName": "My Store",
      "subDomain": "my-store",
      "ownerName": "Owner",
      "email": "owner@example.com",
      "phone": "1234567890"
    },
    "expected": { "outcome": "success" },
    "verify": { "toastContains": "Saved" }
  }
]
```

### Type Definitions

Types are defined in `src/test-data/types.ts`:

```typescript
export type Expected =
  | { outcome: 'success' }
  | {
      outcome: 'failure';
      messageContains?: string;
      fieldErrors?: Partial<Record<'storeName' | 'subDomain' | 'email' | 'phone', string>>;
    };

export type LoginCase = {
  id: string;
  name: string;
  username: string;
  password: string;
  expected: Expected;
};
```

### Data Loaders

Test data is loaded via `src/test-data/loaders.ts`:

```typescript
import { loadLoginCases, loadTenantCreateCases } from '../test-data/loaders';

const loginCases = loadLoginCases();
const tenantCases = loadTenantCreateCases();
```

## Page Object Model

The framework implements the **Page Object Model (POM)** pattern for maintainable and reusable test code.

### Base Page

All page objects extend `BasePage`:

```typescript
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.page.setDefaultTimeout(timeouts.actionTimeout);
    this.page.setDefaultNavigationTimeout(timeouts.navigationTimeout);
  }

  async waitForAppIdle(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }
}
```

### Page Object Example

```typescript
export class LoginPage extends BasePage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByText('Email *').locator('..').locator('input[type="text"]');
    this.password = page.locator('input[type="password"]');
    this.submit = page.getByRole('button', { name: /submit/i });
  }

  async goto() {
    await this.page.goto(URLS.LOGIN);
    await this.waitForAppIdle();
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
    await this.waitForAppIdle();
  }
}
```

## Adding New Tests

### Step 1: Create Test Data

Add test cases to the appropriate JSON file in `data/`:

```json
{
  "id": "unique-test-id",
  "name": "Descriptive test name",
  "input": { ... },
  "expected": { "outcome": "success" | "failure" }
}
```

### Step 2: Create/Update Page Object

If testing a new page, create a page object in `src/pages/`:

```typescript
import { BasePage } from '../base/BasePage';

export class NewPage extends BasePage {
  // Define locators
  readonly element: Locator;

  constructor(page: Page) {
    super(page);
    this.element = page.getByRole('button', { name: 'Click' });
  }

  // Define actions
  async performAction() {
    await this.element.click();
  }
}
```

### Step 3: Create Test Spec

Create a new spec file in `src/tests/`:

```typescript
import { test, expect } from '@playwright/test';
import { loadTestCases } from '../test-data/loaders';
import { NewPage } from '../pages/NewPage';

const testCases = loadTestCases();

for (const tc of testCases) {
  test(`feature | ${tc.id} | ${tc.name}`, async ({ page }) => {
    const newPage = new NewPage(page);
    // Test implementation
  });
}
```

## CI/CD Integration

### GitHub Actions

The framework includes a GitHub Actions workflow (`.github/workflows/playwright.yml`):

```yaml
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Features

- Runs on push/PR to main/master branches
- Uploads test reports as artifacts
- 30-day report retention

## Best Practices

### Test Organization

- Keep test data separate from test logic
- Use meaningful test case IDs and names
- Group related tests in the same spec file

### Page Objects

- One page object per application page/component
- Keep locators as class properties
- Encapsulate complex interactions in methods
- Always extend `BasePage` for consistent timeouts

### Data-Driven Approach

- Store test data in JSON files under `data/`
- Define TypeScript types for type safety
- Reference credentials using `loginRefId` to avoid duplication

### Selectors

- Prefer role-based selectors (`getByRole`)
- Use `getByText` for user-visible content
- Avoid CSS selectors when possible
- Use `exact: true` for precise matching

### Assertions

- Use Playwright's built-in `expect` with auto-waiting
- Always provide meaningful timeout values
- Assert both success and failure scenarios

## Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports are generated in the `playwright-report/` directory.

## Troubleshooting

### Common Issues

1. **Tests timeout:** Increase timeout values in `data/testTimeout.json`
2. **Element not found:** Check if locators match the current UI
3. **Flaky tests:** Add appropriate waits using `waitForAppIdle()`

### Debug Mode

```bash
# Run with debug inspector
npx playwright test --debug

# Run with trace viewer
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## License

**Maintained by:** BluBird Interactive
