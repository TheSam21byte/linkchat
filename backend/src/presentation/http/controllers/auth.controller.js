import { toUserDto } from "../../../application/dto/UserDto.js";
import {
  loginUserUseCase,
  registerUserUseCase,
} from "../../composition/container.js";
import { sendHttpError } from "../utils/HttpErrorHandler.js";

export async function register(req, res) {
  try {
    const result = await registerUserUseCase.execute({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      username: req.body.username,
      avatarFile: req.file,
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al registrar usuario.");
  }
}

export async function login(req, res) {
  try {
    const result = await loginUserUseCase.execute({
      email: req.body.email,
      password: req.body.password,
    });

    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al iniciar sesión.");
  }
}

export async function me(req, res) {
  return res.json({
    user: toUserDto(req.user),
  });
}
