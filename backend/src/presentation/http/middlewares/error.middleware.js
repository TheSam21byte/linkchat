import { sendHttpError } from "../utils/HttpErrorHandler.js";

export function globalErrorMiddleware(error, req, res, next) {
  if (error?.message?.includes("CORS") || error?.message?.includes("Origen no permitido")) {
    return res.status(403).json({ message: error.message });
  }

  if (error?.message?.includes("Solo se permiten imágenes")) {
    return res.status(400).json({ message: error.message });
  }

  return sendHttpError(res, error);
}

export function notFoundMiddleware(req, res) {
  return res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}
