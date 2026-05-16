import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Loader2,
  Paperclip,
  Save,
  Trash2,
  UploadCloud,
  UserRound
} from "lucide-react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type {
  Attachment,
  Priority,
  Task,
  TaskStatus,
  User
} from "../../types";

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

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString() : "No due date";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth.user);
  const isAdmin = currentUser?.role === "ADMIN";
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [deleteAttachmentIds, setDeleteAttachmentIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "TODO" as TaskStatus,
    priority: "MEDIUM" as Priority,
    dueDate: "",
    assignedToId: ""
  });

  const loadTask = async () => {
    const res = await api.get(`/tasks/${id}`);
    const loadedTask = res.data.task as Task;

    setTask(loadedTask);
    setForm({
      title: loadedTask.title || "",
      description: loadedTask.description || "",
      status: loadedTask.status || "TODO",
      priority: loadedTask.priority || "MEDIUM",
      dueDate: loadedTask.dueDate
        ? loadedTask.dueDate.slice(0, 10)
        : "",
      assignedToId: loadedTask.assignedTo?.id || ""
    });
    setDeleteAttachmentIds([]);
  };

  useEffect(() => {
    loadTask();
  }, [id]);

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

  const downloadAttachment = async (attachment: Attachment) => {
    const filename = attachment.filepath.split(/[\\/]/).pop();
    if (!filename) {
      return;
    }

    const response = await api.get(`/tasks/file/${filename}`, {
      responseType: "blob"
    });

    const fileUrl = window.URL.createObjectURL(
      new Blob([response.data])
    );
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = attachment.filename;
    link.click();

    window.URL.revokeObjectURL(fileUrl);
  };

  const openAttachment = async (attachment: Attachment) => {
    const filename = attachment.filepath.split(/[\\/]/).pop();
    if (!filename) {
      return;
    }

    const response = await api.get(`/tasks/file/${filename}`, {
      responseType: "blob"
    });

    const fileUrl = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/pdf"
      })
    );

    window.open(fileUrl, "_blank");
  };

  const toggleAttachmentDelete = (attachmentId: string) => {
    setDeleteAttachmentIds((current) =>
      current.includes(attachmentId)
        ? current.filter((idValue) => idValue !== attachmentId)
        : [...current, attachmentId]
    );
  };

  const handleUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    const existingCount = task?.attachments?.length || 0;
    const newCount = files?.length || 0;

    if (existingCount - deleteAttachmentIds.length + newCount > 3) {
      setMessage("Only 3 PDF files are allowed per task");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (deleteAttachmentIds.length) {
      formData.append(
        "deleteAttachmentIds",
        deleteAttachmentIds.join(",")
      );
    }

    if (files) {
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
    }

    try {
      const res = await api.put(`/tasks/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setTask(res.data.task);
      setFiles(null);
      setDeleteAttachmentIds([]);
      setMessage("Task updated");
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Could not update task"
      );
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this task and all attached PDFs?"
    );

    if (!confirmed) {
      return;
    }

    await api.delete(`/tasks/${id}`);
    navigate(isAdmin ? "/admin/tasks" : "/");
  };

  if (!task) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="mx-auto flex max-w-5xl items-center justify-center rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading task details...</span>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                    <FileText className="h-4 w-4" />
                    Task Details
                  </p>
                  <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
                    {task.title}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${statusClass[task.status]}`}>
                    {task.status === "COMPLETED" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : task.status === "IN_PROGRESS" ? (
                      <Clock3 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {statusLabel[task.status]}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${priorityClass[task.priority]}`}>
                    <Flag className="h-4 w-4" />
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-0 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Assigned to
                  </p>
                  <p className="truncate text-sm font-semibold text-gray-950">
                    {task.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Due date
                  </p>
                  <p className="text-sm font-semibold text-gray-950">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                  <Paperclip className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Documents
                  </p>
                  <p className="text-sm font-semibold text-gray-950">
                    {task.attachments?.length || 0} uploaded
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleUpdate}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">
                    Task Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Update the task fields and save your changes.
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Title
                  </span>
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.target.value })
                    }
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    placeholder="Title"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Description
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value
                      })
                    }
                    className="min-h-40 resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    placeholder="Description"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          status: event.target.value as TaskStatus
                        })
                      }
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    >
                      <option value="TODO">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Priority
                    </span>
                    <select
                      value={form.priority}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          priority: event.target.value as Priority
                        })
                      }
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Due date
                    </span>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        setForm({ ...form, dueDate: event.target.value })
                      }
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Assigned user
                    </span>
                    <select
                      value={form.assignedToId}
                      disabled={!isAdmin}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          assignedToId: event.target.value
                        })
                      }
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition-all duration-200 hover:border-gray-300 focus:border-black focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Unassigned</option>
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
            </section>

            <aside className="grid gap-6 lg:content-start">
              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-950">
                      Documents
                    </h2>
                    <p className="text-sm text-gray-500">
                      Up to 3 PDF files per task.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <Paperclip className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid gap-3">
                  {task.attachments?.map((attachment) => {
                    const selectedForDelete =
                      deleteAttachmentIds.includes(attachment.id);

                    return (
                      <label
                        key={attachment.id}
                        className={`group grid gap-3 rounded-xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                          selectedForDelete
                            ? "border-red-200 bg-red-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <span className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-black group-hover:text-white">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium text-gray-950">
                              {attachment.filename}
                            </span>
                            <span className="text-xs text-gray-500">
                              PDF document
                            </span>
                          </span>
                        </span>

                        <span className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openAttachment(attachment)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadAttachment(attachment)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </button>
                          <span className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={selectedForDelete}
                              onChange={() =>
                                toggleAttachmentDelete(attachment.id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-red-600 accent-red-600"
                            />
                            Remove
                          </span>
                        </span>
                      </label>
                    );
                  })}

                  {!task.attachments?.length && (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">
                        No documents uploaded.
                      </p>
                    </div>
                  )}
                </div>

                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center transition-all duration-200 hover:border-gray-400 hover:bg-white">
                  <UploadCloud className="mb-2 h-7 w-7 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Add PDF files
                  </span>
                  <span className="mt-1 text-xs text-gray-500">
                    Select one or more documents
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
                  <p className="mt-3 text-sm text-gray-600">
                    {files.length} file{files.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                {message && (
                  <p className="mb-4 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-800">
                    {message}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md active:translate-y-0">
                    <Save className="h-4 w-4" />
                    Update Task
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md active:translate-y-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Task
                  </button>
                </div>
              </section>
            </aside>
          </form>
        </div>

        {/* <section className="grid gap-2 text-gray-700">
          <p>
            <strong>Assigned user:</strong>{" "}
            {task.assignedTo?.name || "Unassigned"}
          </p>
          <p>
            <strong>Priority:</strong> {task.priority}
          </p>
          <p>
            <strong>Status:</strong> {task.status}
          </p>
          <p>
            <strong>Due date:</strong>{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "-"}
          </p>
          <p>
            <strong>Full description:</strong>{" "}
            {task.description || "-"}
          </p>
        </section> */}
      </main>
    </>
  );
}
