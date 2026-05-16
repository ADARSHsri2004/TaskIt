import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../../api/axios";

export default function TaskDetails() {
  const { id } = useParams();

  const [task, setTask] =
    useState<any>(null);

  useEffect(() => {
    api
      .get(`/tasks/${id}`)
      .then((res) => {
        setTask(res.data.task);
      });
  }, []);

  if (!task) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl mb-3">
        {task.title}
      </h1>

      <p>{task.description}</p>

      <div className="mt-4">
        <strong>Status:</strong>{" "}
        {task.status}
      </div>

      <div>
        <strong>Priority:</strong>{" "}
        {task.priority}
      </div>

      <div className="mt-4">
        <h2 className="text-xl mb-2">
          Attachments
        </h2>

        {task.attachments?.map(
          (file: any) => (
            <a
              key={file.id}
              href={`http://localhost:5000/uploads/${file.filepath.split("/").pop()}`}
              target="_blank"
              className="block text-blue-500"
            >
              {file.filename}
            </a>
          )
        )}
      </div>
    </div>
  );
}