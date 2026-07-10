import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./http/app.js";
import { connectDB } from "../infrastructure/index.js";
import { socketCorsOptions } from "../infrastructure/config/cors.js";
import { configureChatSocket } from "./sockets/chat.socket.js";

dotenv.config();

await connectDB();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: socketCorsOptions,
});

configureChatSocket(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor LinkChat ejecutándose en puerto ${PORT}`);
});

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ El puerto ${PORT} ya está en uso.`);
    console.error("Cierra el backend anterior antes de iniciar otro.");
    console.error("En PowerShell: Get-NetTCPConnection -LocalPort 4000 | Select OwningProcess");
    process.exit(1);
  }

  throw error;
});

console.log("JWT_SECRET cargado:", Boolean(process.env.JWT_SECRET));
