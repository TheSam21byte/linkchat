import { EntityId, Message, ValidationError } from "../../../domain/index.js";
import { toMessageSocketDto } from "../../dto/MessageDto.js";

export class GetMessagesByChannelUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ channelId, limit = 50 }) {
    EntityId.create(channelId);

    const parsedLimit = Number(limit) || 50;
    const messages = await this.messageRepository.findByChannelId(channelId, parsedLimit);

    return {
      total: messages.length,
      messages,
    };
  }
}

export class SendMessageUseCase {
  constructor(messageRepository) {
    this.messageRepository = messageRepository;
  }

  async execute({ username, channelId, content, type = "public" }) {
    if (!username?.trim() || !channelId || !content?.trim()) {
      throw new ValidationError("username, channelId y content son obligatorios.");
    }

    EntityId.create(channelId);

    const messageEntity = new Message({
      username,
      channelId,
      content,
      type,
    });

    const savedMessage = await this.messageRepository.create(messageEntity.toPersistence());

    return toMessageSocketDto({
      savedMessage,
      username,
      channelId,
      content: content.trim(),
    });
  }
}
