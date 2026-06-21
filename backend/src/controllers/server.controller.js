import mongoose from "mongoose";
import Server from "../models/Server.js";
import User from "../models/User.js";
import Member from "../models/Member.js";
import Channel from "../models/Channel.js";

export const createServer = async (req, res) => {
  try {
    const { name, description, ownerUsername } = req.body;

    if (!name || !ownerUsername) {
      return res.status(400).json({
        message: "El nombre del servidor y ownerUsername son obligatorios"
      });
    }

    const username = ownerUsername.trim();

    const owner = await User.findOneAndUpdate(
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

    res.status(201).json({
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
    res.status(500).json({
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