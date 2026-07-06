import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No autorizado. Inicia sesión."
      });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Usuario no encontrado."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Sesión inválida o expirada."
    });
  }
};