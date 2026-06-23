import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";

export const createMessageInChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { username, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({
        message: "channelId no valido"
      });
    }

    if (!username?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: "username y content son obligatorios"
      });
    }

    const channel = await Channel.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        message: "Canal no encontrado"
      });
    }

    const message = await Message.create({
      username: username.trim(),
      channelId,
      content: content.trim(),
      type: "public"
    });

    res.status(201).json({
      message: "Mensaje creado correctamente",
      channelMessage: message
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear mensaje",
      error: error.message
    });
  }
};

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
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      total: messages.length,
      messages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener mensajes",
      error: error.message
    });
  }
};
