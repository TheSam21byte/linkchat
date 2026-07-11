import { AppError } from "../../../domain/errors/AppError.js";

export function sendHttpError(res, error, fallbackMessage = "Error interno del servidor.") {
  if (error?.code === 11000) {
    const duplicatedField = Object.keys(error.keyPattern ?? {})[0];

    return res.status(409).json({
      message:
        duplicatedField === "username"
          ? "Ese username ya está en uso. Elige otro."
          : duplicatedField === "name"
            ? "Ya existe un canal con ese nombre en este servidor."
            : "Ya existe un registro con esos datos.",
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  return res.status(500).json({
    message: fallbackMessage,
    error: error.message,
  });
}
