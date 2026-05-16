import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/tasks/TaskCard";
import type { Task } from "../types";

type Stats = {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
};

export default function Dashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchTasks = async () => {
    const res = await api.get("/tasks", {
      params: {
        status,
        priority,
        search,
        limit: isAdmin ? 5 : 20
      }
    });

    setTasks(res.data.data);
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority, search, isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    api.get("/admin/stats").then((res) => {
      setStats(res.data.stats);
    });
  }, [isAdmin]);

  return (
    <>
      <Navbar />

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">
              {isAdmin ? "Admin Dashboard" : "Dashboard"}
            </h1>
            <p className="text-gray-600">
              {isAdmin
                ? "Monitor users, tasks, and priority work."
                : "Your assigned tasks are shown here."}
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Link
                to="/admin/users"
                className="border rounded px-4 py-2"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/tasks"
                className="bg-black text-white rounded px-4 py-2"
              >
                Manage Tasks
              </Link>
            </div>
          )}
        </div>

        {isAdmin && stats && (
          <section className="grid gap-3 mb-6 md:grid-cols-5">
            <StatCard label="Total users" value={stats.totalUsers} />
            <StatCard label="Total tasks" value={stats.totalTasks} />
            <StatCard label="Completed" value={stats.completedTasks} />
            <StatCard label="Pending" value={stats.pendingTasks} />
            <StatCard label="High priority" value={stats.highPriorityTasks} />
          </section>
        )}

        <div className="grid gap-3 mb-4 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
            className="border rounded px-3 py-2"
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="TODO">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <section className="grid gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {!tasks.length && (
            <p className="border rounded p-6 text-gray-600">
              No tasks found.
            </p>
          )}
        </section>
      </main>
    </>
  );
}

function StatCard({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border rounded p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
