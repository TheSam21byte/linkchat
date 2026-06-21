import mongoose from "mongoose";
import Member from "../models/Member.js";

export const getMembersByServer = async (req, res) => {
  try {
    const { serverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serverId)) {
      return res.status(400).json({
        message: "serverId no válido"
      });
    }

    const members = await Member.find({
      serverId,
      active: true
    })
      .populate("userId", "username status lastSeen")
      .populate("serverId", "name description")
      .sort({ joinedAt: 1 });

    res.json({
      total: members.length,
      members
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar miembros",
      error: error.message
    });
  }
};

export const getServersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "userId no válido"
      });
    }

    const memberships = await Member.find({
      userId,
      active: true
    })
      .populate("serverId", "name description")
      .populate("userId", "username status")
      .sort({ joinedAt: -1 });

    res.json({
      total: memberships.length,
      memberships
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar servidores del usuario",
      error: error.message
    });
  }
};