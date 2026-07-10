import { ValidationError } from "../errors/AppError.js";

export class InvitationCode {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!value || value.length < 4) {
      throw new ValidationError("Código de invitación no válido.");
    }

    return new InvitationCode(value);
  }

  toString() {
    return this.value;
  }
}
