import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  Search,
  Shield,
  UsersRound
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/tasks/TaskCard";
import type { Task } from "../types";
import { setTasks } from "../features/tasks/tasksSlice";

type Stats = {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const reduxTasks = useSelector((state: any) => state.tasks.items);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [search, setSearch] = useState("");
  const [dueDateFrom, setDueDateFrom] = useState("");
  const [dueDateTo, setDueDateTo] = useState("");
  const [sort, setSort] = useState("newest");

  const isAdmin = user?.role === "ADMIN";

  // Filter tasks based on criteria
  const filteredTasks = reduxTasks.filter((task: Task) => {
    if (status && task.status !== status) return false;
    if (priority && task.priority !== priority) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false;
    
    if (dueDateFrom && task.dueDate && new Date(task.dueDate) < new Date(dueDateFrom)) return false;
    if (dueDateTo && task.dueDate && new Date(task.dueDate) > new Date(dueDateTo)) return false;
    
    return true;
  }).sort((a: Task, b: Task) => {
    if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === "dueDateAsc") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sort === "dueDateDesc") {
      if (!a.dueDate) return -1;
      if (!b.dueDate) return 1;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    }
    return 0;
  });

  const fetchTasks = async () => {
    const res = await api.get("/tasks", {
      params: {
        limit: isAdmin ? 5 : 20
      }
    });

    dispatch(setTasks(res.data.data));
  };

  useEffect(() => {
    fetchTasks();
  }, [isAdmin]);

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

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                    <ClipboardList className="h-4 w-4" />
                    Task Overview
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    {isAdmin
                      ? "Monitor users, tasks, and priority work."
                      : "Your assigned tasks are shown here."}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      to="/admin/users"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                    >
                      <UsersRound className="h-4 w-4" />
                      Manage Users
                    </Link>
                    <Link
                      to="/admin/tasks"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0"
                    >
                      <Shield className="h-4 w-4" />
                      Manage Tasks
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {isAdmin && stats && (
            <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Total users" value={stats.totalUsers} icon="users" />
              <StatCard label="Total tasks" value={stats.totalTasks} icon="tasks" />
              <StatCard label="Completed" value={stats.completedTasks} icon="done" />
              <StatCard label="Pending" value={stats.pendingTasks} icon="pending" />
              <StatCard label="High priority" value={stats.highPriorityTasks} icon="priority" />
            </section>
          )}

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter className="h-4 w-4" />
              Filters
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <label className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tasks"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                />
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="">All Status</option>
                <option value="TODO">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <label className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dueDateFrom}
                  onChange={(event) => setDueDateFrom(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                  aria-label="Due date from"
                />
              </label>

              <label className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={dueDateTo}
                  onChange={(event) => setDueDateTo(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                  aria-label="Due date to"
                />
              </label>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="dueDateAsc">Due date earliest</option>
                <option value="dueDateDesc">Due date latest</option>
              </select>
            </div>
          </section>

          <section className="grid gap-3">
            {filteredTasks.map((task: Task) => (
              <TaskCard key={task.id} task={task} />
            ))}

            {!filteredTasks.length && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
                <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="font-medium text-gray-800">No tasks found.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: number;
  icon: "users" | "tasks" | "done" | "pending" | "priority";
}) {
  const Icon =
    icon === "users"
      ? UsersRound
      : icon === "done"
        ? CheckCircle2
        : icon === "pending"
          ? ClipboardList
          : icon === "priority"
            ? BarChart3
            : ClipboardList;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-950">{value}</p>
    </div>
  );
}
