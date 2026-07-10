export class IUserRepository {
  async findByEmailWithPassword(_email) {
    throw new Error("IUserRepository.findByEmailWithPassword no implementado.");
  }

  async findByEmailOrUsername(_email, _username) {
    throw new Error("IUserRepository.findByEmailOrUsername no implementado.");
  }

  async findById(_id) {
    throw new Error("IUserRepository.findById no implementado.");
  }

  async findAll() {
    throw new Error("IUserRepository.findAll no implementado.");
  }

  async create(_userData) {
    throw new Error("IUserRepository.create no implementado.");
  }

  async save(_user) {
    throw new Error("IUserRepository.save no implementado.");
  }

  async upsertGuestByUsername(_username) {
    throw new Error("IUserRepository.upsertGuestByUsername no implementado.");
  }
}
