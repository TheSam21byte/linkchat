import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  createServerUseCase,
  getServerByIdUseCase,
  getServersUseCase,
} from "../../composition/container.js";

export async function createServer(req, res) {
  try {
    const result = await createServerUseCase.execute(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al crear servidor.");
  }
}

export async function getServers(req, res) {
  try {
    const result = await getServersUseCase.execute();
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar servidores.");
  }
}

export async function getServerById(req, res) {
  try {
    const server = await getServerByIdUseCase.execute({ id: req.params.id });
    return res.json(server);
  } catch (error) {
    return sendHttpError(res, error, "Error al obtener servidor.");
  }
}
