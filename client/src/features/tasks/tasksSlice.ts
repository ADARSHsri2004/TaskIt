import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  assignedToId?: string;
  attachments?: any[];
  createdBy?: any;
  assignedTo?: any;
}

interface TasksState {
  items: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TasksState = {
  items: [],
  selectedTask: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Set all tasks
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.items = action.payload;
      state.lastUpdated = Date.now();
    },

    // Add or update a task (from real-time updates)
    addOrUpdateTask: (state, action: PayloadAction<Task>) => {
      const existingIndex = state.items.findIndex(
        (task) => task.id === action.payload.id
      );
      
      if (existingIndex > -1) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
      state.lastUpdated = Date.now();
    },

    // Update task fields (from real-time updates)
    updateTaskFields: (
      state,
      action: PayloadAction<{
        id: string;
        updates: Partial<Task>;
      }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.updates);
        state.lastUpdated = Date.now();
      }
    },

    // Remove a task
    removeTask: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
      state.lastUpdated = Date.now();
    },

    // Set selected task
    selectTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update task status (real-time)
    updateTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: string }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status as any;
        state.lastUpdated = Date.now();
      }
    },

    // Update task priority (real-time)
    updateTaskPriority: (
      state,
      action: PayloadAction<{ id: string; priority: string }>
    ) => {
      const task = state.items.find((t) => t.id === action.payload.id);
      if (task) {
        task.priority = action.payload.priority as any;
        state.lastUpdated = Date.now();
      }
    },

    // Clear all tasks
    clearTasks: (state) => {
      state.items = [];
      state.selectedTask = null;
      state.lastUpdated = null;
    },
  },
});

export const {
  setTasks,
  addOrUpdateTask,
  updateTaskFields,
  removeTask,
  selectTask,
  setLoading,
  setError,
  clearError,
  updateTaskStatus,
  updateTaskPriority,
  clearTasks,
} = tasksSlice.actions;

export default tasksSlice.reducer;