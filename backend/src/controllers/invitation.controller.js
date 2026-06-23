import { customAlphabet } from "nanoid";
import mongoose from "mongoose";
import Invitation from "../models/Invitation.js";
import Server from "../models/Server.js";
import User from "../models/User.js";
import Member from "../models/Member.js";

const generateCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6
);

const buildInviteUrl = (code) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );

  return `${clientUrl}/invite/${code}`;
};

export const createInvitation = async (req, res) => {
  try {
    const { serverId, code } = req.body;

    if (!serverId) {
      return res.status(400).json({
        message: "serverId es obligatorio"
      });
    }

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

    const invitationCode = code?.trim() || generateCode();

    const invitation = await Invitation.create({
      code: invitationCode,
      serverId,
      active: true
    });

    res.status(201).json({
      message: "Invitación creada correctamente",
      invitation,
      inviteUrl: buildInviteUrl(invitation.code)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe una invitación con ese código"
      });
    }

    res.status(500).json({
      message: "Error al crear invitación",
      error: error.message
    });
  }
};

export const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find()
      .populate("serverId", "name description")
      .sort({ createdAt: -1 });

    res.json({
      total: invitations.length,
      invitations
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar invitaciones",
      error: error.message
    });
  }
};

export const getInvitationByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const invitation = await Invitation.findOne({ code })
      .populate("serverId", "name description");

    if (!invitation) {
      return res.status(404).json({
        valid: false,
        message: "Invitación no encontrada"
      });
    }

    if (!invitation.active) {
      return res.status(410).json({
        valid: false,
        message: "La invitación ya no está activa"
      });
    }

    res.json({
      valid: true,
      code: invitation.code,
      active: invitation.active,
      server: {
        id: invitation.serverId._id,
        name: invitation.serverId.name,
        description: invitation.serverId.description
      },
      invitation
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener invitación",
      error: error.message
    });
  }
};

export const joinByInvitation = async (req, res) => {
  try {
    const { code } = req.params;
    const username = req.body.username?.trim();

    if (!username) {
      return res.status(400).json({
        message: "El username es obligatorio"
      });
    }

    const invitation = await Invitation.findOne({
      code,
      active: true
    }).populate("serverId", "name description");

    if (!invitation) {
      return res.status(404).json({
        message: "Invitación no válida o inactiva"
      });
    }

    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: {
          status: "online",
          lastSeen: null
        },
        $setOnInsert: {
          username
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    const member = await Member.findOneAndUpdate(
      {
        userId: user._id,
        serverId: invitation.serverId
      },
      {
        $set: {
          active: true,
          nickname: username
        },
        $setOnInsert: {
          userId: user._id,
          serverId: invitation.serverId,
          role: "member",
          joinedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.json({
      message: "Usuario unido al servidor correctamente",
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      },
      server: {
        id: invitation.serverId._id,
        name: invitation.serverId.name,
        description: invitation.serverId.description
      },
      member: {
        id: member._id,
        serverId: member.serverId,
        role: member.role,
        active: member.active
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al unirse mediante invitación",
      error: error.message
    });
  }
};

export const disableInvitation = async (req, res) => {
  try {
    const { code } = req.params;

    const invitation = await Invitation.findOneAndUpdate(
      { code },
      { active: false },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({
        message: "Invitación no encontrada"
      });
    }

    res.json({
      message: "Invitación desactivada correctamente",
      invitation
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al desactivar invitación",
      error: error.message
    });
  }
};