export class IVoiceService {
  isConfigured() {
    throw new Error("IVoiceService.isConfigured no implementado.");
  }

  isLambdaFallbackEnabled() {
    throw new Error("IVoiceService.isLambdaFallbackEnabled no implementado.");
  }

  async createVoiceSession(_input) {
    throw new Error("IVoiceService.createVoiceSession no implementado.");
  }

  async joinMeeting(_input) {
    throw new Error("IVoiceService.joinMeeting no implementado.");
  }
}
