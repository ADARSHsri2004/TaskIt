import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:5173",
          "https://task-it-xi.vercel.app"
        ],
        credentials: true
      }
    });

    this.io.use((socket: AuthenticatedSocket, next) => {
      const userId = socket.handshake.auth.userId;
      const userRole = socket.handshake.auth.userRole;

      if (!userId) {
        return next(new Error("Authentication required"));
      }

      socket.userId = userId;
      socket.userRole = userRole || "USER";
      next();
    });

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      
      // Track user connection
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId)!.add(socket.id);

      // Join user-specific room
      socket.join(`user:${userId}`);
      socket.join("tasks"); // Join general tasks room for admin/broadcast

      console.log(`User ${userId} connected with socket ${socket.id}`);

      socket.on("disconnect", () => {
        const sockets = this.connectedUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }
        console.log(`User ${userId} disconnected`);
      });

      // Send connection confirmation
      socket.emit("connected", {
        success: true,
        message: "Connected to WebSocket server",
        userId
      });
    });

    return this.io;
  }

  getIO() {
    return this.io;
  }

  // Emit task created event
  emitTaskCreated(task: any, createdById: string) {
    if (!this.io) return;
    
    // Broadcast to all connected clients (admin view)
    this.io.to("tasks").emit("task:created", {
      event: "task_created",
      task,
      timestamp: new Date()
    });

    // Also emit to the creator
    this.io.to(`user:${createdById}`).emit("task:created", {
      event: "task_created",
      task,
      timestamp: new Date()
    });

    // If task is assigned to someone, notify them
    if (task.assignedToId && task.assignedToId !== createdById) {
      this.io.to(`user:${task.assignedToId}`).emit("task:assigned", {
        event: "task_assigned",
        task,
        timestamp: new Date()
      });
    }
  }

  // Emit task updated event
  emitTaskUpdated(task: any, updatedById: string, previousTask?: any) {
    if (!this.io) return;

    // Determine what changed for targeted notifications
    const changes: any = {};
    if (previousTask) {
      if (previousTask.status !== task.status) changes.status = task.status;
      if (previousTask.priority !== task.priority) changes.priority = task.priority;
      if (previousTask.assignedToId !== task.assignedToId) changes.assignedToId = task.assignedToId;
    }

    // Broadcast to all connected clients
    this.io.to("tasks").emit("task:updated", {
      event: "task_updated",
      task,
      changes,
      updatedById,
      timestamp: new Date()
    });

    // Notify assigned user if task was assigned to someone
    if (task.assignedToId) {
      this.io.to(`user:${task.assignedToId}`).emit("task:updated", {
        event: "task_updated",
        task,
        changes,
        updatedById,
        timestamp: new Date()
      });
    }

    // Notify creator
    if (task.createdById) {
      this.io.to(`user:${task.createdById}`).emit("task:updated", {
        event: "task_updated",
        task,
        changes,
        updatedById,
        timestamp: new Date()
      });
    }
  }

  // Emit task deleted event
  emitTaskDeleted(taskId: string, task: any, deletedById: string) {
    if (!this.io) return;

    // Broadcast to all connected clients
    this.io.to("tasks").emit("task:deleted", {
      event: "task_deleted",
      taskId,
      deletedById,
      timestamp: new Date()
    });

    // Notify assigned user
    if (task.assignedToId) {
      this.io.to(`user:${task.assignedToId}`).emit("task:deleted", {
        event: "task_deleted",
        taskId,
        deletedById,
        timestamp: new Date()
      });
    }

    // Notify creator
    if (task.createdById) {
      this.io.to(`user:${task.createdById}`).emit("task:deleted", {
        event: "task_deleted",
        taskId,
        deletedById,
        timestamp: new Date()
      });
    }
  }

  // Emit task status changed event
  emitTaskStatusChanged(taskId: string, newStatus: string, task: any, changedById: string) {
    if (!this.io) return;

    this.io.to("tasks").emit("task:statusChanged", {
      event: "task_status_changed",
      taskId,
      newStatus,
      changedById,
      task,
      timestamp: new Date()
    });
  }

  // Emit task priority changed event
  emitTaskPriorityChanged(taskId: string, newPriority: string, task: any, changedById: string) {
    if (!this.io) return;

    this.io.to("tasks").emit("task:priorityChanged", {
      event: "task_priority_changed",
      taskId,
      newPriority,
      changedById,
      task,
      timestamp: new Date()
    });
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}

export default new WebSocketService();
