import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword, validateName } from "../utils/validation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password, 8);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setMessage("Registered successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Register</h2>

        <div className="mb-3">
          <input
            placeholder="Full Name"
            value={name}
            className={`border w-full p-2 rounded transition ${
              errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            onBlur={() => {
              const nameError = validateName(name);
              if (nameError) {
                setErrors((prev) => ({ ...prev, name: nameError }));
              }
            }}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

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
            placeholder="Password (min 8 characters)"
            value={password}
            className={`border w-full p-2 rounded transition ${
              errors.password ? "border-red-500 bg-red-50" : "border-gray-300"
            }`}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            onBlur={() => {
              const passwordError = validatePassword(password, 8);
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
          <p
            className={`text-sm mb-3 p-2 rounded ${
              message.includes("successfully")
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={isLoading || Object.keys(errors).length > 0}
          className={`w-full p-2 rounded font-medium transition ${
            isLoading || Object.keys(errors).length > 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
