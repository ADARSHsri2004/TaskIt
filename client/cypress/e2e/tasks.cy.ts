describe('Task Management E2E Tests', () => {
  beforeEach(() => {
    // Mock login and navigate to dashboard
    cy.visit('/login');
    
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

  it('should display tasks list', () => {
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        tasks: [
          {
            id: 'task-1',
            title: 'Sample Task 1',
            description: 'Description 1',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdById: 'user-1',
            assignedToId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [],
            assignedTo: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
            createdBy: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('getTasks');

    cy.wait('@getTasks');
    cy.contains('Sample Task 1').should('be.visible');
  });

  it('should create a new task', () => {
    cy.visit('/tasks/create');

    cy.intercept('POST', '/api/tasks', {
      statusCode: 201,
      body: {
        success: true,
        task: {
          id: 'task-new',
          title: 'New Task',
          description: 'New task description',
          priority: 'HIGH',
          status: 'TODO',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
          assignedTo: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      },
    }).as('createTask');

    cy.get('input[placeholder*="title" i]').type('New Task');
    cy.get('textarea[placeholder*="description" i]').type('New task description');
    cy.get('select[name="priority"]').select('HIGH');
    cy.get('button').contains('Create Task').click();

    cy.wait('@createTask');
    cy.url().should('include', '/dashboard');
  });

  it('should view task details', () => {
    cy.visit('/tasks/task-1');

    cy.intercept('GET', '/api/tasks/task-1', {
      statusCode: 200,
      body: {
        success: true,
        task: {
          id: 'task-1',
          title: 'Task Details',
          description: 'Detailed description',
          priority: 'HIGH',
          status: 'PENDING',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
          assignedTo: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      },
    }).as('getTaskDetails');

    cy.wait('@getTaskDetails');
    cy.contains('Task Details').should('be.visible');
    cy.contains('Detailed description').should('be.visible');
  });

  it('should filter tasks by status', () => {
    cy.intercept('GET', '/api/tasks?status=TODO*', {
      statusCode: 200,
      body: {
        success: true,
        tasks: [
          {
            id: 'task-1',
            title: 'Pending Task',
            description: 'Pending description',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdById: 'user-1',
            assignedToId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [],
            assignedTo: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
            createdBy: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('filterByStatus');

    cy.get('select[name="status"]').select('TODO');
    cy.wait('@filterByStatus');
    cy.contains('Pending Task').should('be.visible');
  });

  it('should filter tasks by priority', () => {
    cy.intercept('GET', '/api/tasks?priority=HIGH*', {
      statusCode: 200,
      body: {
        success: true,
        tasks: [
          {
            id: 'task-1',
            title: 'High Priority Task',
            description: 'High priority description',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdById: 'user-1',
            assignedToId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [],
            assignedTo: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
            createdBy: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('filterByPriority');

    cy.get('select[name="priority"]').select('HIGH');
    cy.wait('@filterByPriority');
    cy.contains('High Priority Task').should('be.visible');
  });

  it('should search tasks', () => {
    cy.intercept('GET', '/api/tasks?search=important*', {
      statusCode: 200,
      body: {
        success: true,
        tasks: [
          {
            id: 'task-1',
            title: 'Important Task',
            description: 'Very important work',
            priority: 'HIGH',
            status: 'TODO',
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            createdById: 'user-1',
            assignedToId: 'user-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            attachments: [],
            assignedTo: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
            createdBy: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'USER',
            },
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    }).as('searchTasks');

    cy.get('input[placeholder*="search" i]').type('important');
    cy.wait('@searchTasks');
    cy.contains('Important Task').should('be.visible');
  });

  it('should delete a task', () => {
    cy.visit('/tasks/task-1');

    cy.intercept('GET', '/api/tasks/task-1', {
      statusCode: 200,
      body: {
        success: true,
        task: {
          id: 'task-1',
          title: 'Task to Delete',
          description: 'This will be deleted',
          priority: 'LOW',
          status: 'TODO',
          dueDate: null,
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
          assignedTo: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      },
    }).as('getTask');

    cy.intercept('DELETE', '/api/tasks/task-1', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Task deleted successfully',
      },
    }).as('deleteTask');

    cy.wait('@getTask');
    cy.get('button').contains('Delete').click();
    cy.wait('@deleteTask');
    cy.url().should('include', '/dashboard');
  });

  it('should update task status', () => {
    cy.visit('/tasks/task-1');

    cy.intercept('GET', '/api/tasks/task-1', {
      statusCode: 200,
      body: {
        success: true,
        task: {
          id: 'task-1',
          title: 'Task to Update',
          description: 'Status will be updated',
          priority: 'MEDIUM',
          status: 'TODO',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
          assignedTo: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
          createdBy: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          },
        },
      },
    }).as('getTask');

    cy.intercept('PUT', '/api/tasks/task-1', {
      statusCode: 200,
      body: {
        success: true,
        task: {
          id: 'task-1',
          title: 'Task to Update',
          description: 'Status will be updated',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attachments: [],
        },
      },
    }).as('updateTask');

    cy.wait('@getTask');
    cy.get('select[name="status"]').select('COMPLETED');
    cy.wait('@updateTask');
    cy.contains('Task updated successfully').should('be.visible');
  });
});
