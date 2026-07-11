import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  getMembersByServerUseCase,
  getMyServersUseCase,
  getServersByUserUseCase,
  joinServerUseCase,
  kickMemberUseCase,
  updateMemberRoleUseCase,
} from "../../composition/container.js";

export async function getMembersByServer(req, res) {
  try {
    const result = await getMembersByServerUseCase.execute({
      serverId: req.params.serverId,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar miembros.");
  }
}

export async function getServersByUser(req, res) {
  try {
    const result = await getServersByUserUseCase.execute({
      userId: req.params.userId,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar servidores del usuario.");
  }
}

export async function getMyServers(req, res) {
  try {
    const result = await getMyServersUseCase.execute({
      userId: req.user._id,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar tus servidores.");
  }
}

export async function joinServer(req, res) {
  try {
    const result = await joinServerUseCase.execute({
      serverId: req.params.serverId,
      userId: req.user._id,
      username: req.user.username,
    });
    return res.status(201).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al unirse al servidor.");
  }
}

export async function updateMemberRole(req, res) {
  try {
    const result = await updateMemberRoleUseCase.execute({
      memberId: req.params.memberId,
      role: req.body.role,
      actorUserId: req.user._id,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al actualizar rol.");
  }
}

export async function kickMember(req, res) {
  try {
    const result = await kickMemberUseCase.execute({
      memberId: req.params.memberId,
      actorUserId: req.user._id,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al expulsar miembro.");
  }
}
