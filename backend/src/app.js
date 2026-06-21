import express from 'express';
import cors from 'cors';

import serverRoutes from "./routes/server.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";

const app = express();

// Configuración de CORS para permitir solicitudes desde el cliente (CAMBIAR AL TENER EL FRONTEND EN PRODUCCIÓN)
app.use(cors({
  origin: process.env.CLIENT_URL
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "LinkChat API",
    status: "running",
    message: "Backend funcionando correctamente"
  });
});

app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/invitations", invitationRoutes);

export default app;