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