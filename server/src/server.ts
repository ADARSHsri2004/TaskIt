import dotenv from "dotenv";

dotenv.config();

import http from "http";
import app from "./app";
import websocketService from "./services/websocket.service";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

// Initialize WebSocket
websocketService.initialize(httpServer);

httpServer.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});