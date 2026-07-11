export class LambdaVoiceAdapter {
  constructor(apiUrl = process.env.CHIME_VOICE_API_URL?.trim()) {
    this.apiUrl = apiUrl;
  }

  isEnabled() {
    return process.env.CHIME_USE_LAMBDA === "true";
  }

  async joinMeeting(payload) {
    if (!this.apiUrl) {
      const error = new Error(
        "Falta CHIME_VOICE_API_URL en las variables de entorno para usar la Lambda de voz."
      );
      error.statusCode = 503;
      throw error;
    }

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
