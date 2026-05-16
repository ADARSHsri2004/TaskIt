import { useState } from "react";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setToken, setUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    dispatch(setToken(res.data.accessToken));
    dispatch(setUser(res.data.user));

    navigate("/");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h2 className="text-xl mb-4">Login</h2>

        <input
          placeholder="Email"
          className="border w-full p-2 mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border w-full p-2 mb-2"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white w-full p-2"
        >
          Login
        </button>
      </div>
    </div>
  );
}