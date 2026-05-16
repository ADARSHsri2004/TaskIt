import bcrypt from 'bcryptjs';

/**
 * Test Data Factories
 * Creates realistic mock data for testing
 */

export const createMockUser = (overrides?: any) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTask = (overrides?: any) => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'Test task description',
  priority: 'HIGH',
  status: 'PENDING',
  dueDate: new Date(Date.now() + 86400000),
  createdById: 'user-1',
  assignedToId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAttachment = (overrides?: any) => ({
  id: 'attachment-1',
  filename: 'test-file.pdf',
  filepath: '/uploads/test-file.pdf',
  mimetype: 'application/pdf',
  taskId: 'task-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createHashedPassword = async (password: string = 'password123') => {
  return bcrypt.hash(password, 10);
};

export const createMockApiResponse = <T>(data: T, statusCode = 200) => ({
  status: statusCode,
  statusText: statusCode === 200 ? 'OK' : 'Error',
  headers: {},
  config: {},
  data,
});

export const createMockApiError = (message = 'API Error', statusCode = 400) => ({
  response: {
    status: statusCode,
    statusText: statusCode === 400 ? 'Bad Request' : 'Error',
    data: {
      success: false,
      message,
    },
  },
});

/**
 * Auth Test Helpers
 */
export const authTestData = {
  validRegistration: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
  },
  validLogin: {
    email: 'test@example.com',
    password: 'password123',
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'password123',
  },
  invalidPassword: {
    email: 'test@example.com',
    password: 'short',
  },
};

/**
 * Task Test Helpers
 */
export const taskTestData = {
  validTask: {
    title: 'Implement feature X',
    description: 'Complete the feature implementation',
    priority: 'HIGH',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  },
  taskWithoutDescription: {
    title: 'Quick task',
    priority: 'LOW',
    status: 'TODO',
  },
  taskWithInvalidData: {
    description: 'Missing title',
    priority: 'INVALID',
    status: 'TODO',
  },
  searchTerms: ['important', 'urgent', 'feature'],
  statuses: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
  priorities: ['LOW', 'MEDIUM', 'HIGH'],
};

/**
 * Pagination Helpers
 */
export const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  limit = 10,
  total = items.length
) => ({
  success: true,
  items,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

/**
 * JWT Helpers
 */
export const mockJwtPayload = {
  id: 'user-1',
  role: 'USER',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900,
};

export const mockRefreshTokenPayload = {
  id: 'user-1',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 604800,
};
