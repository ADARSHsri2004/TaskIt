import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Flag,
  UserRound
} from "lucide-react";
import type { Task } from "../../types";

const statusLabel = {
  TODO: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed"
};

const statusClass = {
  TODO: "bg-gray-100 text-gray-700 ring-gray-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-100"
};

const priorityClass = {
  LOW: "bg-slate-100 text-slate-700 ring-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-100",
  HIGH: "bg-red-50 text-red-700 ring-red-100"
};

export default function TaskCard({
  task,
}: {
  task: Task;
}) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
            <FileText className="h-4 w-4" />
            Task
          </div>
          <h2 className="truncate text-xl font-semibold text-gray-950">
            {task.title}
          </h2>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {task.description || "No description provided."}
          </p>
        </div>

        <Link
          to={`/tasks/${task.id}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
        >
          View Details
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[task.status]}`}>
          {task.status === "COMPLETED" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Clock3 className="h-3.5 w-3.5" />
          )}
          {statusLabel[task.status]}
        </span>

        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${priorityClass[task.priority]}`}>
          <Flag className="h-3.5 w-3.5" />
          {task.priority}
        </span>

        {task.assignedTo && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
            <UserRound className="h-3.5 w-3.5" />
            {task.assignedTo.name}
          </span>
        )}

        {task.dueDate && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
            <CalendarDays className="h-3.5 w-3.5" />
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </article>
  );
}
