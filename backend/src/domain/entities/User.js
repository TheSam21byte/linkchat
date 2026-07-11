import { ValidationError } from "../errors/AppError.js";
import { MIN_DISPLAY_NAME_LENGTH } from "../constants/Defaults.js";
import { Email } from "../value-objects/Email.js";
import { Username } from "../value-objects/Username.js";
import { UserStatus } from "../value-objects/UserStatus.js";
import { EntityId } from "../value-objects/EntityId.js";

export class User {
  constructor({
    id = null,
    email = null,
    name = null,
    username = null,
    avatarUrl = null,
    status = UserStatus.offline(),
    lastSeen = null,
    passwordHash = null,
  }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.email = email ? (email instanceof Email ? email : Email.create(email)) : null;
    this.name = name?.trim() ?? null;
    this.username = username instanceof Username ? username : Username.create(username);
    this.avatarUrl = avatarUrl ?? null;
    this.status = status instanceof UserStatus ? status : UserStatus.create(status);
    this.lastSeen = lastSeen ?? null;
    this.passwordHash = passwordHash ?? null;

    this.validateName();
  }

  validateName() {
    if (!this.name || this.name.length < MIN_DISPLAY_NAME_LENGTH) {
      throw new ValidationError(
        `El nombre debe tener al menos ${MIN_DISPLAY_NAME_LENGTH} caracteres.`
      );
    }
  }

  markOnline() {
    this.status = UserStatus.online();
    this.lastSeen = null;
  }

  markOffline() {
    this.status = UserStatus.offline();
    this.lastSeen = new Date();
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      email: this.email?.value ?? null,
      name: this.name,
      username: this.username.value,
      avatarUrl: this.avatarUrl,
      status: this.status.value,
      lastSeen: this.lastSeen,
      passwordHash: this.passwordHash,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new User({
      id: document._id ?? document.id,
      email: document.email,
      name: document.name,
      username: document.username,
      avatarUrl: document.avatarUrl,
      status: document.status,
      lastSeen: document.lastSeen,
      passwordHash: document.passwordHash,
    });
  }
}
