import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/tasks").then((res) => {
      setTasks(res.data.data);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Tasks</h1>

      {tasks.map((task: any) => (
        <div key={task.id} className="border p-3 mb-2">
          <h3>{task.title}</h3>
          <p>{task.status}</p>
        </div>
      ))}
    </div>
  );
}