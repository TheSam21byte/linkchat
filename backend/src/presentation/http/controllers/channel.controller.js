import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  createChannelUseCase,
  deleteChannelUseCase,
  getChannelByIdUseCase,
  getChannelsByServerUseCase,
  updateChannelUseCase,
} from "../../composition/container.js";

export async function createChannel(req, res) {
  try {
    const result = await createChannelUseCase.execute(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al crear canal.");
  }
}

export async function getChannelsByServer(req, res) {
  try {
    const result = await getChannelsByServerUseCase.execute({
      serverId: req.params.serverId,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar canales.");
  }
}

export async function getChannelById(req, res) {
  try {
    const channel = await getChannelByIdUseCase.execute({ id: req.params.id });
    return res.json(channel);
  } catch (error) {
    return sendHttpError(res, error, "Error al obtener canal.");
  }
}

export async function updateChannel(req, res) {
  try {
    const result = await updateChannelUseCase.execute({
      id: req.params.id,
      name: req.body.name,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al actualizar canal.");
  }
}

export async function deleteChannel(req, res) {
  try {
    const result = await deleteChannelUseCase.execute({ id: req.params.id });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al eliminar canal.");
  }
}
