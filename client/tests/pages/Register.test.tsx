import { render, screen, waitFor } from '../utils';
import userEvent from '@testing-library/user-event';
import Register from '../../src/pages/Register';
import api from '../../src/api/axios';

jest.mock('../../src/api/axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    render(<Register />);

    expect(screen.getByText('Get Started')).toBeInTheDocument();
    expect(screen.getByText('Create your account to begin managing tasks')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should accept name, email, and password input', async () => {
    const user = userEvent.setup();
    render(<Register />);

    const nameInput = screen.getByPlaceholderText('Enter your full name') as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });

    render(<Register />);

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  it('should display error on duplicate email', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          message: 'User already exists',
        },
      },
    };

    (api.post as jest.Mock).mockRejectedValue(mockError);

    render(<Register />);

    const nameInput = screen.getByPlaceholderText('Enter your full name');
    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('should have link to login page', () => {
    render(<Register />);

    const loginLink = screen.getByRole('link', { name: /already have an account/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
