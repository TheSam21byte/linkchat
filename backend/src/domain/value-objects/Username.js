import { ValidationError } from "../errors/AppError.js";
import { MIN_USERNAME_LENGTH } from "../constants/Defaults.js";

export class Username {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!value || value.length < MIN_USERNAME_LENGTH) {
      throw new ValidationError(
        `El username debe tener al menos ${MIN_USERNAME_LENGTH} caracteres.`
      );
    }

    return new Username(value);
  }

  toString() {
    return this.value;
  }
}
