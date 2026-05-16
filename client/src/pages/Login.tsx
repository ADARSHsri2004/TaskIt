import { useState } from "react";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../utils/validation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setMessage("");
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(setToken(res.data.accessToken));
      dispatch(setUser(res.data.user));

      navigate("/");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Login</h2>

        <div className="mb-3">
          <input
            placeholder="Email"
            value={email}
            className={`border w-full p-2 rounded transition ${
              errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            onBlur={() => {
              const emailError = validateEmail(email);
              if (emailError) {
                setErrors((prev) => ({ ...prev, email: emailError }));
              }
            }}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            className={`border w-full p-2 rounded transition ${
              errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            onBlur={() => {
              const passwordError = validatePassword(password);
              if (passwordError) {
                setErrors((prev) => ({ ...prev, password: passwordError }));
              }
            }}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {message && (
          <p className="text-sm text-red-600 mb-3 p-2 bg-red-50 rounded">
            {message}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading || Object.keys(errors).length > 0}
          className={`w-full p-2 rounded font-medium transition ${
            isLoading || Object.keys(errors).length > 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}