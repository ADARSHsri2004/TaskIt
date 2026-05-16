# TaskIt Testing Guide

This document outlines the comprehensive testing strategy for the TaskIt application, covering unit tests, integration tests, and end-to-end tests for both backend and frontend.

## Overview

The TaskIt project uses industry-standard testing frameworks:

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Jest with React Testing Library for component tests
- **E2E**: Cypress for end-to-end testing

**Target Coverage**: 80% across all modules

## Backend Testing

### Setup

The backend testing infrastructure is configured in `/server/jest.config.ts` and uses:
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for API testing
- **jest-mock-extended** - Advanced mocking utilities for Prisma ORM

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

#### Unit Tests

Located in `tests/services/` directory:

1. **`auth.service.test.ts`** - Authentication service tests
   - `findUserByEmail()` - Find user by email
   - `createUser()` - Create new user
   - Error handling scenarios

2. **`task.service.test.ts`** - Task service tests
   - `createTask()` - Create new task
   - `getTaskById()` - Retrieve task with relations
   - `deleteTask()` - Delete task
   - Error handling

**Coverage Target**: 90%+ for services

#### Integration Tests

Located in `tests/controllers/` directory:

1. **`auth.controller.test.ts`** - Authentication API endpoints
   ```
   POST /api/auth/register    - User registration
   POST /api/auth/login       - User login
   POST /api/auth/logout      - User logout
   ```
   - Valid credentials
   - Duplicate user detection
   - Invalid data validation
   - Error responses

2. **`task.controller.test.ts`** - Task management API endpoints
   ```
   POST /api/tasks              - Create task
   GET /api/tasks               - List tasks with pagination
   GET /api/tasks/:id           - Get task details
   PUT /api/tasks/:id           - Update task
   DELETE /api/tasks/:id        - Delete task
   ```
   - Task creation with file attachments
   - Filtering by status, priority, date range
   - Search functionality
   - Pagination
   - Authorization checks
   - Error handling

**Coverage Target**: 85%+ for controllers

### Key Test Scenarios

#### Authentication Tests

- ✅ User registration with valid data
- ✅ Reject duplicate email registration
- ✅ User login with correct credentials
- ✅ Reject login with wrong password
- ✅ Invalid email/password format
- ✅ JWT token generation
- ✅ User logout and token clearing

#### Task Management Tests

- ✅ Create task with title requirement
- ✅ File attachment validation (max 3 files)
- ✅ Auto-assign task to current user if not admin
- ✅ List tasks with pagination (default: 10 per page)
- ✅ Filter tasks by status (TODO, IN_PROGRESS, COMPLETED)
- ✅ Filter tasks by priority (LOW, MEDIUM, HIGH)
- ✅ Filter tasks by due date range
- ✅ Search tasks by title and description
- ✅ Get task details with relations
- ✅ Update task status and properties
- ✅ Delete task
- ✅ Access control and authorization

### Test Mocking

Prisma database calls are mocked using `jest-mock-extended`:

```typescript
// Example mocking
prismaMock.user.findUnique.mockResolvedValue(mockUser);
prismaMock.task.create.mockResolvedValue(mockTask);
```

### Coverage Report

Generate coverage report:

```bash
npm run test:coverage
```

Expected output shows:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

**Minimum threshold**: 80% for all metrics

## Frontend Testing

### Setup

The frontend testing infrastructure uses:
- **Jest** - Testing framework with TypeScript support
- **React Testing Library** - Component testing utilities
- **Cypress** - End-to-end testing
- **jsdom** - DOM simulation environment

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests (interactive)
npm run test:e2e

# Run E2E tests (headless)
npm run test:e2e:run
```

### Test Structure

#### Component Tests

Located in `tests/pages/` and `tests/components/` directories:

1. **`Login.test.tsx`** - Login page component
   - Render login form with email and password fields
   - Handle user input and state
   - Toggle password visibility
   - Form submission with valid/invalid credentials
   - Error message display
   - Loading state during submission
   - Navigation to register page

2. **`Register.test.tsx`** - Registration page component
   - Render registration form (name, email, password)
   - Handle user input
   - Form submission
   - Duplicate email detection
   - Navigation to login page

3. **`TaskCard.test.tsx`** - Task card display component
   - Render task title and description
   - Display default text when no description
   - Navigate to task details
   - Show task metadata
   - Handle different task statuses
   - Handle different priorities
   - Truncate long titles

**Coverage Target**: 85%+ for components

#### Integration Tests

Located in `tests/integration/` directory:

1. **`auth.integration.test.tsx`** - Authentication flow
   - Complete register → login flow
   - Auth error handling
   - Redux auth state persistence
   - Email format validation
   - Password minimum length enforcement

2. **`tasks.integration.test.tsx`** - Task management flow
   - Fetch and display task list
   - Create new task
   - Filter by status, priority, due date
   - Search tasks by keyword
   - Get task details
   - Update task status
   - Delete task
   - Pagination handling
   - Error handling

**Coverage Target**: 80%+ for integration tests

### Test Utilities

Custom render function with Redux and Router providers:

```typescript
// tests/utils.tsx
export function renderWithProviders(ui: ReactElement, options?: any) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...options });
}
```

### Key Test Scenarios

#### Authentication Tests

- ✅ Login form rendering
- ✅ Email/password input handling
- ✅ Password visibility toggle
- ✅ Form submission with valid credentials
- ✅ Error message display for invalid credentials
- ✅ Loading state during authentication
- ✅ Navigation after successful login
- ✅ Register form rendering and submission
- ✅ Duplicate email detection
- ✅ Navigation between login/register

#### Task Management Tests

- ✅ Task list display
- ✅ Task creation form
- ✅ Status filtering
- ✅ Priority filtering
- ✅ Task search
- ✅ Task details view
- ✅ Task update
- ✅ Task deletion
- ✅ Pagination
- ✅ Error handling

## End-to-End Testing (Cypress)

### Setup

Cypress configuration: `cypress.config.ts`

Base URL: `http://localhost:5173`

### Running E2E Tests

```bash
# Interactive mode (with Cypress UI)
npm run test:e2e

# Headless mode (CI/CD)
npm run test:e2e:run

# Specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"
```

### Test Suites

#### 1. Authentication E2E Tests (`cypress/e2e/auth.cy.ts`)

- ✅ Display login page
- ✅ Login with valid credentials
- ✅ Show error for invalid credentials
- ✅ Toggle password visibility
- ✅ Navigate to register page
- ✅ Register new user
- ✅ Duplicate email error
- ✅ Logout functionality

#### 2. Task Management E2E Tests (`cypress/e2e/tasks.cy.ts`)

- ✅ Display tasks list
- ✅ Create new task
- ✅ View task details
- ✅ Filter by status
- ✅ Filter by priority
- ✅ Search tasks
- ✅ Delete task
- ✅ Update task status

### E2E Test Structure

```typescript
describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page', () => {
    cy.contains('Welcome Back').should('be.visible');
    // ...
  });

  it('should successfully log in', () => {
    cy.intercept('POST', '/api/auth/login', mockResponse).as('loginRequest');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Sign In').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });
});
```

### API Mocking in Cypress

Cypress uses `cy.intercept()` to mock API responses:

```typescript
cy.intercept('POST', '/api/auth/login', {
  statusCode: 200,
  body: { success: true, accessToken: 'token', user: {...} }
}).as('loginRequest');
```

## Coverage Report

### Backend Coverage

```
────────────────────────────────────────
|         Backend Coverage              |
────────────────────────────────────────
| Module              | Target |  Actual |
|────────────────────|────────|─────────|
| Services           | 90%    | Pending |
| Controllers        | 85%    | Pending |
| Middleware         | 80%    | Pending |
| Utils              | 85%    | Pending |
| Overall            | 80%    | Pending |
────────────────────────────────────────
```

### Frontend Coverage

```
────────────────────────────────────────
|         Frontend Coverage             |
────────────────────────────────────────
| Module              | Target |  Actual |
|────────────────────|────────|─────────|
| Pages/Components    | 85%    | Pending |
| Hooks              | 80%    | Pending |
| Services/API       | 85%    | Pending |
| Redux Slices       | 80%    | Pending |
| Overall            | 80%    | Pending |
────────────────────────────────────────
```

## CI/CD Integration

### GitHub Actions

Tests should run on:
- Push to main branch
- Pull requests
- Pre-deployment checks

### Pre-commit Hooks

Consider adding pre-commit hooks to run tests automatically:

```bash
# .husky/pre-commit
npm run test
npm run test:coverage
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   ```typescript
   // ✅ Good
   it('should return user when email exists', () => {
     expect(user).toBeDefined();
   });

   // ❌ Bad
   it('should call prisma.user.findUnique', () => {
     expect(prisma.user.findUnique).toHaveBeenCalled();
   });
   ```

2. **Use descriptive test names**
   ```typescript
   it('should reject registration with existing email', () => {
     // ...
   });
   ```

3. **Follow AAA pattern** (Arrange, Act, Assert)
   ```typescript
   it('should create a task', () => {
     // Arrange
     const taskData = {...};
     prismaMock.task.create.mockResolvedValue(mockTask);

     // Act
     const result = await createTask(taskData);

     // Assert
     expect(result).toEqual(mockTask);
   });
   ```

### Integration Tests

1. **Test complete workflows**
   ```typescript
   it('should complete registration and login flow', () => {
     // Register → then Login → then Dashboard
   });
   ```

2. **Mock external dependencies**
   ```typescript
   jest.mock('../../src/api/axios');
   ```

3. **Clean up after tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### E2E Tests

1. **Use semantic selectors**
   ```typescript
   // ✅ Good
   cy.get('button').contains('Sign In').click();

   // ❌ Bad
   cy.get('button[class*="..."]').click();
   ```

2. **Intercept and mock API calls**
   ```typescript
   cy.intercept('POST', '/api/auth/login', mockResponse).as('loginRequest');
   ```

3. **Wait for responses**
   ```typescript
   cy.wait('@loginRequest');
   ```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase Jest timeout: `jest.setTimeout(10000);`
   - Ensure mocks are properly configured

2. **Module not found errors**
   - Check Jest moduleNameMapper configuration
   - Ensure test setup files are loaded

3. **Cypress tests failing**
   - Verify base URL is correct
   - Check API mocking with `cy.intercept()`
   - Ensure app is running before E2E tests

4. **Coverage not meeting threshold**
   - Add tests for uncovered branches
   - Use coverage report to identify gaps
   - Run `npm run test:coverage` to see detailed report

## Continuous Improvement

1. **Monitor test flakiness**
   - Track flaky tests
   - Improve timing and waiting strategies
   - Add retry logic where appropriate

2. **Keep tests maintainable**
   - Refactor test utilities
   - DRY up test code
   - Document complex test scenarios

3. **Expand coverage**
   - Add edge case tests
   - Test error scenarios
   - Test performance-critical paths

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Supertest](https://github.com/visionmedia/supertest)
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)

## Support

For questions or issues with testing:
1. Check test documentation in respective test files
2. Review coverage report: `npm run test:coverage`
3. Debug with VS Code Test Explorer
4. Use Cypress UI for interactive debugging
