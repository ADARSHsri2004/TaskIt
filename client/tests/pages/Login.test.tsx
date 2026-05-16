import { render, screen, fireEvent, waitFor } from '../utils';
import userEvent from '@testing-library/user-event';
import Login from '../../src/pages/Login';
import api from '../../src/api/axios';
import * as authSlice from '../../src/features/auth/authSlice';

// Mock the axios API
jest.mock('../../src/api/axios');
jest.mock('../../src/features/auth/authSlice');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Login Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
  });

  it('should render login form', () => {
    render(<Login />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account to continue')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should accept email and password input', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput.type).toBe('password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click to hide password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        accessToken: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      },
    };

    (api.post as jest.Mock).mockResolvedValue(mockResponse);
    (authSlice.setToken as jest.Mock).mockReturnValue({ type: 'auth/setToken' });
    (authSlice.setUser as jest.Mock).mockReturnValue({ type: 'auth/setUser' });

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error message on failed login', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    };

    (api.post as jest.Mock).mockRejectedValue(mockError);

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        accessToken: 'test-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      },
    };

    (api.post as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
    );

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });

  it('should have link to register page', () => {
    render(<Login />);

    const registerLink = screen.getByRole('link', { name: /create new account/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should require email and password fields', async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Try to submit without filling form
    await user.click(submitButton);

    // Form validation should prevent submission (HTML5 validation)
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });
});
