import { ValidationError } from "../errors/AppError.js";
import { MIN_PASSWORD_LENGTH } from "../constants/Defaults.js";

export class Password {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw ?? "";

    if (!value || value.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationError(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      );
    }

    return new Password(value);
  }
}
