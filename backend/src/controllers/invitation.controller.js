import crypto from "crypto";
import mongoose from "mongoose";
import Invitation from "../models/Invitation.js";
import Server from "../models/Server.js";
import User from "../models/User.js";
import Member from "../models/Member.js";

const generateCode = () => {
  return crypto.randomBytes(4).toString("hex");
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
      inviteUrl: `${process.env.CLIENT_URL}/invite/${invitation.code}`
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
        message: "Invitación no encontrada"
      });
    }

    res.json(invitation);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener invitación",
      error: error.message
    });
  }
};

export const joinByInvitation = async (req, res) => {
  try {
    const { code } = req.params
    const { username } = req.body

    if (!username) {
      return res.status(400).json({
        message: 'El username es obligatorio',
      })
    }

    const invitation = await Invitation.findOne({
      code,
      active: true,
    }).populate('serverId')

    if (!invitation) {
      return res.status(404).json({
        message: 'Invitación no encontrada o inactiva',
      })
    }

    const user = await User.findOneAndUpdate(
      { username: username.trim() },
      {
        username: username.trim(),
        status: 'online',
        lastSeen: null,
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
      },
    )

    const member = await Member.findOneAndUpdate(
      {
        userId: user._id,
        serverId: invitation.serverId._id,
      },
      {
        userId: user._id,
        serverId: invitation.serverId._id,
        role: 'member',
        active: true,
        joinedAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: 'after',
        runValidators: true,
      },
    )

    return res.status(200).json({
      message: 'Usuario unido al servidor correctamente',
      user,
      server: invitation.serverId,
      member,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Error al unirse mediante invitación',
      error: error.message,
    })
  }
}

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