import { ValidationError } from "../errors/AppError.js";

const ALLOWED_ROLES = ["owner", "admin", "member"];

export class MemberRole {
  constructor(value) {
    this.value = value;
  }

  static create(raw) {
    const value = raw?.trim().toLowerCase();

    if (!ALLOWED_ROLES.includes(value)) {
      throw new ValidationError("Rol de miembro no válido.");
    }

    return new MemberRole(value);
  }

  static owner() {
    return new MemberRole("owner");
  }

  static member() {
    return new MemberRole("member");
  }

  isOwner() {
    return this.value === "owner";
  }

  toString() {
    return this.value;
  }
}
