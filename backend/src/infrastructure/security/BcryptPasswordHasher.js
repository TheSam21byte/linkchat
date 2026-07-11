import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../domain/ports/IPasswordHasher.js";

export class BcryptPasswordHasher extends IPasswordHasher {
  constructor(rounds = 10) {
    super();
    this.rounds = rounds;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this.rounds);
  }

  async compare(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}
