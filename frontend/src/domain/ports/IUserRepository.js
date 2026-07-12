export class IUserRepository {
  async getUsers() {
    throw new Error("IUserRepository.getUsers no implementado.");
  }

  async startGuest(_username) {
    throw new Error("IUserRepository.startGuest no implementado.");
  }

  async updateProfile(_input) {
    throw new Error("IUserRepository.updateProfile no implementado.");
  }
}
