export class IVoicePresenceRepository {
  async createChannel(_input) {
    throw new Error("IVoicePresenceRepository.createChannel no implementado.");
  }

  subscribeVoiceChannels(_serverId, _callback) {
    throw new Error("IVoicePresenceRepository.subscribeVoiceChannels no implementado.");
  }

  subscribeVoiceParticipants(_input, _callback) {
    throw new Error("IVoicePresenceRepository.subscribeVoiceParticipants no implementado.");
  }

  async joinParticipant(_input) {
    throw new Error("IVoicePresenceRepository.joinParticipant no implementado.");
  }

  async leaveParticipant(_input) {
    throw new Error("IVoicePresenceRepository.leaveParticipant no implementado.");
  }

  async updateParticipant(_input) {
    throw new Error("IVoicePresenceRepository.updateParticipant no implementado.");
  }
}
