import User from "../models/User.js";

export const startUser = async (req, res) => {
    try {
        const username = req.body.username?.trim();

        if (!username) {
            return res.status(400).json({
                message: "El nombre de usuario es obligatorio"
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                message: "El nombre de usuario debe tener al menos 3 caracteres"
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

        res.json({
            message: "Usuario iniciado correctamente",
            user: {
                id: user._id,
                username: user.username,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al iniciar usuario",
            error: error.message
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.json({
            total: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener usuarios",
            error: error.message
        });
    }
};