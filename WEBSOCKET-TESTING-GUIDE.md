# WebSocket Real-Time Task Updates - Testing Guide

## Implementation Overview

Real-time task updates have been implemented using WebSockets (Socket.io) to provide instant synchronization of task changes across multiple clients without page refreshes.

### What Was Added

#### Server-side
- **WebSocket Service** (`server/src/services/websocket.service.ts`): 
  - Manages WebSocket connections and broadcasts task events
  - Emits events: `task:created`, `task:updated`, `task:deleted`, `task:statusChanged`, `task:priorityChanged`, `task:assigned`
  - User-specific room subscriptions for targeted updates

- **Server Integration** (`server/src/server.ts`):
  - HTTP server initialization for WebSocket support
  - Socket.IO initialization with CORS configuration

- **Task Controller Updates** (`server/src/controllers/task.controller.ts`):
  - WebSocket emission after create, update, delete operations
  - Events broadcast to relevant users

#### Client-side
- **WebSocket Hook** (`client/src/hooks/useWebSocket.ts`):
  - Initializes and manages Socket.IO connection
  - Provides subscribe/emit methods for event handling
  - Auto-reconnection with exponential backoff

- **Redux Slice** (`client/src/features/tasks/tasksSlice.ts`):
  - Redux state management for tasks
  - Actions: `addOrUpdateTask`, `removeTask`, `updateTaskStatus`, `updateTaskPriority`

- **Real-time Updates Hook** (`client/src/hooks/useRealtimeTaskUpdates.ts`):
  - Subscribes to all WebSocket task events
  - Dispatches Redux actions on events
  - Shows browser notifications for task assignments

- **Redux Typed Hooks** (`client/src/hooks/useRedux.ts`, `client/src/hooks/useTaskStorage.ts`):
  - Typed Redux dispatch/selector
  - IndexedDB storage for offline capability

---

## Step-by-Step Testing Guide

### Prerequisites
- Both server and client running
- Node.js and npm installed
- Two browser windows/tabs or two different computers (for multi-client testing)

### Test 1: Basic WebSocket Connection

**Objective**: Verify WebSocket connects successfully when user logs in

**Steps**:
1. Start the server: `cd server && npm run dev`
2. Start the client: `cd client && npm run dev`
3. Open browser DevTools (F12)
4. Go to Console tab
5. Login to the application
6. Expected output in console:
   ```
   ✓ WebSocket connected - Real-time updates enabled
   WebSocket connected: {success: true, message: "Connected to WebSocket server", userId: "..."}
   ```

**Verification**: ✓ WebSocket connects after login

---

### Test 2: Real-Time Task Creation

**Objective**: Verify that a new task appears in real-time on all connected clients

**Setup**:
1. Open browser window 1: Login as User A
2. Open browser window 2: Login as User B (different user or same user different tab)
3. Arrange windows side-by-side

**Steps**:
1. In Window 1, navigate to "Create Task"
2. Fill in task details:
   - Title: "Test Real-time Task"
   - Description: "Testing WebSocket updates"
   - Priority: "HIGH"
   - Status: "PENDING"
   - Assign to: User B
3. Click Create
4. Check Window 2 immediately

**Expected**:
- Task appears instantly in Window 2's dashboard (no page refresh needed)
- Console shows: `Task created: {event: 'task_created', task: {...}, timestamp: ...}`
- Task has all details correctly populated

**Verification**: ✓ Real-time task creation works

---

### Test 3: Real-Time Task Update

**Objective**: Verify that task updates appear in real-time across clients

**Setup**:
- Both windows still logged in (from Test 2)
- Task from Test 2 still exists

**Steps**:
1. In Window 1, click on the "Test Real-time Task" to view details
2. Click Edit button
3. Change status from "PENDING" to "IN_PROGRESS"
4. Change priority from "HIGH" to "LOW"
5. Click Save
6. Check Window 2 immediately

**Expected**:
- Task status and priority update instantly in Window 2
- No page refresh required
- Console shows: `Task updated: {event: 'task_updated', task: {...}, changes: {...}}`

**Verification**: ✓ Real-time task updates work

---

### Test 4: Real-Time Task Deletion

**Objective**: Verify that task deletion syncs in real-time

**Setup**:
- Both windows still logged in

**Steps**:
1. In Window 1, create another test task or use existing one
2. Click the task
3. Click Delete button
4. Confirm deletion
5. Check Window 2 immediately

**Expected**:
- Task disappears from Window 2's list instantly
- Console shows: `Task deleted: {event: 'task_deleted', taskId: '...', deletedById: '...'}`
- No page refresh needed

**Verification**: ✓ Real-time task deletion works

---

### Test 5: Task Assignment Notification

**Objective**: Verify that users get notified when a task is assigned to them

**Setup**:
- Both windows logged in as different users
- User B has not assigned any tasks yet

**Steps**:
1. In Window 1 (User A), create a new task
2. In the assign field, select "User B"
3. Click Create
4. Check Window 2 (User B) immediately

**Expected**:
- Console shows: `Task assigned to you: {event: 'task_assigned', task: {...}}`
- Browser notification appears: "Task Assigned - New task: [task title]"
- Task appears in User B's task list

**Verification**: ✓ Task assignment notifications work

---

### Test 6: Admin Real-Time Updates

**Objective**: Verify that admin sees all task updates across all users

**Setup**:
- Window 1: Login as admin
- Window 2: Login as regular user
- Window 3 (optional): Login as another user

**Steps**:
1. In Window 2, create a task
2. In Window 3 (or Window 2), update the task
3. Check Window 1 (admin) immediately

**Expected**:
- Admin sees all task creations, updates, and deletions instantly
- All changes appear in admin dashboard without refresh
- Console shows real-time events

**Verification**: ✓ Admin real-time updates work

---

### Test 7: Connection Stability

**Objective**: Verify WebSocket reconnects after network interruption

**Setup**:
- Client logged in
- Network accessible

**Steps**:
1. Open DevTools Network tab
2. Toggle throttling: Chrome DevTools → Network → Throttling → "Offline"
3. Wait 5 seconds
4. Toggle back to "Online"
5. Check console

**Expected**:
- Console shows: `WebSocket disconnected`
- After reconnect: `WebSocket connected: {...}`
- App automatically reconnects (no manual refresh needed)
- Auto-reconnection attempts: max 5 with exponential backoff

**Verification**: ✓ WebSocket reconnection works

---

### Test 8: Existing Features Not Broken

**Objective**: Verify all existing features still work normally

**Steps**:
1. Test task creation via HTTP (without WebSocket events)
2. Test task update via HTTP
3. Test task filtering and sorting
4. Test file uploads with tasks
5. Test authentication flows
6. Test logout and login

**Expected**:
- All features work as before
- HTTP endpoints work independently
- No errors in console
- Page navigation works smoothly

**Verification**: ✓ Existing features intact

---

### Test 9: Multiple Rapid Updates

**Objective**: Verify system handles rapid concurrent updates

**Setup**:
- 3+ browser windows/tabs with logged-in users

**Steps**:
1. In Window 1, rapidly create 5 tasks in succession
2. Check if all appear in other windows
3. In different windows, update the same task rapidly
4. Monitor for conflicts or missed updates

**Expected**:
- All tasks appear in real-time
- Updates don't get lost
- UI remains responsive
- No console errors

**Verification**: ✓ Multiple rapid updates handled correctly

---

### Test 10: Offline Behavior

**Objective**: Verify app behavior when WebSocket is unavailable

**Setup**:
- DevTools Network tab open

**Steps**:
1. Put network offline (Throttling → Offline)
2. Try to create a task
3. Go back online

**Expected**:
- App handles gracefully without crashing
- Tasks can still be created (HTTP still works)
- Once reconnected, real-time updates resume

**Verification**: ✓ Offline behavior is graceful

---

## Performance Monitoring

### Browser DevTools Monitoring

1. Open DevTools Network tab
2. Filter by "WS" to see WebSocket messages
3. Note message sizes and frequency

**Expected**:
- Each event message < 5KB
- No excessive message flooding
- Proper cleanup on disconnect

### Console Monitoring

Monitor console logs for:
- Connection establishment
- Event emissions
- Reconnection attempts
- Error messages

**Expected**:
- Clean logs without repetitive errors
- Clear event flow
- Proper error reporting

---

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| WebSocket not connecting | User not authenticated | Login first |
| "Cannot connect to server" | CORS misconfiguration | Check server CORS origin settings |
| Events not received | Old browser tab | Refresh and reconnect |
| Lag in updates | Network latency | Normal for high-latency networks |
| Reconnect loop | Server not running | Ensure server is running |
| Redux state not updating | Missing dispatch | Check Redux hooks are used |

---

## Files Modified/Created

### Server
- ✓ `server/src/services/websocket.service.ts` (NEW)
- ✓ `server/src/server.ts` (MODIFIED)
- ✓ `server/src/controllers/task.controller.ts` (MODIFIED)
- ✓ `package.json` - socket.io dependency added

### Client
- ✓ `client/src/hooks/useWebSocket.ts` (NEW)
- ✓ `client/src/hooks/useRedux.ts` (NEW)
- ✓ `client/src/hooks/useTaskStorage.ts` (NEW)
- ✓ `client/src/hooks/useRealtimeTaskUpdates.ts` (NEW)
- ✓ `client/src/hooks/index.ts` (NEW)
- ✓ `client/src/features/tasks/tasksSlice.ts` (NEW)
- ✓ `client/src/store/store.ts` (MODIFIED)
- ✓ `client/src/App.tsx` (MODIFIED)
- ✓ `package.json` - socket.io-client already present

---

## Environment Variables

### Server (.env)
```
PORT=5000
```

### Client (.env or .env.local)
```
REACT_APP_WS_URL=http://localhost:5000
```

For production:
```
REACT_APP_WS_URL=https://your-server-domain.com
```

---

## Verification Checklist

- [ ] Server starts without errors: `npm run dev`
- [ ] Client starts without errors: `npm run dev`
- [ ] Can login successfully
- [ ] WebSocket connects (check console)
- [ ] Create task in one window, appears in another instantly
- [ ] Update task, changes reflect instantly across windows
- [ ] Delete task, removal syncs instantly
- [ ] Admin sees all updates
- [ ] Browser notifications work for task assignments
- [ ] Connection recovers after network interruption
- [ ] Existing features work without issues
- [ ] No console errors

---

## Next Steps

1. **Production Deployment**: Configure WebSocket for production servers
2. **Notifications**: Configure browser push notifications for offline users
3. **WebSocket Middleware**: Add rate limiting and message validation
4. **Testing**: Add WebSocket integration tests
5. **Monitoring**: Add WebSocket connection metrics
6. **Documentation**: Add WebSocket API docs

---

## Support

For issues or questions about WebSocket implementation:
1. Check console logs for errors
2. Verify server is running
3. Check CORS configuration
4. Ensure user is authenticated
5. Review this guide's troubleshooting section
