describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login page', () => {
    cy.contains('Welcome Back').should('be.visible');
    cy.contains('Sign in to your account to continue').should('be.visible');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains('Sign In').should('exist');
  });

  it('should successfully log in with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'test-token-123',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Sign In').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });

  it('should show error message on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        success: false,
        message: 'Invalid credentials',
      },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button').contains('Sign In').click();

    cy.wait('@loginRequest');
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should toggle password visibility', () => {
    const passwordInput = cy.get('input[type="password"]');

    // Show password
    cy.get('button[type="button"]').first().click();
    cy.get('input[type="text"][value=""]').should('exist');

    // Hide password
    cy.get('button[type="button"]').first().click();
    cy.get('input[type="password"]').should('exist');
  });

  it('should navigate to register page', () => {
    cy.contains('Create new account').click();
    cy.url().should('include', '/register');
    cy.contains('Get Started').should('be.visible');
  });

  it('should successfully register new user', () => {
    cy.visit('/register');

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 201,
      body: {
        success: true,
        user: {
          id: 'user-2',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
        },
      },
    }).as('registerRequest');

    cy.get('input[placeholder="Enter your full name"]').type('John Doe');
    cy.get('input[type="email"]').type('john@example.com');
    cy.get('input[type="password"]').first().type('SecurePassword123!');
    cy.get('button').contains('Sign Up').click();

    cy.wait('@registerRequest');
    cy.url().should('include', '/login');
  });

  it('should show duplicate email error', () => {
    cy.visit('/register');

    cy.intercept('POST', '/api/auth/register', {
      statusCode: 400,
      body: {
        success: false,
        message: 'User already exists',
      },
    }).as('registerRequest');

    cy.get('input[placeholder="Enter your full name"]').type('Jane Doe');
    cy.get('input[type="email"]').type('existing@example.com');
    cy.get('input[type="password"]').first().type('password123');
    cy.get('button').contains('Sign Up').click();

    cy.wait('@registerRequest');
    cy.contains('User already exists').should('be.visible');
  });

  it('should successfully logout', () => {
    // First login
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'test-token-123',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button').contains('Sign In').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');

    // Then logout
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: { success: true },
    }).as('logoutRequest');

    cy.get('button').contains('Logout').click();
    cy.wait('@logoutRequest');
    cy.url().should('include', '/login');
  });
});
