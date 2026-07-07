import mongoose from "mongoose";
import Member from "../models/Member.js";
import Server from "../models/Server.js";

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
      .populate("userId", "name username avatarUrl status lastSeen")
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

export const getMyServers = async (req, res) => {
  try {
    const memberships = await Member.find({
      userId: req.user._id,
      active: true
    })
      .populate("serverId", "name description ownerId")
      .sort({ joinedAt: -1 });

    return res.json({
      total: memberships.length,
      memberships
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al listar tus servidores",
      error: error.message
    });
  }
};

export const joinServer = async (req, res) => {
  try {
    const { serverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serverId)) {
      return res.status(400).json({
        message: "serverId no válido"
      });
    }

    const server = await Server.findById(serverId);

    if (!server) {
      return res.status(404).json({
        message: "Servidor no encontrado"
      });
    }

    let membership = await Member.findOne({
      userId: req.user._id,
      serverId
    });

    if (membership) {
      membership.active = true;
      membership.nickname = membership.nickname || req.user.username;
      await membership.save();
    } else {
      membership = await Member.create({
        userId: req.user._id,
        serverId,
        role: "member",
        nickname: req.user.username,
        active: true
      });
    }

    await membership.populate("serverId", "name description ownerId");

    return res.status(201).json({
      message: "Te uniste al servidor correctamente.",
      membership
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al unirse al servidor",
      error: error.message
    });
  }
};
