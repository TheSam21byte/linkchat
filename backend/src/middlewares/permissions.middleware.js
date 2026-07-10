import mongoose from "mongoose";
import Member from "../models/Member.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";
import Invitation from "../models/Invitation.js";

export function requireServerRole(allowedRoles, getServerId) {
  return async (req, res, next) => {
    try {
      const serverId = await getServerId(req);

      if (!serverId || !mongoose.Types.ObjectId.isValid(serverId)) {
        return res.status(400).json({
          message: "serverId no válido para validar permisos"
        });
      }

      const membership = await Member.findOne({
        userId: req.user._id,
        serverId,
        active: true
      });

      if (!membership) {
        return res.status(403).json({
          message: "No perteneces a este servidor"
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          message: "No tienes permisos para realizar esta acción"
        });
      }

      req.membership = membership;
      req.serverId = serverId;

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Error al validar permisos",
        error: error.message
      });
    }
  };
}

export async function getServerIdFromChannelId(channelId) {
  const channel = await Channel.findById(channelId);

  if (!channel) {
    return null;
  }

  return channel.serverId;
}

export async function getServerIdFromMessageId(messageId) {
  const message = await Message.findById(messageId);

  if (!message) {
    return null;
  }

  const channel = await Channel.findById(message.channelId);

  if (!channel) {
    return null;
  }

  return channel.serverId;
}

export async function getServerIdFromInvitationCode(code) {
  const invitation = await Invitation.findOne({ code });

  if (!invitation) {
    return null;
  }

  return invitation.serverId;
}