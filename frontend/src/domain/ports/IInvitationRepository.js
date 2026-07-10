export class IInvitationRepository {
  async getByCode(_code) {
    throw new Error("IInvitationRepository.getByCode no implementado.");
  }

  async joinByCode(_code) {
    throw new Error("IInvitationRepository.joinByCode no implementado.");
  }
}
