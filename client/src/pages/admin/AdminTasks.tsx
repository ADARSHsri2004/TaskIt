import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Flag,
  Paperclip,
  Plus,
  Search,
  Trash2,
  UserRound
} from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type { Priority, Task, TaskStatus } from "../../types";

const statusLabel: Record<TaskStatus, string> = {
  TODO: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
};

const statusClass: Record<TaskStatus, string> = {
  TODO: "bg-gray-100 text-gray-700 ring-gray-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100"
};

const priorityClass: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-700 ring-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-100",
  HIGH: "bg-red-50 text-red-700 ring-red-100"
};

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchTasks = async () => {
    const res = await api.get("/tasks", {
      params: {
        status,
        priority,
        search,
        sort,
        page,
        limit
      }
    });

    setTasks(res.data.data);
    setTotal(res.data.total);
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority, sort, search, page]);

  const deleteTask = async (task: Task) => {
    const confirmed = window.confirm(
      `Delete task "${task.title}" and its attached files?`
    );

    if (!confirmed) {
      return;
    }

    await api.delete(`/tasks/${task.id}`);
    fetchTasks();
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FileText className="h-4 w-4" />
                    Admin
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    Tasks Management
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    All tasks across the system.
                  </p>
                </div>

                <Link
                  to="/tasks/create"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0"
                >
                  <Plus className="h-4 w-4" />
                  Create Task
                </Link>
              </div>
            </div>
          </div>

          <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Filter className="h-4 w-4" />
              Filters
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <label className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  placeholder="Search tasks"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                />
              </label>

              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value as TaskStatus | "");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="">All Status</option>
                <option value="TODO">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={priority}
                onChange={(event) => {
                  setPage(1);
                  setPriority(event.target.value as Priority | "");
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Attachments</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="transition-colors duration-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="max-w-xs truncate font-semibold text-gray-950">
                            {task.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-gray-400" />
                          {task.assignedTo?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[task.status]}`}>
                          {task.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}
                          {statusLabel[task.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${priorityClass[task.priority]}`}>
                          <Flag className="h-3.5 w-3.5" />
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-gray-400" />
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <span className="inline-flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-400" />
                          {task.attachments?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View
                          </Link>
                          <button
                            onClick={() => deleteTask(task)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-center text-sm font-medium text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
