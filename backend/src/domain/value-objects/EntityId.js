import { ValidationError } from "../errors/AppError.js";

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export class EntityId {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = String(raw ?? "").trim();

    if (!OBJECT_ID_PATTERN.test(value)) {
      throw new ValidationError("Identificador no válido.");
    }

    return new EntityId(value);
  }

  static isValid(raw) {
    return OBJECT_ID_PATTERN.test(String(raw ?? "").trim());
  }

  toString() {
    return this.value;
  }

  equals(other) {
    if (!other) {
      return false;
    }

    const otherValue = other instanceof EntityId ? other.value : String(other);
    return this.value === otherValue;
  }
}
