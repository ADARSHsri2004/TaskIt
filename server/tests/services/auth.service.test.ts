import { prismaMock } from '../mocks/prisma';
import * as authService from '../../src/services/auth.service';

describe('Auth Service', () => {
  describe('findUserByEmail', () => {
    it('should find a user by email', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await authService.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await authService.findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'USER',
      };

      const mockUser = {
        id: '1',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await authService.createUser(userData);

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: userData,
      });
    });

    it('should handle database errors', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'USER',
      };

      prismaMock.user.create.mockRejectedValue(
        new Error('Database error')
      );

      await expect(authService.createUser(userData)).rejects.toThrow(
        'Database error'
      );
    });
  });
});
