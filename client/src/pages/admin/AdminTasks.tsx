import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type { Priority, Task, TaskStatus } from "../../types";

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

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Tasks Management</h1>
            <p className="text-gray-600">All tasks across the system.</p>
          </div>

          <Link
            to="/tasks/create"
            className="bg-black text-white rounded px-4 py-2 text-center"
          >
            Create Task
          </Link>
        </div>

        <div className="grid gap-3 mb-4 md:grid-cols-4">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search tasks"
            className="border rounded px-3 py-2"
          />

          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value as TaskStatus | "");
            }}
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
          >
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Attachments</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-t">
                  <td className="p-3 font-medium">{task.title}</td>
                  <td className="p-3">
                    {task.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="p-3">{task.status}</td>
                  <td className="p-3">{task.priority}</td>
                  <td className="p-3">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-3">{task.attachments?.length || 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="border rounded px-3 py-1"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => deleteTask(task)}
                        className="bg-red-600 text-white rounded px-3 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => value - 1)}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((value) => value + 1)}
            className="border rounded px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </main>
    </>
  );
}
