import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { logout as logoutAction, setUser } from "../features/auth/authSlice";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  const [status, setStatus] = useState<"loading" | "ready" | "unauthorized">(
    token ? "loading" : "unauthorized"
  );

  useEffect(() => {
    if (!token) {
      setStatus("unauthorized");
      return;
    }

    let mounted = true;

    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) {
          return;
        }

        dispatch(setUser(res.data.user));
        setStatus("ready");
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        dispatch(logoutAction());
        setStatus("unauthorized");
      });

    return () => {
      mounted = false;
    };
  }, [dispatch, token]);

  if (status === "loading") {
    return <p className="p-6">Checking session...</p>;
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" />;
  }

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
}
