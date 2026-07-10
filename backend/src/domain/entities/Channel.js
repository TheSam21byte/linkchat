import { ValidationError } from "../errors/AppError.js";
import { DEFAULT_CHANNEL_NAME } from "../constants/Defaults.js";
import { EntityId } from "../value-objects/EntityId.js";

export class Channel {
  constructor({ id = null, name, serverId }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.name = name?.trim();
    this.serverId = serverId instanceof EntityId ? serverId : EntityId.create(serverId);

    this.validate();
  }

  validate() {
    if (!this.name) {
      throw new ValidationError("El nombre del canal es obligatorio.");
    }
  }

  static createDefault(serverId) {
    return new Channel({
      name: DEFAULT_CHANNEL_NAME,
      serverId,
    });
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      name: this.name,
      serverId: this.serverId.value,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new Channel({
      id: document._id ?? document.id,
      name: document.name,
      serverId: document.serverId?._id ?? document.serverId,
    });
  }
}
