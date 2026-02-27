# AcmeAI Legal Assistant - Test Automation Framework

A comprehensive end-to-end test automation framework for the **AcmeAI Legal Assistant** application, built with **Playwright** and **TypeScript**. This framework implements industry best practices including the **Page Object Model (POM)** pattern and **Data-Driven Testing (DDT)** approach, focusing on security validation and functional testing.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Suites](#test-suites)
- [Data-Driven Testing](#data-driven-testing)
- [Page Object Model](#page-object-model)
- [API Testing with Postman](#api-testing-with-postman)
- [CI/CD Integration](#cicd-integration)
- [Test Reports](#test-reports)
- [Adding New Tests](#adding-new-tests)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

This framework provides automated testing capabilities for the **AcmeAI Legal Assistant** application, focusing on:

### Core Testing Areas
- **Security Testing:** Input validation, SQL injection prevention, XSS protection, Unicode handling
- **Functional Testing:** Search functionality, result validation, UI behavior verification
- **API Testing:** Backend endpoint validation with Postman collections

### Key Features
- Cross-browser testing support (Chromium-based)
- Data-driven test execution using JSON files
- Comprehensive security validation test cases
- Automated CI/CD pipeline with GitHub Actions
- HTML test reports with detailed attachments
- Postman collection for API testing

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Test Framework** | [Playwright](https://playwright.dev/) | v1.58.2+ |
| **Language** | TypeScript | ES2020 |
| **Runtime** | Node.js | v18.x+ (LTS) |
| **Package Manager** | npm | v9.x+ |
| **API Testing** | Postman | - |
| **CI/CD** | GitHub Actions | - |
| **Reporting** | Playwright HTML Reporter | Built-in |

## 📁 Project Structure

```
AcmeAI_SQA-/
├── .github/
│   └── workflows/
│       └── playwright.yml           # CI/CD pipeline configuration
├── .postman/                        # Postman metadata
├── data/                            # Test data files (JSON)
│   ├── homePageSecurityTest.json    # Security test cases
│   └── validSearchResult.json       # Search validation test data
├── node_modules/                    # Dependencies (ignored by git)
├── playwright-report/               # Generated HTML reports
├── postman/                         # Postman collections & globals
│   ├── collections/
│   │   └── ACME AI.postman_collection.json
│   └── globals/
│       └── workspace.postman_globals.json
├── src/                             # Source code
│   ├── pages/                       # Page Object Models
│   │   ├── homePageSecurityTest.page.ts
│   │   └── validSearchResult.page.ts
│   ├── test-data/                   # Data loaders and types
│   │   ├── loaders.ts               # JSON data loading utilities
│   │   └── types.ts                 # TypeScript type definitions
│   └── tests/                       # Test specifications
│       ├── homePageSecurityTest.spec.ts
│       └── validSearchResult.spec.ts
├── test-results/                    # Test execution artifacts
├── tests/                           # Additional test directory
├── .gitignore                       # Git ignore rules
├── package.json                     # Project dependencies & scripts
├── package-lock.json                # Dependency lock file
├── playwright.config.ts             # Playwright configuration
├── TestCase.txt                     # Test case documentation
└── tsconfig.json                    # TypeScript configuration
```

## ✅ Prerequisites

Before setting up the project, ensure you have:

- **Node.js:** v18.x or higher (LTS recommended)
- **npm:** v9.x or higher
- **Git:** For version control
- **Postman** (optional): For API testing

### Verify Installation

```pwsh
node --version   # Should show v18.x or higher
npm --version    # Should show v9.x or higher
git --version    # Any recent version
```

## 🚀 Installation

### 1. Clone the Repository

```pwsh
git clone https://github.com/haris-bbil/AcmeAI_SQA-.git
cd AcmeAI_SQA-
```

### 2. Install Dependencies

```pwsh
npm install
```

### 3. Install Playwright Browsers

```pwsh
npx playwright install --with-deps
```

This will download Chromium, Firefox, and WebKit browsers along with their system dependencies.

## ⚙️ Configuration

### Playwright Configuration

The `playwright.config.ts` file contains all test execution settings:

```typescript
{
  testDir: './src/tests',           // Test location
  timeout: 30_000,                  // 30 seconds per test
  maxFailures: 0,                   // Run all tests
  fullyParallel: false,             // Sequential execution
  workers: 1,                       // Single worker
  reporter: 'html',                 // HTML report generation
  baseURL: 'http://localhost:3001', // Default application URL
  headless: !!process.env.CI,       // Headless in CI
  ignoreHTTPSErrors: true,          // Allow self-signed certificates
  trace: 'on-first-retry'           // Trace on failures
}
```

### Environment Variables

Configure the application base URL:

```pwsh
# Windows PowerShell
$env:BASE_URL = "http://localhost:3001"

# Linux/Mac
export BASE_URL="http://localhost:3001"
```

Or update `playwright.config.ts` directly:

```typescript
baseURL: process.env.BASE_URL ?? 'http://localhost:3001'
```

### Browser Settings

The framework is configured to run on:
- **Chromium** (Desktop Chrome)
- Viewport: 1920×1080 (maximized)
- Auto-maximized browser window

## 🧪 Running Tests

### Quick Start

```pwsh
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Record new tests using Codegen
npm run record

# Run specific test suite (Legal Assistant HomePage tests)
npm run test:LegalAssistantHomePage
```

### Advanced Test Execution

```pwsh
# Run specific test file
npx playwright test src/tests/validSearchResult.spec.ts

# Run with specific browser
npx playwright test --project=chromium

# Run in headed mode (visible browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run with specific tag/pattern
npx playwright test -g "Security"

# Generate and show report
npx playwright show-report
```

### Test Execution Order

The `test:LegalAssistantHomePage` script runs tests in order:
1. **Valid Search Result Test** - Validates search functionality
2. **Security Tests** - Validates input security and error handling

## 📝 Test Suites

### 1. Security Testing Suite

**File:** `src/tests/homePageSecurityTest.spec.ts`

Tests core security requirements against common vulnerabilities:

| Test Case | Requirement | Description | Expected Result |
|-----------|-------------|-------------|-----------------|
| TC-SQL-01 | CORE-VAL-01 | SQL injection prevention | Safe error or rejection |
| TC-XSS-01 | CORE-VAL-02 | HTML/JS tag rejection | Escapes or rejects scripts |
| TC-LEN-01 | CORE-VAL-03 | Input length enforcement | Rejects 10,000+ chars |
| TC-FMT-01 | CORE-VAL-04 | Format validation | Rejects invalid formats |
| TC-UNI-01 | CORE-VAL-05 | Unicode handling | Decodes and validates safely |
| TC-FILE-01 | CORE-VAL-06 | File upload restrictions | No file upload available |
| TC-SRV-01 | CORE-VAL-07 | Server-side validation | Backend validates input |
| TC-ERR-01 | CORE-VAL-08 | Generic error messages | No stack traces exposed |

**Key Features:**
- Validates against SQL injection (`' OR 1=1 --`)
- Tests XSS protection (`<script>alert('XSS')</script>`)
- Enforces input length limits (10,000 characters)
- Validates Unicode encoding (`%3Cscript%3E`)
- Ensures server-side validation exists
- Verifies no sensitive error leaks

### 2. Functional Testing Suite

**File:** `src/tests/validSearchResult.spec.ts`

Validates search functionality and result accuracy:

**Test:** "Validate search result for the search input = 'a'"

- **Input:** Query string "a"
- **Expected Results:**
  - Returns 10 relevant legal documents
  - Summary text: "Found 10 relevant legal"
  - All expected document titles are present

**Expected Document Titles:**
1. Data Protection and Privacy Act
2. Intellectual Property Rights Law
3. Employment Standards Act
4. Contract Law Basics
5. Consumer Protection Regulations
6. Environmental Compliance Act
7. Cybersecurity Framework
8. Corporate Governance Code
9. Anti-Money Laundering Law
10. Intellectual Property Licensing Agreement Template

## 📊 Data-Driven Testing

### Test Data Structure

Test data is stored in JSON files under the `data/` directory.

#### Security Test Data (`data/homePageSecurityTest.json`)

```json
[
  {
    "requirementId": "CORE-VAL-01",
    "testCaseId": "TC-SQL-01",
    "description": "All text inputs must reject SQL injection attempts",
    "expectedResult": "API returns safe error or ignores malicious input",
    "payload": "' OR 1=1 --",
    "mode": "query"
  }
]
```

#### Search Validation Data (`data/validSearchResult.json`)

```json
{
  "testTitle": "Validate search result for the search input = \"a\"",
  "query": "a",
  "expectedSummaryText": "Found 10 relevant legal",
  "expectedResultsCount": 10,
  "expectedTitles": ["Title 1", "Title 2", ...]
}
```

### Type Definitions

**File:** `src/test-data/types.ts`

```typescript
export type CoreTestingMode = 'query' | 'upload' | 'server-validation';

export type CoreTestingCase = {
  requirementId: string;
  testCaseId: string;
  description: string;
  expectedResult: string;
  payload?: string;
  mode: CoreTestingMode;
};
```

### Data Loaders

**File:** `src/test-data/loaders.ts`

```typescript
import { loadCoreTestingCases } from '../test-data/loaders';

const testCases = loadCoreTestingCases();
// Automatically replaces __LONG_A_10000__ with 10,000 'a' characters
```

## 🏗️ Page Object Model

### Architecture

All page objects encapsulate UI elements and interactions for specific pages.

### Base Page Pattern

```typescript
export class HomePageSecurityTestPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly mainArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', {
      name: 'Search for legal documents...'
    });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.mainArea = page.getByRole('main');
  }

  async gotoHome() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { 
      name: 'Legal Assistant' 
    })).toBeVisible();
  }

  async submitQuery(payload: string) {
    await this.searchInput.click();
    await this.searchInput.fill(payload);
    await this.searchButton.click();
  }
}
```

### Page Objects

1. **HomePageSecurityTestPage** (`homePageSecurityTest.page.ts`)
   - Handles home page navigation
   - Manages search input interactions
   - Validates safe UI state

2. **ValidSearchResultPage** (`validSearchResult.page.ts`)
   - Performs search operations
   - Validates search results
   - Checks document titles and summaries

## 🔌 API Testing with Postman

### Collection Overview

**File:** `postman/collections/ACME AI.postman_collection.json`

The Postman collection tests the `/generate` endpoint with data-driven test cases.

### Test Cases

| Test Case | Description | Input | Expected |
|-----------|-------------|-------|----------|
| TC-1 | Empty input | `{ query: "" }` | BLOCK |
| TC-2 | Invalid input (number) | `{ query: 1 }` | BLOCK |
| TC-3 | Invalid key parameter | `{ queryyyyy: "a" }` | BLOCK |
| TC-4 | Special characters | `{ query: "\|; ²³~ @..." }` | ALLOW |
| TC-5 | Missing input value | `{}` | BLOCK |
| TC-6 | Valid input returns 200 | `{ query: "a" }` | ALLOW |
| TC-7 | Valid input returns 10 docs | `{ query: "a" }` | ALLOW |
| TC-8 | Specific title in results | `{ query: "a" }` | ALLOW |

### Running Postman Tests

1. Import collection: `postman/collections/ACME AI.postman_collection.json`
2. Import globals: `postman/globals/workspace.postman_globals.json`
3. Run collection using Postman Runner
4. Tests execute automatically with pre-request scripts

### Response Validation

Expected successful response structure:

```json
{
  "success": true,
  "status": 200,
  "data": {
    "summary": "Found 10 relevant legal document(s)...",
    "matched_docs": [
      { "id": 1, "title": "Document Title" }
    ]
  },
  "message": "Search completed successfully"
}
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/playwright.yml`

```yaml
name: Playwright CI

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    steps:
      - Checkout repository
      - Setup Node.js (LTS)
      - Install dependencies (npm ci)
      - Install Playwright browsers
      - Run tests with BASE_URL from GitHub vars
      - Upload HTML report (30-day retention)
```

### Triggering CI

```pwsh
# Push to main branch
git push origin main

# Manual trigger via GitHub Actions tab
# Click "Run workflow" button
```

### Viewing Results

1. Navigate to repository → Actions tab
2. Select the workflow run
3. Download "playwright-report" artifact
4. Extract and open `index.html`

## 📈 Test Reports

### HTML Reports

After test execution, view the interactive HTML report:

```pwsh
npx playwright show-report
```

**Report Features:**
- Test execution summary (passed/failed/skipped)
- Detailed test logs with steps
- Screenshots on failures
- Test attachments (result messages, response data)
- Execution timeline
- Filtering and search capabilities

### Report Location

```
playwright-report/
└── index.html          # Main report file
```

### Test Attachments

Each test includes custom attachments:

1. **Result Message:** Expected vs. actual results
2. **Response Data:** API response structure (JSON)

Example:

```
Requirement: CORE-VAL-01
Test Case: TC-SQL-01
Expected Result: API returns safe error or ignores malicious input
Actual Result: Test executed successfully with safe UI behavior
```

## ➕ Adding New Tests

### Step 1: Create Test Data

Add test cases to appropriate JSON file in `data/`:

```json
{
  "requirementId": "NEW-REQ-01",
  "testCaseId": "TC-NEW-01",
  "description": "New test description",
  "expectedResult": "Expected behavior",
  "payload": "test payload",
  "mode": "query"
}
```

### Step 2: Update Type Definitions (if needed)

Modify `src/test-data/types.ts`:

```typescript
export type NewTestCase = {
  id: string;
  description: string;
  // ... additional fields
};
```

### Step 3: Create Data Loader

Add loader function in `src/test-data/loaders.ts`:

```typescript
export function loadNewTestCases(): NewTestCase[] {
  const dataPath = resolve(process.cwd(), 'data', 'newTest.json');
  const raw = readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}
```

### Step 4: Create/Update Page Object

Create page object in `src/pages/`:

```typescript
export class NewFeaturePage {
  readonly page: Page;
  readonly element: Locator;

  constructor(page: Page) {
    this.page = page;
    this.element = page.getByRole('button', { name: 'Click' });
  }

  async performAction() {
    await this.element.click();
  }
}
```

### Step 5: Create Test Spec

Create spec file in `src/tests/`:

```typescript
import { test, expect } from '@playwright/test';
import { loadNewTestCases } from '../test-data/loaders';
import { NewFeaturePage } from '../pages/NewFeaturePage';

const testCases = loadNewTestCases();

for (const tc of testCases) {
  test(`Feature | ${tc.id} | ${tc.description}`, async ({ page }) => {
    const app = new NewFeaturePage(page);
    // Test implementation
  });
}
```

## 💡 Best Practices

### Test Organization

- ✅ Keep test data separate from test logic
- ✅ Use meaningful test case IDs and names
- ✅ Group related tests in the same spec file
- ✅ Use data-driven approach for multiple scenarios

### Page Objects

- ✅ One page object per application page/component
- ✅ Keep locators as class properties
- ✅ Encapsulate complex interactions in methods
- ✅ Use descriptive method names

### Selectors

- ✅ Prefer role-based selectors (`getByRole`)
- ✅ Use `getByText` for user-visible content
- ✅ Avoid CSS/XPath selectors when possible
- ✅ Use `exact: true` for precise matching

### Assertions

- ✅ Use Playwright's built-in `expect` with auto-waiting
- ✅ Validate both positive and negative scenarios
- ✅ Assert on user-visible behavior, not implementation
- ✅ Provide meaningful error messages

### Security Testing

- ✅ Test common attack vectors (SQL injection, XSS)
- ✅ Validate input sanitization
- ✅ Ensure generic error messages (no stack traces)
- ✅ Verify server-side validation exists

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Problem:** Tests exceed 30-second timeout

**Solution:** Increase timeout in `playwright.config.ts`:

```typescript
timeout: 60_000,  // 60 seconds
```

#### 2. Element Not Found

**Problem:** Locator cannot find UI element

**Solution:**
- Inspect element in browser DevTools
- Update selector to match current UI
- Use Playwright Inspector: `npx playwright test --debug`

#### 3. Browser Not Installed

**Problem:** "Executable doesn't exist" error

**Solution:**

```pwsh
npx playwright install chromium
```

#### 4. Tests Are Flaky

**Problem:** Tests pass/fail inconsistently

**Solution:**
- Add explicit waits: `await page.waitForLoadState('networkidle')`
- Use auto-waiting assertions: `await expect(element).toBeVisible()`
- Avoid `page.waitForTimeout()` - use event-based waits

### Debug Mode

```pwsh
# Run with Playwright Inspector
npx playwright test --debug

# Run with trace recording
npx playwright test --trace on

# View trace file
npx playwright show-trace trace.zip
```

### Verbose Logging

```pwsh
# Enable debug logs
$env:DEBUG = "pw:api"
npx playwright test
```

## 📄 License & Maintainer

**Project:** AcmeAI Legal Assistant - Test Automation Framework  
**Repository:** [haris-bbil/AcmeAI_SQA-](https://github.com/haris-bbil/AcmeAI_SQA-)  
**Maintained by:** BluBird Interactive  
**License:** ISC


For issues, questions, or contributions:

1. Open an issue on [GitHub Issues](https://github.com/haris-bbil/AcmeAI_SQA-/issues)
2. Create a pull request with improvements
3. Contact the maintainers via repository

---

**Developed By Haris Md Miftahul**
