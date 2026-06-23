import express from "express";
import cors from "cors";

import { corsOptions } from "./config/cors.js";
import userRoutes from "./routes/user.routes.js";
import serverRoutes from "./routes/server.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import memberRoutes from "./routes/member.routes.js";
import messageRoutes from "./routes/message.routes.js";

const app = express();

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "LinkChat API",
    status: "running",
    message: "Backend funcionando correctamente"
  });
});

app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/messages", messageRoutes);

export default app;
