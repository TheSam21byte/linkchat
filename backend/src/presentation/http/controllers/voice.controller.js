import { joinChimeMeetingUseCase } from "../../composition/container.js";
import { sendHttpError } from "../utils/HttpErrorHandler.js";

export async function joinChimeMeeting(req, res) {
  try {
    const chimeSession = await joinChimeMeetingUseCase.execute(req.body ?? {});
    return res.status(200).json(chimeSession);
  } catch (error) {
    console.error("[voice/chime/join]", error?.name, error?.message);
    return sendHttpError(res, error, "Error al conectar con el servicio de voz.");
  }
}
