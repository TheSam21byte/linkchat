export class IChimeMeetingRepository {
  async findByExternalMeetingId(_externalMeetingId) {
    throw new Error("IChimeMeetingRepository.findByExternalMeetingId no implementado.");
  }

  async upsert(_externalMeetingId, _data) {
    throw new Error("IChimeMeetingRepository.upsert no implementado.");
  }

  async deleteByExternalMeetingId(_externalMeetingId) {
    throw new Error("IChimeMeetingRepository.deleteByExternalMeetingId no implementado.");
  }
}
