import { sendHttpError } from "../utils/HttpErrorHandler.js";
import {
  createInvitationUseCase,
  disableInvitationUseCase,
  getInvitationByCodeUseCase,
  getInvitationsUseCase,
  joinByInvitationUseCase,
} from "../../composition/container.js";

export async function createInvitation(req, res) {
  try {
    const result = await createInvitationUseCase.execute({
      ...req.body,
      clientUrl: process.env.CLIENT_URL,
    });
    return res.status(201).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al crear invitación.");
  }
}

export async function getInvitations(req, res) {
  try {
    const result = await getInvitationsUseCase.execute();
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al listar invitaciones.");
  }
}

export async function getInvitationByCode(req, res) {
  try {
    const invitation = await getInvitationByCodeUseCase.execute({
      code: req.params.code,
    });
    return res.json(invitation);
  } catch (error) {
    return sendHttpError(res, error, "Error al obtener invitación.");
  }
}

export async function joinByInvitation(req, res) {
  try {
    const result = await joinByInvitationUseCase.execute({
      code: req.params.code,
      user: req.user,
    });
    return res.status(200).json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al unirse mediante invitación.");
  }
}

export async function disableInvitation(req, res) {
  try {
    const result = await disableInvitationUseCase.execute({
      code: req.params.code,
    });
    return res.json(result);
  } catch (error) {
    return sendHttpError(res, error, "Error al desactivar invitación.");
  }
}
