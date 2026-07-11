import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  getUsersUseCase,
  startGuestUserUseCase,
  updateUserProfileUseCase,
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

export async function updateMe(req, res) {
  try {
    const result = await updateUserProfileUseCase.execute({
      userId: req.user._id,
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      avatarFile: req.file,
      currentAvatarUrl: req.user.avatarUrl,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al actualizar perfil.");
  }
}
