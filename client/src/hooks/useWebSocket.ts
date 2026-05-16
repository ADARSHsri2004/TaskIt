import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from './useRedux';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

interface UseWebSocketOptions {
  enabled?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const user = useAppSelector((state) => state.auth?.user);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!enabled || !user) return;

    // Connect to WebSocket server
    const socket = io(WS_URL, {
      auth: {
        userId: user.id,
        userRole: user.role
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    // Connection event
    socket.on('connected', (data) => {
      console.log('WebSocket connected:', data);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, user]);

  // Subscribe to WebSocket events
  const subscribe = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, handler);
        return () => {
          socketRef.current?.off(event, handler);
        };
      }
      return () => {};
    },
    []
  );

  // Emit WebSocket event
  const emit = useCallback(
    (event: string, data: any) => {
      if (socketRef.current) {
        socketRef.current.emit(event, data);
      }
    },
    []
  );

  // Check if connected
  const isConnected = socketRef.current?.connected || false;

  return {
    socket: socketRef.current,
    subscribe,
    emit,
    isConnected
  };
};
