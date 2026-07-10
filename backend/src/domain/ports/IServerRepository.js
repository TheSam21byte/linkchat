export class IServerRepository {
  async findById(_id) {
    throw new Error("IServerRepository.findById no implementado.");
  }

  async findAll() {
    throw new Error("IServerRepository.findAll no implementado.");
  }

  async create(_serverData) {
    throw new Error("IServerRepository.create no implementado.");
  }

  async save(_server) {
    throw new Error("IServerRepository.save no implementado.");
  }
}
