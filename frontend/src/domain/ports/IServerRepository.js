export class IServerRepository {
  async getAll() {
    throw new Error("IServerRepository.getAll no implementado.");
  }

  async getById(_serverId) {
    throw new Error("IServerRepository.getById no implementado.");
  }

  async create(_input) {
    throw new Error("IServerRepository.create no implementado.");
  }
}
