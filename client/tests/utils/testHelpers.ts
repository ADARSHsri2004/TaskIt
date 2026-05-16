import type { Task } from '../../src/types';

/**
 * Frontend Test Data Factories
 */

export const createMockUser = (overrides?: any) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  ...overrides,
});

export const createMockTask = (overrides?: any): Task => ({
  id: 'task-1',
  title: 'Test Task',
  description: 'Test task description',
  priority: 'HIGH',
  status: 'TODO',
  dueDate: new Date(Date.now() + 86400000),
  createdById: 'user-1',
  assignedToId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  attachments: [],
  assignedTo: createMockUser({ id: 'user-1' }),
  createdBy: createMockUser({ id: 'user-1' }),
  ...overrides,
});

export const createMockAttachment = (overrides?: any) => ({
  id: 'attachment-1',
  filename: 'test-file.pdf',
  filepath: '/uploads/test-file.pdf',
  mimetype: 'application/pdf',
  taskId: 'task-1',
  ...overrides,
});

/**
 * Auth Test Data
 */
export const authTestData = {
  register: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePassword123!',
  },
  login: {
    email: 'test@example.com',
    password: 'password123',
  },
  loginResponse: {
    success: true,
    accessToken: 'test-token-123',
    user: createMockUser(),
  },
  registerResponse: {
    success: true,
    user: {
      id: 'user-2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    },
  },
  errors: {
    invalidCredentials: 'Invalid credentials',
    userExists: 'User already exists',
    userNotFound: 'User not found',
  },
};

/**
 * Task Test Data
 */
export const taskTestData = {
  tasks: [
    createMockTask({
      id: 'task-1',
      title: 'First Task',
      status: 'TODO',
      priority: 'HIGH',
    }),
    createMockTask({
      id: 'task-2',
      title: 'Second Task',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
    }),
    createMockTask({
      id: 'task-3',
      title: 'Third Task',
      status: 'COMPLETED',
      priority: 'LOW',
    }),
  ],
  newTask: {
    title: 'New Task',
    description: 'New task description',
    priority: 'HIGH',
    status: 'TODO',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  },
  taskListResponse: {
    success: true,
    tasks: [] as Task[],
    total: 0,
    page: 1,
    totalPages: 1,
  },
  statuses: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
  priorities: ['LOW', 'MEDIUM', 'HIGH'],
  errors: {
    notFound: 'Task not found',
    unauthorized: 'Unauthorized',
    invalidData: 'Invalid task data',
  },
};

/**
 * API Response Helpers
 */
export const createMockApiResponse = <T>(data: T, status = 200) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {},
  data,
});

export const createMockApiError = (message: string, status = 400) => ({
  response: {
    status,
    statusText: status === 400 ? 'Bad Request' : 'Error',
    data: {
      success: false,
      message,
    },
  },
  message: `Request failed with status code ${status}`,
});

/**
 * Redux State Helpers
 */
export const createMockAuthState = (overrides?: any) => ({
  token: 'test-token-123',
  user: createMockUser(),
  loading: false,
  error: null,
  ...overrides,
});

/**
 * Pagination Helpers
 */
export const createMockPaginatedResponse = <T>(
  items: T[],
  page = 1,
  limit = 10
) => ({
  success: true,
  tasks: items,
  total: items.length,
  page,
  totalPages: Math.ceil(items.length / limit),
});

/**
 * Common test selectors
 */
export const selectors = {
  auth: {
    emailInput: 'input[type="email"]',
    passwordInput: 'input[type="password"]',
    nameInput: 'input[placeholder*="name" i]',
    submitButton: 'button[type="submit"]',
    loginLink: 'a[href="/login"]',
    registerLink: 'a[href="/register"]',
  },
  tasks: {
    titleInput: 'input[placeholder*="title" i]',
    descriptionInput: 'textarea[placeholder*="description" i]',
    statusSelect: 'select[name="status"]',
    prioritySelect: 'select[name="priority"]',
    searchInput: 'input[placeholder*="search" i]',
    createButton: 'button:contains("Create")',
    deleteButton: 'button:contains("Delete")',
  },
};

/**
 * Wait helpers for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForLoadingToFinish = async (getByText: any) => {
  try {
    await getByText(/loading/i);
    // If loading appears, wait for it to disappear
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch {
    // Loading might not appear, that's ok
  }
};
