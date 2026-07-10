import mongoose from "mongoose";
import Message from "../models/Message.js";

export const getMessagesByChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({
        message: "channelId no válido"
      });
    }

    const messages = await Message.find({ channelId })
      .populate("userId", "name username avatarUrl status")
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      total: messages.length,
      messages: messages.reverse()
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener mensajes",
      error: error.message
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de mensaje no válido"
      });
    }

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        message: "Mensaje no encontrado"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to(String(message.channelId)).emit("message_deleted", {
        messageId: String(message._id),
        channelId: String(message.channelId)
      });
    }

    return res.json({
      message: "Mensaje eliminado correctamente",
      deletedMessage: message
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar mensaje",
      error: error.message
    });
  }
};