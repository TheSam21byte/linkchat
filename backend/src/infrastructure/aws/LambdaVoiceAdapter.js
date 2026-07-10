const DEFAULT_CHIME_VOICE_API_URL =
  "https://9v1fgc9ahf.execute-api.us-east-1.amazonaws.com/default/servidor-voz-chime";

export class LambdaVoiceAdapter {
  constructor(apiUrl = process.env.CHIME_VOICE_API_URL ?? DEFAULT_CHIME_VOICE_API_URL) {
    this.apiUrl = apiUrl;
  }

  isEnabled() {
    return process.env.CHIME_USE_LAMBDA === "true";
  }

  async joinMeeting(payload) {
    const lambdaResponse = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await lambdaResponse.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      const error = new Error("La Lambda de voz devolvió una respuesta inválida.");
      error.statusCode = 502;
      throw error;
    }

    if (!lambdaResponse.ok) {
      const error = new Error(
        data.error ?? data.message ?? "No se pudo crear la reunión de voz en AWS Lambda."
      );
      error.statusCode = lambdaResponse.status;
      throw error;
    }

    return data;
  }
}
