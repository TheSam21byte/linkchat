import { ValidationError } from "../errors/AppError.js";
import { EntityId } from "../value-objects/EntityId.js";

export class Server {
  constructor({ id = null, name, description = "", ownerId }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.name = name?.trim();
    this.description = description?.trim() ?? "";
    this.ownerId = ownerId instanceof EntityId ? ownerId : EntityId.create(ownerId);

    this.validate();
  }

  validate() {
    if (!this.name) {
      throw new ValidationError("El nombre del servidor es obligatorio.");
    }
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId.value,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new Server({
      id: document._id ?? document.id,
      name: document.name,
      description: document.description,
      ownerId: document.ownerId?._id ?? document.ownerId,
    });
  }
}
