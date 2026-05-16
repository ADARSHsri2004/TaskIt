import { useState } from "react";
import api from "../api/axios";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await api.post("/auth/register", {
      name,
      email,
      password,
    });

    alert("Registered successfully");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 border rounded w-80">
        <h2 className="text-xl mb-4">Register</h2>

        <input
          placeholder="Name"
          className="border w-full p-2 mb-2"
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleRegister}
          className="bg-green-500 text-white w-full p-2"
        >
          Register
        </button>
      </div>
    </div>
  );
}
