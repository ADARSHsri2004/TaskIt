import { render, screen, waitFor } from '../utils';
import userEvent from '@testing-library/user-event';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../src/pages/Login';
import Register from '../../src/pages/Register';
import api from '../../src/api/axios';
import authReducer, { setToken, setUser } from '../../src/features/auth/authSlice';

jest.mock('../../src/api/axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete full registration and login flow', async () => {
    const user = userEvent.setup();

    // Step 1: Register new user
    const registerData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
    };

    (api.post as jest.Mock).mockResolvedValueOnce({
      data: { success: true, user: registerData },
    });

    const { unmount } = render(<Register />);

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, registerData.name);
    await user.type(emailInput, registerData.email);
    await user.type(passwordInput, registerData.password);
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    unmount();

    // Step 2: Login with registered credentials
    (api.post as jest.Mock).mockClear();
    (api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        success: true,
        accessToken: 'test-token-123',
        user: {
          id: 'user-1',
          email: registerData.email,
          name: registerData.name,
          role: 'USER',
        },
      },
    });

    render(<Login />);

    const loginEmailInput = screen.getByPlaceholderText('Enter your email');
    const loginPasswordInput = screen.getByPlaceholderText('Enter your password');
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(loginEmailInput, registerData.email);
    await user.type(loginPasswordInput, registerData.password);
    await user.click(loginButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: registerData.email,
        password: registerData.password,
      });
    });
  });

  it('should handle auth errors gracefully', async () => {
    const user = userEvent.setup();

    // Try to register with duplicate email
    (api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { message: 'User already exists' },
      },
    });

    render(<Register />);

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'Jane Doe');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should persist auth state in redux', () => {
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    };

    const token = 'test-token-123';

    store.dispatch(setToken(token));
    store.dispatch(setUser(mockUser));

    const state = store.getState();
    expect(state.auth.token).toBe(token);
    expect(state.auth.user).toEqual(mockUser);
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<Register />);

    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    // Try with invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(emailInput.validity.valid).toBe(false);
  });

  it('should enforce password minimum length', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

    await user.type(passwordInput, '12345');

    // Password should have minLength requirement
    expect(passwordInput.minLength).toBeGreaterThan(0);
  });
});
