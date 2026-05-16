import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import type { Role, User } from "../../types";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "USER" as Role
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchUsers = async () => {
    const res = await api.get("/admin/users", {
      params: { search, page, limit }
    });

    setUsers(res.data.data);
    setTotal(res.data.total);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitUser = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/admin/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role
        });
        setMessage("User updated");
      } else {
        await api.post("/admin/users", form);
        setMessage("User created");
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Could not save user"
      );
    }
  };

  const editUser = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role
    });
  };

  const deleteUser = async (user: User) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? Related tasks and PDFs will be removed.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Could not delete user"
      );
    }
  };

  const viewUser = async (user: User) => {
    const res = await api.get(`/admin/users/${user.id}`);
    setViewingUser(res.data.user);
  };

  return (
    <>
      <Navbar />

      <main className="p-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold">Users Management</h1>
            <p className="text-gray-600">Create, edit, and remove accounts.</p>
          </div>

          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search users"
            className="border rounded px-3 py-2 w-full md:w-72"
          />
        </div>

        <form
          onSubmit={submitUser}
          className="grid gap-3 border rounded p-4 mb-6 md:grid-cols-5"
        >
          <input
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            placeholder="Name"
            className="border rounded px-3 py-2"
          />

          <input
            required
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="Email"
            className="border rounded px-3 py-2"
          />

          <input
            required={!editingId}
            disabled={Boolean(editingId)}
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            placeholder={editingId ? "Password unchanged" : "Password"}
            className="border rounded px-3 py-2 disabled:bg-gray-100"
          />

          <select
            value={form.role}
            onChange={(event) =>
              setForm({ ...form, role: event.target.value as Role })
            }
            className="border rounded px-3 py-2"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          <div className="flex gap-2">
            <button className="bg-black text-white rounded px-4 py-2">
              {editingId ? "Update" : "Create"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border rounded px-4 py-2"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && <p className="mb-4 text-sm">{message}</p>}

        {viewingUser && (
          <div className="border rounded p-4 mb-4">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {viewingUser.name}
                </h2>
                <p className="text-gray-600">{viewingUser.email}</p>
                <p className="text-gray-600">
                  {viewingUser.role} ·{" "}
                  {viewingUser.assignedTasks?.length || 0} assigned tasks
                </p>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="border rounded px-3 py-1 h-fit"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewUser(user)}
                        className="border rounded px-3 py-1"
                      >
                        View
                      </button>
                      <button
                        onClick={() => editUser(user)}
                        className="border rounded px-3 py-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
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
