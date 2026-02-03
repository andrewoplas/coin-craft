# Testing Guide

This document outlines the automated testing strategy for CoinCraft. **All features must have automated tests - no manual testing required.**

## Testing Philosophy

- **Zero manual intervention**: All testing is automated and runs in CI/CD
- **Test-driven development**: Write tests alongside (or before) implementation
- **Comprehensive coverage**: Unit, integration, and E2E tests for all features
- **Fast feedback**: Unit tests run in milliseconds, E2E tests complete in minutes

---

## Test Types & Responsibilities

### Unit Tests (Vitest)

**What to test:**
- Pure functions and utilities
- Data formatting (money, dates, numbers)
- Business logic helpers
- Type guards and validators
- Constants and configurations

**Example files to test:**
- `src/lib/format.ts` - Money/date formatting
- `src/lib/constants.ts` - Character configs
- `src/lib/utils.ts` - Utility functions
- Module manifests validation

**Test location:** `src/lib/__tests__/[filename].test.ts`

**Example test:**
```typescript
// src/lib/__tests__/format.test.ts
import { describe, it, expect } from 'vitest'
import { fromCentavos, toCentavos, formatMoney } from '../format'

describe('Money formatting', () => {
  it('converts centavos to decimal', () => {
    expect(fromCentavos(15050)).toBe(150.50)
  })

  it('converts decimal to centavos', () => {
    expect(toCentavos(150.50)).toBe(15050)
  })

  it('formats money with PHP symbol', () => {
    expect(formatMoney(15050)).toBe('₱150.50')
  })
})
```

---

### Integration Tests (Vitest)

**What to test:**
- Server actions (mutations)
- Database queries
- Module registry functions
- Auth operations
- RLS policies

**Test against:**
- Real Supabase test project
- Test database with seed data
- Authenticated test users

**Test location:** `src/server/__tests__/[filename].test.ts`

**Example test:**
```typescript
// src/server/__tests__/create-transaction.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createTransaction } from '../actions/transactions'
import { getTestUser, cleanupTestData } from '../../test/helpers'

describe('createTransaction', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  it('creates an expense transaction', async () => {
    const user = await getTestUser()
    const result = await createTransaction({
      type: 'expense',
      amount: 15000,
      category_id: 'groceries',
      account_id: user.defaultAccountId,
      date: '2025-01-15',
      description: 'Test expense'
    })

    expect(result.success).toBe(true)
    expect(result.data.amount).toBe(15000)
    expect(result.data.type).toBe('expense')
  })

  it('validates RLS policy', async () => {
    const otherUserTransaction = { /* ... */ }
    const result = await getTransaction(otherUserTransaction.id)
    expect(result).toBeNull() // Should not access other user's data
  })
})
```

---

### E2E Tests (Playwright)

**What to test:**
- Complete user flows
- UI interactions and navigation
- Form submissions
- Character selection and theming
- Module activation/deactivation
- Responsive design
- Error states and validation

**Test browsers:**
- Chromium (desktop & mobile)
- Firefox (desktop)
- WebKit/Safari (desktop & mobile)

**Test location:** `e2e/[feature].spec.ts`

**Critical flows to test:**

1. **Authentication Flow**
   - Sign up with email/password
   - Email verification
   - Login
   - Logout

2. **Onboarding Flow**
   - Character selection
   - Module selection
   - First account creation
   - Welcome dashboard

3. **Quick Add Flow**
   - Open Quick Add modal
   - Create expense (< 5 seconds)
   - Create income
   - Create transfer
   - Validation errors

4. **Dashboard**
   - Character-specific theming
   - Active module widgets display
   - Responsive layout (mobile/tablet/desktop)

5. **Module-Specific Flows**
   - Envelope: Create envelope, allocate budget
   - Goals: Create goal, track progress
   - Statistics: View charts and insights

**Example test:**
```typescript
// e2e/quick-add.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Quick Add Transaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('[data-testid="login"]')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password')
    await page.click('[type="submit"]')
  })

  test('creates expense in under 5 seconds', async ({ page }) => {
    const startTime = Date.now()

    await page.click('[data-testid="quick-add-fab"]')
    await page.fill('[name="amount"]', '150')
    await page.click('[data-testid="category-groceries"]')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()

    const duration = Date.now() - startTime
    expect(duration).toBeLessThan(5000)
  })

  test('validates required fields', async ({ page }) => {
    await page.click('[data-testid="quick-add-fab"]')
    await page.click('[data-testid="submit"]')

    await expect(page.locator('text=Amount is required')).toBeVisible()
  })

  test('applies character accent color', async ({ page }) => {
    const fab = page.locator('[data-testid="quick-add-fab"]')
    const bgColor = await fab.evaluate(el =>
      getComputedStyle(el).backgroundColor
    )

    // Should match character's accent color
    expect(bgColor).toBeTruthy()
  })
})
```

---

## Test Data Management

### Fixtures & Factories

Create reusable test data factories:

```typescript
// src/test/factories/transaction.ts
export const createTestTransaction = (overrides = {}) => ({
  id: faker.string.uuid(),
  user_id: 'test-user-id',
  type: 'expense',
  amount: 10000,
  category_id: 'groceries',
  account_id: 'test-account-id',
  date: '2025-01-15',
  description: 'Test transaction',
  created_at: new Date().toISOString(),
  ...overrides
})
```

### Test Database

- Use separate Supabase test project
- Seed before E2E tests: `npm run test:seed`
- Clean up after tests
- Never use production credentials

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
      - run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Quality Gates

- **Unit/Integration tests**: Must pass 100%
- **E2E tests**: Must pass 100%
- **Coverage**: Must be ≥ 90%
- **Build**: Must succeed
- **Lint**: Must pass with no errors

---

## Testing Checklist

Before marking any feature as complete:

- [ ] Unit tests written for all utilities
- [ ] Integration tests written for all server actions
- [ ] E2E tests written for user flows
- [ ] All tests passing locally
- [ ] Coverage ≥ 90%
- [ ] Tests pass in CI/CD
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Character theming tested
- [ ] Error states tested
- [ ] RLS policies tested

---

## Running Tests

```bash
# Development
npm run test:watch              # Run unit tests in watch mode
npm run test:e2e:ui             # Run E2E tests with UI for debugging

# CI/CD
npm run test:all                # Run all tests (CI mode)

# Coverage
npm run test:coverage           # Generate coverage report
open coverage/index.html        # View coverage report
```

---

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how
2. **Use data-testid attributes**: Make E2E selectors stable
3. **Keep tests isolated**: Each test should be independent
4. **Use meaningful descriptions**: Test names should explain the scenario
5. **Test edge cases**: Empty states, errors, boundaries
6. **Mock external services**: Use test doubles for third-party APIs
7. **Fast feedback**: Unit tests should run in < 1 second each

---

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Testing Library](https://testing-library.com)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
