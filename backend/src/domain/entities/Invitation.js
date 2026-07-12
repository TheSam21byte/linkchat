import { EntityId } from "../value-objects/EntityId.js";
import { InvitationCode } from "../value-objects/InvitationCode.js";

export class Invitation {
  constructor({ id = null, code, serverId, active = true }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.code = code instanceof InvitationCode ? code : InvitationCode.create(code);
    this.serverId = serverId instanceof EntityId ? serverId : EntityId.create(serverId);
    this.active = Boolean(active);
  }

  deactivate() {
    this.active = false;
  }

  isActive() {
    return this.active;
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      code: this.code.value,
      serverId: this.serverId.value,
      active: this.active,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new Invitation({
      id: document._id ?? document.id,
      code: document.code,
      serverId: document.serverId?._id ?? document.serverId,
      active: document.active,
    });
  }
}
