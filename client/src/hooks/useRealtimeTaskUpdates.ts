import { useEffect } from 'react';
import { useWebSocket } from './useWebSocket';
import { useAppDispatch, useAppSelector } from './useRedux';
import {
  addOrUpdateTask,
  removeTask,
  updateTaskStatus,
  updateTaskPriority,
} from '../features/tasks/tasksSlice';

export const useRealtimeTaskUpdates = () => {
  const dispatch = useAppDispatch();
  const { subscribe, isConnected } = useWebSocket();
  const user = useAppSelector((state) => state.auth?.user);

  // Handle task created event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:created', (data: any) => {
      console.log('Task created:', data);
      const { task } = data;

      // Update Redux store
      dispatch(addOrUpdateTask(task));
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  // Handle task updated event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:updated', (data: any) => {
      console.log('Task updated:', data);
      const { task } = data;

      // Update Redux store
      dispatch(addOrUpdateTask(task));
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  // Handle task deleted event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:deleted', (data: any) => {
      console.log('Task deleted:', data);
      const { taskId } = data;

      // Update Redux store
      dispatch(removeTask(taskId));
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  // Handle task status changed event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:statusChanged', (data: any) => {
      console.log('Task status changed:', data);
      const { taskId, newStatus } = data;

      // Update Redux store
      dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  // Handle task priority changed event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:priorityChanged', (data: any) => {
      console.log('Task priority changed:', data);
      const { taskId, newPriority } = data;

      // Update Redux store
      dispatch(updateTaskPriority({ id: taskId, priority: newPriority }));
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  // Handle task assigned event
  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe('task:assigned', (data: any) => {
      console.log('Task assigned to you:', data);
      const { task } = data;

      // Update Redux store
      dispatch(addOrUpdateTask(task));

      // Optional: Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Task Assigned', {
          body: `New task: ${task.title}`,
          tag: `task-${task.id}`,
          requireInteraction: false,
        });
      }
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, dispatch]);

  return { isConnected };
};
