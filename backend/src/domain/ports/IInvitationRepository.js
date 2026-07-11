export class IInvitationRepository {
  async findByCode(_code) {
    throw new Error("IInvitationRepository.findByCode no implementado.");
  }

  async findActiveByCode(_code) {
    throw new Error("IInvitationRepository.findActiveByCode no implementado.");
  }

  async findAll() {
    throw new Error("IInvitationRepository.findAll no implementado.");
  }

  async create(_invitationData) {
    throw new Error("IInvitationRepository.create no implementado.");
  }

  async save(_invitation) {
    throw new Error("IInvitationRepository.save no implementado.");
  }

  async deactivateByCode(_code) {
    throw new Error("IInvitationRepository.deactivateByCode no implementado.");
  }
}
