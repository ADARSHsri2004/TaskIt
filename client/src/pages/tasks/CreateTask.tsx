import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type { Priority, TaskStatus, User } from "../../types";
import {
  validateTitle,
  validateDueDate,
  validateFiles,
} from "../../utils/validation";

export default function CreateTask() {
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth.user);
  const isAdmin = currentUser?.role === "ADMIN";
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as Priority,
    status: "TODO" as TaskStatus,
    dueDate: "",
    assignedToId: "",
  });

  const [files, setFiles] = useState<FileList | null>(null);

  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    files?: string;
  }>({});

  const [touched, setTouched] = useState<{
    title?: boolean;
    dueDate?: boolean;
  }>({});

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    api
      .get("/admin/users", {
        params: { limit: 100 },
      })
      .then((res) => setUsers(res.data.data));
  }, [isAdmin]);

  const validateFormOnSubmit = (): boolean => {
    const newErrors: typeof errors = {};

    const titleError = validateTitle(form.title);
    if (titleError) newErrors.title = titleError;

    const dueDateError = validateDueDate(form.dueDate);
    if (dueDateError) newErrors.dueDate = dueDateError;

    const filesError = validateFiles(files, 3);
    if (filesError) newErrors.files = filesError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: "title" | "dueDate") => {
    setTouched({ ...touched, [field]: true });

    if (field === "title") {
      const titleError = validateTitle(form.title);
      setErrors((prev) => ({
        ...prev,
        title: titleError,
      }));
    } else if (field === "dueDate") {
      const dueDateError = validateDueDate(form.dueDate);
      setErrors((prev) => ({
        ...prev,
        dueDate: dueDateError,
      }));
    }
  };

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm({ ...form, [field]: value });

    if (touched[field as "title" | "dueDate"]) {
      if (field === "title") {
        const titleError = validateTitle(value);
        setErrors((prev) => ({
          ...prev,
          title: titleError,
        }));
      } else if (field === "dueDate") {
        const dueDateError = validateDueDate(value);
        setErrors((prev) => ({
          ...prev,
          dueDate: dueDateError,
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    const filesError = validateFiles(e.target.files, 3);
    setErrors((prev) => ({
      ...prev,
      files: filesError,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!validateFormOnSubmit()) {
      setMessageType("error");
      setMessage("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);

    try {
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

      await api.post("/tasks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessageType("success");
      setMessage("Task created successfully! Redirecting...");
      setTimeout(() => {
        navigate(isAdmin ? "/admin/tasks" : "/");
      }, 1500);
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.response?.data?.message || "Could not create task");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Create Task</h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <input
              value={form.title}
              placeholder="Title *"
              className={`border w-full p-2 rounded transition ${
                errors.title && touched.title
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              onChange={(event) => handleChange("title", event.target.value)}
              onBlur={() => handleBlur("title")}
              disabled={isLoading}
            />
            {errors.title && touched.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>

          <textarea
            value={form.description}
            placeholder="Description (optional)"
            className="border rounded px-3 py-2 min-h-32 border-gray-300 transition focus:border-blue-500"
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            disabled={isLoading}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <select
                value={form.priority}
                className="border rounded px-3 py-2 w-full border-gray-300 transition focus:border-blue-500"
                onChange={(event) =>
                  setForm({
                    ...form,
                    priority: event.target.value as Priority,
                  })
                }
                disabled={isLoading}
              >
                <option value="LOW">Priority: Low</option>
                <option value="MEDIUM">Priority: Medium</option>
                <option value="HIGH">Priority: High</option>
              </select>
            </div>

            <div>
              <select
                value={form.status}
                className="border rounded px-3 py-2 w-full border-gray-300 transition focus:border-blue-500"
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as TaskStatus,
                  })
                }
                disabled={isLoading}
              >
                <option value="TODO">Status: Pending</option>
                <option value="IN_PROGRESS">Status: In Progress</option>
                <option value="COMPLETED">Status: Completed</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <input
                type="date"
                value={form.dueDate}
                className={`border w-full rounded px-3 py-2 transition ${
                  errors.dueDate && touched.dueDate
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                onChange={(event) =>
                  handleChange("dueDate", event.target.value)
                }
                onBlur={() => handleBlur("dueDate")}
                disabled={isLoading}
              />
              {errors.dueDate && touched.dueDate && (
                <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <select
                value={form.assignedToId}
                disabled={!isAdmin || isLoading}
                className="border rounded px-3 py-2 w-full disabled:bg-gray-100 border-gray-300 transition"
                onChange={(event) =>
                  setForm({
                    ...form,
                    assignedToId: event.target.value,
                  })
                }
              >
                <option value="">
                  {isAdmin ? "Assign user (optional)" : "Admin only"}
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
          </div>

          <div>
            <input
              type="file"
              multiple
              accept="application/pdf,.pdf"
              className={`border w-full rounded px-3 py-2 transition ${
                errors.files ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF files only, maximum 3 files
            </p>
            {errors.files && (
              <p className="text-sm text-red-600 mt-1">{errors.files}</p>
            )}
          </div>

          {message && (
            <p
              className={`text-sm p-3 rounded transition ${
                messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className={`rounded px-4 py-2 w-fit font-medium transition ${
              isLoading || Object.keys(errors).length > 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isLoading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </main>
    </>
  );
}
