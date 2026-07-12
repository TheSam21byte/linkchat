import { ValidationError } from "../errors/AppError.js";

const ALLOWED_STATUSES = ["online", "offline", "busy"];

export class UserStatus {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!ALLOWED_STATUSES.includes(value)) {
      throw new ValidationError("Estado de usuario no válido.");
    }

    return new UserStatus(value);
  }

  static offline() {
    return new UserStatus("offline");
  }

  static online() {
    return new UserStatus("online");
  }

  isOnline() {
    return this.value === "online";
  }

  toString() {
    return this.value;
  }
}
