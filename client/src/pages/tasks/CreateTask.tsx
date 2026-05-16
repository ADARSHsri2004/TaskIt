import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  Plus,
  UploadCloud,
  UserRound
} from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type { Priority, TaskStatus, User } from "../../types";

export default function CreateTask() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth.user);
  const isAdmin = currentUser?.role === "ADMIN";
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
    status: "TODO" as TaskStatus,
    dueDate: "",
    assignedToId: ""
  });

  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    api
      .get("/admin/users", {
        params: { limit: 100 }
      })
      .then((res) => setUsers(res.data.data));
  }, [isAdmin]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (files && files.length > 3) {
      setMessage("Only 3 PDF files are allowed");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      await api.post("/tasks", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      navigate(isAdmin ? "/admin/tasks" : "/");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Could not create task"
      );
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="px-5 py-6 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FileText className="h-4 w-4" />
                    New Task
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    Create Task
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-gray-600">
                    Add task details, assign ownership, and attach up to 3 PDF files.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="grid gap-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
          >
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Title
                </span>
                <input
                  required
                  value={form.title}
                  placeholder="Title"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Description
                </span>
                <textarea
                  value={form.description}
                  placeholder="Description"
                  className="min-h-40 resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Flag className="h-4 w-4" />
                    Priority
                  </span>
                  <select
                    value={form.priority}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value as Priority
                      })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    {form.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : form.status === "IN_PROGRESS" ? (
                      <Clock3 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    Status
                  </span>
                  <select
                    value={form.status}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as TaskStatus
                      })
                    }
                  >
                    <option value="TODO">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CalendarDays className="h-4 w-4" />
                    Due date
                  </span>
                  <input
                    type="date"
                    value={form.dueDate}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    onChange={(event) =>
                      setForm({ ...form, dueDate: event.target.value })
                    }
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <UserRound className="h-4 w-4" />
                    Assigned user
                  </span>
                  <select
                    value={form.assignedToId}
                    disabled={!isAdmin}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assignedToId: event.target.value
                      })
                    }
                  >
                    <option value="">
                      {isAdmin ? "Assign user" : "Admin only"}
                    </option>
                    {users
                      .filter((user) => user.role === "USER")
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition-all duration-200 hover:border-gray-400 hover:bg-white">
              <UploadCloud className="mb-2 h-8 w-8 text-gray-500" />
              <span className="text-sm font-semibold text-gray-950">
                Upload PDF files
              </span>
              <span className="mt-1 text-xs text-gray-500">
                Select up to 3 documents
              </span>
              <input
                type="file"
                multiple
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(event) => setFiles(event.target.files)}
              />
            </label>

            {files && files.length > 0 && (
              <p className="text-sm text-gray-600">
                {files.length} file{files.length === 1 ? "" : "s"} selected
              </p>
            )}

            {message && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {message}
              </p>
            )}

            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0 sm:w-fit">
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
