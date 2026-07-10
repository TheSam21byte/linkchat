import { UnauthorizedError } from "../../../domain/errors/AppError.js";
import { validateSessionUseCase } from "../../composition/container.js";
import { sendHttpError } from "../utils/HttpErrorHandler.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No autorizado. Inicia sesión.");
    }

    const token = authHeader.split(" ")[1];
    req.user = await validateSessionUseCase.execute({ token });
    next();
  } catch (error) {
    return sendHttpError(res, error, "Sesión inválida o expirada.");
  }
}
