import { Link } from "react-router-dom";

export default function TaskCard({
  task,
}: any) {
  return (
    <div className="border p-4 rounded mb-3 shadow">
      <h2 className="text-xl">
        {task.title}
      </h2>

      <p>{task.description}</p>

      <div className="flex gap-2 mt-2">
        <span className="bg-gray-200 px-2 py-1 rounded">
          {task.status}
        </span>

        <span className="bg-blue-200 px-2 py-1 rounded">
          {task.priority}
        </span>
      </div>

      <Link
        to={`/tasks/${task.id}`}
        className="text-blue-500 mt-3 inline-block"
      >
        View Details
      </Link>
    </div>
  );
}