import { render, screen } from '../utils';
import TaskCard from '../../src/components/tasks/TaskCard';
import type { Task } from '../../src/types';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children }: any) => <a href={to}>{children}</a>,
}));

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'HIGH',
    status: 'TODO',
    dueDate: new Date('2026-05-30'),
    createdById: 'user-1',
    assignedToId: 'user-2',
    createdAt: new Date(),
    updatedAt: new Date(),
    attachments: [],
    assignedTo: {
      id: 'user-2',
      name: 'Assigned User',
      email: 'assigned@example.com',
      role: 'USER',
    },
    createdBy: {
      id: 'user-1',
      name: 'Creator User',
      email: 'creator@example.com',
      role: 'USER',
    },
  };

  it('should render task card with title and description', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task')).toBeInTheDocument();
  });

  it('should display "No description provided" when description is missing', () => {
    const taskWithoutDescription = {
      ...mockTask,
      description: null,
    };

    render(<TaskCard task={taskWithoutDescription} />);

    expect(screen.getByText('No description provided.')).toBeInTheDocument();
  });

  it('should have a link to task details', () => {
    render(<TaskCard task={mockTask} />);

    const detailsLink = screen.getByRole('link', { name: /view details/i });
    expect(detailsLink).toHaveAttribute('href', '/tasks/task-1');
  });

  it('should render task metadata', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Task')).toBeInTheDocument();
  });

  it('should handle tasks with different statuses', () => {
    const completedTask = {
      ...mockTask,
      status: 'COMPLETED',
    };

    render(<TaskCard task={completedTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should handle tasks with different priorities', () => {
    const lowPriorityTask = {
      ...mockTask,
      priority: 'LOW',
    };

    render(<TaskCard task={lowPriorityTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should truncate long titles', () => {
    const longTitleTask = {
      ...mockTask,
      title: 'This is a very long task title that should be truncated because it exceeds the maximum width of the card',
    };

    const { container } = render(<TaskCard task={longTitleTask} />);
    const titleElement = container.querySelector('h2');

    expect(titleElement).toHaveClass('truncate');
  });
});
