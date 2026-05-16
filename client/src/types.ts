export type Role = "ADMIN" | "USER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Attachment = {
  id: string;
  filename: string;
  filepath: string;
  mimetype: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  createdAt: string;
  assignedTo?: User | null;
  createdBy?: User | null;
  attachments?: Attachment[];
};
