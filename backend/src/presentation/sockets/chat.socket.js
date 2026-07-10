import { sendMessageUseCase } from "../composition/container.js";
import {
  emitSocketError,
  formatPrivateMessage,
  formatSystemMessage,
} from "./utils/SocketErrorHandler.js";

const connectedUsers = new Map();

export function configureChatSocket(io) {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    socket.on("join_channel", ({ username, channelId, avatarUrl }) => {
      socket.join(channelId);

      connectedUsers.set(socket.id, {
        username,
        channelId,
        avatarUrl,
      });

      io.to(channelId).emit(
        "system_message",
        formatSystemMessage(`${username} se ha unido al canal`)
      );
    });

    socket.on("send_message", async ({ username, channelId, message }) => {
      try {
        const data = await sendMessageUseCase.execute({
          username,
          channelId,
          content: message,
          type: "public",
        });

        io.to(channelId).emit("receive_message", data);
      } catch (error) {
        emitSocketError(
          socket,
          error,
          "No se pudo guardar el mensaje en la base de datos."
        );
      }
    });

    socket.on("typing_start", ({ username, channelId }) => {
      if (!username || !channelId) return;

      socket.to(channelId).emit("typing_update", {
        username,
        isTyping: true,
      });
    });

    socket.on("typing_stop", ({ username, channelId }) => {
      if (!username || !channelId) return;

      socket.to(channelId).emit("typing_update", {
        username,
        isTyping: false,
      });
    });

    socket.on("get_users", ({ channelId }) => {
      const users = [];

      for (const [socketId, userData] of connectedUsers.entries()) {
        if (userData.channelId === channelId) {
          users.push({
            socketId,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
          });
        }
      }

      socket.emit("users_list", users);
    });

    socket.on("private_message", ({ toSocketId, fromUsername, message }) => {
      io.to(toSocketId).emit(
        "receive_private_message",
        formatPrivateMessage(fromUsername, message)
      );
    });

    socket.on("disconnect", () => {
      const userData = connectedUsers.get(socket.id);

      if (userData) {
        socket.to(userData.channelId).emit("typing_update", {
          username: userData.username,
          isTyping: false,
        });

        io.to(userData.channelId).emit(
          "system_message",
          formatSystemMessage(`${userData.username} ha salido del canal`)
        );

        connectedUsers.delete(socket.id);
      }

      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });
}
