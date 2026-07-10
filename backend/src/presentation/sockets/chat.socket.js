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

    socket.on("join_channel", ({ username, channelId }) => {
      socket.join(channelId);

      connectedUsers.set(socket.id, {
        username,
        channelId,
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

    socket.on("get_users", ({ channelId }) => {
      const users = [];

      for (const [socketId, userData] of connectedUsers.entries()) {
        if (userData.channelId === channelId) {
          users.push({
            socketId,
            username: userData.username,
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
