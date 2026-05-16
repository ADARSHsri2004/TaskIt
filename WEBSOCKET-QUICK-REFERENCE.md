# WebSocket Implementation - Quick Reference

## 🎯 What Changed

| What | Where | Impact |
|------|-------|--------|
| Task create event | Server broadcasts on POST `/api/tasks` | Non-breaking: HTTP still works |
| Task update event | Server broadcasts on PUT `/api/tasks/:id` | Non-breaking: HTTP still works |
| Task delete event | Server broadcasts on DELETE `/api/tasks/:id` | Non-breaking: HTTP still works |
| Redux store | Client: new `tasks` slice | Enhancement: optional to use |
| App startup | Client: new hook in `App.tsx` | Auto-subscribes to events |

## 🚀 Starting the Application

```bash
# Terminal 1 - Start Server
cd server
npm run dev
# Expected: Server running on port 5000

# Terminal 2 - Start Client
cd client  
npm run dev
# Expected: Client running on port 5173
```

## ✅ Verification Checklist (30 seconds)

1. **Both servers running?** ✓
2. **Open browser console** (F12)
3. **Login to app**
4. **See this in console?**
   ```
   ✓ WebSocket connected - Real-time updates enabled
   WebSocket connected: {success: true, message: "Connected to WebSocket server", userId: "..."}
   ```
5. **Open second browser tab** and login
6. **Create task in Tab 1** → **Appears instantly in Tab 2** ✓

## 🔄 WebSocket Events

### Events Your App Receives

```
task:created          // New task created
task:updated          // Task modified
task:deleted          // Task removed
task:statusChanged    // Status updated
task:priorityChanged  // Priority updated
task:assigned         // Task assigned to you (with notification)
```

### In Your Code

If you want to listen to events directly:

```typescript
import { useWebSocket } from './hooks/useWebSocket';
import { useAppDispatch } from './hooks/useRedux';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsub = subscribe('task:created', (data) => {
      console.log('New task:', data.task);
      // dispatch actions, update UI, etc.
    });
    return unsub;
  }, [subscribe]);

  return <div>My Component</div>;
};
```

Or use the hook that already does this:

```typescript
import { useRealtimeTaskUpdates } from './hooks';

const MyComponent = () => {
  const { isConnected } = useRealtimeTaskUpdates();
  
  return <div>Connected: {isConnected ? '✓' : '✗'}</div>;
};
```

## 📊 Redux Tasks State

### Structure

```typescript
// State shape
{
  tasks: {
    items: Task[],        // All tasks
    selectedTask: Task | null,  // Currently selected
    loading: boolean,
    error: string | null,
    lastUpdated: number,  // Timestamp
  }
}
```

### Using Tasks in Components

```typescript
import { useAppSelector } from './hooks/useRedux';

const MyComponent = () => {
  // Get all tasks
  const tasks = useAppSelector((state) => state.tasks.items);
  
  // Get selected task
  const selected = useAppSelector((state) => state.tasks.selectedTask);
  
  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};
```

### Dispatching Task Actions

```typescript
import { useAppDispatch } from './hooks/useRedux';
import { 
  addOrUpdateTask, 
  removeTask,
  updateTaskStatus 
} from './features/tasks/tasksSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();

  const handleNewTask = (task) => {
    dispatch(addOrUpdateTask(task));
  };

  const handleDeleteTask = (taskId) => {
    dispatch(removeTask(taskId));
  };

  const handleStatusChange = (taskId, status) => {
    dispatch(updateTaskStatus({ id: taskId, status }));
  };

  return <>...</>;
};
```

## 🧪 Quick Test (2 minutes)

### Setup
- Terminal 1: `cd server && npm run dev`
- Terminal 2: `cd client && npm run dev`
- Browser 1: http://localhost:5173 (login)
- Browser 2: http://localhost:5173 (login)

### Test Execution
```
Browser 1 → Create task "Test Real-time"
           ↓
Browser 2 → Task appears instantly! ✓
           ↓
Browser 1 → Change status to "IN_PROGRESS"
           ↓
Browser 2 → Status updates instantly! ✓
           ↓
Browser 1 → Delete task
           ↓
Browser 2 → Task disappears instantly! ✓
```

## 🔧 Configuration

### Server CORS
File: `server/src/services/websocket.service.ts`

```typescript
cors: {
  origin: [
    "http://localhost:5173",        // Dev
    "https://task-it-xi.vercel.app" // Production
  ],
  credentials: true
}
```

Add more origins as needed.

### Client WebSocket URL
File: `client/src/hooks/useWebSocket.ts`

```typescript
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
```

Set in `.env.local`:
```
REACT_APP_WS_URL=https://your-domain.com
```

## 📁 Key Files

### Server
| File | Purpose |
|------|---------|
| `server/src/services/websocket.service.ts` | WebSocket manager |
| `server/src/server.ts` | HTTP + WebSocket server |
| `server/src/controllers/task.controller.ts` | Emits events |

### Client
| File | Purpose |
|------|---------|
| `client/src/hooks/useWebSocket.ts` | WebSocket connection |
| `client/src/hooks/useRealtimeTaskUpdates.ts` | Redux integration |
| `client/src/features/tasks/tasksSlice.ts` | Task state |
| `client/src/App.tsx` | Hook initialization |

## ⚡ Common Questions

### Q: Does this break existing features?
**A:** No. All HTTP endpoints work as before. WebSocket is an enhancement layer.

### Q: What if WebSocket fails?
**A:** App still works. HTTP endpoints handle all operations. WebSocket auto-reconnects with backoff.

### Q: How do I know if WebSocket is connected?
**A:** Check console for `✓ WebSocket connected` or use `useWebSocket` hook's `isConnected` flag.

### Q: Can I use this with existing API calls?
**A:** Yes! HTTP API works independently. Combine both for best UX.

### Q: What about offline users?
**A:** If offline, WebSocket disconnects. HTTP still works for create/update (once connection restored, sync happens).

### Q: How many concurrent users?
**A:** Depends on server resources. Socket.IO is scalable. With proper configuration, handles hundreds per node.

## 🐛 Quick Debug

### Check Connection
```javascript
// In browser console
socket.connected // true/false
socket.id        // Socket ID
```

### Check Redux State
```javascript
// In browser console (with Redux DevTools)
store.getState().tasks.items // All tasks
store.getState().tasks.selectedTask // Selected task
```

### Monitor Events
```javascript
// In browser console
const socket = document.body.__SOCKET__; // If exposed
// Or use Redux DevTools to see dispatched actions
```

## 📞 Support

| Issue | Check |
|-------|-------|
| Not connecting | Is user logged in? Is server running? |
| Events not received | Check console for errors. Refresh if needed. |
| Stale data | Refresh page or call API endpoint directly. |
| Performance slow | Check network. WebSocket adds minimal overhead. |

## 🎉 You're All Set!

Everything is ready to use. Real-time updates will happen automatically once users are logged in and connected.

**Next Steps:**
1. ✓ Start both servers
2. ✓ Open app in multiple tabs/windows
3. ✓ Create/update/delete tasks
4. ✓ Watch them update in real-time!

For detailed testing: See `WEBSOCKET-TESTING-GUIDE.md`
