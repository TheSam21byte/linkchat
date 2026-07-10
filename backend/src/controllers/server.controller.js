import mongoose from "mongoose";
import Server from "../models/Server.js";
import User from "../models/User.js";
import Member from "../models/Member.js";
import Channel from "../models/Channel.js";
import Message from "../models/Message.js";

export const createServer = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "El nombre del servidor es obligatorio"
      });
    }

    const owner = req.user;

    const server = await Server.create({
      name: name.trim(),
      description: description || "",
      ownerId: owner._id
    });

    const member = await Member.create({
      userId: owner._id,
      serverId: server._id,
      role: "owner",
      nickname: owner.username,
      active: true
    });

    const channel = await Channel.create({
      name: "general",
      serverId: server._id
    });

    return res.status(201).json({
      message: "Servidor creado correctamente",
      server,
      owner: {
        id: owner._id,
        username: owner.username
      },
      member,
      defaultChannel: channel
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear servidor",
      error: error.message
    });
  }
};

export const getServers = async (req, res) => {
  try {
    const servers = await Server.find()
      .populate("ownerId", "username status")
      .sort({ createdAt: -1 });

    res.json({
      total: servers.length,
      servers
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar servidores",
      error: error.message
    });
  }
};

export const getServerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de servidor no válido"
      });
    }

    const server = await Server.findById(id).populate("ownerId", "username status");

    if (!server) {
      return res.status(404).json({
        message: "Servidor no encontrado"
      });
    }

    res.json(server);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener servidor",
      error: error.message
    });
  }
};

export const updateServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const server = await Server.findByIdAndUpdate(
      id,
      {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description } : {})
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!server) {
      return res.status(404).json({
        message: "Servidor no encontrado"
      });
    }

    res.json({
      message: "Servidor actualizado correctamente",
      server
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar servidor",
      error: error.message
    });
  }
};

export const deleteServer = async (req, res) => {
  try {
    const { id } = req.params;

    const server = await Server.findById(id);

    if (!server) {
      return res.status(404).json({
        message: "Servidor no encontrado"
      });
    }

    const channels = await Channel.find({ serverId: id }).select("_id");
    const channelIds = channels.map((channel) => channel._id);

    await Message.deleteMany({ channelId: { $in: channelIds } });
    await Channel.deleteMany({ serverId: id });
    await Member.deleteMany({ serverId: id });
    await Server.findByIdAndDelete(id);

    res.json({
      message: "Servidor eliminado correctamente",
      server
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar servidor",
      error: error.message
    });
  }
};