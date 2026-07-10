import { IMessageRepository } from "../../../../domain/ports/IMessageRepository.js";
import Message from "../models/Message.js";

export class MongooseMessageRepository extends IMessageRepository {
  async findByChannelId(channelId, limit = 50) {
    const messages = await Message.find({ channelId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return messages.reverse();
  }

  async create(messageData) {
    return Message.create(messageData);
  }
}
