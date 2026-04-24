---
name: testing
description: >
  Write unit tests and automation tests with Playwright for any frontend/backend project.
  Use this skill whenever the user wants to: write unit tests (Jest, Vitest, Mocha, pytest),
  write integration tests, write end-to-end tests with Playwright, generate test cases from
  existing code, debug failing tests, configure a test runner, create Page Object Models,
  mock/stub dependencies, check coverage, or any time the user mentions "test", "spec",
  "playwright", "jest", "vitest", "assert", "expect", "describe", "it()", "e2e",
  "unit test", or "auto test". This skill is mandatory for any software testing task.
---

# Testing Skill

This skill guides the creation of high-quality tests, covering **Unit Tests** and **Automation Tests with Playwright**.

## First Step: Analyze the Requirements

Before writing any test, identify:

1. **Test type**: Unit / Integration / E2E?
2. **Framework**: What is the project using? (Jest, Vitest, Playwright, pytest…)
3. **Language**: TypeScript, JavaScript, Python?
4. **Code under test**: Read the source code to understand behavior before writing assertions.
5. **Environment**: Browser, Node.js, CI/CD pipeline?

If any of these are unclear, ask the user before proceeding.

---

## PART 1 — Unit Tests

### Principles of Good Unit Tests

- **One test checks one behavior** — avoid testing too many things in a single `it()`
- **AAA Pattern**: Arrange → Act → Assert
- **Test names must describe behavior**, not implementation:
  - ❌ `it('calls getUserById')`
  - ✅ `it('returns null when user does not exist')`
- **Tests must be independent**: no dependency on execution order, no shared state
- **Fast & Deterministic**: no real API calls, no dependency on real-time clocks

### Common Frameworks

#### Jest / Vitest (JavaScript/TypeScript)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest' // or from '@jest/globals'

describe('UserService', () => {
  let userService: UserService
  let mockRepo: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      save: vi.fn(),
    }
    userService = new UserService(mockRepo)
  })

  describe('getUser', () => {
    it('returns user when found', async () => {
      // Arrange
      const fakeUser = { id: '1', name: 'Alice' }
      mockRepo.findById.mockResolvedValue(fakeUser)

      // Act
      const result = await userService.getUser('1')

      // Assert
      expect(result).toEqual(fakeUser)
    })

    it('returns null when user does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null)
      const result = await userService.getUser('999')
      expect(result).toBeNull()
    })

    it('throws when repository fails', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'))
      await expect(userService.getUser('1')).rejects.toThrow('DB error')
    })
  })
})
```

#### pytest (Python)

```python
import pytest
from unittest.mock import MagicMock

class TestUserService:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.mock_repo = MagicMock()
        self.service = UserService(repo=self.mock_repo)

    def test_returns_user_when_found(self):
        # Arrange
        fake_user = {"id": "1", "name": "Alice"}
        self.mock_repo.find_by_id.return_value = fake_user

        # Act
        result = self.service.get_user("1")

        # Assert
        assert result == fake_user

    def test_returns_none_when_not_found(self):
        self.mock_repo.find_by_id.return_value = None
        result = self.service.get_user("999")
        assert result is None

    def test_raises_when_repo_fails(self):
        self.mock_repo.find_by_id.side_effect = Exception("DB error")
        with pytest.raises(Exception, match="DB error"):
            self.service.get_user("1")
```

### Mocks & Stubs

```typescript
// Mock an entire module
vi.mock('./emailService', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Spy on a method
const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Per-test mock
it('handles API error', () => {
  vi.mocked(fetchUser).mockRejectedValueOnce(new Error('Network error'))
  // ...
})

// Cleanup
afterEach(() => vi.restoreAllMocks())
```

### Testing React Components (React Testing Library)

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('LoginForm', () => {
  it('shows an error when submitting an empty form', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('calls onSubmit with credentials when the form is valid', async () => {
    const mockSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LoginForm onSubmit={mockSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'secret123',
      })
    })
  })
})
```

### Code Coverage

```bash
# Vitest
vitest run --coverage

# Jest
jest --coverage

# pytest
pytest --cov=src --cov-report=html
```

Coverage guidance:
- **>80%**: the minimum to aim for
- **Focus on branch coverage**, not just line coverage
- 100% coverage does not mean good tests — prioritize important edge cases

---

## PART 2 — Playwright (E2E & Automation Tests)

### Standard Playwright Project Structure

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   └── dashboard/
│       └── dashboard.spec.ts
├── pages/                  ← Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── BasePage.ts
├── fixtures/               ← Custom fixtures & test data
│   ├── auth.fixture.ts
│   └── testData.ts
└── playwright.config.ts
```

### Production-Ready playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Page Object Model (POM)

```typescript
// pages/BasePage.ts
import { Page, Locator } from '@playwright/test'

export class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async getToast(): Promise<string> {
    const toast = this.page.locator('[data-testid="toast"]')
    await toast.waitFor()
    return toast.textContent() ?? ''
  }
}
```

```typescript
// pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Login' })
    this.errorMessage = page.locator('[data-testid="error-message"]')
  }

  async goto() {
    await this.page.goto('/login')
    await this.waitForPageLoad()
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message)
  }
}
```

### Writing a Clean Spec File

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/LoginPage'
import { DashboardPage } from '../../pages/DashboardPage'

test.describe('Login', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('successfully logs in with valid credentials', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await loginPage.login('alice@example.com', 'password123')
    await expect(page).toHaveURL('/dashboard')
    await dashboard.expectWelcomeMessage('Alice')
  })

  test('shows an error with wrong password', async () => {
    await loginPage.login('alice@example.com', 'wrongpassword')
    await loginPage.expectError('Invalid credentials')
    await expect(loginPage.page).toHaveURL('/login')
  })

  test('validates empty form submission', async () => {
    await loginPage.submitButton.click()
    await loginPage.expectError('Email is required')
  })
})
```

### Fixtures & Authentication

```typescript
// fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test'

type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: log in before each test
    await page.goto('/login')
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/dashboard')
    await use(page)
    // Teardown: log out after the test
    await page.goto('/logout')
  },

  adminPage: async ({ page }, use) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@example.com')
    await page.getByLabel('Password').fill('adminpass')
    await page.getByRole('button', { name: 'Login' }).click()
    await page.waitForURL('/admin')
    await use(page)
  },
})

export { expect } from '@playwright/test'
```

```typescript
// Using the fixture in a test
import { test, expect } from '../../fixtures/auth.fixture'

test('user can see their own profile', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile')
  await expect(authenticatedPage.getByText('user@example.com')).toBeVisible()
})
```

### Common Patterns

#### API Mocking

```typescript
test('shows an error when the API fails', async ({ page }) => {
  await page.route('**/api/users', route =>
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  )
  await page.goto('/users')
  await expect(page.getByText('Something went wrong')).toBeVisible()
})
```

#### Intercept & Assert Request

```typescript
test('sends the correct payload on form submit', async ({ page }) => {
  const requestPromise = page.waitForRequest('**/api/register')
  await page.goto('/register')
  await page.getByLabel('Email').fill('new@example.com')
  await page.getByRole('button', { name: 'Register' }).click()
  const request = await requestPromise
  const body = request.postDataJSON()
  expect(body.email).toBe('new@example.com')
})
```

#### Visual Regression

```typescript
test('login page looks as expected', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveScreenshot('login-page.png', {
    maxDiffPixels: 100,
  })
})
```

#### File Download

```typescript
test('exports a CSV file successfully', async ({ page }) => {
  const downloadPromise = page.waitForEvent('download')
  await page.goto('/reports')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/\.csv$/)
})
```

### Running Playwright

```bash
# Run all tests
npx playwright test

# Run a specific file
npx playwright test tests/e2e/auth/login.spec.ts

# Run with UI (interactive debug mode)
npx playwright test --ui

# Run headed (visible browser)
npx playwright test --headed

# Debug a specific test
npx playwright test --debug tests/e2e/auth/login.spec.ts

# View the HTML report
npx playwright show-report

# Codegen — record actions as code
npx playwright codegen http://localhost:3000
```

---

## PART 3 — Pre-Ship Checklist

Before marking a test as done, verify:

- [ ] Test fails for the right reason when behavior is broken (break the code intentionally, then rerun)
- [ ] Test name is descriptive enough — reading the name alone tells you what it checks
- [ ] No hardcoded waits (`await page.waitForTimeout(3000)`) — use locator-based assertions instead
- [ ] Each test cleans up its own state (use `beforeEach` / `afterEach`)
- [ ] Tests pass in CI (no dependency on local environment specifics)
- [ ] Playwright: important elements have `data-testid` attributes
- [ ] Dependencies are properly mocked — tests do not call real external services

---

## Locator Strategy (Playwright)

Priority order, highest to lowest:

1. `getByRole('button', { name: 'Submit' })` — semantic, accessible ✅
2. `getByLabel('Email')` — tied to a visible label ✅
3. `getByText('Welcome back')` — visible text ✅
4. `getByTestId('submit-btn')` — explicit `data-testid` attribute ✅
5. `locator('.btn-primary')` — CSS class, use when necessary ⚠️
6. `locator('div > button:nth-child(2)')` — fragile structural selectors, avoid ❌
