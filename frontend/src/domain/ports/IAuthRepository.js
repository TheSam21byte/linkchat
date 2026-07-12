export class IAuthRepository {
  async register(_input) {
    throw new Error("IAuthRepository.register no implementado.");
  }

  async login(_input) {
    throw new Error("IAuthRepository.login no implementado.");
  }

  async getCurrentUser() {
    throw new Error("IAuthRepository.getCurrentUser no implementado.");
  }
}
