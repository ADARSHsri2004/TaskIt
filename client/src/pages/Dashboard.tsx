import { useEffect, useState } from "react";

import api from "../api/axios";

import Navbar from "../components/Navbar";

import TaskCard from "../components/tasks/TaskCard";

export default function Dashboard() {
  const [tasks, setTasks] =
    useState([]);

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const fetchTasks = async () => {
    const res = await api.get(
      `/tasks?status=${status}&priority=${priority}`
    );

    setTasks(res.data.data);
  };

  useEffect(() => {
    fetchTasks();
  }, [status, priority]);

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl mb-4">
          Dashboard
        </h1>

        {/* FILTERS */}

        <div className="flex gap-4 mb-4">
          <select
            className="border p-2"
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >
            <option value="">
              All Status
            </option>

            <option value="TODO">
              TODO
            </option>

            <option value="IN_PROGRESS">
              IN_PROGRESS
            </option>

            <option value="COMPLETED">
              COMPLETED
            </option>
          </select>

          <select
            className="border p-2"
            onChange={(e) =>
              setPriority(
                e.target.value
              )
            }
          >
            <option value="">
              All Priority
            </option>

            <option value="LOW">
              LOW
            </option>

            <option value="MEDIUM">
              MEDIUM
            </option>

            <option value="HIGH">
              HIGH
            </option>
          </select>
        </div>

        {/* TASKS */}

        {tasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
          />
        ))}
      </div>
    </>
  );
}