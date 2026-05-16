import { prismaMock } from '../mocks/prisma';
import * as taskService from '../../src/services/task.service';

describe('Task Service', () => {
  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Task description',
        priority: 'HIGH',
        status: 'PENDING',
        createdById: 'user-1',
        assignedToId: 'user-2',
      };

      const mockTask = {
        id: 'task-1',
        ...taskData,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.task.create.mockResolvedValue(mockTask);

      const result = await taskService.createTask(taskData);

      expect(result).toEqual(mockTask);
      expect(prismaMock.task.create).toHaveBeenCalledWith({
        data: taskData,
      });
    });

    it('should handle task creation errors', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Task description',
        priority: 'HIGH',
        status: 'PENDING',
        createdById: 'user-1',
      };

      prismaMock.task.create.mockRejectedValue(
        new Error('Failed to create task')
      );

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        'Failed to create task'
      );
    });
  });

  describe('getTaskById', () => {
    it('should get a task by id with relations', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Task description',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: null,
        createdById: 'user-1',
        assignedToId: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: {
          id: 'user-2',
          name: 'Assigned User',
          email: 'assigned@example.com',
          role: 'USER',
        },
        createdBy: {
          id: 'user-1',
          name: 'Creator',
          email: 'creator@example.com',
          role: 'USER',
        },
        attachments: [],
      };

      prismaMock.task.findUnique.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('task-1');

      expect(result).toEqual(mockTask);
      expect(prismaMock.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        include: {
          assignedTo: true,
          createdBy: true,
        },
      });
    });

    it('should return null when task does not exist', async () => {
      prismaMock.task.findUnique.mockResolvedValue(null);

      const result = await taskService.getTaskById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      const mockDeletedTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Task description',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: null,
        createdById: 'user-1',
        assignedToId: 'user-2',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.task.delete.mockResolvedValue(mockDeletedTask);

      const result = await taskService.deleteTask('task-1');

      expect(result).toEqual(mockDeletedTask);
      expect(prismaMock.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('should handle task deletion errors', async () => {
      prismaMock.task.delete.mockRejectedValue(
        new Error('Task not found')
      );

      await expect(taskService.deleteTask('nonexistent-id')).rejects.toThrow(
        'Task not found'
      );
    });
  });
});
