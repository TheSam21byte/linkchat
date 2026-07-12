import { ValidationError } from "../errors/AppError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!value || !EMAIL_PATTERN.test(value)) {
      throw new ValidationError("Email inválido.");
    }

    return new Email(value);
  }

  toString() {
    return this.value;
  }
}
