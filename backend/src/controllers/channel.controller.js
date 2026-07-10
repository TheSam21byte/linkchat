import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import Server from "../models/Server.js";
import Message from "../models/Message.js";

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

    return res.status(201).json({
      message: "Canal creado correctamente",
      channel
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe un canal con ese nombre en este servidor"
      });
    }

    return res.status(500).json({
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

    return res.json({
      total: channels.length,
      channels
    });
  } catch (error) {
    return res.status(500).json({
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

    const channel = await Channel.findById(id).populate(
      "serverId",
      "name description"
    );

    if (!channel) {
      return res.status(404).json({
        message: "Canal no encontrado"
      });
    }

    return res.json(channel);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener canal",
      error: error.message
    });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de canal no válido"
      });
    }

    if (!name) {
      return res.status(400).json({
        message: "El nombre del canal es obligatorio"
      });
    }

    const channel = await Channel.findByIdAndUpdate(
      id,
      { name: name.trim() },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!channel) {
      return res.status(404).json({
        message: "Canal no encontrado"
      });
    }

    return res.json({
      message: "Canal actualizado correctamente",
      channel
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Ya existe un canal con ese nombre en este servidor"
      });
    }

    return res.status(500).json({
      message: "Error al actualizar canal",
      error: error.message
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "ID de canal no válido"
      });
    }

    const channel = await Channel.findByIdAndDelete(id);

    if (!channel) {
      return res.status(404).json({
        message: "Canal no encontrado"
      });
    }

    await Message.deleteMany({ channelId: id });

    return res.json({
      message: "Canal eliminado correctamente",
      channel
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar canal",
      error: error.message
    });
  }
};