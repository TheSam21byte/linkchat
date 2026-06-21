import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import Server from "../models/Server.js";

export const createChannel = async (req, res) => {
  try {
    const { name, serverId } = req.body;

    if (!name || !serverId) {
      return res.status(400).json({
        message: "El nombre del canal y serverId son obligatorios"
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

    const channel = await Channel.create({
      name: name.trim(),
      serverId
    });

    res.status(201).json({
      message: "Canal creado correctamente",
      channel
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe un canal con ese nombre en este servidor"
      });
    }

    res.status(500).json({
      message: "Error al crear canal",
      error: error.message
    });
  }
};

export const getChannelsByServer = async (req, res) => {
  try {
    const { serverId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serverId)) {
      return res.status(400).json({
        message: "serverId no válido"
      });
    }

    const channels = await Channel.find({ serverId }).sort({ createdAt: 1 });

    res.json({
      total: channels.length,
      channels
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al listar canales",
      error: error.message
    });
  }
};

export const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de canal no válido"
      });
    }

    const channel = await Channel.findById(id).populate("serverId", "name description");

    if (!channel) {
      return res.status(404).json({
        message: "Canal no encontrado"
      });
    }

    res.json(channel);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener canal",
      error: error.message
    });
  }
};