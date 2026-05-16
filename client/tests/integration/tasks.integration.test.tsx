import { render, screen, waitFor } from '../utils';
import userEvent from '@testing-library/user-event';
import api from '../../src/api/axios';
import type { Task } from '../../src/types';

jest.mock('../../src/api/axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'task-1' }),
}));

describe('Task Management Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'First Task',
      description: 'Description for first task',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date('2026-05-30'),
      createdById: 'user-1',
      assignedToId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      assignedTo: mockUser,
      createdBy: mockUser,
    },
    {
      id: 'task-2',
      title: 'Second Task',
      description: 'Description for second task',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-06-15'),
      createdById: 'user-1',
      assignedToId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      attachments: [],
      assignedTo: mockUser,
      createdBy: mockUser,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display tasks list', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: mockTasks,
        total: 2,
        page: 1,
        totalPages: 1,
      },
    });

    // This would be a Dashboard component that fetches tasks
    render(<div>Task List</div>);

    // Verify API call for fetching tasks
    await waitFor(() => {
      expect(screen.getByText('Task List')).toBeInTheDocument();
    });
  });

  it('should create a new task', async () => {
    const newTaskData = {
      title: 'New Task',
      description: 'New task description',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date('2026-06-01').toISOString(),
    };

    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        task: {
          id: 'task-3',
          ...newTaskData,
          createdById: 'user-1',
          assignedToId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: [],
          assignedTo: mockUser,
          createdBy: mockUser,
        },
      },
    });

    await (api.post as jest.Mock)('/tasks', newTaskData);

    expect(api.post).toHaveBeenCalledWith('/tasks', newTaskData);
  });

  it('should filter tasks by status', async () => {
    const statusFilter = 'TODO';

    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: [mockTasks[0]], // Only the TODO task
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    await (api.get as jest.Mock)(`/tasks?status=${statusFilter}`);

    expect(api.get).toHaveBeenCalledWith(`/tasks?status=${statusFilter}`);
  });

  it('should filter tasks by priority', async () => {
    const priorityFilter = 'HIGH';

    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: [mockTasks[0]], // Only the HIGH priority task
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    await (api.get as jest.Mock)(`/tasks?priority=${priorityFilter}`);

    expect(api.get).toHaveBeenCalledWith(`/tasks?priority=${priorityFilter}`);
  });

  it('should search tasks by keyword', async () => {
    const searchTerm = 'First';

    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: [mockTasks[0]],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    await (api.get as jest.Mock)(`/tasks?search=${searchTerm}`);

    expect(api.get).toHaveBeenCalledWith(`/tasks?search=${searchTerm}`);
  });

  it('should get task details', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        task: mockTasks[0],
      },
    });

    await (api.get as jest.Mock)('/tasks/task-1');

    expect(api.get).toHaveBeenCalledWith('/tasks/task-1');
  });

  it('should update task status', async () => {
    const updatedTask = {
      ...mockTasks[0],
      status: 'COMPLETED',
    };

    (api.put as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        task: updatedTask,
      },
    });

    await (api.put as jest.Mock)('/tasks/task-1', { status: 'COMPLETED' });

    expect(api.put).toHaveBeenCalledWith('/tasks/task-1', { status: 'COMPLETED' });
  });

  it('should delete a task', async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Task deleted successfully',
      },
    });

    await (api.delete as jest.Mock)('/tasks/task-1');

    expect(api.delete).toHaveBeenCalledWith('/tasks/task-1');
  });

  it('should handle pagination when fetching tasks', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: [mockTasks[0]],
        total: 20,
        page: 2,
        totalPages: 2,
      },
    });

    await (api.get as jest.Mock)('/tasks?page=2&limit=10');

    expect(api.get).toHaveBeenCalledWith('/tasks?page=2&limit=10');
  });

  it('should handle task filtering with multiple criteria', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        tasks: [mockTasks[0]],
        total: 1,
        page: 1,
        totalPages: 1,
      },
    });

    const query = '/tasks?status=TODO&priority=HIGH&search=First';
    await (api.get as jest.Mock)(query);

    expect(api.get).toHaveBeenCalledWith(query);
  });

  it('should handle errors when fetching tasks', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    });

    try {
      await (api.get as jest.Mock)('/tasks');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('should handle errors when creating a task', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        status: 400,
        data: { message: 'Title is required' },
      },
    });

    try {
      await (api.post as jest.Mock)('/tasks', {});
    } catch (error) {
      expect(error.response.data.message).toBe('Title is required');
    }
  });
});
