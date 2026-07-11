export class IMemberRepository {
  async findByUserAndServer(_userId, _serverId) {
    throw new Error("IMemberRepository.findByUserAndServer no implementado.");
  }

  async findActiveByServerId(_serverId) {
    throw new Error("IMemberRepository.findActiveByServerId no implementado.");
  }

  async findActiveByUserId(_userId) {
    throw new Error("IMemberRepository.findActiveByUserId no implementado.");
  }

  async create(_memberData) {
    throw new Error("IMemberRepository.create no implementado.");
  }

  async save(_member) {
    throw new Error("IMemberRepository.save no implementado.");
  }

  async upsertActiveMembership(_data) {
    throw new Error("IMemberRepository.upsertActiveMembership no implementado.");
  }

  async findById(_memberId) {
    throw new Error("IMemberRepository.findById no implementado.");
  }
}
