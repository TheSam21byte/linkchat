import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from 'mongoose'
import { uploadAvatarToS3 } from '../services/s3.service.js'
function createToken(user) {
    return jwt.sign(
        {
            userId: user._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
}

function formatUser(user) {
    return {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        status: user.status
    };
}

export const register = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;
        const name = req.body.name?.trim();

        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Nombre, email y contraseña son obligatorios."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 6 caracteres."
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Ya existe un usuario registrado con ese email."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const tempUserId = new mongoose.Types.ObjectId()

        const avatarUrl = req.file
            ? await uploadAvatarToS3(req.file, tempUserId)
            : null

        const user = await User.create({
            _id: tempUserId,
            email,
            passwordHash,
            name,
            username: name,
            avatarUrl,
            status: 'offline',
        })

        return res.status(201).json({
            message: "Usuario registrado correctamente. Ahora inicia sesión.",
            user: formatUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al registrar usuario.",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email y contraseña son obligatorios."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Credenciales incorrectas."
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Credenciales incorrectas."
            });
        }

        user.status = "online";
        user.lastSeen = null;
        await user.save();

        const token = createToken(user);

        return res.json({
            message: "Inicio de sesión correcto.",
            token,
            user: formatUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al iniciar sesión.",
            error: error.message
        });
    }
};

export const me = async (req, res) => {
    return res.json({
        user: formatUser(req.user)
    });
};