import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useRealtimeTaskUpdates } from "./hooks";

function App() {
  const { isConnected } = useRealtimeTaskUpdates();

  useEffect(() => {
    if (isConnected) {
      console.log("✓ WebSocket connected - Real-time updates enabled");
    }
  }, [isConnected]);

  return <AppRoutes />;
}

export default App;