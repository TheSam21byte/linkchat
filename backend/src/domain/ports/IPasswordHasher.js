export class IPasswordHasher {
  async hash(_plainPassword) {
    throw new Error("IPasswordHasher.hash no implementado.");
  }

  async compare(_plainPassword, _passwordHash) {
    throw new Error("IPasswordHasher.compare no implementado.");
  }
}
