import { useState } from "react";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      dispatch(setToken(res.data.accessToken));
      dispatch(setUser(res.data.user));

      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Could not log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 text-lg">Sign in to your account to continue</p>
        </div>

        {/* Login Form Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 animate-fade-up delay-150"
        >
          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-white hover:border-gray-400"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-white hover:border-gray-400"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 animate-fade-up">
              <div className="shrink-0 w-5 h-5 bg-red-500 rounded-full mt-0.5" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group transform hover:scale-105 hover:shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="w-full border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:border-black hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            Create new account
          </Link>
        </form>

        {/* Footer Text */}
        <p className="text-center text-gray-600 text-sm mt-6 animate-fade-up delay-300">
          By signing in, you agree to our <span className="font-semibold text-gray-900">Terms of Service</span> and <span className="font-semibold text-gray-900">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
