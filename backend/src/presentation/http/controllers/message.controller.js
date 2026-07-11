import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  deleteMessageUseCase,
  getMessagesByChannelUseCase,
} from "../../composition/container.js";

export async function getMessagesByChannel(req, res) {
  try {
    const result = await getMessagesByChannelUseCase.execute({
      channelId: req.params.channelId,
      limit: req.query.limit,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al obtener mensajes.");
  }
}

export async function deleteMessage(req, res) {
  try {
    const result = await deleteMessageUseCase.execute({ id: req.params.id });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al eliminar mensaje.");
  }
}
