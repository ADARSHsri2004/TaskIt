import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white p-4 flex justify-between">
      <Link to="/" className="font-bold">
        TaskIt
      </Link>

      <div className="flex gap-4">
        <Link to="/">Dashboard</Link>

        <Link to="/tasks/create">
          Create Task
        </Link>

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}