import mongoose from "mongoose";
import DirectMessage from "../models/DirectMessage.js";
import User from "../models/User.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getDirectMessages = async (req, res) => {
  try {
    const { userId, contactId } = req.params;
    const limit = Number(req.query.limit) || 50;

    if (!isValidObjectId(userId) || !isValidObjectId(contactId)) {
      return res.status(400).json({
        message: "userId o contactId no valido"
      });
    }

    const messages = await DirectMessage.find({
      $or: [
        { fromUserId: userId, toUserId: contactId },
        { fromUserId: contactId, toUserId: userId }
      ]
    })
      .populate("fromUserId", "username status")
      .populate("toUserId", "username status")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      total: messages.length,
      messages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener mensajes directos",
      error: error.message
    });
  }
};

export const sendDirectMessage = async (req, res) => {
  try {
    const { fromUserId, toUserId, content } = req.body;

    if (!fromUserId || !toUserId || !content?.trim()) {
      return res.status(400).json({
        message: "fromUserId, toUserId y content son obligatorios"
      });
    }

    if (!isValidObjectId(fromUserId) || !isValidObjectId(toUserId)) {
      return res.status(400).json({
        message: "fromUserId o toUserId no valido"
      });
    }

    const users = await User.find({
      _id: { $in: [fromUserId, toUserId] }
    });

    if (users.length !== 2) {
      return res.status(404).json({
        message: "Uno de los usuarios no existe"
      });
    }

    const message = await DirectMessage.create({
      fromUserId,
      toUserId,
      content: content.trim()
    });

    const populatedMessage = await message.populate([
      { path: "fromUserId", select: "username status" },
      { path: "toUserId", select: "username status" }
    ]);

    res.status(201).json({
      message: "Mensaje enviado correctamente",
      directMessage: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al enviar mensaje directo",
      error: error.message
    });
  }
};
