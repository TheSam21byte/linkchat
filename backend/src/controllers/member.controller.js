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

    return res.json({
      total: members.length,
      members
    });
  } catch (error) {
    return res.status(500).json({
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

    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({
        message: "No puedes consultar servidores de otro usuario"
      });
    }

    const memberships = await Member.find({
      userId,
      active: true
    })
      .populate("serverId", "name description ownerId")
      .populate("userId", "name username avatarUrl status")
      .sort({ joinedAt: -1 });

    return res.json({
      total: memberships.length,
      memberships
    });
  } catch (error) {
    return res.status(500).json({
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

export const kickMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        message: "memberId no válido"
      });
    }

    const targetMember = await Member.findById(memberId);

    if (!targetMember || !targetMember.active) {
      return res.status(404).json({
        message: "Miembro no encontrado"
      });
    }

    const actorMember = await Member.findOne({
      userId: req.user._id,
      serverId: targetMember.serverId,
      active: true
    });

    if (!actorMember) {
      return res.status(403).json({
        message: "No perteneces a este servidor"
      });
    }

    if (!["owner", "admin"].includes(actorMember.role)) {
      return res.status(403).json({
        message: "No tienes permisos para expulsar usuarios"
      });
    }

    if (String(targetMember.userId) === String(req.user._id)) {
      return res.status(400).json({
        message: "No puedes expulsarte a ti mismo"
      });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({
        message: "No se puede expulsar al owner del servidor"
      });
    }

    if (actorMember.role === "admin" && targetMember.role !== "member") {
      return res.status(403).json({
        message: "Un admin solo puede expulsar members"
      });
    }

    targetMember.active = false;
    await targetMember.save();

    return res.json({
      message: "Usuario expulsado correctamente",
      member: targetMember
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al expulsar usuario",
      error: error.message
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        message: "memberId no válido"
      });
    }

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        message: "Rol no válido. Solo se permite admin o member"
      });
    }

    const targetMember = await Member.findById(memberId);

    if (!targetMember || !targetMember.active) {
      return res.status(404).json({
        message: "Miembro no encontrado"
      });
    }

    const actorMember = await Member.findOne({
      userId: req.user._id,
      serverId: targetMember.serverId,
      active: true
    });

    if (!actorMember || actorMember.role !== "owner") {
      return res.status(403).json({
        message: "Solo el owner puede cambiar roles"
      });
    }

    if (targetMember.role === "owner") {
      return res.status(403).json({
        message: "No se puede cambiar el rol del owner"
      });
    }

    targetMember.role = role;
    await targetMember.save();

    return res.json({
      message: "Rol actualizado correctamente",
      member: targetMember
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar rol",
      error: error.message
    });
  }
};