import { AppError } from "../../../domain/errors/AppError.js";

export function emitSocketError(socket, error, fallbackMessage = "Ocurrió un error inesperado.") {
  const message = error instanceof AppError ? error.message : fallbackMessage;

  socket.emit("error_message", { message });
}

export function formatSystemMessage(text) {
  return {
    usuario: "Sistema",
    mensaje: text,
    hora: new Date().toLocaleTimeString(),
  };
}

export function formatPrivateMessage(username, message) {
  return {
    usuario: username,
    mensaje: message,
    hora: new Date().toLocaleTimeString(),
  };
}
