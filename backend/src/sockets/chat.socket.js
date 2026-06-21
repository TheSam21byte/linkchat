import Message from "../models/Message.js";

const connectedUsers = new Map();

export const configureChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    socket.on("join_channel", ({ username, channelId }) => {
      socket.join(channelId);

      connectedUsers.set(socket.id, {
        username,
        channelId
      });

      io.to(channelId).emit("system_message", {
        usuario: "Sistema",
        mensaje: `${username} se ha unido al canal`,
        hora: new Date().toLocaleTimeString()
      });
    });

    socket.on("send_message", async ({ username, channelId, message }) => {
      try {
        const savedMessage = await Message.create({
          username,
          channelId,
          content: message,
          type: "public"
        });

        const data = {
          id: savedMessage._id,
          usuario: username,
          mensaje: message,
          channelId,
          hora: new Date().toLocaleTimeString()
        };

        io.to(channelId).emit("receive_message", data);
      } catch (error) {
        socket.emit("error_message", {
          message: "No se pudo guardar el mensaje en la base de datos"
        });
      }
    });

    socket.on("get_users", ({ channelId }) => {
      const users = [];

      for (const [socketId, userData] of connectedUsers.entries()) {
        if (userData.channelId === channelId) {
          users.push({
            socketId,
            username: userData.username
          });
        }
      }

      socket.emit("users_list", users);
    });

    socket.on("private_message", ({ toSocketId, fromUsername, message }) => {
      io.to(toSocketId).emit("receive_private_message", {
        usuario: fromUsername,
        mensaje: message,
        hora: new Date().toLocaleTimeString()
      });
    });

    socket.on("disconnect", () => {
      const userData = connectedUsers.get(socket.id);

      if (userData) {
        io.to(userData.channelId).emit("system_message", {
          usuario: "Sistema",
          mensaje: `${userData.username} ha salido del canal`,
          hora: new Date().toLocaleTimeString()
        });

        connectedUsers.delete(socket.id);
      }

      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });
};