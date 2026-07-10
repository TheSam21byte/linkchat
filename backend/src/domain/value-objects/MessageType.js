import { ValidationError } from "../errors/AppError.js";

const ALLOWED_TYPES = ["public", "private", "system"];

export class MessageType {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!ALLOWED_TYPES.includes(value)) {
      throw new ValidationError("Tipo de mensaje no válido.");
    }

    return new MessageType(value);
  }

  static publicMessage() {
    return new MessageType("public");
  }

  toString() {
    return this.value;
  }
}
