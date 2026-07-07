import User from "../models/User.js";
import { uploadAvatarToS3 } from "../services/s3.service.js";

const formatUser = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  username: user.username,
  avatarUrl: user.avatarUrl,
  status: user.status
});

export const updateMe = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const username = req.body.username?.trim().toLowerCase();

    if (!name || !email || !username) {
      return res.status(400).json({
        message: "Nombre, email y username son obligatorios."
      });
    }

    if (name.length < 3 || username.length < 3) {
      return res.status(400).json({
        message: "El nombre y el username deben tener al menos 3 caracteres."
      });
    }

    const duplicatedUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [{ email }, { username }]
    }).select("email username");

    if (duplicatedUser) {
      return res.status(409).json({
        message: duplicatedUser.email === email
          ? "Ese email ya pertenece a otra cuenta."
          : "Ese username ya está en uso. Elige otro."
      });
    }

    const avatarUrl = req.file
      ? await uploadAvatarToS3(req.file, req.user._id)
      : req.user.avatarUrl;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, username, avatarUrl },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Perfil actualizado correctamente.",
      user: formatUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicatedField = Object.keys(error.keyPattern ?? {})[0];

      return res.status(409).json({
        message: duplicatedField === "username"
          ? "Ese username ya está en uso. Elige otro."
          : "Ese email ya pertenece a otra cuenta."
      });
    }

    return res.status(500).json({
      message: "Error al actualizar el perfil.",
      error: error.message
    });
  }
};

export const startUser = async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();

    if (!username) {
      return res.status(400).json({
        message: "El nombre de usuario es obligatorio"
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado. Regístrate para continuar."
      });
    }

    user.status = "online";
    user.lastSeen = null;
    await user.save();

    return res.json({
      message: "Usuario iniciado correctamente",
      user: formatUser(user)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al iniciar usuario",
      error: error.message
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name username avatarUrl status lastSeen")
      .sort({ createdAt: -1 });

    return res.json({
      total: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
};
