import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Create Task</h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            required
            value={form.title}
            placeholder="Title"
            className="border rounded px-3 py-2"
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
          />

          <textarea
            value={form.description}
            placeholder="Description"
            className="border rounded px-3 py-2 min-h-32"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.priority}
              className="border rounded px-3 py-2"
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

            <select
              value={form.status}
              className="border rounded px-3 py-2"
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={form.dueDate}
              className="border rounded px-3 py-2"
              onChange={(event) =>
                setForm({ ...form, dueDate: event.target.value })
              }
            />

            <select
              value={form.assignedToId}
              disabled={!isAdmin}
              className="border rounded px-3 py-2 disabled:bg-gray-100"
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
          </div>

          <input
            type="file"
            multiple
            accept="application/pdf,.pdf"
            className="border rounded px-3 py-2"
            onChange={(event) => setFiles(event.target.files)}
          />

          {message && <p className="text-sm text-red-600">{message}</p>}

          <button className="bg-black text-white rounded px-4 py-2 w-fit">
            Create Task
          </button>
        </form>
      </main>
    </>
  );
}
