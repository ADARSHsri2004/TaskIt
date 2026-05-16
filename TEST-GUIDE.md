# Test Execution Guide

Quick reference for running tests in TaskIt project.

## Backend Tests

### Installation

```bash
cd server
npm install
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run specific test file
npm run test -- auth.service.test.ts

# Generate coverage report
npm run test:coverage

# Run with verbose output
npm run test -- --verbose
```

### View Coverage Report

After running `npm run test:coverage`, open the HTML report:

```bash
# On Windows
start coverage/lcov-report/index.html

# On macOS
open coverage/lcov-report/index.html

# On Linux
xdg-open coverage/lcov-report/index.html
```

## Frontend Tests

### Installation

```bash
cd client
npm install
```

### Running Unit & Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test -- Login.test.tsx

# Generate coverage report
npm run test:coverage

# Run with verbose output
npm run test -- --verbose
```

### Running E2E Tests

```bash
# Open Cypress UI (interactive)
npm run test:e2e

# Run all E2E tests headless
npm run test:e2e:run

# Run specific E2E test
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run with specific browser
npx cypress run --browser chrome

# Debug mode
npx cypress run --headed --no-exit
```

## Coverage Requirements

### Backend

Minimum 80% coverage required:

- **Services**: 90% target
- **Controllers**: 85% target
- **Middleware**: 80% target
- **Utilities**: 85% target

### Frontend

Minimum 80% coverage required:

- **Components**: 85% target
- **Pages**: 85% target
- **Hooks**: 80% target
- **Redux Slices**: 80% target

## Testing Workflow

### Before Committing

```bash
# 1. Run all tests
npm run test

# 2. Check coverage
npm run test:coverage

# 3. Ensure 80% minimum coverage
# Review coverage report

# 4. Run E2E tests (if applicable)
npm run test:e2e:run
```

### Pre-Push Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Coverage meets 80% threshold
- [ ] E2E tests passing
- [ ] No console errors or warnings
- [ ] Code linted successfully

## Common Commands

### Backend

```bash
# Development with auto-reload and test
npm run dev

# Run tests and watch for changes
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run single test suite
npm run test -- tests/services/auth.service.test.ts
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Run tests in watch mode
npm run test:watch

# E2E tests in UI
npm run test:e2e

# E2E tests headless
npm run test:e2e:run
```

## Troubleshooting

### Backend

**Issue: Tests timeout**
```bash
# Increase timeout
npm run test -- --testTimeout=20000
```

**Issue: Module not found**
- Verify `.env.test` exists with correct paths
- Check Jest config `moduleNameMapper`

**Issue: Prisma mock not working**
- Ensure `jest-mock-extended` is installed
- Check setup file at `tests/setup.ts`

### Frontend

**Issue: Can't find module**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm run test -- --clearCache
```

**Issue: E2E tests failing**
- Ensure app is running: `npm run dev`
- Check Cypress base URL in `cypress.config.ts`
- Verify API mocking with `cy.intercept()`

**Issue: Tests are slow**
- Run tests in parallel: Jest does this by default
- Check for `waitFor` timeouts
- Profile with `npm run test -- --detectOpenHandles`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: cd server && npm install
      - run: npm run test
      - run: npm run test:coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: cd client && npm install
      - run: npm run test
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      - run: cd server && npm install && npm run dev &
      - run: cd client && npm install && npm run build
      - run: npm run test:e2e:run
```

## Test Data & Fixtures

Both backend and frontend have test helpers:

### Backend
```typescript
// tests/utils/testHelpers.ts
import { createMockUser, createMockTask } from './testHelpers';

const mockUser = createMockUser({ email: 'custom@example.com' });
```

### Frontend
```typescript
// tests/utils/testHelpers.ts
import { createMockUser, authTestData } from './testHelpers';

const user = createMockUser();
const loginData = authTestData.login;
```

## Performance Tips

1. **Run tests in watch mode** during development
2. **Use focused tests** with `.only` for specific tests
3. **Clear Jest cache** if seeing stale results
4. **Parallelize** - Jest runs tests in parallel by default
5. **Minimize** database calls by proper mocking

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Supertest](https://github.com/visionmedia/supertest#readme)

## Additional Help

For detailed information, see:
- Backend: [Server Tests Documentation](#)
- Frontend: [Client Tests Documentation](#)
- Main: [Testing Guide](./TESTING.md)
