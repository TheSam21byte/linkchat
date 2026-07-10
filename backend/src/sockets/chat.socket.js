import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Channel from "../models/Channel.js";
import Member from "../models/Member.js";

const connectedUsers = new Map();

async function getUserFromToken(token) {
  if (!token) {
    return null;
  }

  const payload = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(payload.userId).select("-passwordHash");

  return user;
}

async function getActiveMembershipByChannel({ userId, channelId }) {
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return {
      channel: null,
      membership: null
    };
  }

  const membership = await Member.findOne({
    userId,
    serverId: channel.serverId,
    active: true
  });

  return {
    channel,
    membership
  };
}

export const configureChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      const user = await getUserFromToken(token);

      if (!user) {
        return next(new Error("No autorizado. Inicia sesión."));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Sesión inválida o expirada."));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id, socket.user.username);

    socket.on("join_channel", async ({ channelId }) => {
      try {
        if (!channelId) {
          return socket.emit("error_message", {
            message: "channelId es obligatorio"
          });
        }

        const { channel, membership } = await getActiveMembershipByChannel({
          userId: socket.user._id,
          channelId
        });

        if (!channel) {
          return socket.emit("error_message", {
            message: "Canal no encontrado"
          });
        }

        if (!membership) {
          return socket.emit("error_message", {
            message: "No perteneces al servidor de este canal"
          });
        }

        socket.join(String(channelId));

        connectedUsers.set(socket.id, {
          userId: String(socket.user._id),
          username: socket.user.username,
          avatarUrl: socket.user.avatarUrl,
          channelId: String(channelId),
          serverId: String(channel.serverId),
          role: membership.role
        });

        socket.to(String(channelId)).emit("system_message", {
          usuario: "Sistema",
          mensaje: `${socket.user.username} se ha unido al canal`,
          channelId: String(channelId),
          hora: new Date().toLocaleTimeString()
        });
      } catch (error) {
        socket.emit("error_message", {
          message: "No se pudo unir al canal"
        });
      }
    });

    socket.on("send_message", async ({ channelId, message }) => {
      try {
        if (!channelId || !message?.trim()) {
          return socket.emit("error_message", {
            message: "channelId y message son obligatorios"
          });
        }

        const { channel, membership } = await getActiveMembershipByChannel({
          userId: socket.user._id,
          channelId
        });

        if (!channel) {
          return socket.emit("error_message", {
            message: "Canal no encontrado"
          });
        }

        if (!membership) {
          return socket.emit("error_message", {
            message: "No tienes permiso para enviar mensajes en este canal"
          });
        }

        const savedMessage = await Message.create({
          userId: socket.user._id,
          username: socket.user.username,
          channelId,
          content: message.trim(),
          avatarUrl: socket.user.avatarUrl,
          type: "public"
        });

        const data = {
          id: savedMessage._id,
          _id: savedMessage._id,
          userId: socket.user._id,
          usuario: socket.user.username,
          username: socket.user.username,
          mensaje: savedMessage.content,
          content: savedMessage.content,
          channelId: String(savedMessage.channelId),
          avatarUrl: savedMessage.avatarUrl,
          type: savedMessage.type,
          hora: new Date().toLocaleTimeString(),
          createdAt: savedMessage.createdAt
        };

        io.to(String(channelId)).emit("receive_message", data);
      } catch (error) {
        socket.emit("error_message", {
          message: "No se pudo guardar el mensaje en la base de datos"
        });
      }
    });

    socket.on("typing_start", ({ channelId }) => {
      if (!channelId) return;

      if (!socket.rooms.has(String(channelId))) return;

      socket.to(String(channelId)).emit("typing_update", {
        username: socket.user.username,
        isTyping: true
      });
    });

    socket.on("typing_stop", ({ channelId }) => {
      if (!channelId) return;

      if (!socket.rooms.has(String(channelId))) return;

      socket.to(String(channelId)).emit("typing_update", {
        username: socket.user.username,
        isTyping: false
      });
    });

    socket.on("get_users", ({ channelId }) => {
      const users = [];

      for (const [socketId, userData] of connectedUsers.entries()) {
        if (userData.channelId === String(channelId)) {
          users.push({
            socketId,
            userId: userData.userId,
            username: userData.username,
            avatarUrl: userData.avatarUrl,
            role: userData.role
          });
        }
      }

      socket.emit("users_list", users);
    });

    socket.on("disconnect", () => {
      const userData = connectedUsers.get(socket.id);

      if (userData) {
        socket.to(userData.channelId).emit("typing_update", {
          username: userData.username,
          isTyping: false
        });

        socket.to(userData.channelId).emit("system_message", {
          usuario: "Sistema",
          mensaje: `${userData.username} ha salido del canal`,
          channelId: userData.channelId,
          hora: new Date().toLocaleTimeString()
        });

        connectedUsers.delete(socket.id);
      }

      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });
};