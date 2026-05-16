import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../features/auth/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const logout = async () => {
    await api.post("/auth/logout");
    dispatch(logoutAction());
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

        {isAdmin && (
          <>
            <Link to="/admin/users">
              Users Management
            </Link>

            <Link to="/admin/tasks">
              Tasks Management
            </Link>
          </>
        )}

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
