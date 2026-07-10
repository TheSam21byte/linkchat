import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  getUsersUseCase,
  startGuestUserUseCase,
} from "../../composition/container.js";

export async function startUser(req, res) {
  try {
    const result = await startGuestUserUseCase.execute({
      username: req.body.username,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al iniciar usuario.");
  }
}

export async function getUsers(req, res) {
  try {
    const result = await getUsersUseCase.execute();
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al obtener usuarios.");
  }
}
