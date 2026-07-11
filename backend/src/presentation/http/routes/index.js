import express from "express";
import authRoutes from "./auth.routes.js";
import channelRoutes from "./channel.routes.js";
import healthRoutes from "./health.routes.js";
import invitationRoutes from "./invitation.routes.js";
import memberRoutes from "./member.routes.js";
import messageRoutes from "./message.routes.js";
import serverRoutes from "./server.routes.js";
import userRoutes from "./user.routes.js";
import voiceRoutes from "./voice.routes.js";

export function registerHttpRoutes(app) {
  app.use("/", healthRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/servers", serverRoutes);
  app.use("/api/channels", channelRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/members", memberRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/voice", voiceRoutes);
  app.use("/uploads", express.static("uploads"));
}
