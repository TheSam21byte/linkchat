import { ValidationError } from "../errors/AppError.js";
import { EntityId } from "../value-objects/EntityId.js";
import { MessageType } from "../value-objects/MessageType.js";
import { Username } from "../value-objects/Username.js";

export class Message {
  constructor({
    id = null,
    username,
    channelId,
    content,
    type = MessageType.publicMessage(),
    createdAt = null,
  }) {
    this.id = id ? (id instanceof EntityId ? id : EntityId.create(id)) : null;
    this.username =
      username instanceof Username ? username.value : Username.create(username).value;
    this.channelId = channelId instanceof EntityId ? channelId : EntityId.create(channelId);
    this.content = content?.trim();
    this.type = type instanceof MessageType ? type : MessageType.create(type);
    this.createdAt = createdAt;

    this.validate();
  }

  validate() {
    if (!this.content) {
      throw new ValidationError("El contenido del mensaje es obligatorio.");
    }
  }

  toPersistence() {
    return {
      _id: this.id?.value,
      username: this.username,
      channelId: this.channelId.value,
      content: this.content,
      type: this.type.value,
    };
  }

  static fromPersistence(document) {
    if (!document) {
      return null;
    }

    return new Message({
      id: document._id ?? document.id,
      username: document.username,
      channelId: document.channelId?._id ?? document.channelId,
      content: document.content,
      type: document.type,
      createdAt: document.createdAt,
    });
  }
}
