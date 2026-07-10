import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";

import app from "./http/app.js";
import { connectDB, disconnectDB } from "../infrastructure/index.js";
import { validateEnv } from "../infrastructure/config/env.js";
import { socketCorsOptions } from "../infrastructure/config/cors.js";
import { configureChatSocket } from "./sockets/chat.socket.js";

dotenv.config();

validateEnv();
await connectDB();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: socketCorsOptions,
});

configureChatSocket(io);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";

httpServer.listen(PORT, HOST, () => {
  console.log(`Servidor LinkChat en ${HOST}:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || "development"}`);
});

httpServer.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${PORT} ya esta en uso.`);
    process.exit(1);
  }

  throw error;
});

function shutdown(signal) {
  console.log(`${signal} recibido. Cerrando servidor...`);

  httpServer.close(async () => {
    try {
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error("Error al cerrar la aplicacion:", error.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Cierre forzado por timeout.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
