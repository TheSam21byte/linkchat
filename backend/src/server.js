import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { socketCorsOptions } from "./config/cors.js";
import { configureChatSocket } from "./sockets/chat.socket.js";

dotenv.config();

await connectDB();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: socketCorsOptions
});

configureChatSocket(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor LinkChat ejecutándose en puerto ${PORT}`);
});
