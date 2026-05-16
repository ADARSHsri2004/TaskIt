import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type {
  Attachment,
  Priority,
  Task,
  TaskStatus,
  User
} from "../../types";

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
        <p className="p-6">Loading...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Task Details</h1>

        <form
          onSubmit={handleUpdate}
          className="grid gap-4 border rounded p-4 mb-6"
        >
          <input
            required
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            className="border rounded px-3 py-2"
            placeholder="Title"
          />

          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({
                ...form,
                description: event.target.value
              })
            }
            className="border rounded px-3 py-2 min-h-32"
            placeholder="Description"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as TaskStatus
                })
              }
              className="border rounded px-3 py-2"
            >
              <option value="TODO">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <select
              value={form.priority}
              onChange={(event) =>
                setForm({
                  ...form,
                  priority: event.target.value as Priority
                })
              }
              className="border rounded px-3 py-2"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) =>
                setForm({ ...form, dueDate: event.target.value })
              }
              className="border rounded px-3 py-2"
            />

            <select
              value={form.assignedToId}
              disabled={!isAdmin}
              onChange={(event) =>
                setForm({
                  ...form,
                  assignedToId: event.target.value
                })
              }
              className="border rounded px-3 py-2 disabled:bg-gray-100"
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
          </div>

          <div>
            <p className="font-medium mb-2">Uploaded documents</p>
            <div className="grid gap-2">
              {task.attachments?.map((attachment) => (
                <label
                  key={attachment.id}
                  className="flex flex-col gap-2 border rounded p-3 md:flex-row md:items-center md:justify-between"
                >
                  <span>{attachment.filename}</span>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openAttachment(attachment)}
                      className="border rounded px-3 py-1"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadAttachment(attachment)}
                      className="border rounded px-3 py-1"
                    >
                      Download
                    </button>
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deleteAttachmentIds.includes(
                          attachment.id
                        )}
                        onChange={() =>
                          toggleAttachmentDelete(attachment.id)
                        }
                      />
                      Remove
                    </span>
                  </span>
                </label>
              ))}

              {!task.attachments?.length && (
                <p className="text-gray-600">No documents uploaded.</p>
              )}
            </div>
          </div>

          <input
            type="file"
            multiple
            accept="application/pdf,.pdf"
            className="border rounded px-3 py-2"
            onChange={(event) => setFiles(event.target.files)}
          />

          {message && <p className="text-sm">{message}</p>}

          <div className="flex gap-3">
            <button className="bg-black text-white px-4 py-2 rounded">
              Update Task
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Task
            </button>
          </div>
        </form>

        <section className="grid gap-2 text-gray-700">
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
        </section>
      </main>
    </>
  );
}
