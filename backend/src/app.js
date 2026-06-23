import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import serverRoutes from "./routes/server.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import memberRoutes from "./routes/member.routes.js";
import messageRoutes from "./routes/message.routes.js";
import directMessageRoutes from "./routes/direct-message.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

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
app.use("/api/direct-messages", directMessageRoutes);

export default app;
